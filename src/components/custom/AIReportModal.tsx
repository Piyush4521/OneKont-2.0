"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Bot, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AIReportModalProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

type AnalysisResult = {
  type: string;
  severity: string;
  confidence: number;
  description: string;
};

const FALLBACK_RESULT: AnalysisResult = {
  type: "Unknown",
  severity: "Medium",
  confidence: 0,
  description: "Connection failed",
};

export default function AIReportModal({
  triggerLabel = "Report with AI",
  triggerClassName,
}: AIReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const progressIntervalRef = useRef<number | null>(null);
  const completionTimeoutRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (completionTimeoutRef.current) {
      window.clearTimeout(completionTimeoutRef.current);
      completionTimeoutRef.current = null;
    }
  };

  const resetState = () => {
    clearTimers();
    setIsScanning(false);
    setScanProgress(0);
    setAnalysisResult(null);
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") return;
      setPreview(result);
      void startAnalysis(result, file.type);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64Image: string, mimeType: string) => {
    clearTimers();
    setIsScanning(true);
    setScanProgress(10);
    setAnalysisResult(null);

    progressIntervalRef.current = window.setInterval(() => {
      setScanProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 200);

    try {
      const res = await fetch("/api/ai/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, mimeType }),
      });

      const data = (await res.json()) as AnalysisResult;
      const result = res.ok ? data : FALLBACK_RESULT;
      setScanProgress(100);
      completionTimeoutRef.current = window.setTimeout(() => {
        setIsScanning(false);
        setAnalysisResult(result);
      }, 500);
    } catch {
      setIsScanning(false);
      setAnalysisResult(FALLBACK_RESULT);
    } finally {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-300 transition border border-slate-200 shadow-lg dark:bg-slate-800 dark:text-white dark:border-white/10 dark:hover:bg-slate-700",
            triggerClassName
          )}
        >
          <Camera size={18} /> {triggerLabel}
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="text-blue-500" /> AI Damage Assessment
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {!analysisResult && !isScanning && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition cursor-pointer relative">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                accept="image/*"
              />
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-full text-blue-500">
                <Upload size={32} />
              </div>
              <div className="text-center">
                <p className="font-medium">Upload Disaster Photo</p>
                <p className="text-xs text-slate-500">AI will auto-detect severity and type</p>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="space-y-4 text-center py-8">
              <div className="relative w-32 h-32 mx-auto bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                {preview && (
                  <Image
                    src={preview}
                    alt="Scanning"
                    fill
                    sizes="128px"
                    unoptimized
                    className="object-cover opacity-50"
                  />
                )}

                <motion.div
                  className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div>
                <p className="text-blue-500 font-bold animate-pulse text-sm mb-2">GEMINI VISION ANALYZING...</p>
                <Progress value={scanProgress} className="h-2 bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div
                className={`border p-4 rounded-xl flex items-start gap-3 ${
                  analysisResult.type === "None"
                    ? "bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                }`}
              >
                {analysisResult.type === "None" ? (
                  <XCircle className="text-slate-500 mt-1" />
                ) : (
                  <CheckCircle2 className="text-blue-500 mt-1" />
                )}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {analysisResult.type === "None" ? "No Disaster Detected" : "Incident Verified"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{analysisResult.description}</p>
                </div>
              </div>

              {analysisResult.type !== "None" && (
                <>
                  <div className="grid gap-2">
                    <Label>Detected Incident Type</Label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-red-600 dark:text-red-400 font-bold">
                      <AlertTriangle size={16} />
                      {analysisResult.type}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>AI Estimated Severity</Label>
                    <Input
                      defaultValue={analysisResult.severity}
                      className="bg-slate-50 dark:bg-slate-900 font-bold"
                      readOnly
                    />
                  </div>
                </>
              )}

              <Button
                className={`w-full font-bold py-6 ${
                  analysisResult.type === "None" ? "bg-slate-400" : "bg-red-600 hover:bg-red-500"
                }`}
                disabled={analysisResult.type === "None"}
              >
                {analysisResult.type === "None" ? "CANNOT SUBMIT" : "SUBMIT VERIFIED REPORT"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
