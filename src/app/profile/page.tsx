"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Role = "public" | "volunteer" | "gov";

type Profile = {
  id: string;
  role: Role;
  full_name: string;
  phone: string | null;
  email: string | null;
  district: string | null;
  address: string | null;
  emergency_contact: string | null;
  citizen_id: string | null;
  organization: string | null;
  role_title: string | null;
  badge_id: string | null;
  base_location: string | null;
  availability: string | null;
  skills: string | null;
  equipment: string | null;
  designation: string | null;
  department: string | null;
  employee_id: string | null;
  jurisdiction: string | null;
  office_location: string | null;
};

type FormState = Record<keyof Profile, string>;

const toFormState = (profile: Profile): FormState => ({
  id: profile.id,
  role: profile.role,
  full_name: profile.full_name ?? "",
  phone: profile.phone ?? "",
  email: profile.email ?? "",
  district: profile.district ?? "",
  address: profile.address ?? "",
  emergency_contact: profile.emergency_contact ?? "",
  citizen_id: profile.citizen_id ?? "",
  organization: profile.organization ?? "",
  role_title: profile.role_title ?? "",
  badge_id: profile.badge_id ?? "",
  base_location: profile.base_location ?? "",
  availability: profile.availability ?? "",
  skills: profile.skills ?? "",
  equipment: profile.equipment ?? "",
  designation: profile.designation ?? "",
  department: profile.department ?? "",
  employee_id: profile.employee_id ?? "",
  jurisdiction: profile.jurisdiction ?? "",
  office_location: profile.office_location ?? "",
});

const fromFormState = (state: FormState) => ({
  full_name: state.full_name.trim(),
  phone: state.phone.trim() || null,
  email: state.email.trim().toLowerCase() || null,
  district: state.district.trim() || null,
  address: state.address.trim() || null,
  emergency_contact: state.emergency_contact.trim() || null,
  citizen_id: state.citizen_id.trim() || null,
  organization: state.organization.trim() || null,
  role_title: state.role_title.trim() || null,
  badge_id: state.badge_id.trim() || null,
  base_location: state.base_location.trim() || null,
  availability: state.availability.trim() || null,
  skills: state.skills.trim() || null,
  equipment: state.equipment.trim() || null,
  designation: state.designation.trim() || null,
  department: state.department.trim() || null,
  employee_id: state.employee_id.trim() || null,
  jurisdiction: state.jurisdiction.trim() || null,
  office_location: state.office_location.trim() || null,
  updated_at: new Date().toISOString(),
});

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "saving">("loading");
  const [message, setMessage] = useState<string | null>(null);

  const role = useMemo(() => profile?.role ?? "public", [profile?.role]);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!active) return;

      if (!userData?.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!active) return;

      if (error || !data) {
        setMessage("Unable to load profile. Please try again.");
        setStatus("ready");
        return;
      }

      setProfile(data as Profile);
      setFormState(toFormState(data as Profile));
      setStatus("ready");
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [router]);

  const handleChange = (key: keyof Profile, value: string) => {
    if (!formState) return;
    setFormState({ ...formState, [key]: value });
  };

  const handleSave = async () => {
    if (!profile || !formState) return;
    setStatus("saving");
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const updatePayload = fromFormState(formState);

    const emailChanged =
      formState.email.trim().toLowerCase() !== (profile.email ?? "").trim().toLowerCase();

    if (emailChanged && updatePayload.email) {
      const { error } = await supabase.auth.updateUser({ email: updatePayload.email });
      if (error) {
        setMessage(error.message);
        setStatus("ready");
        return;
      }
    }

    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", profile.id);

    if (error) {
      setMessage(error.message);
      setStatus("ready");
      return;
    }

    setMessage(emailChanged ? "Profile saved. Confirm new email to complete update." : "Profile saved.");
    setProfile({ ...profile, ...updatePayload });
    setStatus("ready");
  };

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (status === "loading" || !formState) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">My Profile</h1>
          <p className="text-sm text-slate-500">Update your information anytime.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40 uppercase">
            {role}
          </Badge>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {message && <div className="text-sm text-emerald-600">{message}</div>}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="profile-full-name">Full Name</Label>
            <Input
              id="profile-full-name"
              value={formState.full_name}
              onChange={(event) => handleChange("full_name", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={formState.role} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input
              id="profile-email"
              value={formState.email}
              onChange={(event) => handleChange("email", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={formState.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {role === "public" && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Public Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-district">District / City</Label>
              <Input
                id="profile-district"
                value={formState.district}
                onChange={(event) => handleChange("district", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-emergency">Emergency Contact</Label>
              <Input
                id="profile-emergency"
                value={formState.emergency_contact}
                onChange={(event) => handleChange("emergency_contact", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-address">Current Address</Label>
              <Textarea
                id="profile-address"
                value={formState.address}
                onChange={(event) => handleChange("address", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-citizen-id">Aadhaar / ID Number</Label>
              <Input
                id="profile-citizen-id"
                value={formState.citizen_id}
                onChange={(event) => handleChange("citizen_id", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {role === "volunteer" && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Volunteer Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-org">Organization / Unit</Label>
              <Input
                id="profile-org"
                value={formState.organization}
                onChange={(event) => handleChange("organization", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role-title">Role</Label>
              <Input
                id="profile-role-title"
                value={formState.role_title}
                onChange={(event) => handleChange("role_title", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-badge">Badge / License ID</Label>
              <Input
                id="profile-badge"
                value={formState.badge_id}
                onChange={(event) => handleChange("badge_id", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-base">Base Location</Label>
              <Input
                id="profile-base"
                value={formState.base_location}
                onChange={(event) => handleChange("base_location", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-availability">Availability</Label>
              <Input
                id="profile-availability"
                value={formState.availability}
                onChange={(event) => handleChange("availability", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-equipment">Vehicle / Equipment</Label>
              <Input
                id="profile-equipment"
                value={formState.equipment}
                onChange={(event) => handleChange("equipment", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-skills">Certifications / Skills</Label>
              <Textarea
                id="profile-skills"
                value={formState.skills}
                onChange={(event) => handleChange("skills", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {role === "gov" && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Government Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-designation">Designation</Label>
              <Input
                id="profile-designation"
                value={formState.designation}
                onChange={(event) => handleChange("designation", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-department">Department</Label>
              <Input
                id="profile-department"
                value={formState.department}
                onChange={(event) => handleChange("department", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-employee">Employee ID</Label>
              <Input
                id="profile-employee"
                value={formState.employee_id}
                onChange={(event) => handleChange("employee_id", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-jurisdiction">Jurisdiction</Label>
              <Input
                id="profile-jurisdiction"
                value={formState.jurisdiction}
                onChange={(event) => handleChange("jurisdiction", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-office">Office Location</Label>
              <Input
                id="profile-office"
                value={formState.office_location}
                onChange={(event) => handleChange("office_location", event.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 font-bold"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
