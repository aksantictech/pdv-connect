import { createClient } from "@/lib/supabase/server";
import SchoolAttendanceManager from "@/components/admin/SchoolAttendanceManager";
import type {
  SchoolAttendanceRecord,
  SchoolAttendanceSession,
  SchoolAttendanceStudent,
  SchoolClassOption,
  SchoolYear,
} from "@/types/school";

export const dynamic = "force-dynamic";

export default async function SchoolAttendancePage() {
  const supabase = await createClient();

  const [
    schoolYearsResult,
    schoolClassesResult,
    sessionsResult,
    recordsResult,
    studentsResult,
  ] = await Promise.all([
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
      .from("school_attendance_sessions")
      .select(
        "id, school_year_id, class_id, attendance_date, session_label, note, created_at"
      )
      .order("attendance_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("school_attendance_records")
      .select("id, session_id, student_id, status, note, marked_at"),

    supabase
      .from("school_students")
      .select("id, student_number, first_name, last_name, is_active")
      .order("first_name"),
  ]);

  const rawSchoolYears =
    (schoolYearsResult.data as unknown as Omit<SchoolYear, "assembly">[] | null) ??
    [];

  const schoolYears: SchoolYear[] = rawSchoolYears.map((schoolYear) => ({
    ...schoolYear,
    assembly: null,
  }));

  const schoolClasses =
    (schoolClassesResult.data as unknown as SchoolClassOption[] | null) ?? [];

  const students =
    (studentsResult.data as unknown as SchoolAttendanceStudent[] | null) ?? [];

  const rawSessions =
    (sessionsResult.data as unknown as Omit<
      SchoolAttendanceSession,
      "school_year" | "school_class"
    >[] | null) ?? [];

  const sessions: SchoolAttendanceSession[] = rawSessions.map((session) => ({
    ...session,
    school_year:
      schoolYears.find((schoolYear) => schoolYear.id === session.school_year_id) ??
      null,
    school_class:
      schoolClasses.find((schoolClass) => schoolClass.id === session.class_id) ??
      null,
  }));

  const rawRecords =
    (recordsResult.data as unknown as Omit<
      SchoolAttendanceRecord,
      "student"
    >[] | null) ?? [];

  const records: SchoolAttendanceRecord[] = rawRecords.map((record) => ({
    ...record,
    student:
      students.find((student) => student.id === record.student_id) ?? null,
  }));

  const hasError = Boolean(
    schoolYearsResult.error ||
      schoolClassesResult.error ||
      sessionsResult.error ||
      recordsResult.error ||
      studentsResult.error
  );

  return (
    <SchoolAttendanceManager
      schoolYears={schoolYears}
      schoolClasses={schoolClasses}
      sessions={sessions}
      records={records}
      loadError={
        hasError
          ? "Impossible de charger les présences scolaires. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}