"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Types to make it realistic
type Incident = {
  id: number;
  type: "Flood" | "Medical" | "Fire" | "Collapse";
  location: string;
  timestamp: string;
  status: "Open" | "Assigned" | "Resolved";
  severity: "Critical" | "High" | "Medium";
  verified: boolean;
};

type ContextType = {
  incidents: Incident[];
  activeVolunteers: number;
  addIncident: (type: Incident['type'], location: string) => void;
  verifyIncident: (id: number) => void;
  resolveIncident: (id: number) => void;
};

const DisasterContext = createContext<ContextType | undefined>(undefined);

export function DisasterProvider({ children }: { children: React.ReactNode }) {
  // 1. INITIAL REALISTIC DATA (Solapur Specific)
  const [incidents, setIncidents] = useState<Incident[]>([
    { id: 1, type: "Flood", location: "Kondi Village (Sector 4)", timestamp: "10:05 AM", status: "Open", severity: "Critical", verified: true },
    { id: 2, type: "Medical", location: "Shelter #2 (North Solapur)", timestamp: "10:12 AM", status: "Assigned", severity: "High", verified: true },
    { id: 3, type: "Collapse", location: "Old Bridge, Sina River", timestamp: "10:30 AM", status: "Open", severity: "Critical", verified: false },
  ]);

  const [activeVolunteers, setActiveVolunteers] = useState(450);

  // 2. SIMULATE LIVE DATA INCOMING (The "Alive" Feel)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly fluctuate volunteer count
      setActiveVolunteers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 3. ACTIONS
  const addIncident = (type: Incident['type'], location: string) => {
    const newIncident: Incident = {
      id: Date.now(),
      type,
      location,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "Open",
      severity: "High",
      verified: false
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const verifyIncident = (id: number) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, verified: true } : inc));
  };

  const resolveIncident = (id: number) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: "Resolved" } : inc));
  };

  return (
    <DisasterContext.Provider value={{ incidents, activeVolunteers, addIncident, verifyIncident, resolveIncident }}>
      {children}
    </DisasterContext.Provider>
  );
}

export function useDisaster() {
  const context = useContext(DisasterContext);
  if (!context) throw new Error("useDisaster must be used within a DisasterProvider");
  return context;
}