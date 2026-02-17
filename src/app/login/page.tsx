"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Shield, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Role = "public" | "volunteer" | "gov";

type RoleState = {
  step: "idle" | "sending" | "otp" | "verifying" | "verified";
  error?: string;
  otp: string;
};

const emptyRoleState: RoleState = {
  step: "idle",
  error: undefined,
  otp: "",
};

export default function LoginPage() {
  const router = useRouter();
  const [roleState, setRoleState] = useState<Record<Role, RoleState>>({
    public: { ...emptyRoleState },
    volunteer: { ...emptyRoleState },
    gov: { ...emptyRoleState },
  });
  const [pendingData, setPendingData] = useState<Record<Role, Record<string, string> | null>>({
    public: null,
    volunteer: null,
    gov: null,
  });

  const updateRoleState = (role: Role, patch: Partial<RoleState>) => {
    setRoleState((prev) => ({
      ...prev,
      [role]: { ...prev[role], ...patch },
    }));
  };

  const parseForm = (form: HTMLFormElement) => {
    const entries = Object.fromEntries(new FormData(form).entries());
    return Object.fromEntries(Object.entries(entries).map(([key, value]) => [key, String(value)]));
  };

  const requestOtp = async (role: Role, payload: Record<string, string>) => {
    updateRoleState(role, { step: "sending", error: undefined, otp: "" });

    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, data: payload }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorText =
        data?.error ||
        (data?.errors ? Object.values(data.errors).join(" ") : "Unable to request OTP.");
      updateRoleState(role, { step: "idle", error: errorText });
      return;
    }

    setPendingData((prev) => ({ ...prev, [role]: payload }));
    updateRoleState(role, { step: "otp", error: undefined });
  };

  const handleSubmit = (role: Role) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = parseForm(event.currentTarget);
    await requestOtp(role, payload);
  };

  const handleVerify = async (role: Role) => {
    const payload = pendingData[role];
    if (!payload) {
      updateRoleState(role, { error: "Missing form data. Please request OTP again." });
      return;
    }

    const otp = roleState[role].otp.trim();
    if (!otp) {
      updateRoleState(role, { error: "Enter the OTP sent to your email." });
      return;
    }

    updateRoleState(role, { step: "verifying", error: undefined });

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, data: payload, token: otp, email: payload.email }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      updateRoleState(role, { step: "otp", error: data?.error ?? "OTP verification failed." });
      return;
    }

    if (data?.session?.access_token && data?.session?.refresh_token) {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    updateRoleState(role, { step: "verified", error: undefined });

    const redirectMap: Record<Role, string> = {
      public: "/",
      volunteer: "/volunteers",
      gov: "/admin/dashboard",
    };
    router.replace(redirectMap[role]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40">
            Secure Access
          </Badge>
          <h1 className="text-3xl md:text-4xl font-black">Role-Based Login</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Choose your portal. Each login captures the required details to route you to the correct response
            workflow and verification layer.
          </p>
        </div>

        <Tabs defaultValue="public" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-14 rounded-xl p-1">
            <TabsTrigger value="public" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-bold rounded-lg">
              <Users size={14} className="mr-2" /> Public
            </TabsTrigger>
            <TabsTrigger value="volunteer" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-bold rounded-lg">
              <Shield size={14} className="mr-2" /> Volunteer
            </TabsTrigger>
            <TabsTrigger value="gov" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold rounded-lg">
              <Building2 size={14} className="mr-2" /> Government
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Public Citizen Login</CardTitle>
                <CardDescription>Verify identity and current location to enable rapid help dispatch.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit("public")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="public-name">Full Name</Label>
                      <Input id="public-name" name="fullName" placeholder="Enter full name" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-phone">Mobile Number</Label>
                      <Input id="public-phone" name="phone" type="tel" placeholder="10-digit mobile" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-email">Email</Label>
                      <Input id="public-email" name="email" type="email" placeholder="name@email.com" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-district">District / City</Label>
                      <Input id="public-district" name="district" placeholder="Solapur" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="public-address">Current Address</Label>
                      <Textarea id="public-address" name="address" placeholder="Area, landmark, building details" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-emergency">Emergency Contact</Label>
                      <Input id="public-emergency" name="emergencyContact" type="tel" placeholder="Family / guardian phone" required disabled={roleState.public.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="public-id">Aadhaar / ID Number</Label>
                      <Input id="public-id" name="citizenId" placeholder="Official ID number" required disabled={roleState.public.step !== "idle"} />
                    </div>
                  </div>
                  {roleState.public.error && (
                    <div className="text-sm text-red-600">{roleState.public.error}</div>
                  )}
                  {(roleState.public.step === "otp" || roleState.public.step === "verifying") && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="public-otp">OTP Code</Label>
                        <Input
                          id="public-otp"
                          name="otp"
                          placeholder="Enter OTP from email"
                          value={roleState.public.otp}
                          onChange={(event) => updateRoleState("public", { otp: event.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" className="flex-1 bg-blue-600 hover:bg-blue-500 font-bold" onClick={() => handleVerify("public")} disabled={roleState.public.step === "verifying"}>
                          {roleState.public.step === "verifying" ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => pendingData.public && requestOtp("public", pendingData.public)} disabled={roleState.public.step === "verifying"}>
                          Resend OTP
                        </Button>
                      </div>
                    </div>
                  )}
                  {roleState.public.step === "verified" ? (
                    <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold">
                      Access Granted
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold" disabled={roleState.public.step !== "idle"}>
                      {roleState.public.step === "sending" ? "Sending OTP..." : "Request OTP"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteer" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Volunteer & Agency Login</CardTitle>
                <CardDescription>Capture team role, credentials, and operational readiness.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit("volunteer")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vol-name">Full Name</Label>
                      <Input id="vol-name" name="fullName" placeholder="Volunteer lead name" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-phone">Mobile Number</Label>
                      <Input id="vol-phone" name="phone" type="tel" placeholder="10-digit mobile" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-email">Email</Label>
                      <Input id="vol-email" name="email" type="email" placeholder="team@email.com" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-org">Organization / Unit</Label>
                      <Input id="vol-org" name="organization" placeholder="NDRF / NGO / Hospital" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-role">Role</Label>
                      <Input id="vol-role" name="roleTitle" placeholder="Police, NDRF, Doctor, NGO" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-badge">Badge / License ID</Label>
                      <Input id="vol-badge" name="badgeId" placeholder="Official ID" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-base">Base Location</Label>
                      <Input id="vol-base" name="baseLocation" placeholder="Operating zone or base camp" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vol-availability">Availability</Label>
                      <Input id="vol-availability" name="availability" placeholder="On-duty / Standby / Off-duty" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vol-skills">Certifications / Skills</Label>
                      <Textarea id="vol-skills" name="skills" placeholder="Rescue, medical, diving, driving" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="vol-equipment">Vehicle / Equipment</Label>
                      <Input id="vol-equipment" name="equipment" placeholder="Boat, ambulance, supplies" required disabled={roleState.volunteer.step !== "idle"} />
                    </div>
                  </div>
                  {roleState.volunteer.error && (
                    <div className="text-sm text-red-600">{roleState.volunteer.error}</div>
                  )}
                  {(roleState.volunteer.step === "otp" || roleState.volunteer.step === "verifying") && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="vol-otp">OTP Code</Label>
                        <Input
                          id="vol-otp"
                          name="otp"
                          placeholder="Enter OTP from email"
                          value={roleState.volunteer.otp}
                          onChange={(event) => updateRoleState("volunteer", { otp: event.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold" onClick={() => handleVerify("volunteer")} disabled={roleState.volunteer.step === "verifying"}>
                          {roleState.volunteer.step === "verifying" ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => pendingData.volunteer && requestOtp("volunteer", pendingData.volunteer)} disabled={roleState.volunteer.step === "verifying"}>
                          Resend OTP
                        </Button>
                      </div>
                    </div>
                  )}
                  {roleState.volunteer.step === "verified" ? (
                    <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold">
                      Access Granted
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold" disabled={roleState.volunteer.step !== "idle"}>
                      {roleState.volunteer.step === "sending" ? "Sending OTP..." : "Request OTP"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gov" className="mt-6">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Government Login</CardTitle>
                <CardDescription>Official access for command center and ministry staff.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit("gov")} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gov-name">Officer Name</Label>
                      <Input id="gov-name" name="fullName" placeholder="Full official name" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-designation">Designation</Label>
                      <Input id="gov-designation" name="designation" placeholder="Collector / SDM / Officer" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-dept">Department</Label>
                      <Input id="gov-dept" name="department" placeholder="Disaster Management / Police" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-employee">Employee ID</Label>
                      <Input id="gov-employee" name="employeeId" placeholder="Govt employee ID" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-email">Official Email</Label>
                      <Input id="gov-email" name="email" type="email" placeholder="name@gov.in" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-phone">Official Phone</Label>
                      <Input id="gov-phone" name="phone" type="tel" placeholder="Office contact number" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-jurisdiction">Jurisdiction</Label>
                      <Input id="gov-jurisdiction" name="jurisdiction" placeholder="District / Sector" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gov-office">Office Location</Label>
                      <Input id="gov-office" name="officeLocation" placeholder="Head office address" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="gov-access">Secure Access Code</Label>
                      <Input id="gov-access" name="accessCode" type="password" placeholder="Authorization code" required disabled={roleState.gov.step !== "idle"} />
                    </div>
                  </div>
                  {roleState.gov.error && (
                    <div className="text-sm text-red-600">{roleState.gov.error}</div>
                  )}
                  {(roleState.gov.step === "otp" || roleState.gov.step === "verifying") && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="gov-otp">OTP Code</Label>
                        <Input
                          id="gov-otp"
                          name="otp"
                          placeholder="Enter OTP from email"
                          value={roleState.gov.otp}
                          onChange={(event) => updateRoleState("gov", { otp: event.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" className="flex-1 bg-slate-900 hover:bg-slate-800 font-bold" onClick={() => handleVerify("gov")} disabled={roleState.gov.step === "verifying"}>
                          {roleState.gov.step === "verifying" ? "Verifying..." : "Verify OTP"}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => pendingData.gov && requestOtp("gov", pendingData.gov)} disabled={roleState.gov.step === "verifying"}>
                          Resend OTP
                        </Button>
                      </div>
                    </div>
                  )}
                  {roleState.gov.step === "verified" ? (
                    <Button type="button" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold">
                      Access Granted
                    </Button>
                  ) : (
                    <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold" disabled={roleState.gov.step !== "idle"}>
                      {roleState.gov.step === "sending" ? "Sending OTP..." : "Request OTP"}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
