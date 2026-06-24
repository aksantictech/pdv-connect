export type SchoolAssembly = {
id: string;
name: string;
city: string | null;
country: string | null;
};

export type SchoolRecord = {
id: string;
organization_id: string | null;
managing_assembly_id: string;
name: string;
code: string | null;
country: string | null;
city: string | null;
commune: string | null;
address: string | null;
phone: string | null;
email: string | null;
responsible_name: string | null;
responsible_phone: string | null;
responsible_email: string | null;
photo_path: string | null;
photo_url?: string | null;
is_active: boolean;
created_at: string;
updated_at?: string | null;
managing_assembly?: SchoolAssembly | null;
};

export type SchoolOption = {
id: string;
name: string;
city: string | null;
commune: string | null;
managing_assembly_id: string;
is_active: boolean;
};

export type SchoolMemberOption = {
id: string;
assembly_id: string | null;
first_name: string;
last_name: string;
full_name?: string | null;
phone: string | null;
is_active?: boolean;
};

export type SchoolTeacher = {
id: string;
assembly_id: string | null;
school_id: string | null;
member_id: string | null;
first_name: string;
last_name: string;
full_name?: string | null;
gender: string | null;
phone: string | null;
email: string | null;
speciality: string | null;
specialty?: string | null;
qualification: string | null;
hire_date: string | null;
notes?: string | null;
is_active: boolean;
created_at?: string;
school?: SchoolRecord | null;
member?: SchoolMemberOption | null;
};

export type SchoolYear = {
id: string;
organization_id: string | null;
assembly_id: string | null;
school_id: string | null;
name: string;
start_date: string;
end_date: string;
is_current: boolean;
is_active: boolean;
created_at: string;
updated_at?: string | null;
assembly?: SchoolAssembly | null;
school?: SchoolRecord | null;
};

export type SchoolClass = {
id: string;
school_year_id: string;
school_id?: string | null;
name: string;
level_name: string | null;
section_name: string | null;
level?: string | null;
section?: string | null;
capacity: number | null;
main_teacher_id: string | null;
titulaire_member_id?: string | null;
room_name: string | null;
main_teacher_name?: string | null;
is_active: boolean;
created_at?: string;
school_year: SchoolYear | null;
main_teacher: SchoolTeacher | null;
};

export type SchoolClassOption = {
id: string;
school_year_id: string;
school_id?: string | null;
name: string;
level_name: string | null;
section_name: string | null;
level?: string | null;
section?: string | null;
capacity: number | null;
is_active: boolean;
};

export type SchoolStudentStatus =
| "prospect"
| "preinscrit"
| "inscrit"
| "admis"
| "suspendu"
| "termine"
| "transfere"
| "abandon";

export type SchoolStudent = {
id: string;
assembly_id?: string | null;
school_id?: string | null;
student_number: string | null;
first_name: string;
last_name: string;
gender: string | null;
birth_date: string | null;
phone: string | null;
email: string | null;
address: string | null;
commune: string | null;
city: string | null;
country: string | null;
parent_name: string | null;
parent_phone: string | null;
parent_email: string | null;
emergency_contact_name: string | null;
emergency_contact_phone: string | null;
photo_path: string | null;
photo_url?: string | null;
notes: string | null;
is_active: boolean;
status?: SchoolStudentStatus | string;
created_at?: string;
current_enrollment?: SchoolEnrollment | null;
};

export type SchoolEnrollmentStatus =
| "preinscrit"
| "inscrit"
| "suspendu"
| "termine"
| "transfere";

export type SchoolEnrollment = {
id: string;
student_id: string;
school_year_id: string;
class_id: string | null;
school_class_id?: string | null;
registration_number?: string | null;
enrollment_date: string;
status: SchoolEnrollmentStatus;
fee_amount: number | string | null;
fee_paid: number | string | null;
tuition_total?: number | string | null;
tuition_paid?: number | string | null;
observation: string | null;
notes?: string | null;
student: SchoolStudent | null;
school_year: SchoolYear | null;
school_class: SchoolClassOption | null;
};

export const enrollmentStatusLabels: Record<
SchoolEnrollmentStatus,
string

> = {
preinscrit: "Préinscrit",
inscrit: "Inscrit",
suspendu: "Suspendu",
termine: "Terminé",
transfere: "Transféré",
};

export const enrollmentStatusStyles: Record<
SchoolEnrollmentStatus,
string

> = {
preinscrit: "bg-blue-100 text-blue-800",
inscrit: "bg-emerald-100 text-emerald-800",
suspendu: "bg-orange-100 text-orange-800",
termine: "bg-violet-100 text-violet-800",
transfere: "bg-slate-200 text-slate-700",
};

export type AttendanceStatus =
| "non_renseigne"
| "present"
| "absent"
| "retard"
| "justifie";

export type SchoolAttendanceStudent = {
id: string;
student_number: string | null;
first_name: string;
last_name: string;
full_name?: string;
photo_url?: string | null;
is_active: boolean;
};

export type SchoolAttendanceRecord = {
id: string;
session_id: string;
student_id: string;
status: AttendanceStatus;
note: string | null;
marked_at: string | null;
created_at?: string;
student: SchoolAttendanceStudent | null;
};

export type SchoolAttendanceSession = {
id: string;
school_year_id: string;
class_id: string;
school_class_id?: string;
attendance_date: string;
session_label: string;
label?: string | null;
note: string | null;
notes?: string | null;
created_at: string;
school_year: SchoolYear | null;
school_class: SchoolClassOption | null;
};

export const attendanceStatusLabels: Record<AttendanceStatus, string> = {
non_renseigne: "Non renseigné",
present: "Présent",
absent: "Absent",
retard: "Retard",
justifie: "Justifié",
};

export const attendanceStatusStyles: Record<AttendanceStatus, string> = {
non_renseigne: "bg-slate-100 text-slate-700",
present: "bg-emerald-100 text-emerald-800",
absent: "bg-red-100 text-red-700",
retard: "bg-amber-100 text-amber-800",
justifie: "bg-cyan-100 text-cyan-800",
};

export type SchoolSubject = {
id: string;
assembly_id: string;
school_id?: string | null;
name: string;
code: string | null;
coefficient: number | string;
is_active: boolean;
};

export type SchoolAssessment = {
id: string;
school_year_id: string;
class_id: string;
subject_id: string;
title: string;
evaluation_period: string;
assessment_date: string;
max_score: number | string;
weight: number | string;
note: string | null;
is_active: boolean;
created_at: string;
school_year: SchoolYear | null;
school_class: SchoolClassOption | null;
subject: SchoolSubject | null;
};

export type SchoolAssessmentGradeRow = {
grade_id: string;
assessment_id: string;
student_id: string;
score: number | string | null;
comment: string | null;
student_number: string | null;
first_name: string;
last_name: string;
photo_path: string | null;
max_score: number | string;
subject_name: string;
assessment_title: string;
};
