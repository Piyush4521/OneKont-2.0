"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShieldAlert } from "lucide-react";
import { useNetwork } from "@/components/custom/NetworkProvider";
import AIReportModal from "@/components/custom/AIReportModal";
import VoiceRecorder from "@/components/custom/VoiceRecorder";
import SurvivalModeOverlay from "@/components/custom/SurvivalModeOverlay";

type Coords = {
  lat: number;
  lng: number;
};

export default function SOSButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (!isActive) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setCoords(null);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [isActive]);

  const handleSOSClick = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-center">
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="absolute bg-red-500 rounded-full opacity-20"
              animate={{ scale: [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: "180px", height: "180px" }}
            />
            <motion.div
              className="absolute bg-red-500 rounded-full opacity-20 delay-75"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              style={{ width: "180px", height: "180px" }}
            />
          </div>
        )}

        <motion.button
          className={`relative z-20 flex items-center justify-center w-44 h-44 md:w-48 md:h-48 rounded-full shadow-2xl transition-colors duration-300 border-4 border-white/20 backdrop-blur-sm
            ${isActive ? "bg-emerald-600 shadow-emerald-500/50 scale-95" : "bg-gradient-to-br from-red-600 to-orange-600 shadow-red-500/50"}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSOSClick}
          aria-label="Trigger SOS"
        >
          <div className="flex flex-col items-center text-white pointer-events-none">
            {isActive ? (
              <>
                <ShieldAlert size={42} className="mb-2 animate-bounce" />
                <span className="text-xl font-bold tracking-widest">ACTIVE</span>
              </>
            ) : (
              <>
                <Phone size={42} className="mb-2" />
                <span className="text-2xl font-black tracking-widest">SOS</span>
                <span className="text-xs uppercase opacity-80 mt-1">Tap for Help</span>
              </>
            )}
          </div>
        </motion.button>
      </div>

      <div className="h-16 relative z-30 flex items-center justify-center">
        <AnimatePresence>
          {isHovered && !isActive && (
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <VoiceRecorder />
              <AIReportModal />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isActive && (
        <SurvivalModeOverlay
          open={isActive}
          onClose={() => setIsActive(false)}
          isOnline={isOnline}
          location={coords}
        />
      )}
    </div>
  );
}
