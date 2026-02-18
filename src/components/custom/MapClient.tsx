"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Fragment, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Hospital, Shelter, Volunteer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useDisaster } from "@/context/DisasterContext";

const sosIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const volIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RESYNC_MS = 60000;

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
}

const applyRealtimeChange = <T extends { id: number }>(
  prev: T[],
  payload: RealtimePostgresChangesPayload<T>
) => {
  if (payload.eventType === "DELETE") {
    const removed = payload.old as T;
    return prev.filter((item) => item.id !== removed.id);
  }

  const next = payload.new as T;
  if (!next?.id) return prev;

  const index = prev.findIndex((item) => item.id === next.id);
  if (index === -1) return [next, ...prev];

  const updated = [...prev];
  updated[index] = next;
  return updated;
};

type MapClientProps = {
  className?: string;
};

export default function MapClient({ className }: MapClientProps) {
  const [position, setPosition] = useState<[number, number]>([17.6599, 75.9064]);
  const [layerMode, setLayerMode] = useState<"live" | "sentiment">("live");
  const { incidents } = useDisaster();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const panicZones = incidents.map((incident) => ({
    id: incident.id,
    lat: incident.lat,
    lng: incident.lng,
    intensity: typeof incident.panic === "number" ? incident.panic : 0.6,
  }));

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;

    const load = async () => {
      try {
        const [volRes, shelterRes, hospRes] = await Promise.all([
          fetch("/api/volunteers", { cache: "no-store" }),
          fetch("/api/shelters", { cache: "no-store" }),
          fetch("/api/hospitals", { cache: "no-store" }),
        ]);

        if (!active) return;

        if (volRes.ok) {
          setVolunteers((await volRes.json()) as Volunteer[]);
        }
        if (shelterRes.ok) {
          setShelters((await shelterRes.json()) as Shelter[]);
        }
        if (hospRes.ok) {
          setHospitals((await hospRes.json()) as Hospital[]);
        }
      } catch (error) {
        // Keep last known values on network errors.
      }
    };

    load();
    const interval = window.setInterval(load, RESYNC_MS);

    const channel = supabase
      .channel("realtime:map")
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteers" }, (payload) => {
        if (!active) return;
        setVolunteers((prev) =>
          applyRealtimeChange(prev, payload as RealtimePostgresChangesPayload<Volunteer>)
        );
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "shelters" }, (payload) => {
        if (!active) return;
        setShelters((prev) =>
          applyRealtimeChange(prev, payload as RealtimePostgresChangesPayload<Shelter>)
        );
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "hospitals" }, (payload) => {
        if (!active) return;
        setHospitals((prev) =>
          applyRealtimeChange(prev, payload as RealtimePostgresChangesPayload<Hospital>)
        );
      })
      .subscribe();

    return () => {
      active = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      },
      () => {
        setPosition([17.6599, 75.9064]);
      }
    );
  }, []);

  return (
    <div
      className={cn(
        "w-full h-full rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl relative z-0",
        className
      )}
    >
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <MapUpdater center={position} />

        <TileLayer
          key={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        <Marker position={position} icon={userIcon}>
          <Popup>
            <div className="text-slate-900 font-bold">You are here</div>
          </Popup>
        </Marker>

        <Circle
          center={position}
          pathOptions={{ fillColor: "#3b82f6", color: "#3b82f6", opacity: 0.25, weight: 1, dashArray: "4 6" }}
          radius={10000}
        />

        {incidents.map((incident) => (
          <Fragment key={incident.id}>
            <Marker position={[incident.lat, incident.lng]} icon={sosIcon}>
              <Popup>
                <div className="text-slate-900">
                  <strong className="text-red-600 uppercase">Alert: {incident.type}</strong>
                  <br />
                  <span className="text-xs font-semibold">Severity: {incident.severity}</span>
                  <br />
                  {incident.description}
                  <br />
                  <span className="text-xs text-slate-600">
                    {incident.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[incident.lat, incident.lng]}
              pathOptions={{ fillColor: "red", color: "red", opacity: 0.2, weight: 1 }}
              radius={800}
            />
          </Fragment>
        ))}

        {volunteers.map((team) => (
          <Marker key={team.id} position={[team.lat, team.lng]} icon={volIcon}>
            <Popup>
              <div className="text-slate-900">
                <strong>{team.name}</strong>
                <br />
                Status: {team.status}
                <br />
                ETA: {team.eta}
              </div>
            </Popup>
          </Marker>
        ))}

        {shelters.map((shelter) => (
          <Marker key={shelter.id} position={[shelter.lat, shelter.lng]} icon={shelterIcon}>
            <Popup>
              <div className="text-slate-900">
                <strong>{shelter.name}</strong>
                <br />
                Capacity: {shelter.capacity}
              </div>
            </Popup>
          </Marker>
        ))}

        {hospitals.map((hospital) => (
          <Marker key={hospital.id} position={[hospital.lat, hospital.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-slate-900">
                <strong>{hospital.name}</strong>
                <br />
                Capacity: {hospital.capacity}
              </div>
            </Popup>
          </Marker>
        ))}

        {layerMode === "sentiment" &&
          panicZones.map((zone) => {
            const color = zone.intensity > 0.75 ? "#ef4444" : zone.intensity > 0.5 ? "#f97316" : "#facc15";
            const radius = 500 + zone.intensity * 1100;
            return (
              <Circle
                key={`panic-${zone.id}`}
                center={[zone.lat, zone.lng]}
                pathOptions={{ fillColor: color, color: color, opacity: 0.25, weight: 0 }}
                radius={radius}
              />
            );
          })}
      </MapContainer>

      <div className="absolute top-4 right-4 z-400 bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 rounded-xl p-2 backdrop-blur">
        <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">Layers</div>
        <div className="flex gap-2">
          <button
            onClick={() => setLayerMode("live")}
            className={`px-3 py-1 text-xs font-bold rounded-lg ${
              layerMode === "live"
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Live Ops
          </button>
          <button
            onClick={() => setLayerMode("sentiment")}
            className={`px-3 py-1 text-xs font-bold rounded-lg ${
              layerMode === "sentiment"
                ? "bg-red-600 text-white"
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Sentiment
          </button>
        </div>
      </div>
    </div>
  );
}
