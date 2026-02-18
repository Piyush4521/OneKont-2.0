"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Incident } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type ContextType = {
  incidents: Incident[];
  activeVolunteers: number;
  addIncident: (type: Incident["type"], location: string) => Promise<void>;
  verifyIncident: (id: number) => Promise<void>;
  resolveIncident: (id: number) => Promise<void>;
};

const DisasterContext = createContext<ContextType | undefined>(undefined);

const RESYNC_MS = 60000;

const applyIncidentChange = (
  prev: Incident[],
  payload: RealtimePostgresChangesPayload<Incident>
) => {
  if (payload.eventType === "DELETE") {
    const removed = payload.old as Incident;
    return prev.filter((incident) => incident.id !== removed.id);
  }

  const next = payload.new as Incident;
  if (!next?.id) return prev;

  const index = prev.findIndex((incident) => incident.id === next.id);
  if (index === -1) return [next, ...prev];

  const updated = [...prev];
  updated[index] = next;
  return updated;
};

export function DisasterProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeVolunteers, setActiveVolunteers] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    const loadIncidents = async () => {
      try {
        const incRes = await fetch("/api/incidents", { cache: "no-store" });
        if (!active || !incRes.ok) return;
        const data = (await incRes.json()) as Incident[];
        setIncidents(data);
      } catch {
        // Keep last known values on network errors.
      }
    };

    const loadMetrics = async () => {
      try {
        const metricsRes = await fetch("/api/metrics", { cache: "no-store" });
        if (!active || !metricsRes.ok) return;
        const data = (await metricsRes.json()) as { activeVolunteers?: number };
        if (typeof data.activeVolunteers === "number") {
          setActiveVolunteers(data.activeVolunteers);
        }
      } catch {
        // Keep last known values on network errors.
      }
    };

    const loadAll = async () => {
      await Promise.all([loadIncidents(), loadMetrics()]);
    };

    loadAll();
    const interval = window.setInterval(loadAll, RESYNC_MS);

    const channel = supabase
      .channel("realtime:disaster")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          if (!active) return;
          setIncidents((prev) =>
            applyIncidentChange(prev, payload as RealtimePostgresChangesPayload<Incident>)
          );
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteers" }, () => {
        if (!active) return;
        loadMetrics();
      })
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const addIncident = async (type: Incident["type"], location: string) => {
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, location }),
      });

      if (!res.ok) return;
      const created = (await res.json()) as Incident;
      setIncidents((prev) => [created, ...prev]);
    } catch {
      // ignore
    }
  };

  const verifyIncident = async (id: number) => {
    try {
      const res = await fetch(`/api/incidents/${id}/verify`, { method: "POST" });
      if (!res.ok) return;
      const updated = (await res.json()) as Incident;
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    } catch {
      // ignore
    }
  };

  const resolveIncident = async (id: number) => {
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, { method: "POST" });
      if (!res.ok) return;
      const updated = (await res.json()) as Incident;
      setIncidents((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    } catch {
      // ignore
    }
  };

  return (
    <DisasterContext.Provider value={{ incidents, activeVolunteers, addIncident, verifyIncident, resolveIncident }}>
      {children}
    </DisasterContext.Provider>
  );
}

export function useDisaster() {
  const context = useContext(DisasterContext);
  if (!context) throw new Error("useDisaster must be used within a DisasterProvider");
  return context;
}
