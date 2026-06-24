import { createClient } from "@/lib/supabase/server";
import ActivitiesManager from "@/components/admin/ActivitiesManager";
import type {
  ActivityAssemblyOption,
  ActivityDepartmentOption,
  ActivityMemberOption,
  ActivityRecord,
} from "../../../types/activities";

export default async function ActivitiesPage() {
  const supabase = await createClient();

  const [
    activitiesResult,
    assembliesResult,
    departmentsResult,
    membersResult,
  ] = await Promise.all([
    supabase
      .from("activities")
      .select(`
        id,
        organization_id,
        assembly_id,
        department_id,
        title,
        activity_type,
        periodicity,
        description,
        expected_results,
        planned_start_date,
        planned_end_date,
        location,
        responsible_member_id,
        estimated_participants,
        budget_planned,
        budget_actual,
        actual_results,
        report_summary,
        status,
        status_note,
        approved_at,
        created_at,
        is_active
      `)
      .order("planned_start_date", { ascending: true }),

    supabase
      .from("assemblies")
      .select("id, name, city, country")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("departments")
      .select("id, assembly_id, name")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("members")
      .select("id, assembly_id, first_name, last_name, phone")
      .eq("is_active", true)
      .order("first_name"),
  ]);

  const assemblies =
    (assembliesResult.data as ActivityAssemblyOption[] | null) ?? [];

  const departments =
    (departmentsResult.data as ActivityDepartmentOption[] | null) ?? [];

  const members =
    (membersResult.data as ActivityMemberOption[] | null) ?? [];

  const rawActivities =
    (activitiesResult.data as Omit<
      ActivityRecord,
      "assembly" | "department" | "responsible"
    >[] | null) ?? [];

  const activities: ActivityRecord[] = rawActivities.map((activity) => ({
    ...activity,
    assembly:
      assemblies.find((assembly) => assembly.id === activity.assembly_id) ??
      null,
    department:
      departments.find(
        (department) => department.id === activity.department_id
      ) ?? null,
    responsible:
      members.find(
        (member) => member.id === activity.responsible_member_id
      ) ?? null,
  }));

  return (
    <ActivitiesManager
      initialActivities={activities}
      assemblies={assemblies}
      departments={departments}
      members={members}
      loadError={
        activitiesResult.error
          ? "Impossible de charger les activités. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}