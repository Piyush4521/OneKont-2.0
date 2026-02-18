"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Send, AlertTriangle, Activity } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VoiceRecorderProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

type Analysis = {
  transcription: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  type: "Flood" | "Fire" | "Medical" | "Collapse" | "Unknown";
  sentiment: "Calm" | "Concerned" | "Panicked";
  keywords: string[];
};

export default function VoiceRecorder({
  triggerLabel = "Voice SOS",
  triggerClassName,
}: VoiceRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  const stopMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    const tracks = mediaRecorderRef.current?.stream.getTracks();
    tracks?.forEach((track) => track.stop());
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await processAudio(blob);
        stopMedia();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAnalysis(null);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to use SOS.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;

      try {
        const res = await fetch("/api/ai/audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64Audio, mimeType: blob.type }),
        });

        const data = await res.json();
        setAnalysis(data);
      } catch (error) {
        console.error("AI Error", error);
      } finally {
        setIsProcessing(false);
      }
    };
  };

  const handleSendReport = async () => {
    if (!analysis) return;
    setIsSending(true);

    try {
      const panicLevel =
        analysis.sentiment === "Panicked" ? 0.9 : analysis.sentiment === "Concerned" ? 0.6 : 0.2;

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: analysis.type,
          location: "Live Voice Report",
          lat: 17.6599 + Math.random() * 0.01,
          lng: 75.9064 + Math.random() * 0.01,
          severity: analysis.priority,
          description: `Voice Transcript: ${analysis.transcription}`,
          panic: panicLevel,
          sentiment: analysis.sentiment,
          transcription: analysis.transcription,
        }),
      });

      if (res.ok) {
        setIsOpen(false);
        setAnalysis(null);
        alert("Emergency report sent successfully.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to send report.");
    } finally {
      setIsSending(false);
    }
  };

  const triggerClasses = cn(
    "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition border border-white/10 shadow-lg",
    "bg-red-600 text-white hover:bg-red-500",
    triggerClassName
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) stopMedia();
      }}
    >
      <DialogTrigger asChild>
        <button className={triggerClasses}>
          <Mic size={18} /> {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-105">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mic className="text-red-500" /> Voice Report
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-8 gap-6">
          <div
            className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-all duration-300
            ${isRecording ? "border-red-500 bg-red-500/10" : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900"}
          `}
          >
            {isRecording && (
              <>
                <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-75"></div>
                <div className="flex gap-1 h-8 items-end">
                  <div className="w-1 bg-red-500 animate-bounce h-4"></div>
                  <div className="w-1 bg-red-500 animate-[bounce_1.2s_infinite] h-8"></div>
                  <div className="w-1 bg-red-500 animate-[bounce_0.8s_infinite] h-6"></div>
                </div>
              </>
            )}
            {!isRecording && !isProcessing && <Mic size={40} className="text-slate-500" />}
            {isProcessing && <Loader2 size={40} className="text-blue-500 animate-spin" />}
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-bold text-lg">
              {isRecording ? "Listening..." : isProcessing ? "AI Analyzing Audio..." : "Tap to Record"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRecording ? "Describe the emergency clearly" : "We detect disaster type & panic level"}
            </p>
          </div>

          <div className="w-full space-y-4">
            {!analysis && !isProcessing && (
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-6 font-bold text-lg ${
                  isRecording
                    ? "bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="mr-2" fill="currentColor" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2" /> Start Recording
                  </>
                )}
              </Button>
            )}

            {analysis && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm italic text-slate-600 dark:text-slate-300">
                  &quot;{analysis.transcription}&quot;
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Detected Type</div>
                    <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      {analysis.type}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Priority</div>
                    <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity
                        size={14}
                        className={analysis.priority === "Critical" ? "text-red-600 animate-pulse" : "text-yellow-400"}
                      />
                      {analysis.priority}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">AI Sentiment Analysis</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px] uppercase",
                        analysis.sentiment === "Panicked"
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40"
                      )}
                    >
                      {analysis.sentiment}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleSendReport}
                  disabled={isSending}
                  className="w-full bg-green-600 hover:bg-green-500 font-bold"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={18} /> SENDING PRIORITY ALERT...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" size={18} /> SEND REPORT
                    </>
                  )}
                </Button>

                <button
                  onClick={() => setAnalysis(null)}
                  disabled={isSending}
                  className="w-full text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white mt-2"
                >
                  Record Again
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
