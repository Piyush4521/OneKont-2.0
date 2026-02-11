"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Package, CheckCircle2, Radio, Shield, MapPin, Award, Users, HeartPulse, Truck } from "lucide-react";
import MapWrapper from "@/components/custom/MapWrapper";
import MissionCard, { MissionProps } from "@/components/custom/MissionCard";
import DispatchOverlay from "@/components/custom/DispatchOverlay";
import WalkieTalkiePanel from "@/components/custom/WalkieTalkiePanel";

type Role = "Police" | "NDRF" | "Doctor" | "NGO";

const roles: { id: Role; label: string; badge: string; icon: typeof Shield }[] = [
  { id: "Police", label: "Police", badge: "Crowd Control", icon: Shield },
  { id: "NDRF", label: "NDRF", badge: "Rescue Ops", icon: Truck },
  { id: "Doctor", label: "Doctors", badge: "Medical", icon: HeartPulse },
  { id: "NGO", label: "NGO", badge: "Relief", icon: Users },
];

const initialMissions: Record<Role, MissionProps[]> = {
  Police: [
    {
      id: 101,
      title: "Crowd Control at Relief Camp",
      location: "Shelter #2 (North Solapur)",
      severity: "medium",
      distance: "1.1 km",
      status: "pending",
      desc: "Manage entry flow and secure medical triage zone.",
      role: "Police",
    },
  ],
  NDRF: [
    {
      id: 1,
      title: "Deliver Insulin Kits",
      location: "Shelter #4 (Kondi School)",
      severity: "high",
      distance: "1.2 km",
      status: "pending",
      desc: "Urgent request from Dr. Deshmukh. 10 kits needed.",
      role: "NDRF",
    },
    {
      id: 2,
      title: "Food Distribution",
      location: "North Solapur Bazaar",
      severity: "medium",
      distance: "3.5 km",
      status: "pending",
      desc: "Distribute 50 thepla packets to stranded workers.",
      role: "NDRF",
    },
  ],
  Doctor: [
    {
      id: 201,
      title: "Critical Triage Support",
      location: "Mobile Clinic Unit 3",
      severity: "high",
      distance: "2.4 km",
      status: "pending",
      desc: "3 patients need immediate stabilization and transport.",
      role: "Doctor",
    },
  ],
  NGO: [
    {
      id: 301,
      title: "Dry Ration Supply",
      location: "Sector 4 Relief Hub",
      severity: "medium",
      distance: "2.9 km",
      status: "pending",
      desc: "Stock low. Coordinate 200 ration kits delivery.",
      role: "NGO",
    },
  ],
};

const dispatchByRole: Record<Role, MissionProps> = {
  Police: {
    id: 901,
    title: "Traffic Diversion Setup",
    location: "Old Bridge Junction",
    severity: "high",
    distance: "0.8 km",
    status: "pending",
    desc: "Set barricades and clear evacuation lanes.",
    role: "Police",
  },
  NDRF: {
    id: 902,
    title: "Rescue Needed - 500m Away",
    location: "Sina River Bend",
    severity: "high",
    distance: "0.5 km",
    status: "pending",
    desc: "Family stranded on rooftop. Boats required.",
    role: "NDRF",
  },
  Doctor: {
    id: 903,
    title: "Emergency Evacuation",
    location: "Shelter #5",
    severity: "high",
    distance: "1.6 km",
    status: "pending",
    desc: "Two critical patients need hospital transfer.",
    role: "Doctor",
  },
  NGO: {
    id: 904,
    title: "Water Purification Drop",
    location: "Camp Extension East",
    severity: "medium",
    distance: "2.0 km",
    status: "pending",
    desc: "Distribute chlorine tablets and water cans.",
    role: "NGO",
  },
};

const inventorySeed = [
  { label: "Ration Kits", value: 45, icon: Package },
  { label: "Empty Seats", value: 4, icon: Users },
  { label: "Medical Kits", value: 18, icon: HeartPulse },
  { label: "Rescue Boats", value: 5, icon: Truck },
];

export default function VolunteersPage() {
  const [activeRole, setActiveRole] = useState<Role>("NDRF");
  const [roleMissions, setRoleMissions] = useState(initialMissions);
  const [dispatchMission, setDispatchMission] = useState<MissionProps | null>(null);
  const [karmaPoints, setKarmaPoints] = useState(850);
  const [inventory, setInventory] = useState(inventorySeed);

  const missions = roleMissions[activeRole];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDispatchMission(dispatchByRole[activeRole]);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [activeRole]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setInventory((prev) =>
        prev.map((item) => ({
          ...item,
          value: Math.max(0, item.value + (Math.random() > 0.6 ? 1 : -1)),
        }))
      );
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  const badges = useMemo(() => {
    if (karmaPoints > 900) return ["Flood Hero", "Rapid Responder", "First Aid Ace"];
    if (karmaPoints > 700) return ["Relief Runner", "Storm Shield"];
    return ["Volunteer"];
  }, [karmaPoints]);

  const handleAcceptDispatch = () => {
    if (!dispatchMission) return;
    setRoleMissions((prev) => ({
      ...prev,
      [activeRole]: [{ ...dispatchMission, status: "accepted" }, ...prev[activeRole]],
    }));
    setDispatchMission(null);
    setKarmaPoints((prev) => prev + 30);
  };

  const handleDeclineDispatch = () => {
    setDispatchMission(null);
  };

  const handleMissionStatus = (id: number, status: MissionProps["status"]) => {
    setRoleMissions((prev) => ({
      ...prev,
      [activeRole]: prev[activeRole].map((mission) => (mission.id === id ? { ...mission, status } : mission)),
    }));
    if (status === "completed") {
      setKarmaPoints((prev) => prev + 40);
    }
  };

  return (
    <div className="pb-24 space-y-6 max-w-md mx-auto md:max-w-5xl p-4 text-slate-900 dark:text-slate-100">
      <DispatchOverlay mission={dispatchMission} onAccept={handleAcceptDispatch} onDecline={handleDeclineDispatch} />

      <div className="bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 relative z-10">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">VOLUNTEER ID: VOL-2026-X9</div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="text-blue-500 fill-blue-500/20" /> SQUAD ALPHA
            </h1>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/50 animate-pulse">
                <Radio size={10} className="mr-1" /> LIVE TRACKING
              </Badge>
              <span className="text-xs text-slate-600 dark:text-slate-500">Zone: Kondi Sector</span>
            </div>
          </div>
          <div className="text-left md:text-right space-y-2">
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">IMPACT SCORE</div>
              <div className="text-3xl font-black text-yellow-400">{karmaPoints}</div>
              <div className="text-xs text-slate-600 dark:text-slate-500">Level 4 Rescuer</div>
            </div>
            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              {badges.map((badge) => (
                <Badge key={badge} className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-600/20 dark:text-blue-200 dark:border-blue-500/40">
                  <Award size={12} className="mr-1" /> {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest mb-3">Role-Based Login</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Icon size={14} /> {role.label}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{role.badge}</div>
              </button>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="missions" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-14 rounded-xl p-1">
          <TabsTrigger value="missions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300">
            MISSIONS ({missions.length})
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300">
            GPS MAP
          </TabsTrigger>
          <TabsTrigger value="inventory" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300">
            INVENTORY
          </TabsTrigger>
          <TabsTrigger value="comms" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300">
            COMMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="missions" className="space-y-4 mt-4 animate-in slide-in-from-left-4 fade-in">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onStatusChange={handleMissionStatus} />
          ))}
        </TabsContent>

        <TabsContent value="map" className="h-[500px] mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative bg-white dark:bg-slate-950 animate-in zoom-in-95 fade-in shadow-xl">
          <MapWrapper className="h-full" />
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 p-3 rounded-lg backdrop-blur-md flex flex-col gap-1 shadow-lg z-[400]">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Destination</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
              <MapPin size={12} className="text-red-500" /> Shelter #4
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">ETA: 12 mins</div>
          </div>
          <button className="absolute bottom-6 right-6 bg-blue-600 p-4 rounded-full text-white shadow-xl shadow-blue-500/40 hover:scale-110 transition active:scale-95 z-[400]">
            <Navigation size={24} />
          </button>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4 animate-in slide-in-from-right-4 fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inventory.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition">
                  <CardContent className="p-6 flex flex-col items-center gap-2">
                    <Icon className="text-blue-500" size={28} />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest text-center">{item.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-3">Auto-updates every 6 seconds from supply coordinators.</div>
        </TabsContent>

        <TabsContent value="comms" className="mt-4 animate-in slide-in-from-right-4 fade-in">
          <WalkieTalkiePanel channel="A-12" />
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-4 w-full max-w-md px-6 z-40">
        <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-2xl shadow-emerald-200/60 dark:shadow-emerald-900/40 flex items-center justify-center gap-2 transition active:scale-95 border border-emerald-200 dark:border-emerald-400/20">
          <CheckCircle2 /> UPDATE STATUS: SAFE
        </button>
      </div>
    </div>
  );
}
