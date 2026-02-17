"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type NetworkContextValue = {
  isOnline: boolean;
  toggleNetwork: () => void;
};

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  toggleNetwork: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export default function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleNetwork = () => setIsOnline((prev) => !prev);

  return (
    <NetworkContext.Provider value={{ isOnline, toggleNetwork }}>
      <div className={`transition-all duration-1000 ${!isOnline ? "grayscale contrast-125 bg-slate-950" : ""}`}>
        {children}

        <button
          onClick={toggleNetwork}
          className={`fixed bottom-6 md:bottom-8 right-4 md:right-8 z-50 px-3 py-2 rounded-full font-bold shadow-2xl border transition-all w-[170px] md:w-[200px] text-center text-[11px] md:text-xs whitespace-nowrap
            ${isOnline ? "bg-green-500 text-black border-green-400 hover:bg-green-400" : "bg-red-600 text-white border-red-500 animate-pulse"}
          `}
        >
          {isOnline ? "Network: 5G (Demo)" : "Offline Mode: Exit"}
        </button>

        {!isOnline && (
          <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center text-xs font-bold py-1 z-[100] animate-in slide-in-from-top">
            OFFLINE MODE ACTIVE | LOW BANDWIDTH PROTOCOL | SMS ONLY
          </div>
        )}
      </div>
    </NetworkContext.Provider>
  );
}
