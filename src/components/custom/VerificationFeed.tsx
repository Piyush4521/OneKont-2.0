"use client";

import { useMemo, useState } from "react";
import { Check, X, MapPin, ShieldCheck, Trophy, AlertOctagon, Radar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import EvidenceCamDialog from "@/components/custom/EvidenceCamDialog";

type AlertItem = {
  id: number;
  type: string;
  location: string;
  reporter: string;
  time: string;
  distanceKm: number;
  votes: { yes: number; no: number };
  speedKph: number;
  reportsLastHour: number;
  evidenceCaptured?: boolean;
};

const GEOFENCE_KM = 10;

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    type: "Fire",
    location: "Near Railway Station",
    reporter: "Anon_User",
    time: "2m ago",
    distanceKm: 2.4,
    votes: { yes: 12, no: 1 },
    speedKph: 18,
    reportsLastHour: 1,
  },
  {
    id: 2,
    type: "Flood",
    location: "Old Bridge Area",
    reporter: "Piyush_S",
    time: "5m ago",
    distanceKm: 12.6,
    votes: { yes: 3, no: 8 },
    speedKph: 92,
    reportsLastHour: 5,
  },
  {
    id: 3,
    type: "Road Block",
    location: "Sector 4 Main Road",
    reporter: "Rahul_K",
    time: "10m ago",
    distanceKm: 6.1,
    votes: { yes: 5, no: 0 },
    speedKph: 22,
    reportsLastHour: 2,
  },
];

const spamCheck = (alert: AlertItem) => {
  const flags = [];
  if (alert.speedKph > 80) flags.push("Speed anomaly");
  if (alert.reportsLastHour > 3) flags.push("Rapid spam reports");
  return {
    isSpam: flags.length > 0,
    reason: flags.join(" | "),
  };
};

export default function VerificationFeed() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [karma, setKarma] = useState(0);
  const [animatingId, setAnimatingId] = useState<number | null>(null);

  const geofenceAlerts = useMemo(
    () => alerts.filter((alert) => alert.distanceKm <= GEOFENCE_KM),
    [alerts]
  );

  const handleVote = (id: number) => {
    setAnimatingId(id);
    setKarma((prev) => prev + 10);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      setAnimatingId(null);
    }, 350);
  };

  const handleCapture = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, evidenceCaptured: true } : alert))
    );
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
            const totalVotes = alert.votes.yes + alert.votes.no;
            const trustScore = totalVotes === 0 ? 0 : Math.round((alert.votes.yes / totalVotes) * 100);
            const isFake = trustScore < 30 && totalVotes > 5;
            const isExiting = animatingId === alert.id;
            const spamStatus = spamCheck(alert);
            const isNear = alert.distanceKm <= GEOFENCE_KM;

            return (
              <motion.div
                key={alert.id}
                drag="x"
                dragConstraints={{ left: -140, right: 140 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 110) handleVote(alert.id);
                  if (info.offset.x < -110) handleVote(alert.id);
                }}
                className={`p-4 rounded-xl border transition-all duration-300 transform
                  ${isFake ? "opacity-50 grayscale border-red-200 dark:border-red-900" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"}
                  ${isExiting ? "opacity-0 translate-x-full" : "opacity-100"}
                `}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <h4 className="font-bold flex items-center gap-2">
                      {isFake && (
                        <Badge variant="destructive" className="h-5 text-[10px]">
                          POSSIBLE FAKE
                        </Badge>
                      )}
                      {spamStatus.isSpam && (
                        <Badge className="h-5 text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40">
                          AUTO-FLAG
                        </Badge>
                      )}
                      {alert.type} Alert
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <MapPin size={12} /> {alert.location} | {alert.time}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500">
                      Reporter: {alert.reporter} | Distance: {alert.distanceKm} km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${trustScore > 70 ? "text-green-500" : "text-yellow-500"}`}>
                      {trustScore}%
                    </div>
                    <div className="text-[10px] uppercase text-slate-500 font-bold">Trust Score</div>
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
                    triggerLabel={alert.evidenceCaptured ? "Evidence Captured" : "Capture Evidence"}
                    triggerClassName={alert.evidenceCaptured ? "bg-emerald-600 hover:bg-emerald-500" : ""}
                    onCapture={() => handleCapture(alert.id)}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleVote(alert.id)}
                      className="flex-1 border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 hover:bg-green-500 hover:text-white text-green-700 dark:text-green-500 h-10"
                    >
                      <Check size={16} className="mr-2" /> VERIFY
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleVote(alert.id)}
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
