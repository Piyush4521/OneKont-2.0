"use client";

import { useState } from "react";
import { Radio, Mic, MicOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WalkieTalkiePanelProps = {
  channel: string;
};

export default function WalkieTalkiePanel({ channel }: WalkieTalkiePanelProps) {
  const [isTransmitting, setIsTransmitting] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 text-slate-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold tracking-widest">Walkie-Talkie</div>
          <div className="text-lg font-black text-slate-900 dark:text-white">Channel {channel}</div>
        </div>
        <Badge
          className={
            isTransmitting
              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40"
          }
        >
          {isTransmitting ? "Transmitting" : "Ready"}
        </Badge>
      </div>

      <div className="bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-400">
        Push-to-talk uses low-bandwidth WebRTC audio. Keep it pressed while speaking.
      </div>

      <button
        className={`w-full py-6 rounded-2xl font-bold text-sm tracking-widest transition-all flex items-center justify-center gap-2
          ${
            isTransmitting
              ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
              : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }
        `}
        onPointerDown={() => setIsTransmitting(true)}
        onPointerUp={() => setIsTransmitting(false)}
        onPointerLeave={() => setIsTransmitting(false)}
      >
        {isTransmitting ? <Mic size={18} /> : <MicOff size={18} />} PUSH TO TALK
      </button>

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Radio size={12} /> Team status: 5 responders online
      </div>
    </div>
  );
}
