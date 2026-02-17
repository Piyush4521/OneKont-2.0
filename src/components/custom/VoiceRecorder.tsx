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
  priority: "Low" | "Medium" | "High";
  disasterType: "Flood" | "Fire" | "Medical" | "Collapse" | "Unknown";
  sentiment: "Calm" | "Concerned" | "Panicked";
  keywords: string[];
};

const keywordGroups = {
  Flood: ["flood", "water", "dam", "overflow", "river"],
  Fire: ["fire", "smoke", "burn", "flames"],
  Medical: ["injured", "bleeding", "unconscious", "medical", "ambulance"],
  Collapse: ["collapse", "trapped", "building", "debris", "cracked"],
};

const priorityKeywords = {
  High: ["trapped", "collapsed", "bleeding", "unconscious", "critical"],
  Medium: ["urgent", "help", "immediately", "rescue", "danger"],
};

const sentimentKeywords = {
  Panicked: ["help", "screaming", "panic", "trapped", "urgent", "immediately"],
  Concerned: ["worried", "need", "rising", "unsafe", "stuck"],
};

const analyzeTranscript = (text: string): Analysis => {
  const lower = text.toLowerCase();
  const keywords: string[] = [];
  let disasterType: Analysis["disasterType"] = "Unknown";

  (Object.keys(keywordGroups) as Array<keyof typeof keywordGroups>).forEach((type) => {
    const hits = keywordGroups[type].filter((word) => lower.includes(word));
    if (hits.length) {
      keywords.push(...hits);
      if (disasterType === "Unknown") {
        disasterType = type;
      }
    }
  });

  let priority: Analysis["priority"] = "Low";
  if (priorityKeywords.High.some((word) => lower.includes(word))) {
    priority = "High";
  } else if (priorityKeywords.Medium.some((word) => lower.includes(word))) {
    priority = "Medium";
  }

  let sentiment: Analysis["sentiment"] = "Calm";
  if (sentimentKeywords.Panicked.some((word) => lower.includes(word))) {
    sentiment = "Panicked";
  } else if (sentimentKeywords.Concerned.some((word) => lower.includes(word))) {
    sentiment = "Concerned";
  }

  return {
    priority,
    disasterType,
    sentiment,
    keywords: Array.from(new Set(keywords)),
  };
};

export default function VoiceRecorder({
  triggerLabel = "Voice SOS",
  triggerClassName,
}: VoiceRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (processingTimerRef.current) {
        window.clearTimeout(processingTimerRef.current);
        processingTimerRef.current = null;
      }
    };
  }, []);

  const toggleRecording = () => {
    if (processingTimerRef.current) {
      window.clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }

    if (!isRecording) {
      setIsRecording(true);
      setIsProcessing(false);
      setTranscript("");
      setAnalysis(null);
      return;
    }

    setIsRecording(false);
    setIsProcessing(true);

    processingTimerRef.current = window.setTimeout(() => {
      const newTranscript =
        "Emergency at Market Yard. Water level rising fast. Need boat immediately.";
      setIsProcessing(false);
      setTranscript(newTranscript);
      setAnalysis(analyzeTranscript(newTranscript));
      processingTimerRef.current = null;
    }, 1600);
  };

  const triggerClasses = cn(
    "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition border border-white/10 shadow-lg",
    "bg-red-600 text-white hover:bg-red-500",
    triggerClassName
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className={triggerClasses}>
          <Mic size={18} /> {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[420px]">
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
                  <div className="w-1 bg-red-500 animate-[bounce_1s_infinite] h-4"></div>
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
              {isRecording ? "Recording..." : isProcessing ? "AI Transcribing..." : "Tap to Record"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRecording ? "Speak clearly about the situation" : "AI detects urgency and disaster type"}
            </p>
          </div>

          <div className="w-full space-y-4">
            {!transcript && (
              <Button
                onClick={toggleRecording}
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

            {transcript && analysis && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm italic text-slate-600 dark:text-slate-300">
                  "{transcript}"
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Detected Type</div>
                    <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle size={14} className="text-red-400" />
                      {analysis.disasterType}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Priority</div>
                    <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Activity size={14} className="text-yellow-400" />
                      {analysis.priority}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Sentiment</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        "text-[10px] uppercase",
                        analysis.sentiment === "Panicked"
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40"
                          : analysis.sentiment === "Concerned"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/40"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/40"
                      )}
                    >
                      {analysis.sentiment}
                    </Badge>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Auto-prioritized for dispatch</span>
                  </div>
                </div>

                {analysis.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywords.map((word) => (
                        <Badge key={word} variant="secondary" className="bg-slate-200 text-slate-700 text-[10px] dark:bg-slate-800 dark:text-slate-300">
                          {word.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                )}

                <Button className="w-full bg-green-600 hover:bg-green-500 font-bold">
                  <Send className="mr-2" size={18} /> SEND REPORT
                </Button>
                <button
                  onClick={() => {
                    setTranscript("");
                    setAnalysis(null);
                  }}
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
