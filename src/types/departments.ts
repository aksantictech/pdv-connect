export type DepartmentAssembly = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

export type DepartmentMember = {
  id: string;
  assembly_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
};

export type DepartmentRecord = {
  id: string;
  organization_id: string | null;
  assembly_id: string;
  name: string;
  code: string | null;
  description: string | null;
  objectives: string | null;
  meeting_frequency: string | null;
  responsible_member_id: string | null;
  is_active: boolean;
  assembly: DepartmentAssembly | null;
  responsible: DepartmentMember | null;
};