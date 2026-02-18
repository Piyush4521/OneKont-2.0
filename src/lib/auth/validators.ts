export type Role = "public" | "volunteer" | "gov";

export type PublicPayload = {
  fullName: string;
  phone: string;
  email: string;
  district: string;
  address: string;
  emergencyContact: string;
  citizenId: string;
};

export type VolunteerPayload = {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  roleTitle: string;
  badgeId: string;
  baseLocation: string;
  availability: string;
  skills: string;
  equipment: string;
};

export type GovPayload = {
  fullName: string;
  designation: string;
  department: string;
  employeeId: string;
  email: string;
  phone: string;
  jurisdiction: string;
  officeLocation: string;
  accessCode: string;
};

export type LoginPayload = PublicPayload | VolunteerPayload | GovPayload;

export type ValidationSuccess = {
  ok: true;
  role: Role;
  data: LoginPayload;
};

export type ValidationFailure = {
  ok: false;
  errors: Record<string, string>;
};

export type ValidationResult = ValidationSuccess | ValidationFailure;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;
const AADHAAR_RE = /^\d{12}$/;
const ID_RE = /^[A-Za-z0-9-]{5,20}$/;

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const getString = (
  payload: Record<string, unknown>,
  key: string,
  label: string,
  errors: Record<string, string>,
  options: { min?: number; max?: number; pattern?: RegExp } = {}
) => {
  const raw = typeof payload[key] === "string" ? payload[key].trim() : "";
  if (!raw) {
    errors[key] = `${label} is required.`;
    return "";
  }
  if (options.min && raw.length < options.min) {
    errors[key] = `${label} must be at least ${options.min} characters.`;
  }
  if (options.max && raw.length > options.max) {
    errors[key] = `${label} must be under ${options.max} characters.`;
  }
  if (options.pattern && !options.pattern.test(raw)) {
    errors[key] = `${label} format is invalid.`;
  }
  return raw;
};

const getEmail = (
  payload: Record<string, unknown>,
  key: string,
  label: string,
  errors: Record<string, string>
) => {
  const value = getString(payload, key, label, errors, { pattern: EMAIL_RE });
  return value.toLowerCase();
};

const getPhone = (
  payload: Record<string, unknown>,
  key: string,
  label: string,
  errors: Record<string, string>
) => {
  const value = getString(payload, key, label, errors);
  const digits = normalizeDigits(value);
  if (digits && !PHONE_RE.test(digits)) {
    errors[key] = `${label} must be 10 digits.`;
  }
  return digits;
};

const enforceAllowlist = (value: string, envKey: string, errorKey: string, errors: Record<string, string>) => {
  const allowlist = process.env[envKey];
  if (!allowlist) return;
  const allowed = allowlist.split(",").map((item) => item.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(value)) {
    errors[errorKey] = "ID not authorized for this portal.";
  }
};

export const validateLoginPayload = (roleInput: string, payload: Record<string, unknown>): ValidationResult => {
  const role = roleInput as Role;
  const errors: Record<string, string> = {};

  if (!["public", "volunteer", "gov"].includes(roleInput)) {
    return { ok: false, errors: { role: "Invalid role selected." } };
  }

  if (role === "public") {
    const fullName = getString(payload, "fullName", "Full name", errors, { min: 2, max: 80 });
    const phone = getPhone(payload, "phone", "Mobile number", errors);
    const email = getEmail(payload, "email", "Email", errors);
    const district = getString(payload, "district", "District / City", errors, { min: 2, max: 60 });
    const address = getString(payload, "address", "Current address", errors, { min: 8, max: 240 });
    const emergencyContact = getPhone(payload, "emergencyContact", "Emergency contact", errors);
    const citizenId = getString(payload, "citizenId", "Aadhaar / ID number", errors, { pattern: AADHAAR_RE });
    enforceAllowlist(citizenId, "PUBLIC_ID_ALLOWLIST", "citizenId", errors);

    if (Object.keys(errors).length) return { ok: false, errors };

    return {
      ok: true,
      role,
      data: {
        fullName,
        phone,
        email,
        district,
        address,
        emergencyContact,
        citizenId,
      },
    };
  }

  if (role === "volunteer") {
    const fullName = getString(payload, "fullName", "Full name", errors, { min: 2, max: 80 });
    const phone = getPhone(payload, "phone", "Mobile number", errors);
    const email = getEmail(payload, "email", "Email", errors);
    const organization = getString(payload, "organization", "Organization / Unit", errors, { min: 2, max: 120 });
    const roleTitle = getString(payload, "roleTitle", "Role", errors, { min: 2, max: 40 });
    const badgeId = getString(payload, "badgeId", "Badge / License ID", errors, { pattern: ID_RE });
    const baseLocation = getString(payload, "baseLocation", "Base location", errors, { min: 2, max: 120 });
    const availability = getString(payload, "availability", "Availability", errors, { min: 2, max: 40 });
    const skills = getString(payload, "skills", "Certifications / Skills", errors, { min: 2, max: 240 });
    const equipment = getString(payload, "equipment", "Vehicle / Equipment", errors, { min: 2, max: 120 });
    enforceAllowlist(badgeId, "VOLUNTEER_BADGE_ALLOWLIST", "badgeId", errors);

    if (Object.keys(errors).length) return { ok: false, errors };

    return {
      ok: true,
      role,
      data: {
        fullName,
        phone,
        email,
        organization,
        roleTitle,
        badgeId,
        baseLocation,
        availability,
        skills,
        equipment,
      },
    };
  }

  const fullName = getString(payload, "fullName", "Officer name", errors, { min: 2, max: 80 });
  const designation = getString(payload, "designation", "Designation", errors, { min: 2, max: 80 });
  const department = getString(payload, "department", "Department", errors, { min: 2, max: 80 });
  const employeeId = getString(payload, "employeeId", "Employee ID", errors, { pattern: ID_RE });
  const email = getEmail(payload, "email", "Official email", errors);
  const phone = getPhone(payload, "phone", "Official phone", errors);
  const jurisdiction = getString(payload, "jurisdiction", "Jurisdiction", errors, { min: 2, max: 120 });
  const officeLocation = getString(payload, "officeLocation", "Office location", errors, { min: 2, max: 160 });
  const accessCode = getString(payload, "accessCode", "Secure access code", errors, { min: 6, max: 64 });
  enforceAllowlist(employeeId, "GOV_EMPLOYEE_ALLOWLIST", "employeeId", errors);

  const expectedCode = process.env.GOV_ACCESS_CODE;
  if (expectedCode && accessCode !== expectedCode) {
    errors.accessCode = "Access code is invalid.";
  }

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    role,
    data: {
      fullName,
      designation,
      department,
      employeeId,
      email,
      phone,
      jurisdiction,
      officeLocation,
      accessCode,
    },
  };
};
