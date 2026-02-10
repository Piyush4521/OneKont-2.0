"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Siren, Mic, ShieldCheck, MessageCircle, Volume2, MapPin } from "lucide-react";

const features = [
  {
    title: "One-Tap SOS",
    description: "Single press to broadcast a verified emergency alert.",
    icon: Siren,
    tone: "text-red-400",
  },
  {
    title: "Voice SOS + Sentiment",
    description: "Speech-to-text with urgency and disaster detection.",
    icon: Mic,
    tone: "text-blue-400",
  },
  {
    title: "I Am Safe Blast",
    description: "Share a safety update to WhatsApp or SMS in one tap.",
    icon: ShieldCheck,
    tone: "text-emerald-400",
  },
  {
    title: "Offline SMS Bridge",
    description: "Compressed GPS payload when the internet is down.",
    icon: MessageCircle,
    tone: "text-purple-400",
  },
  {
    title: "Whistle Beacon",
    description: "High-frequency sound to help rescue teams locate you.",
    icon: Volume2,
    tone: "text-yellow-400",
  },
  {
    title: "Offline Vector Maps",
    description: "Shelters and hospitals cached for no-network use.",
    icon: MapPin,
    tone: "text-cyan-400",
  },
];

export default function PanicToCalmPanel() {
  return (
    <section className="px-6 py-16 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 mb-3">Victim Side</Badge>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Panic-to-Calm Interface
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-2">
            Built for people under stress. Large actions, instant feedback, and offline-first survival tools.
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          Designed for battery saver and low connectivity
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl bg-slate-900/5 dark:bg-white/5 ${feature.tone}`}>
                    <Icon size={20} />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{feature.title}</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
