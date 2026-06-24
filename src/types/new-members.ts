export type RegistrationStatus =
  | "soumis"
  | "contacte"
  | "en_suivi"
  | "oriente"
  | "integre"
  | "sans_suite";

export type NewMemberRegistration = {
  id: string;
  organization_id: string;
  assembly_id: string;
  requested_department_id: string | null;
  assigned_to_profile_id: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  phone: string;
  email: string | null;
  country: string | null;
  city: string | null;
  commune: string | null;
  first_visit_date: string | null;
  needs_prayer: boolean;
  needs_counselling: boolean;
  wants_baptism: boolean;
  message: string | null;
  status: RegistrationStatus;
  converted_member_id: string | null;
  created_at: string;
  assembly: {
    name: string;
    city: string | null;
  } | null;
  department: {
    name: string;
  } | null;
};

export type StaffProfile = {
  id: string;
  full_name: string;
  job_title: string | null;
  assembly_id: string | null;
};

export type Followup = {
  id: string;
  followup_date: string;
  channel: string | null;
  note: string;
  next_followup_date: string | null;
  status_after_followup: RegistrationStatus | null;
  profile: {
    full_name: string;
  } | null;
};

export const statusLabels: Record<RegistrationStatus, string> = {
  soumis: "À contacter",
  contacte: "Contacté",
  en_suivi: "En suivi",
  oriente: "Orienté",
  integre: "Intégré",
  sans_suite: "Sans suite",
};

export const statusStyles: Record<RegistrationStatus, string> = {
  soumis: "bg-blue-100 text-blue-800",
  contacte: "bg-amber-100 text-amber-800",
  en_suivi: "bg-violet-100 text-violet-800",
  oriente: "bg-cyan-100 text-cyan-800",
  integre: "bg-emerald-100 text-emerald-800",
  sans_suite: "bg-slate-100 text-slate-700",
};