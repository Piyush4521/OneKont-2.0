export type IncidentType = "Flood" | "Medical" | "Fire" | "Collapse";
export type IncidentStatus = "Open" | "Assigned" | "Resolved";
export type IncidentSeverity = "Critical" | "High" | "Medium";

export type Incident = {
  id: number;
  type: IncidentType;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  verified: boolean;
  description: string;
  panic: number;
  urgencyScore?: number;
  sentiment?: "Panicked" | "Calm" | "Concerned" | "Unknown";
  transcription?: string;
};

export type IncidentCreateInput = {
  type: IncidentType;
  location: string;
  lat?: number;
  lng?: number;
  severity?: IncidentSeverity;
  description?: string;
  panic?: number;
  sentiment?: Incident["sentiment"];
  transcription?: string;
};

export type Volunteer = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  status: string;
  eta: string;
};

export type Shelter = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: string;
};

export type Hospital = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  capacity: string;
};

export type Metrics = {
  activeVolunteers: number;
};
