"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CountrySelect, CommuneField } from "../ui/LocationFields";
import {
  Ban,
  CheckCircle2,
  Eye,
  GraduationCap,
  Printer,
  LoaderCircle,
  Pencil,
  Plus,
  UserCheck,
  Users,
  X,
  
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PhotoPicker from "./PhotoPicker";
import type {
  SchoolAssembly,
  SchoolClassOption,
  SchoolEnrollment,
  SchoolYear,
  
} from "@/types/school";
import {
  enrollmentStatusLabels,
  enrollmentStatusStyles,
} from "@/types/school";

type SchoolStudentsManagerProps = {
  assemblies: SchoolAssembly[];
  schoolYears: SchoolYear[];
  schoolClasses: SchoolClassOption[];
  enrollments: SchoolEnrollment[];
  loadError: string | null;
};

type StudentForm = {
  assemblyId: string;
  schoolYearId: string;
  classId: string;
  enrollmentDate: string;
  status: SchoolEnrollment["status"];
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  commune: string;
  city: string;
  country: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  feeAmount: string;
  feePaid: string;
  observation: string;
  notes: string;
};

type ModalMode = "create" | "edit" | "view" | null;

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function emptyForm(
  assemblies: SchoolAssembly[],
  schoolYears: SchoolYear[]
): StudentForm {
  const currentSchoolYear =
    schoolYears.find((schoolYear) => schoolYear.is_current) ??
    schoolYears[0] ??
    null;

  return {
    assemblyId: currentSchoolYear?.assembly_id ?? assemblies[0]?.id ?? "",
    schoolYearId: currentSchoolYear?.id ?? "",
    classId: "",
    enrollmentDate: new Date().toISOString().slice(0, 10),
    status: "inscrit",
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    commune: "",
    city: "Kinshasa",
    country: "RDC",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    feeAmount: "",
    feePaid: "",
    observation: "",
    notes: "",
  };
}

function formatDate(value: string | null) {
  if (!value) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatAmount(value: number | string | null) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function SchoolStudentsManager({
  assemblies,
  schoolYears,
  schoolClasses,
  enrollments,
  loadError,
}: SchoolStudentsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<ModalMode>(null);
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<SchoolEnrollment | null>(null);

  const [form, setForm] = useState<StudentForm>(() =>
    emptyForm(assemblies, schoolYears)
  );
const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [schoolYearFilter, setSchoolYearFilter] = useState(
    schoolYears.find((schoolYear) => schoolYear.is_current)?.id ?? "all"
  );

  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const availableClasses = useMemo(
    () =>
      schoolClasses.filter(
        (schoolClass) => schoolClass.school_year_id === form.schoolYearId
      ),
    [schoolClasses, form.schoolYearId]
  );

  const filterClasses = useMemo(
    () =>
      schoolClasses.filter(
        (schoolClass) => schoolClass.school_year_id === schoolYearFilter
      ),
    [schoolClasses, schoolYearFilter]
  );

  const filteredEnrollments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return enrollments.filter((enrollment) => {
      const student = enrollment.student;

      if (!student) return false;

      const matchesYear =
        schoolYearFilter === "all" ||
        enrollment.school_year_id === schoolYearFilter;

      const matchesClass =
        classFilter === "all" || enrollment.class_id === classFilter;

      const matchesStatus =
        statusFilter === "all" || enrollment.status === statusFilter;

      const text = [
        student.first_name,
        student.last_name,
        student.student_number,
        student.parent_name,
        student.parent_phone,
        student.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesYear &&
        matchesClass &&
        matchesStatus &&
        text.includes(keyword)
      );
    });
  }, [enrollments, search, schoolYearFilter, classFilter, statusFilter]);

  const activeStudents = new Set(
    enrollments
      .filter((enrollment) => enrollment.student?.is_active)
      .map((enrollment) => enrollment.student_id)
  ).size;

  const registeredCount = filteredEnrollments.filter(
    (enrollment) => enrollment.status === "inscrit"
  ).length;

  const totalExpectedFees = filteredEnrollments.reduce(
    (total, enrollment) => total + Number(enrollment.fee_amount ?? 0),
    0
  );

  const totalPaidFees = filteredEnrollments.reduce(
    (total, enrollment) => total + Number(enrollment.fee_paid ?? 0),
    0
  );

  function closeModal() {
    setMode(null);
    setSelectedEnrollment(null);
    setForm(emptyForm(assemblies, schoolYears));
    setFormError("");
    setFormMessage("");
    setPhotoFile(null);
  }

  function openCreate() {
    if (schoolYears.length === 0) {
      window.alert(
        "Créez d’abord une année scolaire avant d’inscrire un élève."
      );
      return;
    }

    setSelectedEnrollment(null);
    setForm(emptyForm(assemblies, schoolYears));
    setFormError("");
    setFormMessage("");
    setMode("create");
    setPhotoFile(null);
  }

  function openEdit(enrollment: SchoolEnrollment) {
    const student = enrollment.student;

    if (!student) return;

    const schoolYear = enrollment.school_year;

    setSelectedEnrollment(enrollment);
    setPhotoFile(null);
    setForm({
      assemblyId: schoolYear?.assembly_id ?? "",
      schoolYearId: enrollment.school_year_id,
      classId: enrollment.class_id ?? "",
      enrollmentDate: enrollment.enrollment_date,
      status: enrollment.status,
      firstName: student.first_name,
      lastName: student.last_name,
      gender: student.gender ?? "",
      birthDate: student.birth_date ?? "",
      phone: student.phone ?? "",
      email: student.email ?? "",
      address: student.address ?? "",
      commune: student.commune ?? "",
      city: student.city ?? "",
      country: student.country ?? "RDC",
      parentName: student.parent_name ?? "",
      parentPhone: student.parent_phone ?? "",
      parentEmail: student.parent_email ?? "",
      emergencyContactName: student.emergency_contact_name ?? "",
      emergencyContactPhone: student.emergency_contact_phone ?? "",
      feeAmount:
        enrollment.fee_amount !== null ? String(enrollment.fee_amount) : "",
      feePaid:
        enrollment.fee_paid !== null ? String(enrollment.fee_paid) : "",
      observation: enrollment.observation ?? "",
      notes: student.notes ?? "",
    });

    setFormError("");
    setFormMessage("");
    setMode("edit");
  }

  function updateSchoolYear(schoolYearId: string) {
    const schoolYear = schoolYears.find((item) => item.id === schoolYearId);

    setForm((current) => ({
      ...current,
      schoolYearId,
      assemblyId: schoolYear?.assembly_id ?? "",
      classId: "",
    }));
  }

async function uploadStudentPhoto(studentId: string) {
  if (!photoFile) {
    return;
  }

  const extension =
    photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

  const photoPath = `school-students/${studentId}/${Date.now()}.${extension}`;

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
    "update_school_student_photo",
    {
      p_student_id: studentId,
      p_photo_path: photoPath,
    }
  );

  if (photoError) {
    throw new Error(photoError.message);
  }
}

function escapeHtml(value: string | null | undefined) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

  async function saveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormMessage("");

    if (!form.schoolYearId || !form.assemblyId) {
      setFormError("Veuillez sélectionner une année scolaire.");
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("Le prénom et le nom de l’élève sont obligatoires.");
      return;
    }

    const feeAmount = form.feeAmount ? Number(form.feeAmount) : 0;
    const feePaid = form.feePaid ? Number(form.feePaid) : 0;

    if (
      Number.isNaN(feeAmount) ||
      Number.isNaN(feePaid) ||
      feeAmount < 0 ||
      feePaid < 0
    ) {
      setFormError("Les frais doivent être des montants positifs.");
      return;
    }

    setLoading(true);

    const payload = {
      assembly_id: form.assemblyId,
      school_year_id: form.schoolYearId,
      class_id: form.classId || null,
      enrollment_date: form.enrollmentDate || null,
      status: form.status,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      gender: form.gender || null,
      birth_date: form.birthDate || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      commune: form.commune.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || "RDC",
      parent_name: form.parentName.trim() || null,
      parent_phone: form.parentPhone.trim() || null,
      parent_email: form.parentEmail.trim() || null,
      emergency_contact_name: form.emergencyContactName.trim() || null,
      emergency_contact_phone: form.emergencyContactPhone.trim() || null,
      fee_amount: feeAmount,
      fee_paid: feePaid,
      observation: form.observation.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      if (mode === "edit" && selectedEnrollment) {
        const { error } = await supabase.rpc(
          "update_school_student_enrollment",
          {
            p_enrollment_id: selectedEnrollment.id,
            p_payload: payload,
          }
        );

        if (error) throw new Error(error.message);

        if (selectedEnrollment.student) {
  await uploadStudentPhoto(selectedEnrollment.student.id);
}

        setFormMessage("Le dossier de l’élève a été mis à jour.");
      } else {
const { data: enrollmentId, error } = await supabase.rpc(
  "create_school_student_enrollment",
  {
    p_payload: payload,
  }
);

if (error || !enrollmentId) {
  throw new Error(
    error?.message || "Impossible de créer l’inscription de l’élève."
  );
}

const { data: studentId, error: studentIdError } = await supabase.rpc(
  "get_school_student_id_from_enrollment",
  {
    p_enrollment_id: enrollmentId,
  }
);

if (studentIdError || !studentId) {
  throw new Error(
    studentIdError?.message ||
      "L’élève a été créé, mais son identifiant est introuvable."
  );
}

await uploadStudentPhoto(studentId as string);

setFormMessage("L’élève a été inscrit avec succès.");
      }

      router.refresh();

      window.setTimeout(() => {
        closeModal();
      }, 850);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer l’élève."
      );
    } finally {
      setLoading(false);
    }
  }

function printStudentCard(enrollment: SchoolEnrollment) {
  const student = enrollment.student;

  if (!student || enrollment.status !== "inscrit") {
    return;
  }

  const printWindow = window.open("", "_blank", "width=650,height=450");

  if (!printWindow) {
    window.alert(
      "La fenêtre d’impression a été bloquée. Autorisez les fenêtres contextuelles puis réessayez."
    );
    return;
  }

  const initials = `${student.first_name.charAt(0)}${student.last_name.charAt(
    0
  )}`.toUpperCase();

  const logoUrl = `${window.location.origin}/images/logo-pdv.jpeg`;

  const photoMarkup = student.photo_url
    ? `<img src="${escapeHtml(student.photo_url)}" alt="Photo élève" />`
    : `<span>${escapeHtml(initials)}</span>`;

  const className =
    enrollment.school_class?.name || "Classe non attribuée";

  const schoolYear =
    enrollment.school_year?.name || "Année scolaire non définie";

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Carte élève - ${escapeHtml(student.student_number)}</title>
        <style>
          @page {
            size: 85.6mm 54mm;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            width: 85.6mm;
            height: 54mm;
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .card {
            position: relative;
            width: 85.6mm;
            height: 54mm;
            overflow: hidden;
            padding: 5mm;
            color: #ffffff;
            background:
              radial-gradient(circle at top right, rgba(43, 150, 255, 0.42), transparent 35%),
              linear-gradient(135deg, #061d45 0%, #0a3d82 58%, #1680c4 100%);
          }

          .top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 3mm;
            border-bottom: 1px solid rgba(255, 255, 255, 0.26);
            padding-bottom: 2.5mm;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 2.5mm;
          }

          .logo {
            width: 9mm;
            height: 9mm;
            overflow: hidden;
            border-radius: 50%;
            background: #ffffff;
            padding: 1mm;
          }

          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .school {
            font-size: 8.5pt;
            font-weight: 800;
            line-height: 1.15;
          }

          .subtitle {
            margin-top: 0.7mm;
            color: #cce8ff;
            font-size: 5.8pt;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
          }

          .badge {
            border: 1px solid rgba(255, 255, 255, 0.52);
            border-radius: 20px;
            padding: 1.4mm 2.2mm;
            color: #ffffff;
            font-size: 5.5pt;
            font-weight: 800;
            text-transform: uppercase;
          }

          .content {
            display: grid;
            grid-template-columns: 19mm 1fr;
            gap: 4mm;
            margin-top: 4mm;
          }

          .photo {
            display: flex;
            width: 19mm;
            height: 22mm;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 3mm;
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
            font-size: 13pt;
            font-weight: 900;
          }

          .photo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .name {
            font-size: 12pt;
            font-weight: 900;
            line-height: 1.12;
            text-transform: uppercase;
          }

          .student-number {
            margin-top: 1.3mm;
            color: #cce8ff;
            font-size: 6.5pt;
            font-weight: 800;
            letter-spacing: 0.4px;
          }

          .details {
            margin-top: 3mm;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2mm 3mm;
          }

          .label {
            color: #cce8ff;
            font-size: 5.4pt;
            font-weight: 700;
            text-transform: uppercase;
          }

          .value {
            margin-top: 0.5mm;
            color: #ffffff;
            font-size: 6.8pt;
            font-weight: 800;
            line-height: 1.2;
          }

          .footer {
            position: absolute;
            right: 5mm;
            bottom: 3.3mm;
            left: 5mm;
            display: flex;
            justify-content: space-between;
            color: #d7eeff;
            font-size: 5pt;
          }
        </style>
      </head>
      <body onload="window.print()">
        <div class="card">
          <div class="top">
            <div class="brand">
              <div class="logo">
                <img src="${escapeHtml(logoUrl)}" alt="PDV" />
              </div>

              <div>
                <div class="school">École Chrétienne<br />Parole du Salut</div>
                <div class="subtitle">Carte d’élève</div>
              </div>
            </div>

            <div class="badge">Élève inscrit</div>
          </div>

          <div class="content">
            <div class="photo">${photoMarkup}</div>

            <div>
              <div class="name">
                ${escapeHtml(student.first_name)}<br />
                ${escapeHtml(student.last_name)}
              </div>

              <div class="student-number">
                Matricule : ${escapeHtml(
                  student.student_number || "À attribuer"
                )}
              </div>

              <div class="details">
                <div>
                  <div class="label">Classe</div>
                  <div class="value">${escapeHtml(className)}</div>
                </div>

                <div>
                  <div class="label">Année scolaire</div>
                  <div class="value">${escapeHtml(schoolYear)}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <span>PDV Connect</span>
            <span>Document scolaire</span>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}

  async function toggleStudentStatus(enrollment: SchoolEnrollment) {
    const student = enrollment.student;

    if (!student) return;

    const action = student.is_active ? "désactiver" : "réactiver";

    if (
      !window.confirm(
        `Confirmer : ${action} ${student.first_name} ${student.last_name} ?`
      )
    ) {
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc(
      "set_school_student_active_status",
      {
        p_student_id: student.id,
        p_is_active: !student.is_active,
      }
    );

    setLoading(false);

    if (error) {
      window.alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            École chrétienne
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Élèves et inscriptions
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Gérez les élèves, leurs parents ou tuteurs, leur classe, leur
            statut d’inscription et le suivi des frais scolaires.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Inscrire un élève
        </button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Users className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {activeStudents}
          </p>
          <p className="mt-2 font-bold text-slate-700">Élèves actifs</p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <UserCheck className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {registeredCount}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Inscriptions confirmées
          </p>
        </article>

        <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <GraduationCap className="text-amber-700" size={25} />
          <p className="mt-6 text-2xl font-black text-amber-950">
            {formatAmount(totalExpectedFees)}
          </p>
          <p className="mt-2 font-bold text-amber-800">Frais attendus</p>
        </article>

        <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <CheckCircle2 className="text-cyan-700" size={25} />
          <p className="mt-6 text-2xl font-black text-cyan-900">
            {formatAmount(totalPaidFees)}
          </p>
          <p className="mt-2 font-bold text-cyan-800">Frais enregistrés</p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un élève, parent ou numéro..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 lg:col-span-2"
          />

          <select
            value={schoolYearFilter}
            onChange={(event) => {
              setSchoolYearFilter(event.target.value);
              setClassFilter("all");
            }}
            className={inputClassName}
          >
            <option value="all">Toutes les années scolaires</option>

            {schoolYears.map((schoolYear) => (
              <option key={schoolYear.id} value={schoolYear.id}>
                {schoolYear.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all">Tous les statuts</option>

            {Object.entries(enrollmentStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(event) => setClassFilter(event.target.value)}
            className={inputClassName}
          >
            <option value="all">Toutes les classes</option>

            {filterClasses.map((schoolClass) => (
              <option key={schoolClass.id} value={schoolClass.id}>
                {schoolClass.name}
              </option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="p-10 text-center text-red-700">{loadError}</div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucun élève trouvé
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Inscrivez un élève ou adaptez les filtres.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEnrollments.map((enrollment) => {
              const student = enrollment.student;

              if (!student) return null;

              return (
                <article
                  key={enrollment.id}
                  className="grid gap-5 px-6 py-5 transition hover:bg-blue-50/60 xl:grid-cols-[minmax(0,1fr)_minmax(230px,0.8fr)_auto] xl:items-center"
                >
                  <div className="flex items-center gap-4">
<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 font-black text-[#0a3d82]">
  {student.photo_url ? (
    <img
      src={student.photo_url}
      alt={`${student.first_name} ${student.last_name}`}
      className="h-full w-full object-cover"
    />
  ) : (
    <>
      {student.first_name.charAt(0)}
      {student.last_name.charAt(0)}
    </>
  )}
</div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-black text-[#092e63]">
                          {student.first_name} {student.last_name}
                        </p>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                            enrollmentStatusStyles[enrollment.status]
                          }`}
                        >
                          {enrollmentStatusLabels[enrollment.status]}
                        </span>

                        {!student.is_active && (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold text-red-700">
                            Désactivé
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {student.student_number || "Numéro non attribué"}
                        {student.parent_name
                          ? ` • Parent : ${student.parent_name}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm xl:text-right">
                    <p className="font-bold text-slate-700">
                      {enrollment.school_class?.name || "Classe non attribuée"}
                    </p>

                    <p className="mt-1 text-slate-500">
                      {enrollment.school_year?.name || "Année non définie"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Frais : {formatAmount(enrollment.fee_paid)} /{" "}
                      {formatAmount(enrollment.fee_amount)}
                    </p>
                  </div>

                  <div
  className={`grid gap-2 ${
    enrollment.status === "inscrit"
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-3"
  }`}
>
                    {enrollment.status === "inscrit" && (
  <button
    type="button"
    onClick={() => printStudentCard(enrollment)}
    className="inline-flex items-center justify-center gap-1 rounded-xl border border-violet-200 px-2 py-2.5 text-xs font-extrabold text-violet-800 hover:bg-violet-50"
  >
    <Printer size={15} />
    Carte
  </button>
)}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setMode("view");
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 px-2 py-2.5 text-xs font-extrabold text-[#0a3d82] hover:bg-blue-50"
                    >
                      <Eye size={15} />
                      Voir
                    </button>

                    <button
                      type="button"
                      onClick={() => openEdit(enrollment)}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-amber-200 px-2 py-2.5 text-xs font-extrabold text-amber-800 hover:bg-amber-50"
                    >
                      <Pencil size={15} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => toggleStudentStatus(enrollment)}
                      className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-extrabold disabled:opacity-60 ${
                        student.is_active
                          ? "border border-red-200 text-red-700 hover:bg-red-50"
                          : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      <Ban size={15} />
                      {student.is_active ? "Désactiver" : "Réactiver"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {mode === "view" && selectedEnrollment?.student && (
        <div className="fixed inset-0 z-[160] grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Fiche élève
                </p>
                <h2 className="mt-2 text-xl font-black text-[#092e63]">
                  {selectedEnrollment.student.first_name}{" "}
                  {selectedEnrollment.student.last_name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase text-[#1680c4]">
                  Inscription
                </p>
                <p className="mt-2 font-black text-[#092e63]">
                  {enrollmentStatusLabels[selectedEnrollment.status]}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedEnrollment.school_class?.name ||
                    "Classe non attribuée"}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <p className="text-xs font-bold uppercase text-[#1680c4]">
                  Frais scolaires
                </p>
                <p className="mt-2 font-black text-[#092e63]">
                  {formatAmount(selectedEnrollment.fee_paid)} /{" "}
                  {formatAmount(selectedEnrollment.fee_amount)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Parent / tuteur
                </p>
                <p className="mt-2 font-bold text-slate-700">
                  {selectedEnrollment.student.parent_name ||
                    "Non renseigné"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedEnrollment.student.parent_phone ||
                    "Téléphone non renseigné"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Contact d’urgence
                </p>
                <p className="mt-2 font-bold text-slate-700">
                  {selectedEnrollment.student.emergency_contact_name ||
                    "Non renseigné"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedEnrollment.student.emergency_contact_phone ||
                    "Téléphone non renseigné"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">
                  Informations complémentaires
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Né(e) : {formatDate(selectedEnrollment.student.birth_date)}
                  <br />
                  Adresse : {selectedEnrollment.student.address || "Non renseignée"}
                  <br />
                  Commune / Ville :{" "}
                  {[selectedEnrollment.student.commune, selectedEnrollment.student.city]
                    .filter(Boolean)
                    .join(", ") || "Non renseignée"}
                </p>
              </div>
              {selectedEnrollment.status === "inscrit" && (
  <div className="flex justify-end border-t border-slate-100 px-6 py-5">
    <button
      type="button"
      onClick={() => printStudentCard(selectedEnrollment)}
      className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#072d61]"
    >
      <Printer size={17} />
      Imprimer la carte élève
    </button>
  </div>
)}
            </div>
          </div>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="fixed inset-0 z-[160] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto my-6 w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  École chrétienne
                </p>
                <h2 className="mt-2 text-xl font-black text-[#092e63]">
                  {mode === "edit"
                    ? "Modifier le dossier élève"
                    : "Inscrire un élève"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStudent} className="p-6">
              {formError && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {formMessage && (
                <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {formMessage}
                </div>
              )}

<div className="mb-6">
  {mode === "edit" && selectedEnrollment?.student?.photo_url && (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
      <img
        src={selectedEnrollment.student.photo_url}
        alt={`${selectedEnrollment.student.first_name} ${selectedEnrollment.student.last_name}`}
        className="h-16 w-16 rounded-xl object-cover"
      />

      <p className="text-sm font-bold text-[#092e63]">
        Photo actuelle de l’élève
      </p>
    </div>
  )}

  <PhotoPicker
    label="Photo de l’élève"
    file={photoFile}
    onChange={setPhotoFile}
    onError={setFormError}
  />
</div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Année scolaire *
                  </span>

                  <select
                    value={form.schoolYearId}
                    onChange={(event) => updateSchoolYear(event.target.value)}
                    className={inputClassName}
                    required
                  >
                    <option value="">Sélectionnez une année scolaire</option>

                    {schoolYears.map((schoolYear) => (
                      <option key={schoolYear.id} value={schoolYear.id}>
                        {schoolYear.name}
                        {schoolYear.assembly?.name
                          ? ` — ${schoolYear.assembly.name}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Classe
                  </span>

                  <select
                    value={form.classId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        classId: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="">Classe à attribuer plus tard</option>

                    {availableClasses.map((schoolClass) => (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Statut d’inscription
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target
                          .value as SchoolEnrollment["status"],
                      }))
                    }
                    className={inputClassName}
                  >
                    {Object.entries(enrollmentStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date d’inscription
                  </span>

                  <input
                    type="date"
                    value={form.enrollmentDate}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        enrollmentDate: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Prénom *
                  </span>

                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
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
                      setForm((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
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
                      setForm((current) => ({
                        ...current,
                        gender: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  >
                    <option value="">Non renseigné</option>
                    <option value="Garçon">Garçon</option>
                    <option value="Fille">Fille</option>
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
                      setForm((current) => ({
                        ...current,
                        birthDate: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone de l’élève
                  </span>

                  <input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    E-mail de l’élève
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
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
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
  <span className="mb-2 block text-sm font-bold text-slate-700">
    Pays
  </span>

<CountrySelect
value={form.country}
onChange={(value) =>
setForm((current) => ({
...current,
country: value,
}))
}
className={inputClassName}
/> </label>

<label className="block">
  <span className="mb-2 block text-sm font-bold text-slate-700">
    Ville
  </span>

<input
value={form.city}
onChange={(event) =>
setForm((current) => ({
...current,
city: event.target.value,
commune: "",
}))
}
placeholder="Ex. Kinshasa"
className={inputClassName}
/> </label>

<label className="block md:col-span-2">
  <span className="mb-2 block text-sm font-bold text-slate-700">
    Commune / Quartier
  </span>

<CommuneField
city={form.city}
value={form.commune}
onChange={(value) =>
setForm((current) => ({
...current,
commune: value,
}))
}
className={inputClassName}
placeholder="Ex. Lemba"
/> </label>


                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Parent / tuteur
                  </span>

                  <input
                    value={form.parentName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        parentName: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone du parent
                  </span>

                  <input
                    value={form.parentPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        parentPhone: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    E-mail du parent
                  </span>

                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        parentEmail: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Contact d’urgence
                  </span>

                  <input
                    value={form.emergencyContactName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        emergencyContactName: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone d’urgence
                  </span>

                  <input
                    value={form.emergencyContactPhone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        emergencyContactPhone: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Frais annuels prévus
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.feeAmount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        feeAmount: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Frais déjà payés
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.feePaid}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        feePaid: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Observation sur l’inscription
                  </span>

                  <textarea
                    value={form.observation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        observation: event.target.value,
                      }))
                    }
                    className={`${inputClassName} min-h-20 resize-y`}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Notes administratives
                  </span>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        notes: event.target.value,
                      }))
                    }
                    className={`${inputClassName} min-h-20 resize-y`}
                  />
                </label>
              </div>

              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
                >
                  {loading && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {mode === "edit"
                    ? "Enregistrer les modifications"
                    : "Inscrire l’élève"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}