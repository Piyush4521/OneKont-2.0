"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, MapPin, ShieldCheck, Trophy, AlertOctagon, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import EvidenceCamDialog from "@/components/custom/EvidenceCamDialog";
import { useDisaster } from "@/context/DisasterContext";
import type { Incident } from "@/lib/types";

type Coords = {
  lat: number;
  lng: number;
};

type DerivedAlert = {
  incident: Incident;
  distanceKm: number | null;
  timeLabel: string;
  confidenceScore: number;
  reportsLastHour: number;
};

const GEOFENCE_KM = 10;
const DEFAULT_COORDS: Coords = { lat: 17.6599, lng: 75.9064 };

const toRadians = (value: number) => (value * Math.PI) / 180;

const distanceKm = (from: Coords, to: Coords) => {
  const radiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
};

const parseIncidentTime = (incident: Incident) => {
  const candidates = [
    incident.timestamp,
    (incident as Incident & { created_at?: string }).created_at,
  ];

  for (const value of candidates) {
    if (!value) continue;
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const formatIncidentTime = (incident: Incident) => {
  const parsed = parseIncidentTime(incident);
  if (!parsed) return incident.timestamp || "Unknown";
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const confidenceFromIncident = (incident: Incident) => {
  const severityWeight = incident.severity === "Critical" ? 30 : incident.severity === "High" ? 20 : 10;
  const panicScore = typeof incident.panic === "number" ? Math.round(incident.panic * 40) : 15;
  const verifiedBoost = incident.verified ? 20 : 0;
  return clamp(30 + severityWeight + panicScore + verifiedBoost, 10, 100);
};

const buildRecentCounts = (incidentsWithDates: Array<{ incident: Incident; date: Date | null }>) => {
  const cutoff = Date.now() - 60 * 60 * 1000;
  const counts = new Map<string, number>();

  incidentsWithDates.forEach(({ incident, date }) => {
    if (!date || date.getTime() < cutoff) return;
    const key = incident.location?.toLowerCase() || "";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return counts;
};

const spamCheck = (reportsLastHour: number) => {
  if (reportsLastHour > 3) {
    return { isSpam: true, reason: "Rapid duplicate reports" };
  }
  return { isSpam: false, reason: "" };
};

export default function VerificationFeed() {
  const { incidents, verifyIncident, resolveIncident } = useDisaster();
  const [userCoords, setUserCoords] = useState<Coords | null>(null);
  const [karma, setKarma] = useState(0);
  const [animatingId, setAnimatingId] = useState<number | null>(null);
  const [capturedIds, setCapturedIds] = useState<Set<number>>(new Set());
  const actionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setUserCoords(DEFAULT_COORDS)
    );
  }, []);

  useEffect(() => {
    return () => {
      if (actionTimeoutRef.current) {
        window.clearTimeout(actionTimeoutRef.current);
        actionTimeoutRef.current = null;
      }
    };
  }, []);

  const alerts = useMemo(() => {
    const incidentsWithDates = incidents.map((incident) => ({
      incident,
      date: parseIncidentTime(incident),
    }));
    const recentCounts = buildRecentCounts(incidentsWithDates);

    const filtered = incidentsWithDates.filter(
      ({ incident }) => !incident.verified && incident.status !== "Resolved"
    );

    filtered.sort((a, b) => {
      const timeA = a.date ? a.date.getTime() : 0;
      const timeB = b.date ? b.date.getTime() : 0;
      return timeB - timeA;
    });

    return filtered.map(({ incident }) => {
        const distance =
          userCoords && Number.isFinite(incident.lat) && Number.isFinite(incident.lng)
            ? distanceKm(userCoords, { lat: incident.lat, lng: incident.lng })
            : null;
        const locationKey = incident.location?.toLowerCase() || "";
        const reportsLastHour = recentCounts.get(locationKey) ?? 0;

        return {
          incident,
          distanceKm: distance,
          timeLabel: formatIncidentTime(incident),
          confidenceScore: confidenceFromIncident(incident),
          reportsLastHour,
        } as DerivedAlert;
      });
  }, [incidents, userCoords]);

  const geofenceAlerts = useMemo(
    () => alerts.filter((alert) => alert.distanceKm !== null && alert.distanceKm <= GEOFENCE_KM),
    [alerts]
  );

  const queueAnimationReset = (id: number) => {
    if (actionTimeoutRef.current) {
      window.clearTimeout(actionTimeoutRef.current);
    }
    actionTimeoutRef.current = window.setTimeout(() => {
      setAnimatingId((prev) => (prev === id ? null : prev));
      actionTimeoutRef.current = null;
    }, 350);
  };

  const handleVerify = async (id: number) => {
    setAnimatingId(id);
    setKarma((prev) => prev + 10);
    await verifyIncident(id);
    queueAnimationReset(id);
  };

  const handleFake = async (id: number) => {
    setAnimatingId(id);
    setKarma((prev) => prev + 5);
    await resolveIncident(id);
    queueAnimationReset(id);
  };

  const handleCapture = (id: number) => {
    setCapturedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setKarma((prev) => prev + 5);
  };

  return (
    <Card className="w-full bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-200 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="text-green-500" /> Community Verify
          </CardTitle>

          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-3 py-1">
            <Trophy size={14} className="mr-1.5" /> {karma} Karma
          </Badge>
        </div>

        <div className="bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3">
          <Radar size={16} className="text-blue-400" />
          <div>
            <div className="font-semibold">10 km Geofence Alerts</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400">
              {geofenceAlerts.length} reports within {GEOFENCE_KM} km. Swipe right to confirm, left to flag.
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4 flex-1 overflow-y-auto custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
            <ShieldCheck size={48} className="mb-2 text-green-500" />
            <p className="text-sm font-medium">All caught up!</p>
            <p className="text-xs text-slate-400">No unverified reports nearby.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const { incident } = alert;
            const isLowConfidence = alert.confidenceScore < 40;
            const isExiting = animatingId === incident.id;
            const spamStatus = spamCheck(alert.reportsLastHour);
            const isNear = alert.distanceKm !== null && alert.distanceKm <= GEOFENCE_KM;
            const distanceLabel =
              alert.distanceKm !== null ? `${alert.distanceKm.toFixed(1)} km` : "Location unavailable";
            const evidenceCaptured = capturedIds.has(incident.id);

            return (
              <motion.div
                key={incident.id}
                drag="x"
                dragConstraints={{ left: -140, right: 140 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 110) handleVerify(incident.id);
                  if (info.offset.x < -110) handleFake(incident.id);
                }}
                className={`p-4 rounded-xl border transition-all duration-300 transform
                  ${isLowConfidence ? "opacity-70 border-yellow-200 dark:border-yellow-900" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"}
                  ${isExiting ? "opacity-0 translate-x-full" : "opacity-100"}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h4 className="font-bold flex items-center gap-2">
                      {isLowConfidence && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          LOW CONFIDENCE
                        </Badge>
                      )}
                      {spamStatus.isSpam && (
                        <Badge className="h-5 text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40">
                          AUTO-FLAG
                        </Badge>
                      )}
                      {incident.type} Alert
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin size={12} /> {incident.location} | {alert.timeLabel}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500">
                      Severity: {incident.severity} | Status: {incident.status} | Distance: {distanceLabel}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${alert.confidenceScore > 70 ? "text-green-500" : "text-yellow-500"}`}>
                      {alert.confidenceScore}%
                    </div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Confidence</div>
                  </div>
                </div>

                {spamStatus.isSpam && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-[10px] text-red-700 dark:text-red-300 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                    <AlertOctagon size={12} /> Spam filter: {spamStatus.reason}
                  </div>
                )}

                {isNear && (
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-[10px] text-blue-700 dark:text-blue-200 rounded-lg px-3 py-2 mb-3">
                    Geofence alert: Report is within {GEOFENCE_KM} km of your last known position.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <EvidenceCamDialog
                    triggerLabel={evidenceCaptured ? "Evidence Captured" : "Capture Evidence"}
                    triggerClassName={evidenceCaptured ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                    onCapture={() => handleCapture(incident.id)}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleVerify(incident.id)}
                      className="flex-1 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 hover:bg-green-500 hover:text-white text-green-700 dark:text-green-500 h-10"
                    >
                      <Check size={16} className="mr-2" /> VERIFY
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleFake(incident.id)}
                      className="flex-1 border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 hover:bg-red-500 hover:text-white text-red-700 dark:text-red-500 h-10"
                    >
                      <X size={16} className="mr-2" /> FAKE
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
