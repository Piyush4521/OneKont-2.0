"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import {
  ShieldAlert,
  Activity,
  Users,
  Truck,
  AlertTriangle,
  Building,
  Sprout,
  Coins,
  FileText,
  History,
  PlayCircle,
  StopCircle,
  Megaphone,
  Flame,
  Droplet,
} from "lucide-react";
import MapWrapper from "@/components/custom/MapWrapper";
import ArchiveMapPanel from "@/components/custom/ArchiveMapPanel";
import { useDisaster } from "@/context/DisasterContext";
import RoleGuard from "@/components/custom/RoleGuard";

const impactData = [
  { time: "08:00", calls: 12 },
  { time: "10:00", calls: 35 },
  { time: "12:00", calls: 145 },
  { time: "14:00", calls: 110 },
  { time: "16:00", calls: 85 },
];

const damageData = [
  { category: "Housing", amount: 450, label: "Rs 4.5 Cr" },
  { category: "Agriculture", amount: 820, label: "Rs 8.2 Cr" },
  { category: "Infra (Roads)", amount: 310, label: "Rs 3.1 Cr" },
  { category: "Livestock", amount: 50, label: "Rs 0.5 Cr" },
];

const rumorFeed = [
  {
    id: 1,
    title: "Dam wall breach rumor near Ujani",
    status: "Debunked",
    source: "Social Media",
    action: "Publish correction with collector note",
  },
  {
    id: 2,
    title: "False NDRF evacuation order",
    status: "Under Review",
    source: "WhatsApp",
    action: "Verify with command center",
  },
  {
    id: 3,
    title: "Food supplies finished at Camp #3",
    status: "Verified",
    source: "Volunteer",
    action: "Dispatch supply convoy",
  },
];

const evidenceClips = [
  { id: 1, label: "SOS Audio #1298", duration: "00:18", severity: "Critical" },
  { id: 2, label: "SOS Audio #1304", duration: "00:12", severity: "High" },
  { id: 3, label: "SOS Audio #1310", duration: "00:24", severity: "Medium" },
];

const sentimentZones = [
  {
    id: 1,
    label: "Kondi Sector",
    level: "High Panic",
    icon: Flame,
    color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40",
  },
  {
    id: 2,
    label: "North Bazaar",
    level: "Resource Need",
    icon: Droplet,
    color: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/40",
  },
  {
    id: 3,
    label: "Shelter Belt",
    level: "Stable",
    icon: Droplet,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40",
  },
];

const formatIncidentTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function AdminDashboard() {
  const { incidents, activeVolunteers, verifyIncident } = useDisaster();
  const [playingId, setPlayingId] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const tooltipStyle = isDark
    ? { backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }
    : { backgroundColor: "#ffffff", border: "1px solid #e2e8f0", color: "#0f172a" };

  const totalSOS = incidents.length;
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const unverifiedCount = incidents.filter((i) => !i.verified).length;

  const waterNeeded = totalSOS * 25;
  const foodNeeded = totalSOS * 8;
  const medKitsNeeded = criticalCount * 3;
  const boatsNeeded = Math.max(2, Math.ceil(criticalCount / 2));

  return (
    <RoleGuard allow={["gov"]}>
      <div className="space-y-6 pb-20 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100">
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Activity className="text-blue-500" /> Solapur District Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">JURISDICTION: SOLAPUR DIVISION | ID: #MH-13-GOV</p>
          </div>
          <div className="flex gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs text-slate-500 dark:text-slate-400">System Status</div>
              <div className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> ONLINE
              </div>
            </div>
          </div>
        </div>

      <Tabs defaultValue="live" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-12">
          <TabsTrigger value="live" className="data-[state=active]:bg-red-600 data-[state=active]:text-white font-bold text-slate-600 dark:text-slate-300">
            <Activity size={16} className="mr-2" /> LIVE OPERATIONS (WAR ROOM)
          </TabsTrigger>
          <TabsTrigger value="ministry" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold text-slate-600 dark:text-slate-300">
            <FileText size={16} className="mr-2" /> MINISTRY AUDIT & RECOVERY
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Incidents", val: totalSOS, icon: AlertTriangle, color: "text-red-500", sub: "+5 since login" },
              { label: "Active Personnel", val: activeVolunteers, icon: Users, color: "text-blue-500", sub: "Deployed (Active)" },
              { label: "Critical Cases", val: criticalCount, icon: Truck, color: "text-yellow-500", sub: "Immediate Action Req" },
              { label: "Unverified SOS", val: unverifiedCount, icon: ShieldAlert, color: "text-orange-500", sub: "Requires Verification" },
            ].map((stat, i) => (
              <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</div>
                  <div className={`text-[10px] font-bold ${stat.color} opacity-80`}>{stat.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative">
                <MapWrapper className="h-[320px] md:h-[420px] lg:h-[520px]" />
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/80 p-3 rounded-lg text-xs space-y-1 z-[400] border border-slate-200 dark:border-white/10">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">LIVE FEEDS</div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> SOS Beacon
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> Rescue Vehicle
                  </div>
                </div>
              </div>

              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <History size={16} /> Sentiment Heatmap Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sentimentZones.map((zone) => {
                    const Icon = zone.icon;
                    return (
                      <div key={zone.id} className={`rounded-xl border p-3 ${zone.color}`}>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <Icon size={14} /> {zone.label}
                        </div>
                        <div className="text-[10px] uppercase mt-1">{zone.level}</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="py-3">
                  <CardTitle className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Incoming SOS Volume</CardTitle>
                </CardHeader>
                <CardContent className="h-[160px] p-0 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={impactData}>
                      <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="calls" stroke="#ef4444" fillOpacity={1} fill="url(#colorCalls)" />
                      <Tooltip contentStyle={tooltipStyle} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="max-h-[520px] lg:max-h-[560px] overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Live Incident Feed</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-green-500 border-emerald-200 dark:border-green-500/20">
                    REAL-TIME
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={inc.severity === "Critical" ? "destructive" : "default"} className="text-[10px] h-5">
                            {inc.type}
                          </Badge>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{inc.location}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ID: #{inc.id} | {formatIncidentTime(inc.timestamp)}
                        </div>
                      </div>
                      {inc.verified ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-green-500/10 dark:text-green-500 dark:border-green-500/20 text-[10px]">Verified</Badge>
                      ) : (
                        <Button size="sm" variant="secondary" className="h-6 text-[10px]" onClick={() => verifyIncident(inc.id)}>
                          Verify
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone size={16} /> Resource Prediction
                </CardTitle>
                <CardDescription>Auto-calculated needs from live reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Water Needed</span>
                  <span className="font-bold">{waterNeeded} L</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Food Packs</span>
                  <span className="font-bold">{foodNeeded}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Medical Kits</span>
                  <span className="font-bold">{medKitsNeeded}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Rescue Boats</span>
                  <span className="font-bold">{boatsNeeded}</span>
                </div>
                <div className="text-[10px] text-slate-500">Calculated every 5 minutes.</div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Rumor Control Feed</CardTitle>
                <CardDescription>Official debunks and verified updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {rumorFeed.map((rumor) => (
                  <div key={rumor.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{rumor.title}</div>
                      <div className="text-xs text-slate-500">Source: {rumor.source}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={
                          rumor.status === "Debunked"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40"
                            : rumor.status === "Verified"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/40"
                        }
                      >
                        {rumor.status}
                      </Badge>
                      <Button size="sm" variant="secondary" className="text-[10px]">
                        {rumor.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Evidence Playback</CardTitle>
              <CardDescription>Review incoming SOS audio quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evidenceClips.map((clip) => {
                const isPlaying = playingId === clip.id;
                return (
                  <div key={clip.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{clip.label}</div>
                      <div className="text-xs text-slate-500">Duration: {clip.duration} | Severity: {clip.severity}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPlayingId(isPlaying ? null : clip.id)}
                      className="text-xs"
                    >
                      {isPlaying ? <StopCircle size={14} className="mr-2" /> : <PlayCircle size={14} className="mr-2" />}
                      {isPlaying ? "Stop" : "Play"}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ministry" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Building size={16} /> Est. Property Damage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white">Rs 16.3 Cr</div>
                <p className="text-xs text-red-500 mt-1">UP 12% vs last flood</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Sprout size={16} /> Crop Loss (Hectares)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white">1,240 Ha</div>
                <p className="text-xs text-slate-500 mt-1">Focus: Sugarcane and Jowar</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Coins size={16} /> Relief Funds Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900 dark:text-white">65%</div>
                <Progress value={65} className="h-2 mt-2 bg-slate-200 dark:bg-slate-800 [&>div]:bg-green-500" />
                <p className="text-xs text-slate-500 mt-1">Rs 6.5 Cr Disbursed / Rs 10 Cr Total</p>
              </CardContent>
            </Card>
          </div>

          <ArchiveMapPanel />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg">Economic Impact Analysis</CardTitle>
                <CardDescription>Breakdown of financial losses by sector</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={damageData}>
                    <XAxis dataKey="category" stroke={axisColor} fontSize={12} />
                    <YAxis stroke={axisColor} fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History size={18} /> Regional History
                </CardTitle>
                <CardDescription>Past major incidents in Solapur Division</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 1, year: "2025", type: "Flood", location: "Solapur City", status: "Recovery 80%", funds: "Rs 12 Cr" },
                    { id: 2, year: "2023", type: "Drought", location: "Pandharpur", status: "Closed", funds: "Rs 45 Cr" },
                    { id: 3, year: "2021", type: "Earthquake", location: "Latur Border", status: "Closed", funds: "Rs 8 Cr" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-200 dark:bg-slate-800 p-2 rounded-full font-bold text-slate-700 dark:text-slate-300 text-sm">{item.year}</div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.type}</div>
                          <div className="text-xs text-slate-500">{item.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {item.status}
                        </Badge>
                        <div className="text-xs text-slate-400">{item.funds} Spent</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </RoleGuard>
  );
}
