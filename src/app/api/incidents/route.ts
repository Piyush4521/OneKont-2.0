import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { IncidentCreateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
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
