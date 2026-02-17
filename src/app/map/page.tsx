"use client";

import MapWrapper from "@/components/custom/MapWrapper";
import VerificationFeed from "@/components/custom/VerificationFeed";
import { useDisaster } from "@/context/DisasterContext";
export default function MapPage() {
   const { incidents, activeVolunteers } = useDisaster();
   const activeSOS = incidents.filter((incident) => incident.status !== "Resolved").length;
   const rescued = incidents.filter((incident) => incident.status === "Resolved").length;
   const teams = activeVolunteers;
   return (
        <div className="space-y-6 h-[calc(100vh-100px)] text-slate-900 dark:text-slate-100"> {/* Set fixed height for layout */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Live Situational Awareness
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time tracking of Disasters & Assets</p>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold text-red-600 dark:text-red-400">LIVE FEED ACTIVE</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
                {/* Column 1 & 2: The Map (Takes up 2/3 space) */}
                <div className="lg:col-span-2 space-y-4">
                    <MapWrapper />
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs uppercase">Active SOS</h3>
                            <p className="text-2xl font-bold text-red-500">{activeSOS}</p>
                        </div>
                        <div className="p-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs uppercase">Rescued</h3>
                            <p className="text-2xl font-bold text-green-500">{rescued}</p>
                        </div>
                        <div className="p-4 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-xl">
                            <h3 className="text-slate-500 dark:text-slate-400 text-xs uppercase">Teams</h3>
                            <p className="text-2xl font-bold text-blue-500">{teams}</p>
                        </div>
                    </div>
                </div>

                {/* Column 3: The Verification Feed (Takes up 1/3 space) */}
                <div className="lg:col-span-1 h-full overflow-y-auto">
                    <VerificationFeed />
                    </div>
                </div>
            </div>
        );
    }
