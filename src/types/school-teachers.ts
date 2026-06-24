import type {
SchoolClassOption,
SchoolMemberOption,
SchoolRecord,
SchoolSubject,
} from "./school";

export type TeacherDocumentType =
| "cv"
| "diplome"
| "certificat"
| "autre";

export const teacherDocumentTypeLabels: Record<
TeacherDocumentType,
string

> = {
cv: "Curriculum Vitae",
diplome: "Diplôme",
certificat: "Certificat",
autre: "Autre document",
};

export type SchoolTeacherDocument = {
id: string;
teacher_id: string;
document_type: TeacherDocumentType;
title: string;
file_path: string;
file_name: string | null;
mime_type: string | null;
size_bytes: number | null;
created_at: string;
download_url?: string | null;
};

export type SchoolTeacherDetailed = {
id: string;
assembly_id: string | null;
school_id: string | null;
member_id: string | null;
first_name: string;
last_name: string;
gender: string | null;
birth_date: string | null;
marital_status: string | null;
children_count: number | null;
spouse_name: string | null;
phone: string | null;
email: string | null;
address: string | null;
speciality: string | null;
qualification: string | null;
hire_date: string | null;
notes: string | null;
photo_path: string | null;
photo_url?: string | null;
is_active: boolean;
created_at: string;
updated_at: string | null;
school: SchoolRecord | null;
member: SchoolMemberOption | null;
classes: SchoolClassOption[];
subjects: SchoolSubject[];
documents: SchoolTeacherDocument[];
};
