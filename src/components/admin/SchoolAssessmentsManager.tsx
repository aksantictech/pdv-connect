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
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LoaderCircle,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import type {
  SchoolAssembly,
  SchoolAssessment,
  SchoolAssessmentGradeRow,
  SchoolClassOption,
  SchoolSubject,
  SchoolYear,
} from "../../types/school";

type SchoolAssessmentsManagerProps = {
  assemblies: SchoolAssembly[];
  schoolYears: SchoolYear[];
  schoolClasses: SchoolClassOption[];
  subjects: SchoolSubject[];
  assessments: SchoolAssessment[];
  loadError: string | null;
};

type SubjectForm = {
  assemblyId: string;
  name: string;
  code: string;
  coefficient: string;
};

type AssessmentForm = {
  classId: string;
  subjectId: string;
  title: string;
  evaluationPeriod: string;
  assessmentDate: string;
  maxScore: string;
  weight: string;
  note: string;
};

type GradeDraft = {
  studentId: string;
  studentNumber: string | null;
  fullName: string;
  score: string;
  comment: string;
};

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[190] grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="my-auto w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function makeSubjectForm(assemblies: SchoolAssembly[]): SubjectForm {
  return {
    assemblyId: assemblies[0]?.id ?? "",
    name: "",
    code: "",
    coefficient: "1",
  };
}

function makeAssessmentForm(
  schoolClasses: SchoolClassOption[]
): AssessmentForm {
  return {
    classId: schoolClasses[0]?.id ?? "",
    subjectId: "",
    title: "",
    evaluationPeriod: "Trimestre 1",
    assessmentDate: today(),
    maxScore: "20",
    weight: "1",
    note: "",
  };
}

export default function SchoolAssessmentsManager({
  assemblies,
  schoolYears,
  schoolClasses,
  subjects,
  assessments,
  loadError,
}: SchoolAssessmentsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [gradesModalOpen, setGradesModalOpen] = useState(false);

  const [selectedAssessment, setSelectedAssessment] =
    useState<SchoolAssessment | null>(null);

  const [subjectForm, setSubjectForm] = useState<SubjectForm>(() =>
    makeSubjectForm(assemblies)
  );

  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(() =>
    makeAssessmentForm(schoolClasses)
  );

  const [gradeDrafts, setGradeDrafts] = useState<GradeDraft[]>([]);

  const [yearFilter, setYearFilter] = useState(
    schoolYears.find((schoolYear) => schoolYear.is_current)?.id ?? "all"
  );

  const [classFilter, setClassFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const [subjectError, setSubjectError] = useState("");
  const [assessmentError, setAssessmentError] = useState("");
  const [gradesError, setGradesError] = useState("");

  const [subjectMessage, setSubjectMessage] = useState("");
  const [assessmentMessage, setAssessmentMessage] = useState("");
  const [gradesMessage, setGradesMessage] = useState("");

  const [savingSubject, setSavingSubject] = useState(false);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [savingGrades, setSavingGrades] = useState(false);

  const selectedClass = useMemo(
    () =>
      schoolClasses.find(
        (schoolClass) => schoolClass.id === assessmentForm.classId
      ) ?? null,
    [assessmentForm.classId, schoolClasses]
  );

  const selectedClassSchoolYear = useMemo(
    () =>
      schoolYears.find(
        (schoolYear) => schoolYear.id === selectedClass?.school_year_id
      ) ?? null,
    [selectedClass, schoolYears]
  );

  const availableSubjects = useMemo(() => {
    if (!selectedClassSchoolYear) {
      return [];
    }

    return subjects.filter(
      (subject) =>
        subject.is_active &&
        subject.assembly_id === selectedClassSchoolYear.assembly_id
    );
  }, [subjects, selectedClassSchoolYear]);

  const filterClasses = useMemo(() => {
    if (yearFilter === "all") {
      return schoolClasses;
    }

    return schoolClasses.filter(
      (schoolClass) => schoolClass.school_year_id === yearFilter
    );
  }, [schoolClasses, yearFilter]);

  const periods = useMemo(
    () =>
      Array.from(
        new Set(
          assessments
            .map((assessment) => assessment.evaluation_period)
            .filter(Boolean)
        )
      ),
    [assessments]
  );

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesYear =
        yearFilter === "all" || assessment.school_year_id === yearFilter;

      const matchesClass =
        classFilter === "all" || assessment.class_id === classFilter;

      const matchesPeriod =
        periodFilter === "all" ||
        assessment.evaluation_period === periodFilter;

      return matchesYear && matchesClass && matchesPeriod;
    });
  }, [assessments, yearFilter, classFilter, periodFilter]);

  const activeSubjects = subjects.filter((subject) => subject.is_active).length;

  const activeSchoolYear =
    schoolYears.find((schoolYear) => schoolYear.is_current) ?? null;

  const gradesEntered = gradeDrafts.filter(
    (grade) => grade.score.trim() !== ""
  );

  const gradeAverage =
    gradesEntered.length > 0
      ? gradesEntered.reduce(
          (total, grade) =>
            total + Number(grade.score.replace(",", ".")),
          0
        ) / gradesEntered.length
      : 0;

  function closeSubjectModal() {
    setSubjectModalOpen(false);
    setSubjectForm(makeSubjectForm(assemblies));
    setSubjectError("");
    setSubjectMessage("");
  }

  function closeAssessmentModal() {
    setAssessmentModalOpen(false);
    setAssessmentForm(makeAssessmentForm(schoolClasses));
    setAssessmentError("");
    setAssessmentMessage("");
  }

  function closeGradesModal() {
    setGradesModalOpen(false);
    setSelectedAssessment(null);
    setGradeDrafts([]);
    setGradesError("");
    setGradesMessage("");
    setLoadingGrades(false);
  }

  function openSubjectModal() {
    setSubjectForm(makeSubjectForm(assemblies));
    setSubjectError("");
    setSubjectMessage("");
    setSubjectModalOpen(true);
  }

  function openAssessmentModal() {
    if (schoolClasses.length === 0) {
      window.alert(
        "Créez d’abord une année scolaire et une classe avant de programmer une évaluation."
      );
      return;
    }

    if (subjects.length === 0) {
      window.alert(
        "Ajoutez d’abord au moins une matière avant de programmer une évaluation."
      );
      return;
    }

    setAssessmentForm(makeAssessmentForm(schoolClasses));
    setAssessmentError("");
    setAssessmentMessage("");
    setAssessmentModalOpen(true);
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubjectError("");
    setSubjectMessage("");

    if (!subjectForm.assemblyId) {
      setSubjectError("Veuillez sélectionner une assemblée.");
      return;
    }

    if (!subjectForm.name.trim()) {
      setSubjectError("Le nom de la matière est obligatoire.");
      return;
    }

    const coefficient = Number(subjectForm.coefficient);

    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      setSubjectError("Le coefficient doit être supérieur à zéro.");
      return;
    }

    setSavingSubject(true);

    try {
      const { error } = await supabase.rpc("create_school_subject", {
        p_assembly_id: subjectForm.assemblyId,
        p_name: subjectForm.name.trim(),
        p_code: subjectForm.code.trim() || null,
        p_coefficient: coefficient,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSubjectMessage("La matière a été créée avec succès.");
      router.refresh();

      window.setTimeout(() => {
        closeSubjectModal();
      }, 800);
    } catch (error) {
      setSubjectError(
        error instanceof Error
          ? error.message
          : "Impossible de créer cette matière."
      );
    } finally {
      setSavingSubject(false);
    }
  }

  async function createAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setAssessmentError("");
    setAssessmentMessage("");

    if (!assessmentForm.classId) {
      setAssessmentError("Veuillez sélectionner une classe.");
      return;
    }

    if (!assessmentForm.subjectId) {
      setAssessmentError("Veuillez sélectionner une matière.");
      return;
    }

    if (!assessmentForm.title.trim()) {
      setAssessmentError("Le titre de l’évaluation est obligatoire.");
      return;
    }

    const maxScore = Number(assessmentForm.maxScore);
    const weight = Number(assessmentForm.weight);

    if (!Number.isFinite(maxScore) || maxScore <= 0) {
      setAssessmentError("La note maximale doit être supérieure à zéro.");
      return;
    }

    if (!Number.isFinite(weight) || weight <= 0) {
      setAssessmentError("Le poids doit être supérieur à zéro.");
      return;
    }

    setSavingAssessment(true);

    try {
      const { error } = await supabase.rpc("create_school_assessment", {
        p_class_id: assessmentForm.classId,
        p_subject_id: assessmentForm.subjectId,
        p_title: assessmentForm.title.trim(),
        p_evaluation_period:
          assessmentForm.evaluationPeriod.trim() || "Trimestre 1",
        p_assessment_date: assessmentForm.assessmentDate,
        p_max_score: maxScore,
        p_weight: weight,
        p_note: assessmentForm.note.trim() || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      setAssessmentMessage("L’évaluation a été créée avec succès.");
      router.refresh();

      window.setTimeout(() => {
        closeAssessmentModal();
      }, 850);
    } catch (error) {
      setAssessmentError(
        error instanceof Error
          ? error.message
          : "Impossible de créer cette évaluation."
      );
    } finally {
      setSavingAssessment(false);
    }
  }

  async function loadGrades(assessmentId: string) {
    const { data, error } = await supabase.rpc(
      "get_school_assessment_grades",
      {
        p_assessment_id: assessmentId,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    const rows =
      (data as unknown as SchoolAssessmentGradeRow[] | null) ?? [];

    setGradeDrafts(
      rows.map((row) => ({
        studentId: row.student_id,
        studentNumber: row.student_number,
        fullName: `${row.first_name} ${row.last_name}`.trim(),
        score: row.score === null ? "" : String(row.score),
        comment: row.comment ?? "",
      }))
    );
  }

  async function openGrades(assessment: SchoolAssessment) {
    setSelectedAssessment(assessment);
    setGradeDrafts([]);
    setGradesError("");
    setGradesMessage("");
    setGradesModalOpen(true);
    setLoadingGrades(true);

    try {
      await loadGrades(assessment.id);
    } catch (error) {
      setGradesError(
        error instanceof Error
          ? error.message
          : "Impossible de charger la feuille de notes."
      );
    } finally {
      setLoadingGrades(false);
    }
  }

  function updateGrade(
    studentId: string,
    field: "score" | "comment",
    value: string
  ) {
    setGradeDrafts((current) =>
      current.map((grade) =>
        grade.studentId === studentId
          ? {
              ...grade,
              [field]: value,
            }
          : grade
      )
    );
  }

  async function saveGrades() {
    if (!selectedAssessment) {
      return;
    }

    setGradesError("");
    setGradesMessage("");

    const maxScore = Number(selectedAssessment.max_score);

    for (const grade of gradeDrafts) {
      if (!grade.score.trim()) {
        continue;
      }

      const score = Number(grade.score.replace(",", "."));

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > maxScore
      ) {
        setGradesError(
          `La note de ${grade.fullName} doit être comprise entre 0 et ${formatNumber(
            maxScore
          )}.`
        );
        return;
      }
    }

    setSavingGrades(true);

    try {
      const { error } = await supabase.rpc(
        "save_school_assessment_grades",
        {
          p_assessment_id: selectedAssessment.id,
          p_grades: gradeDrafts.map((grade) => ({
            student_id: grade.studentId,
            score: grade.score.trim()
              ? Number(grade.score.replace(",", "."))
              : null,
            comment: grade.comment.trim() || null,
          })),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setGradesMessage("Les notes ont été enregistrées avec succès.");
      router.refresh();
    } catch (error) {
      setGradesError(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer les notes."
      );
    } finally {
      setSavingGrades(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            École chrétienne
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Matières et évaluations
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Créez les matières, programmez les évaluations et saisissez les
            résultats académiques de chaque élève.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openSubjectModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 font-extrabold text-violet-800 transition hover:bg-violet-100"
          >
            <BookOpen size={18} />
            Ajouter une matière
          </button>

          <button
            type="button"
            onClick={openAssessmentModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
          >
            <Plus size={18} />
            Nouvelle évaluation
          </button>
        </div>
      </section>

      {loadError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {loadError}
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <BookOpen className="text-[#0a56a4]" size={25} />
              <p className="mt-6 text-3xl font-black text-[#092e63]">
                {activeSubjects}
              </p>
              <p className="mt-2 font-bold text-slate-700">
                Matières actives
              </p>
            </article>

            <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <ClipboardCheck className="text-emerald-700" size={25} />
              <p className="mt-6 text-3xl font-black text-emerald-900">
                {filteredAssessments.length}
              </p>
              <p className="mt-2 font-bold text-emerald-800">
                Évaluations affichées
              </p>
            </article>

            <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
              <GraduationCap className="text-cyan-700" size={25} />
              <p className="mt-6 text-2xl font-black text-cyan-900">
                {activeSchoolYear?.name || "Non définie"}
              </p>
              <p className="mt-2 font-bold text-cyan-800">
                Année scolaire active
              </p>
            </article>

            <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
              <Calculator className="text-amber-700" size={25} />
              <p className="mt-6 text-3xl font-black text-amber-950">
                {schoolClasses.length}
              </p>
              <p className="mt-2 font-bold text-amber-800">
                Classes disponibles
              </p>
            </article>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-black text-[#092e63]">
                    Matières enregistrées
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Catalogue des cours et coefficients.
                  </p>
                </div>

                <BookOpen size={22} className="text-[#0a56a4]" />
              </div>

              <div className="mt-6 space-y-3">
                {subjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-blue-200 p-8 text-center">
                    <BookOpen className="mx-auto text-blue-200" size={36} />
                    <p className="mt-4 font-black text-[#092e63]">
                      Aucune matière enregistrée
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Créez les matières avant de programmer les évaluations.
                    </p>
                  </div>
                ) : (
                  subjects.map((subject) => {
                    const assembly = assemblies.find(
                      (item) => item.id === subject.assembly_id
                    );

                    return (
                      <article
                        key={subject.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-black text-[#092e63]">
                              {subject.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {assembly?.name || "Assemblée non définie"}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                              subject.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            Coeff. {formatNumber(subject.coefficient)}
                          </span>
                        </div>

                        {subject.code && (
                          <p className="mt-3 text-xs font-bold text-[#1680c4]">
                            Code : {subject.code}
                          </p>
                        )}
                      </article>
                    );
                  })
                )}
              </div>
            </article>

            <article className="rounded-3xl border border-blue-100 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="font-black text-[#092e63]">
                      Évaluations programmées
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Sélectionnez une évaluation pour saisir les notes.
                    </p>
                  </div>

                  <FileText size={22} className="text-[#0a56a4]" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <select
                    value={yearFilter}
                    onChange={(event) => {
                      setYearFilter(event.target.value);
                      setClassFilter("all");
                    }}
                    className={inputClassName}
                  >
                    <option value="all">Toutes les années</option>

                    {schoolYears.map((schoolYear) => (
                      <option key={schoolYear.id} value={schoolYear.id}>
                        {schoolYear.name}
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

                  <select
                    value={periodFilter}
                    onChange={(event) => setPeriodFilter(event.target.value)}
                    className={inputClassName}
                  >
                    <option value="all">Toutes les périodes</option>

                    {periods.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredAssessments.length === 0 ? (
                <div className="p-12 text-center">
                  <ClipboardCheck
                    className="mx-auto text-blue-200"
                    size={42}
                  />
                  <p className="mt-4 font-black text-[#092e63]">
                    Aucune évaluation trouvée
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Programmez une première évaluation pour commencer la saisie
                    des notes.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredAssessments.map((assessment) => (
                    <article
                      key={assessment.id}
                      className="grid gap-5 px-6 py-5 transition hover:bg-blue-50/60 xl:grid-cols-[minmax(0,1fr)_minmax(250px,0.75fr)_auto] xl:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                          <FileText size={23} />
                        </div>

                        <div>
                          <p className="font-black text-[#092e63]">
                            {assessment.title}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {assessment.subject?.name || "Matière non définie"}{" "}
                            • {assessment.evaluation_period}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(assessment.assessment_date)}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm xl:text-right">
                        <p className="font-bold text-slate-700">
                          {assessment.school_class?.name ||
                            "Classe non définie"}
                        </p>

                        <p className="mt-1 text-slate-500">
                          Barème : {formatNumber(assessment.max_score)} • Poids{" "}
                          {formatNumber(assessment.weight)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openGrades(assessment)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                      >
                        <ClipboardCheck size={17} />
                        Saisir les notes
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}

      {subjectModalOpen && (
        <Modal onClose={closeSubjectModal}>
          <div className="flex items-start justify-between border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                Catalogue scolaire
              </p>
              <h2 className="mt-2 text-xl font-black text-[#092e63]">
                Ajouter une matière
              </h2>
            </div>

            <button
              type="button"
              onClick={closeSubjectModal}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={createSubject} className="p-6">
            {subjectError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {subjectError}
              </div>
            )}

            {subjectMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                {subjectMessage}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Assemblée *
                </span>

                <select
                  value={subjectForm.assemblyId}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      assemblyId: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                >
                  <option value="">Sélectionnez une assemblée</option>

                  {assemblies.map((assembly) => (
                    <option key={assembly.id} value={assembly.id}>
                      {assembly.name}
                      {assembly.city ? ` — ${assembly.city}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Matière *
                </span>

                <input
                  value={subjectForm.name}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ex. Mathématiques"
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Code
                </span>

                <input
                  value={subjectForm.code}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="Ex. MATH"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Coefficient *
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={subjectForm.coefficient}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      coefficient: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeSubjectModal}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={savingSubject}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
              >
                {savingSubject && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                Créer la matière
              </button>
            </div>
          </form>
        </Modal>
      )}

      {assessmentModalOpen && (
        <Modal onClose={closeAssessmentModal}>
          <div className="flex items-start justify-between border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                Évaluation académique
              </p>
              <h2 className="mt-2 text-xl font-black text-[#092e63]">
                Nouvelle évaluation
              </h2>
            </div>

            <button
              type="button"
              onClick={closeAssessmentModal}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={createAssessment} className="p-6">
            {assessmentError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {assessmentError}
              </div>
            )}

            {assessmentMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                {assessmentMessage}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Classe *
                </span>

                <select
                  value={assessmentForm.classId}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      classId: event.target.value,
                      subjectId: "",
                    }))
                  }
                  className={inputClassName}
                  required
                >
                  <option value="">Sélectionnez une classe</option>

                  {schoolClasses.map((schoolClass) => {
                    const schoolYear = schoolYears.find(
                      (item) => item.id === schoolClass.school_year_id
                    );

                    return (
                      <option key={schoolClass.id} value={schoolClass.id}>
                        {schoolClass.name}
                        {schoolYear?.name ? ` — ${schoolYear.name}` : ""}
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Matière *
                </span>

                <select
                  value={assessmentForm.subjectId}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      subjectId: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                >
                  <option value="">Sélectionnez une matière</option>

                  {availableSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                      {subject.code ? ` — ${subject.code}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Titre de l’évaluation *
                </span>

                <input
                  value={assessmentForm.title}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ex. Interrogation n°1"
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Période
                </span>

                <input
                  value={assessmentForm.evaluationPeriod}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      evaluationPeriod: event.target.value,
                    }))
                  }
                  placeholder="Ex. Trimestre 1"
                  className={inputClassName}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Date *
                </span>

                <input
                  type="date"
                  value={assessmentForm.assessmentDate}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      assessmentDate: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Barème maximal *
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={assessmentForm.maxScore}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      maxScore: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Poids
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={assessmentForm.weight}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      weight: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Note facultative
                </span>

                <textarea
                  value={assessmentForm.note}
                  onChange={(event) =>
                    setAssessmentForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  className={`${inputClassName} min-h-24 resize-y`}
                  placeholder="Ex. Contrôle portant sur les chapitres 1 à 3."
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeAssessmentModal}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={savingAssessment}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
              >
                {savingAssessment && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                Créer l’évaluation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {gradesModalOpen && selectedAssessment && (
        <Modal onClose={closeGradesModal}>
          <div className="flex items-start justify-between border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                Saisie des notes
              </p>

              <h2 className="mt-2 text-xl font-black text-[#092e63]">
                {selectedAssessment.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {selectedAssessment.subject?.name || "Matière non définie"} •{" "}
                Barème : {formatNumber(selectedAssessment.max_score)}
              </p>
            </div>

            <button
              type="button"
              onClick={closeGradesModal}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {gradesError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {gradesError}
              </div>
            )}

            {gradesMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                {gradesMessage}
              </div>
            )}

            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase text-[#1680c4]">
                  Élèves
                </p>
                <p className="mt-2 text-2xl font-black text-[#092e63]">
                  {gradeDrafts.length}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase text-emerald-700">
                  Notes saisies
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-900">
                  {gradesEntered.length}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase text-amber-700">
                  Moyenne de classe
                </p>
                <p className="mt-2 text-2xl font-black text-amber-950">
                  {formatNumber(gradeAverage)} /{" "}
                  {formatNumber(selectedAssessment.max_score)}
                </p>
              </div>
            </div>

            {loadingGrades ? (
              <div className="rounded-2xl border border-dashed border-blue-200 p-10 text-center">
                <LoaderCircle
                  className="mx-auto animate-spin text-[#0a56a4]"
                  size={36}
                />
                <p className="mt-4 font-black text-[#092e63]">
                  Chargement des élèves inscrits…
                </p>
              </div>
            ) : gradeDrafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-200 p-10 text-center">
                <Users className="mx-auto text-blue-200" size={36} />
                <p className="mt-4 font-black text-[#092e63]">
                  Aucun élève inscrit trouvé
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Vérifie que les élèves sont inscrits dans cette classe.
                </p>
              </div>
            ) : (
              <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-100">
                <div className="divide-y divide-slate-100">
                  {gradeDrafts.map((grade) => (
                    <div
                      key={grade.studentId}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_140px_220px] md:items-center"
                    >
                      <div>
                        <p className="font-black text-[#092e63]">
                          {grade.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {grade.studentNumber || "Matricule non attribué"}
                        </p>
                      </div>

                      <input
                        type="number"
                        min="0"
                        max={String(selectedAssessment.max_score)}
                        step="0.01"
                        value={grade.score}
                        onChange={(event) =>
                          updateGrade(
                            grade.studentId,
                            "score",
                            event.target.value
                          )
                        }
                        placeholder={`0 à ${formatNumber(
                          selectedAssessment.max_score
                        )}`}
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                      />

                      <input
                        value={grade.comment}
                        onChange={(event) =>
                          updateGrade(
                            grade.studentId,
                            "comment",
                            event.target.value
                          )
                        }
                        placeholder="Commentaire facultatif"
                        className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeGradesModal}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={saveGrades}
                disabled={
                  loadingGrades ||
                  savingGrades ||
                  gradeDrafts.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
              >
                {savingGrades ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Enregistrer les notes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}