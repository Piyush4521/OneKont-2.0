"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Role = "public" | "volunteer" | "gov";

type RoleGuardProps = {
  allow: Role[];
  redirectTo?: string;
  children: React.ReactNode;
};

export default function RoleGuard({ allow, redirectTo = "/login", children }: RoleGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let active = true;

    const checkAccess = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !userData?.user) {
        setStatus("denied");
        router.replace(redirectTo);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (!active) return;

      const role = profile?.role as Role | undefined;
      if (profileError || !role || !allow.includes(role)) {
        setStatus("denied");
        router.replace("/");
        return;
      }

      setStatus("allowed");
    };

    void checkAccess();

    return () => {
      active = false;
    };
  }, [allow, redirectTo, router]);

  if (status !== "allowed") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Checking access...</div>;
  }

  return <>{children}</>;
}
