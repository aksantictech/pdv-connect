import { createClient } from "../../../../lib/supabase/server";
import SchoolAssessmentsManager from "../../../../components/admin/SchoolAssessmentsManager";
import type {
  SchoolAssembly,
  SchoolAssessment,
  SchoolClassOption,
  SchoolSubject,
  SchoolYear,
} from "../../../../types/school";

export const dynamic = "force-dynamic";

export default async function SchoolAssessmentsPage() {
  const supabase = await createClient();

  const [
    assembliesResult,
    schoolYearsResult,
    schoolClassesResult,
    subjectsResult,
    assessmentsResult,
  ] = await Promise.all([
    supabase
      .from("assemblies")
      .select("id, name, city, country")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("school_years")
      .select("id, assembly_id, name, start_date, end_date, is_current, is_active")
      .eq("is_active", true)
      .order("start_date", { ascending: false }),

    supabase
      .from("school_classes")
      .select("id, school_year_id, name, level_name, section_name, capacity, is_active")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("school_subjects")
      .select("id, assembly_id, name, code, coefficient, is_active")
      .order("name"),

    supabase
      .from("school_assessments")
      .select(
        "id, school_year_id, class_id, subject_id, title, evaluation_period, assessment_date, max_score, weight, note, is_active, created_at"
      )
      .order("assessment_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const assemblies =
    (assembliesResult.data as unknown as SchoolAssembly[] | null) ?? [];

  const rawSchoolYears =
    (schoolYearsResult.data as unknown as Omit<
      SchoolYear,
      "assembly"
    >[] | null) ?? [];

  const schoolYears: SchoolYear[] = rawSchoolYears.map((schoolYear) => ({
    ...schoolYear,
    assembly:
      assemblies.find((assembly) => assembly.id === schoolYear.assembly_id) ??
      null,
  }));

  const schoolClasses =
    (schoolClassesResult.data as unknown as SchoolClassOption[] | null) ?? [];

  const subjects =
    (subjectsResult.data as unknown as SchoolSubject[] | null) ?? [];

  const rawAssessments =
    (assessmentsResult.data as unknown as Omit<
      SchoolAssessment,
      "school_year" | "school_class" | "subject"
    >[] | null) ?? [];

  const assessments: SchoolAssessment[] = rawAssessments.map((assessment) => ({
    ...assessment,
    school_year:
      schoolYears.find(
        (schoolYear) => schoolYear.id === assessment.school_year_id
      ) ?? null,
    school_class:
      schoolClasses.find(
        (schoolClass) => schoolClass.id === assessment.class_id
      ) ?? null,
    subject:
      subjects.find((subject) => subject.id === assessment.subject_id) ?? null,
  }));

  const hasError = Boolean(
    assembliesResult.error ||
      schoolYearsResult.error ||
      schoolClassesResult.error ||
      subjectsResult.error ||
      assessmentsResult.error
  );

  return (
    <SchoolAssessmentsManager
      assemblies={assemblies}
      schoolYears={schoolYears}
      schoolClasses={schoolClasses}
      subjects={subjects}
      assessments={assessments}
      loadError={
        hasError
          ? "Impossible de charger les matières et évaluations. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}