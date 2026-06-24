"use client";

import {
useMemo,
useState,
type FormEvent,
type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
BookOpen,
CheckCircle2,
Download,
Eye,
FileText,
FileUp,
GraduationCap,
LoaderCircle,
Mail,
MapPin,
Pencil,
Phone,
Plus,
Power,
Printer,
Save,
School,
UserRound,
Users,
X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PhotoPicker from "./PhotoPicker";
import type {
SchoolClassOption,
SchoolMemberOption,
SchoolRecord,
SchoolSubject,
} from "@/types/school";
import {
teacherDocumentTypeLabels,
type SchoolTeacherDetailed,
type TeacherDocumentType,
} from "@/types/school-teachers";

type SchoolTeachersManagerProps = {
schools: SchoolRecord[];
schoolClasses: SchoolClassOption[];
subjects: SchoolSubject[];
members: SchoolMemberOption[];
initialTeachers: SchoolTeacherDetailed[];
loadError: string | null;
};

type TeacherForm = {
schoolId: string;
memberId: string;
firstName: string;
lastName: string;
gender: string;
birthDate: string;
maritalStatus: string;
childrenCount: string;
spouseName: string;
phone: string;
email: string;
address: string;
speciality: string;
qualification: string;
hireDate: string;
notes: string;
isActive: boolean;
classIds: string[];
subjectIds: string[];
};

type TeacherDocumentDraft = {
id: string;
documentType: TeacherDocumentType;
title: string;
file: File | null;
};

type ModalProps = {
children: ReactNode;
onClose: () => void;
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

const maritalStatusOptions = [
"Célibataire",
"Marié(e)",
"Veuf(ve)",
"Divorcé(e)",
"Séparé(e)",
];

function createEmptyForm(schools: SchoolRecord[]): TeacherForm {
return {
schoolId: schools.find((school) => school.is_active)?.id ?? "",
memberId: "",
firstName: "",
lastName: "",
gender: "",
birthDate: "",
maritalStatus: "",
childrenCount: "0",
spouseName: "",
phone: "",
email: "",
address: "",
speciality: "",
qualification: "",
hireDate: "",
notes: "",
isActive: true,
classIds: [],
subjectIds: [],
};
}

function createDocumentDraft(): TeacherDocumentDraft {
return {
id: `${Date.now()}-${Math.random()}`,
documentType: "cv",
title: "",
file: null,
};
}

function formatDate(value: string | null | undefined) {
if (!value) {
return "Non renseignée";
}

return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(`${value}T12:00:00`));
}

function escapeHtml(value: string | null | undefined) {
const ampersand = String.fromCharCode(38);

return String(value ?? "")
.replace(/&/g, `${ampersand}amp;`)
.replace(/</g, `${ampersand}lt;`)
.replace(/>/g, `${ampersand}gt;`)
.replace(/"/g, `${ampersand}quot;`)
.replace(/'/g, `${ampersand}#039;`);
}


function initials(firstName: string, lastName: string) {
return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function Modal({ children, onClose }: ModalProps) {
return (
<div
className="fixed inset-0 z-[180] grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose();
}
}}
> <div className="my-auto w-full max-w-6xl rounded-[2rem] bg-white shadow-2xl">
{children} </div> </div>
);
}

export default function SchoolTeachersManager({
schools,
schoolClasses,
subjects,
members,
initialTeachers,
loadError,
}: SchoolTeachersManagerProps) {
const router = useRouter();
const supabase = createClient();

const [teachers, setTeachers] = useState(initialTeachers);
const [schoolFilter, setSchoolFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
const [search, setSearch] = useState("");

const [formOpen, setFormOpen] = useState(false);
const [viewOpen, setViewOpen] = useState(false);

const [editingTeacher, setEditingTeacher] =
useState<SchoolTeacherDetailed | null>(null);

const [viewingTeacher, setViewingTeacher] =
useState<SchoolTeacherDetailed | null>(null);

const [form, setForm] = useState<TeacherForm>(() =>
createEmptyForm(schools)
);

const [photoFile, setPhotoFile] = useState<File | null>(null);
const [documentDrafts, setDocumentDrafts] = useState<
TeacherDocumentDraft[]

> ([]);

const [loading, setLoading] = useState(false);
const [formError, setFormError] = useState("");
const [formMessage, setFormMessage] = useState("");

const selectedSchool = useMemo(
() => schools.find((school) => school.id === form.schoolId) ?? null,
[schools, form.schoolId]
);

const availableMembers = useMemo(() => {
if (!selectedSchool) {
return [];
}


return members.filter(
  (member) =>
    member.assembly_id === selectedSchool.managing_assembly_id
);


}, [members, selectedSchool]);

const availableClasses = useMemo(
() =>
schoolClasses.filter(
(schoolClass) =>
schoolClass.school_id === form.schoolId &&
schoolClass.is_active
),
[schoolClasses, form.schoolId]
);

const availableSubjects = useMemo(
() =>
subjects.filter(
(subject) =>
subject.school_id === form.schoolId &&
subject.is_active
),
[subjects, form.schoolId]
);

const filteredTeachers = useMemo(() => {
const normalizedSearch = search.trim().toLowerCase();


return teachers.filter((teacher) => {
  const matchesSchool =
    schoolFilter === "all" || teacher.school_id === schoolFilter;

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && teacher.is_active) ||
    (statusFilter === "inactive" && !teacher.is_active);

  const matchesSearch =
    !normalizedSearch ||
    [
      teacher.first_name,
      teacher.last_name,
      teacher.phone,
      teacher.email,
      teacher.school?.name,
      teacher.speciality,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch);

  return matchesSchool && matchesStatus && matchesSearch;
});


}, [teachers, schoolFilter, statusFilter, search]);

const activeTeachers = teachers.filter(
(teacher) => teacher.is_active
).length;

const teachersWithDocuments = teachers.filter(
(teacher) => teacher.documents.length > 0
).length;

function closeForm() {
setFormOpen(false);
setEditingTeacher(null);
setForm(createEmptyForm(schools));
setPhotoFile(null);
setDocumentDrafts([]);
setFormError("");
setFormMessage("");
}

function closeView() {
setViewOpen(false);
setViewingTeacher(null);
}

function openCreate() {
setEditingTeacher(null);
setForm(createEmptyForm(schools));
setPhotoFile(null);
setDocumentDrafts([]);
setFormError("");
setFormMessage("");
setFormOpen(true);
}

function openEdit(teacher: SchoolTeacherDetailed) {
setEditingTeacher(teacher);


setForm({
  schoolId: teacher.school_id ?? "",
  memberId: teacher.member_id ?? "",
  firstName: teacher.first_name,
  lastName: teacher.last_name,
  gender: teacher.gender ?? "",
  birthDate: teacher.birth_date ?? "",
  maritalStatus: teacher.marital_status ?? "",
  childrenCount: String(teacher.children_count ?? 0),
  spouseName: teacher.spouse_name ?? "",
  phone: teacher.phone ?? "",
  email: teacher.email ?? "",
  address: teacher.address ?? "",
  speciality: teacher.speciality ?? "",
  qualification: teacher.qualification ?? "",
  hireDate: teacher.hire_date ?? "",
  notes: teacher.notes ?? "",
  isActive: teacher.is_active,
  classIds: teacher.classes.map((item) => item.id),
  subjectIds: teacher.subjects.map((item) => item.id),
});

setPhotoFile(null);
setDocumentDrafts([]);
setFormError("");
setFormMessage("");
setFormOpen(true);


}

function openView(teacher: SchoolTeacherDetailed) {
setViewingTeacher(teacher);
setViewOpen(true);
}

function updateForm<K extends keyof TeacherForm>(
field: K,
value: TeacherForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function changeSchool(schoolId: string) {
setForm((current) => ({
...current,
schoolId,
memberId: "",
classIds: [],
subjectIds: [],
}));
}

function changeMember(memberId: string) {
const member = members.find((item) => item.id === memberId);


setForm((current) => ({
  ...current,
  memberId,
  firstName: member?.first_name ?? current.firstName,
  lastName: member?.last_name ?? current.lastName,
  phone: member?.phone ?? current.phone,
}));


}

function toggleClass(classId: string) {
setForm((current) => ({
...current,
classIds: current.classIds.includes(classId)
? current.classIds.filter((item) => item !== classId)
: [...current.classIds, classId],
}));
}

function toggleSubject(subjectId: string) {
setForm((current) => ({
...current,
subjectIds: current.subjectIds.includes(subjectId)
? current.subjectIds.filter((item) => item !== subjectId)
: [...current.subjectIds, subjectId],
}));
}

function addDocument() {
setDocumentDrafts((current) => [...current, createDocumentDraft()]);
}

function removeDocument(documentId: string) {
setDocumentDrafts((current) =>
current.filter((document) => document.id !== documentId)
);
}

function updateDocument(
documentId: string,
field: "documentType" | "title" | "file",
value: TeacherDocumentType | string | File | null
) {
setDocumentDrafts((current) =>
current.map((document) =>
document.id === documentId
? {
...document,
[field]: value,
}
: document
)
);
}

async function uploadTeacherPhoto(teacherId: string) {
if (!photoFile) {
return;
}


const extension =
  photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

const photoPath = `school-teachers/${teacherId}/${Date.now()}.${extension}`;

const { error: uploadError } = await supabase.storage
  .from("pdv-media")
  .upload(photoPath, photoFile, {
    cacheControl: "3600",
    contentType: photoFile.type,
    upsert: false,
  });

if (uploadError) {
  throw new Error(uploadError.message);
}

const { error: photoError } = await supabase.rpc(
  "update_school_teacher_photo",
  {
    p_teacher_id: teacherId,
    p_photo_path: photoPath,
  }
);

if (photoError) {
  throw new Error(photoError.message);
}


}

async function uploadTeacherDocuments(teacherId: string) {
for (const document of documentDrafts) {
if (!document.file) {
continue;
}


  if (document.file.size > 15 * 1024 * 1024) {
    throw new Error(
      `Le document « ${document.file.name} » dépasse la limite de 15 Mo.`
    );
  }

  const safeFileName = document.file.name.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  const filePath = `school-teachers/${teacherId}/${Date.now()}-${safeFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("pdv-documents")
    .upload(filePath, document.file, {
      cacheControl: "3600",
      contentType: document.file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: documentError } = await supabase.rpc(
    "add_school_teacher_document",
    {
      p_teacher_id: teacherId,
      p_document_type: document.documentType,
      p_title:
        document.title.trim() ||
        teacherDocumentTypeLabels[document.documentType],
      p_file_path: filePath,
      p_file_name: document.file.name,
      p_mime_type: document.file.type,
      p_size_bytes: document.file.size,
    }
  );

  if (documentError) {
    throw new Error(documentError.message);
  }
}


}

function makeTeacherPayload(
teacher: SchoolTeacherDetailed,
activeValue: boolean
) {
return {
teacher_id: teacher.id,
school_id: teacher.school_id,
member_id: teacher.member_id,
first_name: teacher.first_name,
last_name: teacher.last_name,
gender: teacher.gender,
birth_date: teacher.birth_date,
marital_status: teacher.marital_status,
children_count: teacher.children_count ?? 0,
spouse_name: teacher.spouse_name,
phone: teacher.phone,
email: teacher.email,
address: teacher.address,
speciality: teacher.speciality,
qualification: teacher.qualification,
hire_date: teacher.hire_date,
notes: teacher.notes,
is_active: activeValue,
class_ids: teacher.classes.map((item) => item.id),
subject_ids: teacher.subjects.map((item) => item.id),
};
}

async function saveTeacher(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setFormError("");
setFormMessage("");

if (!form.schoolId) {
  setFormError("Veuillez sélectionner une école.");
  return;
}

if (!form.firstName.trim() || !form.lastName.trim()) {
  setFormError("Le prénom et le nom sont obligatoires.");
  return;
}

const childrenCount = Number(form.childrenCount);

if (!Number.isInteger(childrenCount) || childrenCount < 0) {
  setFormError("Le nombre d’enfants doit être un nombre positif ou nul.");
  return;
}

setLoading(true);

try {
  const { data: teacherId, error } = await supabase.rpc(
    "save_school_teacher",
    {
      p_payload: {
        teacher_id: editingTeacher?.id ?? null,
        school_id: form.schoolId,
        member_id: form.memberId || null,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        gender: form.gender || null,
        birth_date: form.birthDate || null,
        marital_status: form.maritalStatus || null,
        children_count: childrenCount,
        spouse_name: form.spouseName.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        speciality: form.speciality.trim() || null,
        qualification: form.qualification.trim() || null,
        hire_date: form.hireDate || null,
        notes: form.notes.trim() || null,
        is_active: form.isActive,
        class_ids: form.classIds,
        subject_ids: form.subjectIds,
      },
    }
  );

  if (error || !teacherId) {
    throw new Error(
      error?.message ||
        "Impossible d’enregistrer les informations de l’enseignant."
    );
  }

  const savedTeacherId = teacherId as string;

  await uploadTeacherPhoto(savedTeacherId);
  await uploadTeacherDocuments(savedTeacherId);

  setFormMessage(
    editingTeacher
      ? "Le dossier de l’enseignant a été mis à jour."
      : "Le nouvel enseignant a été enregistré avec succès."
  );

  router.refresh();

  window.setTimeout(() => {
    closeForm();
  }, 850);
} catch (error) {
  setFormError(
    error instanceof Error
      ? error.message
      : "Impossible d’enregistrer l’enseignant."
  );
} finally {
  setLoading(false);
}


}

async function toggleTeacherStatus(teacher: SchoolTeacherDetailed) {
const action = teacher.is_active ? "désactiver" : "réactiver";


const confirmed = window.confirm(
  `Voulez-vous vraiment ${action} ${teacher.first_name} ${teacher.last_name} ?`
);

if (!confirmed) {
  return;
}

const { error } = await supabase.rpc("save_school_teacher", {
  p_payload: makeTeacherPayload(teacher, !teacher.is_active),
});

if (error) {
  window.alert(error.message);
  return;
}

router.refresh();


}

function printTeacherSheet(teacher: SchoolTeacherDetailed) {
const printWindow = window.open("", "_blank", "width=900,height=900");


if (!printWindow) {
  window.alert(
    "La fenêtre d’impression a été bloquée. Autorisez les fenêtres contextuelles puis réessayez."
  );
  return;
}

const teacherPhoto = teacher.photo_url
  ? `<img src="${escapeHtml(teacher.photo_url)}" alt="Photo professeur" />`
  : `<span>${escapeHtml(
      initials(teacher.first_name, teacher.last_name)
    )}</span>`;

const schoolName = teacher.school?.name || "École non renseignée";

const classes =
  teacher.classes.map((item) => item.name).join(", ") ||
  "Aucune classe affectée";

const subjects =
  teacher.subjects.map((item) => item.name).join(", ") ||
  "Aucune matière affectée";

printWindow.document.write(`
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <title>Fiche professeur - ${escapeHtml(
        teacher.first_name
      )} ${escapeHtml(teacher.last_name)}</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          color: #142b52;
          font-family: Arial, Helvetica, sans-serif;
          background: #ffffff;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #0a56a4;
          padding-bottom: 14px;
        }
        .brand { font-size: 13px; font-weight: 800; color: #1680c4; letter-spacing: 1px; }
        h1 { margin: 5px 0 0; font-size: 27px; color: #092e63; }
        .school { text-align: right; font-size: 14px; font-weight: 700; color: #0a3d82; }
        .hero {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 24px;
          margin-top: 28px;
          padding: 22px;
          background: #f1f7ff;
          border-radius: 18px;
        }
        .photo {
          display: flex;
          width: 120px;
          height: 145px;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid #cfe4ff;
          border-radius: 14px;
          background: #0a3d82;
          color: white;
          font-size: 36px;
          font-weight: 900;
        }
        .photo img { width: 100%; height: 100%; object-fit: cover; }
        .name { font-size: 27px; font-weight: 900; color: #092e63; }
        .status {
          display: inline-block;
          margin-top: 10px;
          padding: 6px 10px;
          border-radius: 999px;
          background: ${teacher.is_active ? "#dcfce7" : "#e2e8f0"};
          color: ${teacher.is_active ? "#166534" : "#334155"};
          font-size: 12px;
          font-weight: 800;
        }
        .section { margin-top: 25px; }
        .section h2 {
          margin: 0 0 12px;
          font-size: 15px;
          color: #0a56a4;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .item {
          padding: 13px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #ffffff;
        }
        .label {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .value { margin-top: 5px; font-size: 14px; font-weight: 700; }
        .footer {
          margin-top: 34px;
          border-top: 1px solid #dbeafe;
          padding-top: 10px;
          color: #64748b;
          font-size: 10px;
          text-align: center;
        }
      </style>
    </head>
    <body onload="window.print()">
      <div class="header">
        <div>
          <div class="brand">ÉCOLE CHRÉTIENNE PAROLE DU SALUT</div>
          <h1>Fiche professeur</h1>
        </div>
        <div class="school">${escapeHtml(schoolName)}</div>
      </div>

      <div class="hero">
        <div class="photo">${teacherPhoto}</div>
        <div>
          <div class="name">${escapeHtml(
            teacher.first_name
          )} ${escapeHtml(teacher.last_name)}</div>
          <div class="status">${
            teacher.is_active ? "Enseignant actif" : "Enseignant inactif"
          }</div>
          <p><strong>Spécialité :</strong> ${escapeHtml(
            teacher.speciality || "Non renseignée"
          )}</p>
          <p><strong>Qualification :</strong> ${escapeHtml(
            teacher.qualification || "Non renseignée"
          )}</p>
        </div>
      </div>

      <div class="section">
        <h2>Informations personnelles</h2>
        <div class="grid">
          <div class="item"><div class="label">Genre</div><div class="value">${escapeHtml(
            teacher.gender || "Non renseigné"
          )}</div></div>
          <div class="item"><div class="label">Date de naissance</div><div class="value">${escapeHtml(
            formatDate(teacher.birth_date)
          )}</div></div>
          <div class="item"><div class="label">État civil</div><div class="value">${escapeHtml(
            teacher.marital_status || "Non renseigné"
          )}</div></div>
          <div class="item"><div class="label">Conjoint(e)</div><div class="value">${escapeHtml(
            teacher.spouse_name || "Non renseigné"
          )}</div></div>
          <div class="item"><div class="label">Nombre d’enfants</div><div class="value">${escapeHtml(
            String(teacher.children_count ?? 0)
          )}</div></div>
          <div class="item"><div class="label">Date d’engagement</div><div class="value">${escapeHtml(
            formatDate(teacher.hire_date)
          )}</div></div>
        </div>
      </div>

      <div class="section">
        <h2>Coordonnées</h2>
        <div class="grid">
          <div class="item"><div class="label">Téléphone</div><div class="value">${escapeHtml(
            teacher.phone || "Non renseigné"
          )}</div></div>
          <div class="item"><div class="label">E-mail</div><div class="value">${escapeHtml(
            teacher.email || "Non renseigné"
          )}</div></div>
          <div class="item"><div class="label">Adresse</div><div class="value">${escapeHtml(
            teacher.address || "Non renseignée"
          )}</div></div>
          <div class="item"><div class="label">Membre de l’église</div><div class="value">${
            teacher.member
              ? escapeHtml(
                  `${teacher.member.first_name} ${teacher.member.last_name}`
                )
              : "Aucun lien"
          }</div></div>
        </div>
      </div>

      <div class="section">
        <h2>Affectations académiques</h2>
        <div class="grid">
          <div class="item"><div class="label">Classes</div><div class="value">${escapeHtml(
            classes
          )}</div></div>
          <div class="item"><div class="label">Matières</div><div class="value">${escapeHtml(
            subjects
          )}</div></div>
        </div>
      </div>

      <div class="footer">
        Document généré par PDV Connect • ${new Date().toLocaleDateString(
          "fr-FR"
        )}
      </div>
    </body>
  </html>
`);

printWindow.document.close();


}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
École chrétienne </p>


      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Gestion des enseignants
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Centralisez les dossiers professionnels, les affectations de
        classes, les matières enseignées et les documents académiques.
      </p>
    </div>

    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <Plus size={19} />
      Ajouter un enseignant
    </button>
  </section>

  {loadError ? (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      {loadError}
    </div>
  ) : (
    <>
      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Users className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {teachers.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Enseignants enregistrés
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activeTeachers}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Enseignants actifs
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
          <FileText className="text-violet-700" size={25} />
          <p className="mt-6 text-3xl font-black text-violet-900">
            {teachersWithDocuments}
          </p>
          <p className="mt-2 font-bold text-violet-800">
            Dossiers documentés
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-[minmax(0,1fr)_260px_210px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un enseignant, une matière, une école..."
            className={inputClassName}
          />

          <select
            value={schoolFilter}
            onChange={(event) => setSchoolFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all">Toutes les écoles</option>

            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>

        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <UserRound className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucun enseignant trouvé
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Commencez par enregistrer le premier enseignant de l’école.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <article
                key={teacher.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0a3d82] font-black text-white">
                      {teacher.photo_url ? (
                        <img
                          src={teacher.photo_url}
                          alt={`${teacher.first_name} ${teacher.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials(teacher.first_name, teacher.last_name)
                      )}
                    </div>

                    <div>
                      <h2 className="font-black text-[#092e63]">
                        {teacher.first_name} {teacher.last_name}
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {teacher.school?.name || "École non renseignée"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      teacher.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {teacher.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex gap-2 text-slate-600">
                    <GraduationCap
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    <span>
                      {teacher.speciality || "Spécialité non renseignée"}
                    </span>
                  </div>

                  <div className="flex gap-2 text-slate-600">
                    <BookOpen
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    <span>
                      {teacher.subjects.length > 0
                        ? teacher.subjects
                            .map((subject) => subject.name)
                            .join(", ")
                        : "Aucune matière affectée"}
                    </span>
                  </div>

                  <div className="flex gap-2 text-slate-600">
                    <School
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    <span>
                      {teacher.classes.length > 0
                        ? teacher.classes
                            .map((schoolClass) => schoolClass.name)
                            .join(", ")
                        : "Aucune classe affectée"}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => openView(teacher)}
                    className="inline-flex items-center justify-center rounded-xl border border-blue-200 py-2.5 text-[#0a3d82] transition hover:bg-blue-50"
                    title="Voir la fiche"
                  >
                    <Eye size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(teacher)}
                    className="inline-flex items-center justify-center rounded-xl border border-blue-200 py-2.5 text-[#0a3d82] transition hover:bg-blue-50"
                    title="Modifier"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => printTeacherSheet(teacher)}
                    className="inline-flex items-center justify-center rounded-xl border border-violet-200 py-2.5 text-violet-800 transition hover:bg-violet-50"
                    title="Imprimer la fiche"
                  >
                    <Printer size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleTeacherStatus(teacher)}
                    className={`inline-flex items-center justify-center rounded-xl border py-2.5 transition ${
                      teacher.is_active
                        ? "border-red-200 text-red-700 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                    title={
                      teacher.is_active
                        ? "Désactiver"
                        : "Réactiver"
                    }
                  >
                    <Power size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )}

  {formOpen && (
    <Modal onClose={closeForm}>
      <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
            École chrétienne
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#092e63]">
            {editingTeacher
              ? "Modifier l’enseignant"
              : "Ajouter un enseignant"}
          </h2>
        </div>

        <button
          type="button"
          onClick={closeForm}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X size={22} />
        </button>
      </div>

      <form onSubmit={saveTeacher} className="p-6 sm:p-8">
        {formError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {formError}
          </div>
        )}

        {formMessage && (
          <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <CheckCircle2 size={19} className="shrink-0" />
            {formMessage}
          </div>
        )}

        <div className="mb-7">
          {editingTeacher?.photo_url && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
              <img
                src={editingTeacher.photo_url}
                alt={`${editingTeacher.first_name} ${editingTeacher.last_name}`}
                className="h-16 w-16 rounded-xl object-cover"
              />
              <p className="text-sm font-bold text-[#092e63]">
                Photo actuelle de l’enseignant
              </p>
            </div>
          )}

          <PhotoPicker
            label="Photo de l’enseignant"
            file={photoFile}
            onChange={setPhotoFile}
            onError={setFormError}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              École *
            </span>

            <select
              value={form.schoolId}
              onChange={(event) => changeSchool(event.target.value)}
              className={inputClassName}
              required
            >
              <option value="">Sélectionnez une école</option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                  {school.commune ? ` — ${school.commune}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Lier à un membre de l’église
              <span className="ml-1 font-normal text-slate-400">
                (facultatif)
              </span>
            </span>

            <select
              value={form.memberId}
              onChange={(event) => changeMember(event.target.value)}
              className={inputClassName}
              disabled={!selectedSchool}
            >
              <option value="">Aucun lien pour le moment</option>

              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                  {member.phone ? ` — ${member.phone}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Prénom *
            </span>
            <input
              value={form.firstName}
              onChange={(event) =>
                updateForm("firstName", event.target.value)
              }
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nom *
            </span>
            <input
              value={form.lastName}
              onChange={(event) =>
                updateForm("lastName", event.target.value)
              }
              className={inputClassName}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Genre
            </span>
            <select
              value={form.gender}
              onChange={(event) =>
                updateForm("gender", event.target.value)
              }
              className={inputClassName}
            >
              <option value="">Non renseigné</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Date de naissance
            </span>
            <input
              type="date"
              value={form.birthDate}
              onChange={(event) =>
                updateForm("birthDate", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              État civil
            </span>
            <select
              value={form.maritalStatus}
              onChange={(event) =>
                updateForm("maritalStatus", event.target.value)
              }
              className={inputClassName}
            >
              <option value="">Non renseigné</option>
              {maritalStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nom du conjoint(e)
            </span>
            <input
              value={form.spouseName}
              onChange={(event) =>
                updateForm("spouseName", event.target.value)
              }
              placeholder="Ex. Nom de l’épouse ou de l’époux"
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Nombre d’enfants
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.childrenCount}
              onChange={(event) =>
                updateForm("childrenCount", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Date d’engagement
            </span>
            <input
              type="date"
              value={form.hireDate}
              onChange={(event) =>
                updateForm("hireDate", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Téléphone
            </span>
            <input
              value={form.phone}
              onChange={(event) =>
                updateForm("phone", event.target.value)
              }
              placeholder="+243 ..."
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Adresse e-mail
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateForm("email", event.target.value)
              }
              className={inputClassName}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Adresse
            </span>
            <input
              value={form.address}
              onChange={(event) =>
                updateForm("address", event.target.value)
              }
              placeholder="Rue, numéro, quartier..."
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Spécialité / matière
            </span>
            <input
              value={form.speciality}
              onChange={(event) =>
                updateForm("speciality", event.target.value)
              }
              placeholder="Ex. Mathématiques, musique..."
              className={inputClassName}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Qualification
            </span>
            <input
              value={form.qualification}
              onChange={(event) =>
                updateForm("qualification", event.target.value)
              }
              placeholder="Ex. Licence, formation pédagogique..."
              className={inputClassName}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Notes administratives
            </span>
            <textarea
              value={form.notes}
              onChange={(event) =>
                updateForm("notes", event.target.value)
              }
              className={`${inputClassName} min-h-24 resize-y`}
              placeholder="Informations complémentaires..."
            />
          </label>
        </div>

        <section className="mt-8 rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
          <div className="flex items-center gap-3">
            <School className="text-[#0a56a4]" size={21} />
            <div>
              <h3 className="font-black text-[#092e63]">
                Classes affectées
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Un enseignant peut être affecté à une ou plusieurs classes.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableClasses.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune classe disponible pour cette école.
              </p>
            ) : (
              availableClasses.map((schoolClass) => (
                <button
                  key={schoolClass.id}
                  type="button"
                  onClick={() => toggleClass(schoolClass.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                    form.classIds.includes(schoolClass.id)
                      ? "border-[#0a56a4] bg-[#0a56a4] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                  }`}
                >
                  {schoolClass.name}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-violet-100 bg-violet-50/50 p-5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-violet-700" size={21} />
            <div>
              <h3 className="font-black text-[#092e63]">
                Matières enseignées
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Sélectionne une ou plusieurs matières pour cet enseignant.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {availableSubjects.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune matière disponible pour cette école.
              </p>
            ) : (
              availableSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => toggleSubject(subject.id)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-bold transition ${
                    form.subjectIds.includes(subject.id)
                      ? "border-violet-700 bg-violet-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                  }`}
                >
                  {subject.name}
                  {subject.code ? ` — ${subject.code}` : ""}
                </button>
              ))
            )}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-amber-100 bg-amber-50/50 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <FileUp className="text-amber-700" size={21} />
              <div>
                <h3 className="font-black text-[#092e63]">
                  CV, diplômes et documents
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  PDF, Word, JPG ou PNG. Taille maximale : 15 Mo par fichier.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addDocument}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-extrabold text-amber-800 hover:bg-amber-100"
            >
              <Plus size={16} />
              Ajouter un document
            </button>
          </div>

          {editingTeacher && editingTeacher.documents.length > 0 && (
            <p className="mt-4 text-sm text-slate-600">
              Documents déjà enregistrés :{" "}
              <strong>{editingTeacher.documents.length}</strong>. Ils restent
              disponibles dans la fiche enseignant.
            </p>
          )}

          <div className="mt-5 space-y-3">
            {documentDrafts.map((document) => (
              <div
                key={document.id}
                className="grid gap-3 rounded-2xl border border-amber-100 bg-white p-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <select
                  value={document.documentType}
                  onChange={(event) =>
                    updateDocument(
                      document.id,
                      "documentType",
                      event.target.value as TeacherDocumentType
                    )
                  }
                  className={inputClassName}
                >
                  {Object.entries(teacherDocumentTypeLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>

                <input
                  value={document.title}
                  onChange={(event) =>
                    updateDocument(
                      document.id,
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="Titre du document"
                  className={inputClassName}
                />

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    updateDocument(
                      document.id,
                      "file",
                      event.target.files?.[0] ?? null
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                />

                <button
                  type="button"
                  onClick={() => removeDocument(document.id)}
                  className="rounded-xl border border-red-200 px-3 py-2.5 text-red-700 hover:bg-red-50"
                  aria-label="Retirer le document"
                >
                  <X size={17} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {editingTeacher && (
          <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateForm("isActive", event.target.checked)
              }
              className="h-4 w-4 accent-[#0a56a4]"
            />
            Enseignant actif
          </label>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeForm}
            className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Enregistrement…
              </>
            ) : (
              <>
                <Save size={18} />
                {editingTeacher
                  ? "Enregistrer les modifications"
                  : "Créer l’enseignant"}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )}

  {viewOpen && viewingTeacher && (
    <Modal onClose={closeView}>
      <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
            Fiche enseignant
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#092e63]">
            {viewingTeacher.first_name} {viewingTeacher.last_name}
          </h2>
        </div>

        <button
          type="button"
          onClick={closeView}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Fermer"
        >
          <X size={22} />
        </button>
      </div>

      <div className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
          <div className="rounded-3xl bg-blue-50 p-5 text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl bg-[#0a3d82] text-4xl font-black text-white">
              {viewingTeacher.photo_url ? (
                <img
                  src={viewingTeacher.photo_url}
                  alt={`${viewingTeacher.first_name} ${viewingTeacher.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(
                  viewingTeacher.first_name,
                  viewingTeacher.last_name
                )
              )}
            </div>

            <span
              className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-extrabold ${
                viewingTeacher.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {viewingTeacher.is_active ? "Enseignant actif" : "Inactif"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              label="École"
              value={viewingTeacher.school?.name || "Non renseignée"}
            />
            <InfoCard
              label="Membre de l’église"
              value={
                viewingTeacher.member
                  ? `${viewingTeacher.member.first_name} ${viewingTeacher.member.last_name}`
                  : "Aucun lien"
              }
            />
            <InfoCard
              label="Date de naissance"
              value={formatDate(viewingTeacher.birth_date)}
            />
            <InfoCard
              label="État civil"
              value={viewingTeacher.marital_status || "Non renseigné"}
            />
            <InfoCard
              label="Conjoint(e)"
              value={viewingTeacher.spouse_name || "Non renseigné"}
            />
            <InfoCard
              label="Nombre d’enfants"
              value={String(viewingTeacher.children_count ?? 0)}
            />
            <InfoCard
              label="Téléphone"
              value={viewingTeacher.phone || "Non renseigné"}
            />
            <InfoCard
              label="Adresse e-mail"
              value={viewingTeacher.email || "Non renseignée"}
            />
            <InfoCard
              label="Spécialité"
              value={viewingTeacher.speciality || "Non renseignée"}
            />
            <InfoCard
              label="Qualification"
              value={viewingTeacher.qualification || "Non renseignée"}
            />
          </div>
        </div>

        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-blue-100 bg-blue-50/50 p-5">
            <h3 className="font-black text-[#092e63]">
              Classes affectées
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {viewingTeacher.classes.length > 0 ? (
                viewingTeacher.classes.map((schoolClass) => (
                  <span
                    key={schoolClass.id}
                    className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#0a3d82]"
                  >
                    {schoolClass.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune classe affectée.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-3xl border border-violet-100 bg-violet-50/50 p-5">
            <h3 className="font-black text-[#092e63]">
              Matières enseignées
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {viewingTeacher.subjects.length > 0 ? (
                viewingTeacher.subjects.map((subject) => (
                  <span
                    key={subject.id}
                    className="rounded-full bg-white px-3 py-2 text-sm font-bold text-violet-800"
                  >
                    {subject.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Aucune matière affectée.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="mt-5 rounded-3xl border border-amber-100 bg-amber-50/50 p-5">
          <h3 className="font-black text-[#092e63]">
            Documents du dossier
          </h3>

          {viewingTeacher.documents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Aucun document n’a encore été téléversé.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {viewingTeacher.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="font-bold text-[#092e63]">
                      {document.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {teacherDocumentTypeLabels[document.document_type]}
                    </p>
                  </div>

                  {document.download_url && (
                    <a
                      href={document.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-extrabold text-amber-800 hover:bg-amber-100"
                    >
                      <Download size={16} />
                      Télécharger
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeView}
            className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 hover:bg-slate-50"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={() => printTeacherSheet(viewingTeacher)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white hover:bg-[#072d61]"
          >
            <Printer size={18} />
            Imprimer la fiche professeur
          </button>
        </div>
      </div>
    </Modal>
  )}
</div>


);
}

function InfoCard({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"> <p className="text-xs font-black uppercase tracking-wide text-slate-500">
{label} </p> <p className="mt-2 break-words font-bold text-[#092e63]">{value}</p> </div>
);
}
