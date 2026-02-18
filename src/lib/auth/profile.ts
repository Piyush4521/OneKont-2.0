import { createHash } from "node:crypto";
import type { GovPayload, PublicPayload, Role, VolunteerPayload } from "@/lib/auth/validators";

type BaseProfile = {
  id: string;
  role: Role;
  full_name: string;
  phone?: string | null;
  email?: string | null;
};

export type ProfileInsert = BaseProfile & {
  district?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  citizen_id?: string | null;
  organization?: string | null;
  role_title?: string | null;
  badge_id?: string | null;
  base_location?: string | null;
  availability?: string | null;
  skills?: string | null;
  equipment?: string | null;
  designation?: string | null;
  department?: string | null;
  employee_id?: string | null;
  jurisdiction?: string | null;
  office_location?: string | null;
  access_code_hash?: string | null;
  updated_at?: string;
};

const hashAccessCode = (value: string) => createHash("sha256").update(value).digest("hex");

export const buildProfile = (
  role: Role,
  data: PublicPayload | VolunteerPayload | GovPayload,
  userId: string
): ProfileInsert => {
  const base: BaseProfile = {
    id: userId,
    role,
    full_name: data.fullName,
    phone: "phone" in data ? data.phone : null,
    email: "email" in data ? data.email : null,
  };

  if (role === "public") {
    const payload = data as PublicPayload;
    return {
      ...base,
      district: payload.district,
      address: payload.address,
      emergency_contact: payload.emergencyContact,
      citizen_id: payload.citizenId,
      updated_at: new Date().toISOString(),
    };
  }

  if (role === "volunteer") {
    const payload = data as VolunteerPayload;
    return {
      ...base,
      organization: payload.organization,
      role_title: payload.roleTitle,
      badge_id: payload.badgeId,
      base_location: payload.baseLocation,
      availability: payload.availability,
      skills: payload.skills,
      equipment: payload.equipment,
      updated_at: new Date().toISOString(),
    };
  }

  const payload = data as GovPayload;
  return {
    ...base,
    designation: payload.designation,
    department: payload.department,
    employee_id: payload.employeeId,
    jurisdiction: payload.jurisdiction,
    office_location: payload.officeLocation,
    access_code_hash: hashAccessCode(payload.accessCode),
    updated_at: new Date().toISOString(),
  };
};
