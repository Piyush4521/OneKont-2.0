import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { IncidentCreateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type UrgencyCandidate = {
  severity?: string | null;
  panic?: number | null;
  timestamp?: string | null;
};

function calculateUrgency(incident: UrgencyCandidate) {
  let score = 0;

  if (incident.severity === "Critical") score += 50;
  if (incident.severity === "High") score += 30;
  if (incident.severity === "Medium") score += 10;

  score += (incident.panic ?? 0) * 20;

  const incidentTime = incident.timestamp ? new Date(incident.timestamp).getTime() : NaN;
  if (!Number.isNaN(incidentTime)) {
    const hoursAgo = (Date.now() - incidentTime) / (1000 * 60 * 60);
    score -= Math.max(0, hoursAgo) * 2;
  }

  return score;
}

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*"); 

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sortedData = (data ?? [])
    .map((incident) => ({
      ...incident,
      urgencyScore: calculateUrgency(incident),
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  return NextResponse.json(sortedData ?? []);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncidentCreateInput;

    if (!body?.type || !body?.location) {
      return NextResponse.json({ error: "type and location are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const lat = typeof body.lat === "number" ? body.lat : 17.6599;
    const lng = typeof body.lng === "number" ? body.lng : 75.9064;
    const severity = body.severity ?? "High";
    const description = body.description ?? "Reported via SOS.";
    const panic = typeof body.panic === "number" ? body.panic : 0.6;

    const sentiment = body.sentiment ?? "Unknown";
    const transcription = body.transcription ?? "Audio report (no transcript)";

    const { data, error } = await supabase
      .from("incidents")
      .insert({
        type: body.type,
        location: body.location,
        lat,
        lng,
        severity,
        description,
        panic,
        sentiment,
        transcription,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
