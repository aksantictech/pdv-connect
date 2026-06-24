import { createClient } from "../../../../lib/supabase/server";
import SchoolStudentsManager from "../../../../components/admin/SchoolStudentsManager";
import type {
  SchoolAssembly,
  SchoolClassOption,
  SchoolEnrollment,
  SchoolStudent,
  SchoolYear,
} from "../../../../types/school";

export const dynamic = "force-dynamic";

export default async function SchoolStudentsPage() {
  const supabase = await createClient();

  const [
    assembliesResult,
    schoolYearsResult,
    schoolClassesResult,
    studentsResult,
    enrollmentsResult,
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
      .from("school_students")
      .select(`
        id,
        student_number,
        first_name,
        last_name,
        gender,
        birth_date,
        phone,
        email,
        address,
        commune,
        city,
        country,
        parent_name,
        parent_phone,
        parent_email,
        emergency_contact_name,
        emergency_contact_phone,
        photo_path,
        notes,
        is_active
      `)
      .order("first_name"),

    supabase
      .from("school_enrollments")
      .select(`
        id,
        student_id,
        school_year_id,
        class_id,
        enrollment_date,
        status,
        fee_amount,
        fee_paid,
        observation
      `)
      .order("created_at", { ascending: false }),
  ]);

  const assemblies =
    (assembliesResult.data as unknown as SchoolAssembly[] | null) ?? [];

  const rawSchoolYears =
    (schoolYearsResult.data as unknown as Omit<SchoolYear, "assembly">[] | null) ??
    [];

  const schoolYears: SchoolYear[] = rawSchoolYears.map((schoolYear) => ({
    ...schoolYear,
    assembly:
      assemblies.find((assembly) => assembly.id === schoolYear.assembly_id) ??
      null,
  }));

  const schoolClasses =
    (schoolClassesResult.data as unknown as SchoolClassOption[] | null) ?? [];

const rawStudents =
  (studentsResult.data as unknown as SchoolStudent[] | null) ?? [];

const students = await Promise.all(
  rawStudents.map(async (student) => {
    if (!student.photo_path) {
      return {
        ...student,
        photo_url: null,
      };
    }

    const { data: signedPhoto } = await supabase.storage
      .from("pdv-media")
      .createSignedUrl(student.photo_path, 3600);

    return {
      ...student,
      photo_url: signedPhoto?.signedUrl ?? null,
    };
  })
);

  const rawEnrollments =
    (enrollmentsResult.data as unknown as Omit<
      SchoolEnrollment,
      "student" | "school_year" | "school_class"
    >[] | null) ?? [];

  const enrollments: SchoolEnrollment[] = rawEnrollments
    .map((enrollment) => ({
      ...enrollment,
      student:
        students.find((student) => student.id === enrollment.student_id) ??
        null,
      school_year:
        schoolYears.find(
          (schoolYear) => schoolYear.id === enrollment.school_year_id
        ) ?? null,
      school_class:
        schoolClasses.find(
          (schoolClass) => schoolClass.id === enrollment.class_id
        ) ?? null,
    }))
    .filter((enrollment) => enrollment.student !== null);

  const hasError = Boolean(
    assembliesResult.error ||
      schoolYearsResult.error ||
      schoolClassesResult.error ||
      studentsResult.error ||
      enrollmentsResult.error
  );

  return (
    <SchoolStudentsManager
      assemblies={assemblies}
      schoolYears={schoolYears}
      schoolClasses={schoolClasses}
      enrollments={enrollments}
      loadError={
        hasError
          ? "Impossible de charger les élèves et inscriptions. Vérifie les droits du compte connecté."
          : null
      }
    />
  );
}