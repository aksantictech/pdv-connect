import { createClient } from "../../../../lib/supabase/server";
import SchoolClassesManager from "../../../../components/admin/SchoolClassesManager";

export const dynamic = "force-dynamic";

type SchoolRow = {
  id: string;
  name: string;
  city: string | null;
  commune: string | null;
  is_active: boolean;
};

type SchoolYearRow = {
  id: string;
  school_id: string | null;
  name: string;
  is_current: boolean;
  is_active: boolean;
};

type SchoolClassRow = {
  id: string;
  school_year_id: string;
  name: string;
  level_name: string | null;
  section_name: string | null;
  capacity: number | null;
  is_active: boolean;
  school_id?: string | null;
};

export default async function SchoolClassesPage() {
  const supabase = await createClient();

  const [schoolsResult, yearsResult, classesResult] = await Promise.all([
    supabase
      .from("schools")
      .select("id, name, city, commune, is_active")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("school_years")
      .select("id, school_id, name, is_current, is_active")
      .eq("is_active", true)
      .order("name"),

    supabase
      .from("school_classes")
      .select(`
        id,
        school_year_id,
        name,
        level_name,
        section_name,
        capacity,
        is_active
      `)
      .order("name"),
  ]);

  const schools = (schoolsResult.data ?? []) as SchoolRow[];

  const schoolYears = (yearsResult.data ?? []) as SchoolYearRow[];

  const rawClasses = (classesResult.data ?? []) as SchoolClassRow[];

  const schoolClasses = rawClasses.map((schoolClass) => ({
    ...schoolClass,
    school_id:
      schoolYears.find(
        (schoolYear) => schoolYear.id === schoolClass.school_year_id
      )?.school_id ?? null,
  }));

  const errors = [
    schoolsResult.error?.message,
    yearsResult.error?.message,
    classesResult.error?.message,
  ].filter((message): message is string => Boolean(message));

  return (
    <SchoolClassesManager
      schools={schools as never}
      schoolYears={schoolYears as never}
      initialClasses={schoolClasses as never}
      loadError={
        errors.length > 0
          ? `Impossible de charger les classes. Détail : ${errors.join(" | ")}`
          : null
      }
    />
  );
}