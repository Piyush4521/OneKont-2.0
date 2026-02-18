"use client";

import { useState } from "react";
import { Wifi, CheckCircle2, AlertTriangle, Droplets, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WalkieTalkiePanel({ channel }: { channel: string }) {
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const sendPing = async (status: string) => {
    setIsSending(true);
    // Fake a short network delay to make it feel real
    await new Promise((resolve) => setTimeout(resolve, 800));
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastPing(`STATUS SENT: ${status} • ${time}`);
    setIsSending(false);
  };

  const pings = [
    { label: "SAFE", color: "bg-emerald-600 hover:bg-emerald-500", icon: CheckCircle2 },
    { label: "TRAPPED", color: "bg-red-600 hover:bg-red-500", icon: AlertTriangle },
    { label: "NEED WATER", color: "bg-blue-600 hover:bg-blue-500", icon: Droplets },
    { label: "NO POWER", color: "bg-amber-600 hover:bg-amber-500", icon: Zap },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Wifi size={120} />
      </div>

      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Low-Bandwidth Link</h3>
          <div className="text-2xl font-black flex items-center gap-2">
            CH-{channel} 
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
        </div>
        <Badge variant="outline" className="border-slate-700 bg-slate-950 text-emerald-400 font-mono text-[10px] py-1 px-2">
          <Wifi size={10} className="mr-2" /> 14kbps STABLE
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
        {pings.map((ping) => (
          <button
            key={ping.label}
            onClick={() => sendPing(ping.label)}
            disabled={isSending}
            className={`${ping.color} disabled:opacity-50 active:scale-95 transition-all p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/10 shadow-lg group`}
          >
            <ping.icon size={24} className="text-white group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs tracking-wider">{ping.label}</span>
          </button>
        ))}
      </div>

      <div className="h-10 flex items-center justify-center text-[10px] font-mono text-slate-400 bg-slate-950/80 rounded-lg border border-slate-800 backdrop-blur-sm">
        {isSending ? (
          <span className="animate-pulse text-blue-400 flex items-center gap-2">
            <Wifi size={10} className="animate-bounce" /> UPLOADING PACKET...
          </span>
        ) : (
          lastPing || "READY FOR TRANSMISSION"
        )}
      </div>
    </div>
  );
}