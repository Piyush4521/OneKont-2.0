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
  // WINNER FIELDS (AI Data)
  urgencyScore?: number;      // Calculated by Triage Algo (0-100)
  sentiment?: "Panicked" | "Calm" | "Concerned" | "Unknown"; // From Audio AI
  transcription?: string;     // From Voice Report
};

// ... keep your other types (IncidentCreateInput, Volunteer, Shelter, etc.) as they were.
export type IncidentCreateInput = {
  type: IncidentType;
  location: string;
  lat?: number;
  lng?: number;
  severity?: IncidentSeverity;
  description?: string;
  panic?: number;
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