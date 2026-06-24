import { createClient } from "@/lib/supabase/server";
import ReportsDashboard from "../../../components/admin/ReportsDashboard";
import type {
  ReportActivity,
  ReportAssembly,
  ReportDepartment,
  ReportMember,
} from "../../../types/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [
    assembliesResult,
    departmentsResult,
    membersResult,
    activitiesResult,
  ] = await Promise.all([
    supabase
      .from("assemblies")
      .select("id, name, city, country")
      .order("name"),

    supabase
      .from("departments")
      .select("id, assembly_id, name, is_active")
      .order("name"),

    supabase
      .from("members")
      .select("id, assembly_id, status, is_active, joined_at"),

    supabase
      .from("activities")
      .select(`
        id,
        assembly_id,
        department_id,
        title,
        activity_type,
        planned_start_date,
        planned_end_date,
        estimated_participants,
        budget_planned,
        budget_actual,
        status,
        location,
        is_active
      `)
      .order("planned_start_date", { ascending: false }),
  ]);

  const assemblies =
    (assembliesResult.data as unknown as ReportAssembly[] | null) ?? [];

  const departments =
    (departmentsResult.data as unknown as ReportDepartment[] | null) ?? [];

  const members =
    (membersResult.data as unknown as ReportMember[] | null) ?? [];

  const activities =
    (activitiesResult.data as unknown as ReportActivity[] | null) ?? [];

  const hasError = Boolean(
    assembliesResult.error ||
      departmentsResult.error ||
      membersResult.error ||
      activitiesResult.error
  );

  return (
    <ReportsDashboard
      assemblies={assemblies}
      departments={departments}
      members={members}
      activities={activities}
      loadError={
        hasError
          ? "Impossible de charger les données du rapport. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}