"use client";

import { useEffect, useState } from "react";
import { MapPin, CheckCircle, AlertTriangle, Navigation, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MissionProps {
  id: number;
  title: string;
  location: string;
  severity: string;
  distance: string;
  status: string;
  desc?: string;
  role?: string;
}

type MissionCardProps = {
  mission: MissionProps;
  onStatusChange?: (id: number, status: MissionProps["status"]) => void;
};

export default function MissionCard({ mission, onStatusChange }: MissionCardProps) {
  const [status, setStatus] = useState(mission.status);

  useEffect(() => {
    setStatus(mission.status);
  }, [mission.status]);

  const updateStatus = (next: MissionProps["status"]) => {
    setStatus(next);
    onStatusChange?.(mission.id, next);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 animate-in slide-in-from-bottom-4 bg-white/90 border-slate-200 dark:bg-slate-900/50 dark:border-white/10
        ${status === "pending" ? "hover:border-blue-500/50" : ""}
        ${status === "accepted" ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200/60 dark:bg-blue-950/30 dark:border-blue-500/50 dark:ring-blue-500/30" : ""}
        ${status === "completed" ? "bg-green-50 border-green-200 opacity-80 dark:bg-green-950/30 dark:border-green-500/50" : ""}
      `}
    >
      <div
        className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl shadow-lg
        ${mission.severity === "high" ? "bg-red-600 text-white shadow-red-900/20" : mission.severity === "medium" ? "bg-orange-500 text-white shadow-orange-900/20" : "bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200"}
      `}
      >
        {mission.severity} Priority
      </div>

      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-xl shrink-0 transition-colors
          ${status === "pending" ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" : ""}
          ${status === "accepted" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 animate-pulse" : ""}
          ${status === "completed" ? "bg-green-600 text-white shadow-lg shadow-green-500/30" : ""}
        `}
        >
          {status === "completed" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">{mission.title}</h3>
            {mission.role && (
              <Badge className="bg-slate-100 text-slate-700 text-[10px] uppercase dark:bg-slate-800 dark:text-slate-300">
                <Star size={10} className="mr-1" /> {mission.role}
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <MapPin size={14} className="text-blue-600 dark:text-blue-500" />
              <span>{mission.location}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 font-mono">
              <span>- {mission.distance} from you</span>
            </div>
          </div>

          {status !== "completed" && mission.desc && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-950/50 p-2 rounded border border-slate-200 dark:border-white/5 line-clamp-2">
              "{mission.desc}"
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/5">
        {status === "pending" && (
          <button
            onClick={() => updateStatus("accepted")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            ACCEPT MISSION
          </button>
        )}

        {status === "accepted" && (
          <div className="flex gap-3 w-full">
            <button className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-slate-700 flex items-center justify-center gap-2">
              <Navigation size={14} /> NAVIGATE
            </button>
            <button
              onClick={() => updateStatus("completed")}
              className="flex-1 py-3 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-500 shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
            >
              <CheckCircle size={14} /> COMPLETE
            </button>
          </div>
        )}

        {status === "completed" && (
          <div className="w-full py-3 text-center text-green-700 dark:text-green-400 font-bold bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20 text-sm flex items-center justify-center gap-2">
            <CheckCircle2 size={16} /> MISSION ACCOMPLISHED
          </div>
        )}
      </div>
    </div>
  );
}
