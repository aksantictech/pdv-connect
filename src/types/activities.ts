export type ActivityStatus =
  | "brouillon"
  | "soumis"
  | "valide"
  | "en_cours"
  | "termine"
  | "rejete"
  | "annule";

export type ActivityAssemblyOption = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

export type ActivityDepartmentOption = {
  id: string;
  assembly_id: string;
  name: string;
};

export type ActivityMemberOption = {
  id: string;
  assembly_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
};

export type ActivityRecord = {
  id: string;
  organization_id: string | null;
  assembly_id: string;
  department_id: string | null;
  title: string;
  activity_type: string | null;
  periodicity: string | null;
  description: string | null;
  expected_results: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  location: string | null;
  responsible_member_id: string | null;
  estimated_participants: number | null;
  budget_planned: number | string | null;
  budget_actual: number | string | null;
  actual_results: string | null;
  report_summary: string | null;
  status: ActivityStatus;
  status_note: string | null;
  approved_at: string | null;
  created_at: string;
  is_active: boolean;
  assembly: ActivityAssemblyOption | null;
  department: ActivityDepartmentOption | null;
  responsible: ActivityMemberOption | null;
};

export const activityStatusLabels: Record<ActivityStatus, string> = {
  brouillon: "Brouillon",
  soumis: "Soumis",
  valide: "Validé",
  en_cours: "En cours",
  termine: "Terminé",
  rejete: "Rejeté",
  annule: "Annulé",
};

export const activityStatusStyles: Record<ActivityStatus, string> = {
  brouillon: "bg-slate-100 text-slate-700",
  soumis: "bg-blue-100 text-blue-800",
  valide: "bg-emerald-100 text-emerald-800",
  en_cours: "bg-cyan-100 text-cyan-800",
  termine: "bg-violet-100 text-violet-800",
  rejete: "bg-red-100 text-red-800",
  annule: "bg-orange-100 text-orange-800",
};