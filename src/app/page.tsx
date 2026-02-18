"use client";

import SOSButton from "@/components/custom/SOSButton";
import GovHeader from "@/components/custom/GovHeader";
import PanicToCalmPanel from "@/components/custom/PanicToCalmPanel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Heart, Home as HomeIcon, Package, Activity, ShieldCheck, Newspaper, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import IoTWaterLevel from "@/components/custom/IoTWaterLevel";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <GovHeader />

      <div className="bg-red-600 dark:bg-red-900/90 text-white text-sm font-bold py-2 overflow-hidden relative shadow-md z-30">
        <div className="animate-marquee whitespace-nowrap flex gap-10 items-center">
          <span className="flex items-center gap-2 text-yellow-300">
            <Megaphone size={14} /> URGENT: Red Alert declared for Solapur.
          </span>
          <span>|</span>
          <span>Ujani Dam water levels at 98%.</span>
          <span>|</span>
          <span>Helpline: 0217-2731010</span>
          <span>|</span>
          <span>NDRF Team #4 deployed to Akkalkot.</span>
        </div>
      </div>

      <main className="pb-20 relative">
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/India_relief_location_map.jpg/600px-India_relief_location_map.jpg')] bg-cover bg-center grayscale mix-blend-overlay"></div>

        <section className="relative pt-8 pb-10 md:pt-10 md:pb-14 flex flex-col items-center justify-center text-center px-4 overflow-hidden z-10">
          <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 px-4 py-1 shadow-sm">
            <ShieldCheck size={12} className="mr-2" /> OFFICIAL GOVT OF MAHARASHTRA PORTAL
          </Badge>

          <h2 className="text-3xl md:text-6xl font-black tracking-tight mb-4 text-slate-800 dark:text-slate-100 leading-tight">
            Crisis Response <br className="hidden md:block" /> <span className="text-blue-600 dark:text-blue-500">Unified.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-6 text-base md:text-lg font-medium">
            Direct link to <span className="font-bold text-slate-900 dark:text-white">District Control Room</span>.
            <br />
            Request help, find shelter, or report damage instantly.
          </p>

          <div className="scale-95 md:scale-100 z-20 drop-shadow-2xl">
            <SOSButton />
          </div>
          <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            GPS TRACKING ACTIVE | VOICE RECORDING ENABLED
          </p>
        </section>
         <section className="px-4 max-w-3xl mx-auto mb-12 relative z-30">
          <IoTWaterLevel />
         </section>
        <section className="px-4 max-w-6xl mx-auto -mt-4 relative z-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: HomeIcon, label: "Find Shelter", desc: "12 Camps Active", color: "bg-blue-600", border: "border-blue-200 dark:border-blue-800" },
              { icon: Package, label: "Food & Ration", desc: "Request Kit", color: "bg-orange-600", border: "border-orange-200 dark:border-orange-800" },
              { icon: Activity, label: "Medical Aid", desc: "Ambulance Status", color: "bg-red-600", border: "border-red-200 dark:border-red-800" },
              { icon: Newspaper, label: "Gov Orders", desc: "Collector Notices", color: "bg-green-600", border: "border-green-200 dark:border-green-800" },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className={`bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border ${item.border} shadow-lg flex flex-col items-center text-center gap-3 cursor-pointer transition-all hover:shadow-xl`}
              >
                <div className={`p-3 rounded-full ${item.color} text-white shadow-md`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <PanicToCalmPanel />

        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Heart className="text-red-500 fill-red-500" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Ground Zero Updates</h3>
              </div>
              <div className="space-y-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        LIVE PHOTO
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          NDRF OPERATION
                        </Badge>
                        <span className="text-[10px] text-slate-400">2 hrs ago</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 transition-colors">
                        40 Villagers Airlifted from Kondi
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Team Alpha used OneKont GPS coordinates to locate the Patil family stranded on a rooftop near the Sina river bank.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group">
                  <CardContent className="p-4 flex gap-4">
                    <div className="h-24 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0 overflow-hidden relative">
                      <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        LIVE PHOTO
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2 text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          COMMUNITY
                        </Badge>
                        <span className="text-[10px] text-slate-400">5 hrs ago</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-blue-600 transition-colors">
                        Food Supply Chain Restored
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        Local NGO "Seva Sankalp" delivered 500 packets to Shelter #4 using the volunteer route map.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MapPin size={100} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Activity className="text-blue-500" /> Solapur District Status
              </h3>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">1,204</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Citizens Safe</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-green-600 dark:text-green-400">14</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Active Shelters</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-orange-600 dark:text-orange-400">82</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Relief Teams</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-600 dark:text-purple-400">450+</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Volunteers</div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <p className="text-[10px] text-slate-500">Last updated: 10 mins ago</p>
                <Badge variant="outline" className="text-[10px]">
                  VERIFIED BY COLLECTOR
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
