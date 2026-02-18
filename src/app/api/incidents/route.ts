import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { IncidentCreateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

// THE WINNER ALGORITHM: Calculate Urgency Score
function calculateUrgency(incident: any) {
  let score = 0;
  
  // 1. Severity Weight
  if (incident.severity === "Critical") score += 50;
  if (incident.severity === "High") score += 30;
  if (incident.severity === "Medium") score += 10;
  
  // 2. Panic Level Weight (assuming panic is 0.0 to 1.0)
  // High panic (e.g. 0.9) adds significant points (18)
  score += (incident.panic || 0) * 20;

  // 3. Time Decay (Newer = Higher Priority)
  // We subtract points as time passes to ensure fresh disasters get attention
  // But we don't subtract too much so that old CRITICAL ones are not buried
  const hoursAgo = (Date.now() - new Date(incident.timestamp).getTime()) / (1000 * 60 * 60);
  score -= hoursAgo * 2; 

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

  // Apply the "Winner Algorithm" sorting
  // @ts-ignore
  const sortedData = data?.map((incident) => ({
    ...incident,
    urgencyScore: calculateUrgency(incident),
  })).sort((a, b) => b.urgencyScore - a.urgencyScore); // Highest score first

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
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}