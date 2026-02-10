"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Siren, Volume2, MapPin, ShieldCheck, PhoneCall, X } from "lucide-react";
import VoiceRecorder from "@/components/custom/VoiceRecorder";
import AIReportModal from "@/components/custom/AIReportModal";

type Coords = {
  lat: number;
  lng: number;
};

type SurvivalModeOverlayProps = {
  open: boolean;
  onClose: () => void;
  isOnline: boolean;
  location: Coords | null;
};

const shelters = [
  { name: "Shelter #4 - Kondi School", distance: "1.2 km", capacity: "140 beds" },
  { name: "Relief Camp - North Bazaar", distance: "2.8 km", capacity: "92 beds" },
  { name: "Community Hall - South Ward", distance: "4.1 km", capacity: "210 beds" },
];

const hospitals = [
  { name: "Civil Hospital, Solapur", distance: "3.6 km", triage: "24x7" },
  { name: "Rural Health Center", distance: "5.2 km", triage: "On call" },
];

const formatCoords = (coords: Coords | null) => {
  if (!coords) return "Locating...";
  return `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
};

const buildSmsPayload = (coords: Coords | null) => {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (!coords) return `SOS|L:0.000,0.000|P:H|T:${time}`;
  return `SOS|L:${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}|P:H|T:${time}`;
};

export default function SurvivalModeOverlay({
  open,
  onClose,
  isOnline,
  location,
}: SurvivalModeOverlayProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isWhistling, setIsWhistling] = useState(false);
  const whistleIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const smsPayload = useMemo(() => buildSmsPayload(location), [location]);
  const safeMessage = useMemo(() => {
    const coords = location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "last known location";
    return `I am safe at ${coords}. This is an automated safety update from OneKont.`;
  }, [location]);

  useEffect(() => {
    if (!open) {
      setIsWhistling(false);
    }
  }, [open]);

  useEffect(() => {
    if (!isWhistling) {
      if (whistleIntervalRef.current) {
        window.clearInterval(whistleIntervalRef.current);
        whistleIntervalRef.current = null;
      }
      return;
    }

    const playTone = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.value = 2850;
      gain.gain.value = 0.06;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);
    };

    playTone();
    whistleIntervalRef.current = window.setInterval(playTone, 650);

    return () => {
      if (whistleIntervalRef.current) {
        window.clearInterval(whistleIntervalRef.current);
        whistleIntervalRef.current = null;
      }
    };
  }, [isWhistling]);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  const handleSafeBlast = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: safeMessage });
        setStatusMessage("Safe message shared.");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeMessage);
        setStatusMessage("Safe message copied for WhatsApp or SMS.");
        return;
      }
      setStatusMessage("Safe message ready.");
    } catch (error) {
      setStatusMessage("Unable to share. Try again.");
    }
  };

  const handleCopySms = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(smsPayload);
        setStatusMessage("SMS payload copied.");
      } else {
        setStatusMessage("SMS payload ready.");
      }
    } catch (error) {
      setStatusMessage("Could not copy SMS payload.");
    }
  };

  if (!open) return null;

  const overlay = (
    <div className="fixed inset-0 z-[200] bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Badge className="bg-red-600/20 text-red-300 border-red-500/40">Survival Mode</Badge>
            <h2 className="text-2xl md:text-4xl font-black">Stay Calm. Help is on the way.</h2>
            <p className="text-sm text-slate-400">
              High-contrast interface with battery saver. Location: {formatCoords(location)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white/10"
          >
            <X size={14} /> Exit Survival Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleSafeBlast}
            className="h-20 text-base font-bold bg-emerald-600 hover:bg-emerald-500 flex items-center gap-3"
          >
            <ShieldCheck size={20} /> I AM SAFE BLAST
          </Button>
          <Button
            onClick={() => setIsWhistling((prev) => !prev)}
            className={`h-20 text-base font-bold flex items-center gap-3 ${
              isWhistling ? "bg-yellow-500 hover:bg-yellow-400 text-black" : "bg-slate-800 hover:bg-slate-700"
            }`}
          >
            <Volume2 size={20} /> {isWhistling ? "STOP WHISTLE" : "WHISTLE BEACON"}
          </Button>
          <Button
            onClick={handleCopySms}
            className="h-20 text-base font-bold bg-blue-600 hover:bg-blue-500 flex items-center gap-3"
          >
            <Siren size={20} /> OFFLINE SMS BRIDGE
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" /> Offline Shelter Map
              </h3>
              <Badge variant="secondary" className="bg-slate-800 text-slate-200">
                Vector Packs Ready
              </Badge>
            </div>
            <div className="space-y-3">
              {shelters.map((shelter) => (
                <div key={shelter.name} className="bg-slate-950/70 border border-white/5 rounded-xl p-3">
                  <div className="font-semibold text-white">{shelter.name}</div>
                  <div className="text-xs text-slate-400">{shelter.distance} away - {shelter.capacity}</div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 space-y-3">
              {hospitals.map((hospital) => (
                <div key={hospital.name} className="bg-slate-950/70 border border-white/5 rounded-xl p-3">
                  <div className="font-semibold text-white">{hospital.name}</div>
                  <div className="text-xs text-slate-400">{hospital.distance} away - Triage: {hospital.triage}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <PhoneCall size={16} className="text-emerald-400" /> Rapid Report
              </h3>
              <Badge className={isOnline ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="space-y-3">
              <VoiceRecorder
                triggerLabel="VOICE SOS"
                triggerClassName="w-full justify-center rounded-xl bg-red-600 hover:bg-red-500 text-base py-4"
              />
              <AIReportModal
                triggerLabel="AI DAMAGE REPORT"
                triggerClassName="w-full justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-base py-4"
              />
            </div>
            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-3">
              <div className="text-[10px] uppercase text-slate-400 font-bold">Offline SMS Payload</div>
              <div className="text-xs text-slate-300 mt-2 break-all">{smsPayload}</div>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-white/10 border border-white/20 text-white text-sm rounded-xl px-4 py-3">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}
