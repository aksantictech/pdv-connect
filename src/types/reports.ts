export type ReportAssembly = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

export type ReportDepartment = {
  id: string;
  assembly_id: string;
  name: string;
  is_active: boolean;
};

export type ReportMember = {
  id: string;
  assembly_id: string;
  status: string | null;
  is_active: boolean;
  joined_at: string | null;
};

export type ReportActivity = {
  id: string;
  assembly_id: string;
  department_id: string | null;
  title: string;
  activity_type: string | null;
  planned_start_date: string | null;
  planned_end_date: string | null;
  estimated_participants: number | null;
  budget_planned: number | string | null;
  budget_actual: number | string | null;
  status: string | null;
  location: string | null;
  is_active: boolean;
};