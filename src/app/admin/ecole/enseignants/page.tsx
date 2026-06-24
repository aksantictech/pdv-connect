import { createClient } from "@/lib/supabase/server";
import SchoolTeachersManager from "@/components/admin/SchoolTeachersManager";
import type {
SchoolAssembly,
SchoolClassOption,
SchoolMemberOption,
SchoolRecord,
SchoolSubject,
SchoolYear,
} from "@/types/school";
import type {
SchoolTeacherDetailed,
SchoolTeacherDocument,
} from "@/types/school-teachers";

export const dynamic = "force-dynamic";

export default async function SchoolTeachersPage() {
const supabase = await createClient();

const [
assembliesResult,
schoolsResult,
schoolYearsResult,
schoolClassesResult,
subjectsResult,
membersResult,
teachersResult,
teacherClassesResult,
teacherSubjectsResult,
documentsResult,
] = await Promise.all([
supabase
.from("assemblies")
.select("id, name, city, country")
.eq("is_active", true)
.order("name"),


supabase
  .from("schools")
  .select(`
    id,
    organization_id,
    managing_assembly_id,
    name,
    code,
    country,
    city,
    commune,
    address,
    phone,
    email,
    responsible_name,
    responsible_phone,
    responsible_email,
    photo_path,
    is_active,
    created_at,
    updated_at
  `)
  .eq("is_active", true)
  .order("name"),

supabase
  .from("school_years")
  .select(`
    id,
    organization_id,
    assembly_id,
    school_id,
    name,
    start_date,
    end_date,
    is_current,
    is_active,
    created_at
  `)
  .eq("is_active", true)
  .order("start_date", { ascending: false }),

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
  .eq("is_active", true)
  .order("name"),

supabase
  .from("school_subjects")
  .select(`
    id,
    assembly_id,
    school_id,
    name,
    code,
    coefficient,
    is_active
  `)
  .eq("is_active", true)
  .order("name"),

supabase
  .from("members")
  .select("id, assembly_id, first_name, last_name, phone, is_active")
  .eq("is_active", true)
  .order("first_name"),

supabase
  .from("school_teachers")
  .select(`
    id,
    assembly_id,
    school_id,
    member_id,
    first_name,
    last_name,
    gender,
    birth_date,
    marital_status,
    children_count,
    spouse_name,
    phone,
    email,
    address,
    speciality,
    qualification,
    hire_date,
    notes,
    photo_path,
    is_active,
    created_at,
    updated_at
  `)
  .order("last_name")
  .order("first_name"),

supabase
  .from("school_teacher_classes")
  .select("teacher_id, class_id")
  .eq("is_active", true),

supabase
  .from("school_teacher_subjects")
  .select("teacher_id, subject_id")
  .eq("is_active", true),

supabase
  .from("school_teacher_documents")
  .select(`
    id,
    teacher_id,
    document_type,
    title,
    file_path,
    file_name,
    mime_type,
    size_bytes,
    created_at
  `)
  .order("created_at", { ascending: false }),


]);

const assemblies =
(assembliesResult.data as unknown as SchoolAssembly[] | null) ?? [];

const rawSchools =
(schoolsResult.data as unknown as SchoolRecord[] | null) ?? [];

const schools: SchoolRecord[] = rawSchools.map((school) => ({
...school,
managing_assembly:
assemblies.find(
(assembly) => assembly.id === school.managing_assembly_id
) ?? null,
}));

const rawSchoolYears =
(schoolYearsResult.data as unknown as SchoolYear[] | null) ?? [];

const schoolYears: SchoolYear[] = rawSchoolYears.map((schoolYear) => ({
...schoolYear,
assembly:
assemblies.find(
(assembly) => assembly.id === schoolYear.assembly_id
) ?? null,
school:
schools.find((school) => school.id === schoolYear.school_id) ?? null,
}));

const rawSchoolClasses =
(schoolClassesResult.data as unknown as SchoolClassOption[] | null) ?? [];

const schoolClasses: SchoolClassOption[] = rawSchoolClasses.map(
(schoolClass) => ({
...schoolClass,
school_id:
schoolYears.find(
(schoolYear) => schoolYear.id === schoolClass.school_year_id
)?.school_id ?? null,
})
);

const subjects =
(subjectsResult.data as unknown as SchoolSubject[] | null) ?? [];

const members =
(membersResult.data as unknown as SchoolMemberOption[] | null) ?? [];

const rawTeachers =
(teachersResult.data as unknown as Omit<
SchoolTeacherDetailed,
"school" | "member" | "classes" | "subjects" | "documents" | "photo_url"
>[] | null) ?? [];

const teacherClasses =
(teacherClassesResult.data as unknown as {
teacher_id: string;
class_id: string;
}[] | null) ?? [];

const teacherSubjects =
(teacherSubjectsResult.data as unknown as {
teacher_id: string;
subject_id: string;
}[] | null) ?? [];

const rawDocuments =
(documentsResult.data as unknown as SchoolTeacherDocument[] | null) ?? [];

const documents = await Promise.all(
rawDocuments.map(async (document) => {
const { data } = await supabase.storage
.from("pdv-documents")
.createSignedUrl(document.file_path, 3600);


  return {
    ...document,
    download_url: data?.signedUrl ?? null,
  };
})


);

const classIdsByTeacher = new Map<string, string[]>();

for (const assignment of teacherClasses) {
const current = classIdsByTeacher.get(assignment.teacher_id) ?? [];
current.push(assignment.class_id);
classIdsByTeacher.set(assignment.teacher_id, current);
}

const subjectIdsByTeacher = new Map<string, string[]>();

for (const assignment of teacherSubjects) {
const current = subjectIdsByTeacher.get(assignment.teacher_id) ?? [];
current.push(assignment.subject_id);
subjectIdsByTeacher.set(assignment.teacher_id, current);
}

const documentsByTeacher = new Map<string, SchoolTeacherDocument[]>();

for (const document of documents) {
const current = documentsByTeacher.get(document.teacher_id) ?? [];
current.push(document);
documentsByTeacher.set(document.teacher_id, current);
}

const teachers = await Promise.all(
rawTeachers.map(async (teacher) => {
let photoUrl: string | null = null;


  if (teacher.photo_path) {
    const { data } = await supabase.storage
      .from("pdv-media")
      .createSignedUrl(teacher.photo_path, 3600);

    photoUrl = data?.signedUrl ?? null;
  }

  const classIds = classIdsByTeacher.get(teacher.id) ?? [];
  const subjectIds = subjectIdsByTeacher.get(teacher.id) ?? [];

  return {
    ...teacher,
    photo_url: photoUrl,
    school:
      schools.find((school) => school.id === teacher.school_id) ?? null,
    member:
      members.find((member) => member.id === teacher.member_id) ?? null,
    classes: schoolClasses.filter((schoolClass) =>
      classIds.includes(schoolClass.id)
    ),
    subjects: subjects.filter((subject) =>
      subjectIds.includes(subject.id)
    ),
    documents: documentsByTeacher.get(teacher.id) ?? [],
  };
})


);

const errors = [
assembliesResult.error?.message,
schoolsResult.error?.message,
schoolYearsResult.error?.message,
schoolClassesResult.error?.message,
subjectsResult.error?.message,
membersResult.error?.message,
teachersResult.error?.message,
teacherClassesResult.error?.message,
teacherSubjectsResult.error?.message,
documentsResult.error?.message,
].filter(Boolean);

return ( <SchoolTeachersManager
   schools={schools}
   schoolClasses={schoolClasses}
   subjects={subjects}
   members={members}
   initialTeachers={teachers}
   loadError={
     errors.length > 0
? `Impossible de charger les enseignants. Détail : ${errors.join(
              " | "
            )}`
: null
}
/>
);
}
