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

type EvidenceFile = {
  id: string;
  kind: "audio" | "video";
  url: string;
  filename: string;
  size: number;
  createdAt: string;
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

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  const kb = value / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const pickMime = (candidates: string[]) => {
  if (typeof MediaRecorder === "undefined") return "";
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ?? "";
};

export default function SurvivalModeOverlay({
  open,
  onClose,
  isOnline,
  location,
}: SurvivalModeOverlayProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isWhistling, setIsWhistling] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const whistleIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<BlobPart[]>([]);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const evidenceRef = useRef<EvidenceFile[]>([]);
  const openRef = useRef(open);

  const smsPayload = useMemo(() => buildSmsPayload(location), [location]);
  const safeMessage = useMemo(() => {
    const coords = location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "last known location";
    return `I am safe at ${coords}. This is an automated safety update from OneKont.`;
  }, [location]);

  useEffect(() => {
    evidenceRef.current = evidence;
  }, [evidence]);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!isWhistling) {
      if (whistleIntervalRef.current) {
        window.clearInterval(whistleIntervalRef.current);
        whistleIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
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
    return () => {
      if (whistleIntervalRef.current) {
        window.clearInterval(whistleIntervalRef.current);
        whistleIntervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      evidenceRef.current.forEach((file) => URL.revokeObjectURL(file.url));
    };
  }, []);

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
    } catch {
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
    } catch {
      setStatusMessage("Could not copy SMS payload.");
    }
  };

  const stopEvidenceCapture = () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
      videoRecorderRef.current.stop();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
      audioRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    videoRecorderRef.current = null;
    audioRecorderRef.current = null;
  };

  const saveEvidence = (kind: EvidenceFile["kind"], blob: Blob, extension: string) => {
    if (!blob.size) return;
    const createdAt = new Date();
    const id = `${kind}-${createdAt.getTime()}`;
    const filename = `onekont-sos-${kind}-${createdAt.toISOString().replace(/[:.]/g, "-")}.${extension}`;
    const url = URL.createObjectURL(blob);
    const payload: EvidenceFile = {
      id,
      kind,
      url,
      filename,
      size: blob.size,
      createdAt: createdAt.toLocaleString(),
    };
    setEvidence((prev) => [payload, ...prev]);
  };

  const startEvidenceCapture = async () => {
    if (isRecording || typeof navigator === "undefined") return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMediaError("This browser does not support background audio/video capture.");
      return;
    }

    setMediaError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { facingMode: "environment" },
      });

      if (!openRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoChunksRef.current = [];
      audioChunksRef.current = [];

      const videoMime = pickMime(["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]);
      const audioMime = pickMime(["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"]);

      const videoRecorder = new MediaRecorder(stream, videoMime ? { mimeType: videoMime } : undefined);
      const audioStream = new MediaStream(stream.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioStream, audioMime ? { mimeType: audioMime } : undefined);

      videoRecorder.ondataavailable = (event) => {
        if (event.data?.size) videoChunksRef.current.push(event.data);
      };
      audioRecorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunksRef.current.push(event.data);
      };

      videoRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: videoRecorder.mimeType || "video/webm" });
        videoChunksRef.current = [];
        saveEvidence("video", blob, "webm");
      };

      audioRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: audioRecorder.mimeType || "audio/webm" });
        audioChunksRef.current = [];
        saveEvidence("audio", blob, "webm");
      };

      videoRecorderRef.current = videoRecorder;
      audioRecorderRef.current = audioRecorder;
      setIsRecording(true);
      videoRecorder.start();
      audioRecorder.start();
    } catch {
      setMediaError("Unable to access camera/microphone. Check permissions.");
      setIsRecording(false);
    }
  };

  const handleClose = () => {
    setIsWhistling(false);
    stopEvidenceCapture();
    onClose();
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
            onClick={handleClose}
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

            <div className="bg-slate-950/70 border border-white/5 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase text-slate-400 font-bold">SOS Evidence Capture</div>
                <Badge className={isRecording ? "bg-red-500/20 text-red-200" : "bg-slate-800 text-slate-300"}>
                  {isRecording ? "Recording" : "Idle"}
                </Badge>
              </div>
              {mediaError ? (
                <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                  {mediaError}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    {isRecording ? "Audio + video recording active." : "Tap to start recording evidence."}
                  </div>
                  <button
                    onClick={isRecording ? stopEvidenceCapture : startEvidenceCapture}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      isRecording
                        ? "bg-red-500/20 text-red-200 border-red-500/40"
                        : "bg-slate-800 text-slate-200 border-white/10"
                    }`}
                  >
                    {isRecording ? "Stop & Save" : "Start"}
                  </button>
                </div>
              )}
              <div className="text-[10px] text-slate-500">
                Saved files appear below and can be downloaded to your browser Downloads folder.
              </div>

              {evidence.length > 0 && (
                <div className="space-y-3">
                  {evidence.map((file) => (
                    <div key={file.id} className="bg-black/40 border border-white/10 rounded-lg p-2 space-y-2">
                      {file.kind === "audio" ? (
                        <audio controls src={file.url} className="w-full" />
                      ) : (
                        <video controls src={file.url} className="w-full h-32 bg-black rounded" />
                      )}
                      <div className="text-[10px] text-slate-400 flex items-center justify-between gap-2">
                        <span>{file.filename}</span>
                        <span>{formatBytes(file.size)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{file.createdAt}</div>
                      <a
                        href={file.url}
                        download={file.filename}
                        className="inline-block text-[10px] font-bold text-blue-300 hover:text-blue-200"
                      >
                        Download {file.kind.toUpperCase()}
                      </a>
                    </div>
                  ))}
                </div>
              )}
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
