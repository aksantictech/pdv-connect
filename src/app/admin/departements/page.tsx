import { createClient } from "@/lib/supabase/server";
import DepartmentsManager from "../../../components/admin/DepartmentsManager";
import type {
  DepartmentAssembly,
  DepartmentMember,
  DepartmentRecord,
} from "../../../types/departments";;

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const [departmentsResult, assembliesResult, membersResult] =
    await Promise.all([
      supabase
        .from("departments")
        .select(`
          id,
          organization_id,
          assembly_id,
          name,
          code,
          description,
          objectives,
          meeting_frequency,
          responsible_member_id,
          is_active
        `)
        .order("name"),

      supabase
        .from("assemblies")
        .select("id, name, city, country")
        .order("name"),

      supabase
        .from("members")
        .select("id, assembly_id, first_name, last_name, phone")
        .eq("is_active", true)
        .order("first_name"),
    ]);

  const assemblies =
    (assembliesResult.data as DepartmentAssembly[] | null) ?? [];

  const members =
    (membersResult.data as DepartmentMember[] | null) ?? [];

  const rawDepartments =
    (departmentsResult.data as Omit<
      DepartmentRecord,
      "assembly" | "responsible"
    >[] | null) ?? [];

  const departments: DepartmentRecord[] = rawDepartments.map((department) => ({
    ...department,
    assembly:
      assemblies.find((assembly) => assembly.id === department.assembly_id) ??
      null,
    responsible:
      members.find((member) => member.id === department.responsible_member_id) ??
      null,
  }));

  return (
    <DepartmentsManager
      initialDepartments={departments}
      assemblies={assemblies}
      members={members}
      loadError={
        departmentsResult.error
          ? "Impossible de charger les départements. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}