import { NextResponse } from "next/server";
import { getSupabaseAdminClient, getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { validateLoginPayload } from "@/lib/auth/validators";
import { buildProfile } from "@/lib/auth/profile";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!token || !email) {
      return NextResponse.json({ error: "OTP token and email are required." }, { status: 400 });
    }

    const validation = validateLoginPayload(body?.role, body?.data ?? {});
    if (!validation.ok) {
      return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 });
    }

    const validatedEmail = (validation.data as { email: string }).email;
    if (validatedEmail !== email) {
      return NextResponse.json({ error: "Email mismatch." }, { status: 400 });
    }

    const supabase = getSupabaseAnonServerClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error || !data?.user) {
      return NextResponse.json({ error: error?.message ?? "OTP verification failed." }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient();
    const profile = buildProfile(validation.role, validation.data, data.user.id);
    const { error: profileError } = await adminClient.from("profiles").upsert(profile, { onConflict: "id" });

    if (profileError) {
      return NextResponse.json(
        { error: "Profile update failed.", details: profileError.message, code: profileError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      session: data.session,
      userId: data.user.id,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unable to verify OTP." }, { status: 500 });
  }
}
