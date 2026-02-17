"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Camera, Upload, Bot, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AIReportModalProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

export default function AIReportModal({
  triggerLabel = "Report with AI",
  triggerClassName,
}: AIReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<null | { type: string; severity: string; confidence: number }>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setScanProgress(0);
      setAnalysisResult(null);
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        window.clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, []);

  // Simulate the AI Analysis Process
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    // Start Scanning Effect
    setIsScanning(true);
    setScanProgress(0);

    // Simulate progress bar filling up
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    scanTimerRef.current = window.setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          if (scanTimerRef.current) {
            window.clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
          }
          setIsScanning(false);
          // MOCK AI RESULT (In real app, this comes from Python backend)
          setAnalysisResult({
            type: "Structural Collapse",
            severity: "Critical",
            confidence: 94
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200); // 2 seconds total scan time
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

      <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bot className="text-blue-500" /> AI Damage Assessment
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          
          {/* 1. Upload Section */}
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
                <p className="text-xs text-slate-500">AI will auto-detect severity & type</p>
              </div>
            </div>
          )}

          {/* 2. Scanning Animation */}
          {isScanning && (
            <div className="space-y-4 text-center py-8">
              <div className="relative w-32 h-32 mx-auto bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                 {/* Fake Image Placeholder */}
                 <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <Camera size={32} className="opacity-20"/>
                 </div>
                 
                 {/* The Laser Scanner Effect */}
                 <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 />
                 <div className="absolute inset-0 bg-blue-500/10" />
              </div>

              <div>
                <p className="text-blue-400 font-bold animate-pulse text-sm mb-2">ANALYZING PIXELS...</p>
                <Progress value={scanProgress} className="h-2 bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          )}

          {/* 3. AI Result & Form Auto-fill */}
          {analysisResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              {/* The "AI Insight" Card */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                <Bot className="text-blue-400 mt-1" size={20} />
                <div>
                    <h4 className="font-bold text-blue-800 dark:text-blue-100">Analysis Complete</h4>
                    <p className="text-xs text-blue-600/80 dark:text-blue-200/70">Confidence Score: {analysisResult.confidence}%</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Detected Incident Type</Label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-red-500 dark:text-red-400 font-bold">
                    <AlertTriangle size={16} />
                    {analysisResult.type}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Estimated Severity</Label>
                <Input defaultValue={analysisResult.severity} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold" readOnly />
              </div>

              <div className="grid gap-2">
                <Label>Add Details (Voice to Text)</Label>
                <Textarea placeholder="Describe situation..." className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[80px]" />
              </div>

              <Button className="w-full bg-red-600 hover:bg-red-500 font-bold py-6">
                SUBMIT VERIFIED REPORT
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
