"use client";

import { useState, useEffect } from "react";
import { Activity, Waves, Wifi } from "lucide-react";

export default function IoTWaterLevel() {
  const [level, setLevel] = useState(98.4);
  const [flow, setFlow] = useState(1240);

  // Simulate live sensor data stream
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random fluctuations to make it look "alive"
      setLevel(prev => +(prev + (Math.random() * 0.1 - 0.05)).toFixed(2));
      setFlow(prev => Math.floor(prev + (Math.random() * 10 - 5)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-linear-to-br from-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-blue-800 relative overflow-hidden shadow-2xl">
      {/* Background Animation */}
      <div className="absolute -bottom-10 -right-10 opacity-10 animate-pulse text-blue-400">
        <Waves size={180} />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-blue-200 text-sm tracking-wider">
            <Activity size={16} className="text-red-400 animate-pulse" />
            IoT SENSOR FEED: UJANI DAM
          </h3>
          <p className="text-[10px] text-slate-400 font-mono mt-1">LAT: 18.0765° N | LNG: 75.1234° E</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/50 rounded-full border border-blue-700/50 backdrop-blur-sm">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
           <span className="text-[10px] font-mono text-blue-200 font-bold">LIVE DATA</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 relative z-10">
        {/* Water Level Gauge */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs text-blue-300 font-medium">Water Capacity</p>
            <p className="text-xs font-mono text-red-400 font-bold animate-pulse">CRITICAL</p>
          </div>
          <div className="text-5xl font-black tabular-nums tracking-tighter text-white drop-shadow-lg">
            {level}<span className="text-2xl text-blue-400">%</span>
          </div>
          
          <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden border border-slate-700">
            <div 
              className="bg-linear-to-r from-blue-500 via-blue-400 to-red-500 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
              style={{ width: `${level}%` }}
            ></div>
          </div>
        </div>

        {/* Inflow Rate */}
        <div className="border-l border-blue-800 pl-8">
          <p className="text-xs text-blue-300 font-medium mb-1">Inflow Rate (Cusecs)</p>
          <div className="text-4xl font-black tabular-nums tracking-tighter text-white">
            {flow.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 bg-slate-900/50 w-fit px-2 py-1 rounded border border-slate-700">
            <Wifi size={10} /> Sensor ID: #IOT-WS-882
          </div>
        </div>
      </div>
    </div>
  );
}