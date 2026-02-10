"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, RefreshCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Coords = {
  lat: number;
  lng: number;
};

type EvidencePayload = {
  dataUrl: string;
  timestamp: string;
  coords: Coords | null;
};

type EvidenceCamDialogProps = {
  triggerLabel?: string;
  triggerClassName?: string;
  onCapture?: (payload: EvidencePayload) => void;
};

export default function EvidenceCamDialog({
  triggerLabel = "Open Evidence Cam",
  triggerClassName,
  onCapture,
}: EvidenceCamDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<EvidencePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setError(null);
      } catch (err) {
        setError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSnapshot(null);
      setError(null);
    }
  }, [isOpen]);

  const capture = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

    let coords: Coords | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 4000,
        });
      });
      coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (err) {
      coords = null;
    }

    const payload: EvidencePayload = {
      dataUrl,
      timestamp: new Date().toLocaleString(),
      coords,
    };

    setSnapshot(payload);
    onCapture?.(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 border border-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-white/10 dark:hover:bg-slate-700",
            triggerClassName
          )}
        >
          <Camera size={14} /> {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="text-blue-400" /> Secure Evidence Cam
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3 rounded-lg">
              {error}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-black">
              <video ref={videoRef} className="w-full h-56 object-cover" playsInline muted />
            </div>
          )}

          {snapshot && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img src={snapshot.dataUrl} alt="Evidence capture" className="w-full h-40 object-cover" />
              <div className="p-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>Timestamp: {snapshot.timestamp}</div>
                <div>
                  Location:{" "}
                  {snapshot.coords ? `${snapshot.coords.lat.toFixed(4)}, ${snapshot.coords.lng.toFixed(4)}` : "Unavailable"}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={capture}
              className="flex-1 bg-blue-600 hover:bg-blue-500 font-bold"
              disabled={!!error}
            >
              <CheckCircle2 className="mr-2" size={16} /> Capture Evidence
            </Button>
            {snapshot && (
              <Button variant="secondary" className="flex-1" onClick={() => setSnapshot(null)}>
                <RefreshCcw className="mr-2" size={16} /> Retake
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
