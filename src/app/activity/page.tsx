"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertTriangle, Truck, Users } from "lucide-react";

const activityLog = [
  { id: 1, time: "10:32", action: "SOS verified at Kondi Sector", status: "Verified" },
  { id: 2, time: "10:40", action: "Team Alpha dispatched to Sina River", status: "Dispatched" },
  { id: 3, time: "10:52", action: "Rumor debunked: Dam breach", status: "Debunked" },
  { id: 4, time: "11:08", action: "Relief supplies delivered to Shelter #4", status: "Completed" },
];

const activeDeployments = [
  { id: 1, team: "Team Alpha", task: "Rooftop rescue", eta: "5 mins" },
  { id: 2, team: "Team Bravo", task: "Food distribution", eta: "12 mins" },
  { id: 3, team: "Medical Unit 3", task: "Triage support", eta: "8 mins" },
];

export default function ActivityPage() {
  return (
    <div className="p-6 space-y-6 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-3xl font-black">Activity Log</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Live operational timeline and dispatch status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock size={16} /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLog.map((entry) => (
              <div key={entry.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{entry.action}</div>
                  <div className="text-xs text-slate-500">{entry.time} hrs</div>
                </div>
                <Badge
                  className={
                    entry.status === "Verified"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/40"
                      : entry.status === "Dispatched"
                      ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40"
                      : entry.status === "Debunked"
                      ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/40"
                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700/30 dark:text-slate-300 dark:border-slate-600/40"
                  }
                >
                  {entry.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck size={16} /> Active Deployments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeDeployments.map((deployment) => (
              <div key={deployment.id} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{deployment.team}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{deployment.task}</div>
                <div className="text-[10px] text-slate-500 uppercase">ETA: {deployment.eta}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={18} />
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Open Alerts</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">12</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="text-blue-500" size={18} />
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Volunteers Active</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">458</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500" size={18} />
            <div>
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 font-bold">Resolved Today</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">34</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
