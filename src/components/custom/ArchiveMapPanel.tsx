"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Calendar, Coins, Home, Sprout, PawPrint } from "lucide-react";

type ArchiveEvent = {
  id: string;
  title: string;
  type: "Flood" | "Drought" | "Earthquake";
  date: string;
  casualties: number;
  injured: number;
  displaced: number;
  camps: number;
  returned: number;
  propertyDamage: string;
  agricultureLoss: string;
  animalsLost: string;
  reliefAllocated: number;
  reliefDistributed: number;
  reliefPending: number;
  reconstructionPercent: number;
};

type Region = {
  id: string;
  name: string;
  left: string;
  top: string;
  events: ArchiveEvent[];
};

const regions: Region[] = [
  {
    id: "solapur",
    name: "Solapur",
    left: "58%",
    top: "56%",
    events: [
      {
        id: "solapur-flood-2026",
        title: "Solapur Flood - Aug 2026",
        type: "Flood",
        date: "Aug 2026",
        casualties: 24,
        injured: 146,
        displaced: 4200,
        camps: 18,
        returned: 3100,
        propertyDamage: "Rs 16.3 Cr",
        agricultureLoss: "1240 Ha",
        animalsLost: "380 livestock",
        reliefAllocated: 5,
        reliefDistributed: 3.2,
        reliefPending: 1.8,
        reconstructionPercent: 60,
      },
      {
        id: "solapur-drought-2023",
        title: "Solapur Drought - May 2023",
        type: "Drought",
        date: "May 2023",
        casualties: 2,
        injured: 18,
        displaced: 980,
        camps: 6,
        returned: 720,
        propertyDamage: "Rs 4.8 Cr",
        agricultureLoss: "3420 Ha",
        animalsLost: "720 livestock",
        reliefAllocated: 12,
        reliefDistributed: 11.1,
        reliefPending: 0.9,
        reconstructionPercent: 92,
      },
    ],
  },
  {
    id: "latur",
    name: "Latur Border",
    left: "52%",
    top: "60%",
    events: [
      {
        id: "latur-quake-2021",
        title: "Latur Quake - Nov 2021",
        type: "Earthquake",
        date: "Nov 2021",
        casualties: 19,
        injured: 210,
        displaced: 1800,
        camps: 8,
        returned: 1500,
        propertyDamage: "Rs 8.1 Cr",
        agricultureLoss: "210 Ha",
        animalsLost: "120 livestock",
        reliefAllocated: 8,
        reliefDistributed: 7.2,
        reliefPending: 0.8,
        reconstructionPercent: 78,
      },
    ],
  },
];

const typeColor = {
  Flood: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40",
  Drought: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-200 dark:border-orange-500/40",
  Earthquake: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/40",
};

export default function ArchiveMapPanel() {
  const [selectedRegionId, setSelectedRegionId] = useState(regions[0].id);
  const [selectedEventId, setSelectedEventId] = useState(regions[0].events[0].id);

  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegionId) ?? regions[0],
    [selectedRegionId]
  );
  const selectedEvent = useMemo(
    () => selectedRegion.events.find((event) => event.id === selectedEventId) ?? selectedRegion.events[0],
    [selectedRegion, selectedEventId]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold mb-3">Disaster Archive Map</div>
          <div className="relative h-[360px] rounded-xl border border-slate-200 dark:border-slate-800 bg-[url('/globe.svg')] bg-center bg-no-repeat bg-contain">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => {
                  setSelectedRegionId(region.id);
                  setSelectedEventId(region.events[0].id);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-full text-[10px] font-bold border shadow-lg
                  ${selectedRegionId === region.id ? "bg-blue-600 text-white border-blue-400" : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"}
                `}
                style={{ left: region.left, top: region.top }}
              >
                <MapPin size={10} className="inline mr-1" /> {region.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold mb-3">Timeline Card</div>
          <div className="space-y-3">
            {selectedRegion.events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  selectedEventId === event.id
                    ? "border-blue-500 bg-slate-50 dark:bg-slate-950"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 dark:text-white">{event.title}</div>
                  <Badge className={typeColor[event.type]}>{event.type}</Badge>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-2">
                  <Calendar size={12} /> {event.date}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Human Impact</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Casualties</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{selectedEvent.casualties}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Injured</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{selectedEvent.injured}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Displaced</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{selectedEvent.displaced}</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Camps: {selectedEvent.camps} | Returned: {selectedEvent.returned}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Event Type</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{selectedEvent.type}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Economic Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <Home className="text-blue-400" size={18} />
              <div>
                <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Property Damage</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.propertyDamage}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <Sprout className="text-emerald-400" size={18} />
              <div>
                <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Agriculture Loss</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.agricultureLoss}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <PawPrint className="text-yellow-400" size={18} />
              <div>
                <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Animals</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{selectedEvent.animalsLost}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Recovery Tracker</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
              <Coins size={12} /> Relief Fund
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white mt-2">
              Rs {selectedEvent.reliefAllocated} Cr Allocated
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rs {selectedEvent.reliefDistributed} Cr Distributed | Rs {selectedEvent.reliefPending} Cr Pending
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:col-span-2">
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Reconstruction Progress</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">{selectedEvent.reconstructionPercent}% Completed</div>
            <Progress value={selectedEvent.reconstructionPercent} className="h-2 mt-3 bg-slate-200 dark:bg-slate-800 [&>div]:bg-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
