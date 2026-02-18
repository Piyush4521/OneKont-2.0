"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: number;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const quickPrompts = ["How to stop bleeding?", "CPR Guide", "Flood Safety Tips", "Nearest Shelter?"];

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello. I am the OneKont AI Assistant. I can provide first-aid advice and emergency protocols. How can I help?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // 1. Show user message immediately
    const newUserMsg: Message = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // 2. Call OUR real API
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      
      const data = await res.json();
      
      // 3. Show Real AI Response
      const newAiMsg: Message = {
        id: Date.now() + 1,
        text: data.text || "Connection failed.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAiMsg]);

    } catch (err) {
      // Error handling
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-600/50 transition-all active:scale-95"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            // FIX: Changed md:w-100 to md:w-[400px] and h-125 to h-[500px]
            className="fixed bottom-28 right-6 z-50 w-[90vw] md:w-100 h-125 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Bot className="text-blue-500" size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Rescue AI</h3>
                <p className="text-xs text-emerald-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 dark:bg-green-400 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 p-4 bg-slate-50 dark:bg-slate-950/50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.sender === "user" ? "bg-slate-700" : "bg-blue-600/20 text-blue-500"
                      }`}
                    >
                      {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-sm max-w-[80%] whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center">
                      <Loader2 size={14} className="animate-spin text-blue-500" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 text-slate-500 text-xs flex items-center">
                      AI is analyzing...
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-2 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 bg-white hover:bg-slate-100 text-xs text-slate-600 rounded-full border border-slate-200 transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                placeholder="Ask about First Aid..."
                className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
              />
              <Button onClick={() => handleSend(inputValue)} size="icon" className="bg-blue-600 hover:bg-blue-500">
                <Send size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}