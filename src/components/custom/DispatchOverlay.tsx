"use client";

import { Navigation, XCircle, CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MissionProps } from "@/components/custom/MissionCard";

type DispatchOverlayProps = {
  mission: MissionProps | null;
  onAccept: () => void;
  onDecline: () => void;
};

export default function DispatchOverlay({ mission, onAccept, onDecline }: DispatchOverlayProps) {
  if (!mission) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase text-slate-500 font-bold tracking-widest">Incoming Dispatch</div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{mission.title}</h3>
          </div>
          <Badge
            className={`text-[10px] uppercase ${
              mission.severity === "high"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30"
                : mission.severity === "medium"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/30"
                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600"
            }`}
          >
            {mission.severity} priority
          </Badge>
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <MapPin size={14} className="text-blue-400" /> {mission.location}
          </div>
          <div className="text-xs text-slate-500">Distance: {mission.distance}</div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {mission.desc ?? "Details incoming from command center."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XCircle size={14} /> Decline
          </button>
          <button
            onClick={onAccept}
            className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={14} /> Accept
          </button>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-2">
          <Navigation size={12} /> Auto-navigation will start on accept.
        </div>
      </div>
    </div>
  );
}
