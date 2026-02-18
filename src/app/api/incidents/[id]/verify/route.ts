import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_req: Request, { params }: RouteContext) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid incident id" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .update({ verified: true })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
