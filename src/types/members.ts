export type MemberStatus =
  | "nouveau"
  | "en_integration"
  | "membre_actif"
  | "ouvrier"
  | "responsable"
  | "inactif"
  | "transfere";

export type AssemblyOption = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

export type DepartmentOption = {
  id: string;
  assembly_id: string;
  name: string;
};

export type MemberDepartmentAssignment = {
  function_name: string | null;
  is_active: boolean;
  department: {
    id: string;
    name: string;
  } | null;
};

export type ChurchMember = {
  id: string;
  assembly_id: string;
  member_number: string | null;
  first_name: string;
  last_name: string;
  gender: string | null;
  phone: string | null;
  email: string | null;
  country: string | null;
  city: string | null;
  commune: string | null;
  marital_status: string | null;
  occupation: string | null;
  joined_at: string | null;
  status: MemberStatus;
  notes: string | null;
  is_active: boolean;
  photo_path: string | null;
  photo_url: string | null;
  created_at: string;
  assembly: {
    name: string;
    city: string | null;
  } | null;
  member_departments: MemberDepartmentAssignment[] | null;
};

export const memberStatusLabels: Record<MemberStatus, string> = {
  nouveau: "Nouveau",
  en_integration: "En intégration",
  membre_actif: "Membre actif",
  ouvrier: "Ouvrier",
  responsable: "Responsable",
  inactif: "Inactif",
  transfere: "Transféré",
};

export const memberStatusStyles: Record<MemberStatus, string> = {
  nouveau: "bg-blue-100 text-blue-800",
  en_integration: "bg-violet-100 text-violet-800",
  membre_actif: "bg-emerald-100 text-emerald-800",
  ouvrier: "bg-cyan-100 text-cyan-800",
  responsable: "bg-amber-100 text-amber-800",
  inactif: "bg-slate-100 text-slate-700",
  transfere: "bg-orange-100 text-orange-800",
};