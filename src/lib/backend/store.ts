import type { Hospital, Incident, IncidentCreateInput, Metrics, Shelter, Volunteer } from "@/lib/types";

type Store = {
  incidents: Incident[];
  volunteers: Volunteer[];
  shelters: Shelter[];
  hospitals: Hospital[];
  metrics: Metrics;
};

const baseCoords = { lat: 17.6599, lng: 75.9064 };

const randomOffset = () => (Math.random() - 0.5) * 0.04;
const randomCoords = () => ({
  lat: baseCoords.lat + randomOffset(),
  lng: baseCoords.lng + randomOffset(),
});
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const store: Store = {
  incidents: [
    {
      id: 1,
      type: "Flood",
      location: "Kondi Village (Sector 4)",
      lat: 17.665,
      lng: 75.91,
      timestamp: "10:05 AM",
      status: "Open",
      severity: "Critical",
      verified: true,
      description: "Water entering homes",
      panic: 0.85,
    },
    {
      id: 2,
      type: "Fire",
      location: "Railway Station Area",
      lat: 17.645,
      lng: 75.89,
      timestamp: "10:12 AM",
      status: "Assigned",
      severity: "High",
      verified: true,
      description: "Near Railway Station",
      panic: 0.7,
    },
    {
      id: 3,
      type: "Collapse",
      location: "Old Bridge, Sina River",
      lat: 17.652,
      lng: 75.915,
      timestamp: "10:30 AM",
      status: "Open",
      severity: "Medium",
      verified: false,
      description: "Old Bridge strain",
      panic: 0.5,
    },
  ],
  volunteers: [
    { id: 1, name: "Team Alpha", lat: 17.655, lng: 75.9, status: "Moving", eta: "5 mins" },
    { id: 2, name: "Team Bravo", lat: 17.662, lng: 75.897, status: "Staged", eta: "10 mins" },
  ],
  shelters: [
    { id: 1, name: "Shelter #4", lat: 17.672, lng: 75.919, capacity: "140 beds" },
    { id: 2, name: "Relief Camp North", lat: 17.646, lng: 75.905, capacity: "95 beds" },
  ],
  hospitals: [
    { id: 1, name: "Civil Hospital", lat: 17.657, lng: 75.925, capacity: "ER 24x7" },
    { id: 2, name: "Rural Health Center", lat: 17.635, lng: 75.885, capacity: "On call" },
  ],
  metrics: {
    activeVolunteers: 450,
  },
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

let metricsTickerStarted = false;

const startMetricsTicker = () => {
  if (metricsTickerStarted) return;
  metricsTickerStarted = true;

  setInterval(() => {
    const delta = Math.random() > 0.5 ? 1 : -1;
    store.metrics.activeVolunteers = clamp(store.metrics.activeVolunteers + delta, 420, 480);
  }, 5000);
};

startMetricsTicker();

export function listIncidents() {
  return store.incidents;
}

export function addIncident(input: IncidentCreateInput): Incident {
  const coords =
    typeof input.lat === "number" && typeof input.lng === "number"
      ? { lat: input.lat, lng: input.lng }
      : randomCoords();

  const newIncident: Incident = {
    id: Date.now(),
    type: input.type,
    location: input.location,
    lat: coords.lat,
    lng: coords.lng,
    timestamp: formatTime(new Date()),
    status: "Open",
    severity: input.severity ?? "High",
    verified: false,
    description: input.description ?? "Reported via SOS.",
    panic: input.panic ?? 0.6,
  };

  store.incidents = [newIncident, ...store.incidents];
  return newIncident;
}

export function verifyIncident(id: number) {
  let updated: Incident | null = null;

  store.incidents = store.incidents.map((incident) => {
    if (incident.id !== id) return incident;
    updated = { ...incident, verified: true };
    return updated;
  });

  return updated;
}

export function resolveIncident(id: number) {
  let updated: Incident | null = null;

  store.incidents = store.incidents.map((incident) => {
    if (incident.id !== id) return incident;
    updated = { ...incident, status: "Resolved" };
    return updated;
  });

  return updated;
}

export function listVolunteers() {
  return store.volunteers;
}

export function listShelters() {
  return store.shelters;
}

export function listHospitals() {
  return store.hospitals;
}

export function getMetrics() {
  return store.metrics;
}
