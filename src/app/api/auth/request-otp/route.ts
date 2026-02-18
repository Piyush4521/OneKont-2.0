import { NextResponse } from "next/server";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import { validateLoginPayload } from "@/lib/auth/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = validateLoginPayload(body?.role, body?.data ?? {});

    if (!result.ok) {
      return NextResponse.json({ error: "Validation failed.", errors: result.errors }, { status: 400 });
    }

    const supabase = getSupabaseAnonServerClient();
    const email = (result.data as { email: string }).email;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to request OTP." }, { status: 500 });
  }
}
