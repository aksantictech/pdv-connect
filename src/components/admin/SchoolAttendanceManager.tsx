"use client";

import {
useEffect,
useMemo,
useState,
type FormEvent,
type ReactNode,
} from "react";


import { useRouter } from "next/navigation";
import {
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  LoaderCircle,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import type {
  AttendanceStatus,
  SchoolAttendanceRecord,
  SchoolAttendanceSession,
  SchoolClassOption,
  SchoolYear,
} from "../../types/school";
import {
  attendanceStatusLabels,
  attendanceStatusStyles,
} from "../../types/school";

type SchoolAttendanceManagerProps = {
  schoolYears: SchoolYear[];
  schoolClasses: SchoolClassOption[];
  sessions: SchoolAttendanceSession[];
  records: SchoolAttendanceRecord[];
  loadError: string | null;
};

type SessionForm = {
  schoolYearId: string;
  classId: string;
  attendanceDate: string;
  sessionLabel: string;
  note: string;
};

type AttendanceDraft = {
  studentId: string;
  studentNumber: string | null;
  fullName: string;
  status: AttendanceStatus;
  note: string;
};

type AttendanceSessionRecordRpc = {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  note: string | null;
  marked_at: string | null;
  student_number: string | null;
  first_name: string;
  last_name: string;
  is_active: boolean;
};

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

const attendanceStatuses: AttendanceStatus[] = [
  "present",
  "absent",
  "retard",
  "justifie",
  "non_renseigne",
];

function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[180] grid place-items-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
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

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function createDefaultSessionForm(schoolYears: SchoolYear[]): SessionForm {
  const currentYear =
    schoolYears.find((schoolYear) => schoolYear.is_current) ??
    schoolYears[0] ??
    null;

  return {
    schoolYearId: currentYear?.id ?? "",
    classId: "",
    attendanceDate: today(),
    sessionLabel: "Journée",
    note: "",
  };
}

export default function SchoolAttendanceManager({
  schoolYears,
  schoolClasses,
  sessions,
  records,
  loadError,
}: SchoolAttendanceManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const [sessionForm, setSessionForm] = useState<SessionForm>(() =>
    createDefaultSessionForm(schoolYears)
  );

  const [attendanceDrafts, setAttendanceDrafts] = useState<
    AttendanceDraft[]
  >([]);

  const [schoolYearFilter, setSchoolYearFilter] = useState(
    schoolYears.find((schoolYear) => schoolYear.is_current)?.id ?? "all"
  );

  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [openingSession, setOpeningSession] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [loadingSessionRecords, setLoadingSessionRecords] = useState(false);

const [selectedSessionPreview, setSelectedSessionPreview] =
  useState<SchoolAttendanceSession | null>(null);

  const [sessionError, setSessionError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const openingClasses = useMemo(
    () =>
      schoolClasses.filter(
        (schoolClass) => schoolClass.school_year_id === sessionForm.schoolYearId
      ),
    [schoolClasses, sessionForm.schoolYearId]
  );

  const filterClasses = useMemo(() => {
    if (schoolYearFilter === "all") {
      return schoolClasses;
    }

    return schoolClasses.filter(
      (schoolClass) => schoolClass.school_year_id === schoolYearFilter
    );
  }, [schoolClasses, schoolYearFilter]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesYear =
        schoolYearFilter === "all" ||
        session.school_year_id === schoolYearFilter;

      const matchesClass =
        classFilter === "all" || session.class_id === classFilter;

      const matchesDate =
        !dateFilter || session.attendance_date === dateFilter;

      return matchesYear && matchesClass && matchesDate;
    });
  }, [sessions, schoolYearFilter, classFilter, dateFilter]);

const selectedSession = useMemo(() => {
  const serverSession =
    sessions.find((session) => session.id === selectedSessionId) ?? null;

  return serverSession ?? selectedSessionPreview;
}, [sessions, selectedSessionId, selectedSessionPreview]);



  const filteredSessionIds = useMemo(
    () => new Set(filteredSessions.map((session) => session.id)),
    [filteredSessions]
  );

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => filteredSessionIds.has(record.session_id)),
    [records, filteredSessionIds]
  );

  const recordedCount = filteredRecords.filter(
    (record) => record.status !== "non_renseigne"
  ).length;

  const attendanceCount = filteredRecords.filter((record) =>
    ["present", "retard", "justifie"].includes(record.status)
  ).length;

  const attendanceRate =
    recordedCount > 0
      ? Math.round((attendanceCount / recordedCount) * 100)
      : 0;

async function loadAttendanceDrafts(sessionId: string) {
  const { data, error } = await supabase.rpc(
    "get_school_attendance_session_records",
    {
      p_session_id: sessionId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  const rows =
    (data as unknown as AttendanceSessionRecordRpc[] | null) ?? [];

  setAttendanceDrafts(
    rows.map((row) => ({
      studentId: row.student_id,
      studentNumber: row.student_number,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      status: row.status,
      note: row.note ?? "",
    }))
  );
}

function makeSessionPreview(sessionId: string): SchoolAttendanceSession {
  return {
    id: sessionId,
    school_year_id: sessionForm.schoolYearId,
    class_id: sessionForm.classId,
    attendance_date: sessionForm.attendanceDate,
    session_label: sessionForm.sessionLabel.trim() || "Journée",
    note: sessionForm.note.trim() || null,
    created_at: new Date().toISOString(),
    school_year:
      schoolYears.find(
        (schoolYear) => schoolYear.id === sessionForm.schoolYearId
      ) ?? null,
    school_class:
      schoolClasses.find(
        (schoolClass) => schoolClass.id === sessionForm.classId
      ) ?? null,
  };
}

  function closeNewSession() {
    setNewSessionOpen(false);
    setSessionForm(createDefaultSessionForm(schoolYears));
    setSessionError("");
  }

  function closeAttendance() {
    setAttendanceOpen(false);
    setSelectedSessionId(null);
    setSelectedSessionPreview(null);
    setAttendanceDrafts([]);
    setLoadingSessionRecords(false);
    setAttendanceError("");
    setAttendanceMessage("");

  }

  function openNewSession() {
    if (schoolYears.length === 0) {
      window.alert(
        "Créez d’abord une année scolaire et une classe avant de prendre les présences."
      );
      return;
    }

    if (schoolClasses.length === 0) {
      window.alert(
        "Créez d’abord au moins une classe avant de prendre les présences."
      );
      return;
    }

    setSessionForm(createDefaultSessionForm(schoolYears));
    setSessionError("");
    setNewSessionOpen(true);
  }

async function openAttendance(session: SchoolAttendanceSession) {
  setSelectedSessionId(session.id);
  setSelectedSessionPreview(session);
  setAttendanceDrafts([]);
  setAttendanceError("");
  setAttendanceMessage("");
  setAttendanceOpen(true);
  setLoadingSessionRecords(true);

  try {
    const { data, error } = await supabase.rpc(
      "open_school_attendance_session",
      {
        p_class_id: session.class_id,
        p_attendance_date: session.attendance_date,
        p_session_label: session.session_label,
        p_note: session.note,
      }
    );

    if (error || !data) {
      throw new Error(
        error?.message ||
          "Impossible de préparer la feuille d’appel."
      );
    }

    const sessionId = data as string;

    setSelectedSessionId(sessionId);

    await loadAttendanceDrafts(sessionId);
  } catch (error) {
    setAttendanceError(
      error instanceof Error
        ? error.message
        : "Impossible de charger les élèves de cette classe."
    );
  } finally {
    setLoadingSessionRecords(false);
  }
}

  function updateAttendanceDraft(
    studentId: string,
    field: "status" | "note",
    value: string
  ) {
    setAttendanceDrafts((current) =>
      current.map((draft) =>
        draft.studentId === studentId
          ? {
              ...draft,
              [field]:
                field === "status"
                  ? (value as AttendanceStatus)
                  : value,
            }
          : draft
      )
    );
  }

  function markAllPresent() {
    setAttendanceDrafts((current) =>
      current.map((draft) => ({
        ...draft,
        status: "present",
      }))
    );
  }

  async function createSession(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setSessionError("");

  if (!sessionForm.schoolYearId) {
    setSessionError("Veuillez sélectionner une année scolaire.");
    return;
  }

  if (!sessionForm.classId) {
    setSessionError("Veuillez sélectionner une classe.");
    return;
  }

  if (!sessionForm.attendanceDate) {
    setSessionError("La date de présence est obligatoire.");
    return;
  }

  setOpeningSession(true);

  try {
    const { data, error } = await supabase.rpc(
      "open_school_attendance_session",
      {
        p_class_id: sessionForm.classId,
        p_attendance_date: sessionForm.attendanceDate,
        p_session_label: sessionForm.sessionLabel.trim() || "Journée",
        p_note: sessionForm.note.trim() || null,
      }
    );

    if (error || !data) {
      throw new Error(
        error?.message || "Impossible d’ouvrir cette séance de présence."
      );
    }

    const sessionId = data as string;

    setSelectedSessionId(sessionId);
    setSelectedSessionPreview(makeSessionPreview(sessionId));
    setAttendanceDrafts([]);
    setAttendanceError("");
    setAttendanceMessage("");
    setNewSessionOpen(false);
    setAttendanceOpen(true);
    setLoadingSessionRecords(true);

    await loadAttendanceDrafts(sessionId);

    router.refresh();
  } catch (error) {
    setSessionError(
      error instanceof Error
        ? error.message
        : "Impossible d’ouvrir la séance."
    );
  } finally {
    setOpeningSession(false);
    setLoadingSessionRecords(false);
  }
}
  async function saveAttendance() {
    if (!selectedSessionId) {
      return;
    }

    setAttendanceError("");
    setAttendanceMessage("");

    if (attendanceDrafts.length === 0) {
      setAttendanceError(
        "Aucun élève inscrit n’a été trouvé pour cette classe."
      );
      return;
    }

    setSavingAttendance(true);

    try {
      const { error } = await supabase.rpc("save_school_attendance", {
        p_session_id: selectedSessionId,
        p_records: attendanceDrafts.map((draft) => ({
          student_id: draft.studentId,
          status: draft.status,
          note: draft.note.trim() || null,
        })),
      });

      if (error) {
        throw new Error(error.message);
      }

      setAttendanceMessage("Les présences ont été enregistrées avec succès.");
      router.refresh();

      window.setTimeout(() => {
        closeAttendance();
      }, 850);
    } catch (error) {
      setAttendanceError(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer les présences."
      );
    } finally {
      setSavingAttendance(false);
    }
  }

  function getSessionSummary(sessionId: string) {
    const sessionRecords = records.filter(
      (record) => record.session_id === sessionId
    );

    const total = sessionRecords.length;
    const present = sessionRecords.filter((record) =>
      ["present", "retard", "justifie"].includes(record.status)
    ).length;
    const absent = sessionRecords.filter(
      (record) => record.status === "absent"
    ).length;
    const pending = sessionRecords.filter(
      (record) => record.status === "non_renseigne"
    ).length;

    return { total, present, absent, pending };
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            École chrétienne
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Présences scolaires
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Ouvrez une feuille d’appel par classe, marquez les présences et
            suivez la régularité des élèves au fil des journées.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewSession}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Nouvelle feuille d’appel
        </button>
      </section>

      {loadError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {loadError}
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <ClipboardCheck className="text-[#0a56a4]" size={25} />
              <p className="mt-6 text-3xl font-black text-[#092e63]">
                {filteredSessions.length}
              </p>
              <p className="mt-2 font-bold text-slate-700">
                Séances de présence
              </p>
            </article>

            <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <CheckCircle2 className="text-emerald-700" size={25} />
              <p className="mt-6 text-3xl font-black text-emerald-900">
                {attendanceRate} %
              </p>
              <p className="mt-2 font-bold text-emerald-800">
                Taux de présence
              </p>
            </article>

            <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
              <Users className="text-cyan-700" size={25} />
              <p className="mt-6 text-3xl font-black text-cyan-900">
                {attendanceCount}
              </p>
              <p className="mt-2 font-bold text-cyan-800">
                Présences comptabilisées
              </p>
            </article>

            <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
              <Clock3 className="text-amber-700" size={25} />
              <p className="mt-6 text-3xl font-black text-amber-950">
                {recordedCount}
              </p>
              <p className="mt-2 font-bold text-amber-800">
                Situations renseignées
              </p>
            </article>
          </section>

          <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="grid gap-4 border-b border-slate-100 p-5 lg:grid-cols-3">
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

              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className={inputClassName}
              />
            </div>

            {filteredSessions.length === 0 ? (
              <div className="p-12 text-center">
                <CalendarCheck2 className="mx-auto text-blue-200" size={42} />
                <p className="mt-4 font-black text-[#092e63]">
                  Aucune feuille d’appel trouvée
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Ouvrez une nouvelle feuille d’appel pour commencer.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredSessions.map((session) => {
                  const summary = getSessionSummary(session.id);

                  return (
                    <article
                      key={session.id}
                      className="grid gap-5 px-6 py-5 transition hover:bg-blue-50/60 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)_auto] xl:items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                          <CalendarCheck2 size={23} />
                        </div>

                        <div>
                          <p className="font-black text-[#092e63]">
                            {session.school_class?.name || "Classe non définie"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(session.attendance_date)} •{" "}
                            {session.session_label}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {session.school_year?.name || "Année non définie"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl bg-emerald-50 px-3 py-2">
                          <p className="font-black text-emerald-800">
                            {summary.present}
                          </p>
                          <p className="mt-1 text-emerald-700">Présents</p>
                        </div>

                        <div className="rounded-xl bg-red-50 px-3 py-2">
                          <p className="font-black text-red-700">
                            {summary.absent}
                          </p>
                          <p className="mt-1 text-red-600">Absents</p>
                        </div>

                        <div className="rounded-xl bg-slate-100 px-3 py-2">
                          <p className="font-black text-slate-700">
                            {summary.pending}
                          </p>
                          <p className="mt-1 text-slate-500">À saisir</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAttendance(session)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                      >
                        <ClipboardCheck size={17} />
                        Gérer la présence
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {newSessionOpen && (
        <Modal onClose={closeNewSession}>
          <div className="flex items-start justify-between border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                Présence scolaire
              </p>
              <h2 className="mt-2 text-xl font-black text-[#092e63]">
                Nouvelle feuille d’appel
              </h2>
            </div>

            <button
              type="button"
              onClick={closeNewSession}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={createSession} className="p-6">
            {sessionError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {sessionError}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Année scolaire *
                </span>

                <select
                  value={sessionForm.schoolYearId}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      schoolYearId: event.target.value,
                      classId: "",
                    }))
                  }
                  className={inputClassName}
                  required
                >
                  <option value="">Sélectionnez une année scolaire</option>

                  {schoolYears.map((schoolYear) => (
                    <option key={schoolYear.id} value={schoolYear.id}>
                      {schoolYear.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Classe *
                </span>

                <select
                  value={sessionForm.classId}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      classId: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                >
                  <option value="">Sélectionnez une classe</option>

                  {openingClasses.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Date *
                </span>

                <input
                  type="date"
                  value={sessionForm.attendanceDate}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      attendanceDate: event.target.value,
                    }))
                  }
                  className={inputClassName}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Libellé de la séance
                </span>

                <input
                  value={sessionForm.sessionLabel}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      sessionLabel: event.target.value,
                    }))
                  }
                  placeholder="Ex. Journée, Matin, Après-midi"
                  className={inputClassName}
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Note éventuelle
                </span>

                <textarea
                  value={sessionForm.note}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  className={`${inputClassName} min-h-24 resize-y`}
                  placeholder="Ex. Journée de révision, activité spéciale..."
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={closeNewSession}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={openingSession}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
              >
                {openingSession && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                Ouvrir la feuille d’appel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {attendanceOpen && selectedSession && (
        <Modal onClose={closeAttendance}>
          <div className="flex items-start justify-between border-b border-slate-100 p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                Feuille d’appel
              </p>

              <h2 className="mt-2 text-xl font-black text-[#092e63]">
                {selectedSession.school_class?.name || "Classe non définie"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {formatDate(selectedSession.attendance_date)} •{" "}
                {selectedSession.session_label}
              </p>
            </div>

            <button
              type="button"
              onClick={closeAttendance}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {attendanceError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {attendanceError}
              </div>
            )}

            {attendanceMessage && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                {attendanceMessage}
              </div>
            )}

            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl bg-blue-50 p-4 sm:flex-row sm:items-center">
              <p className="text-sm font-bold text-[#092e63]">
                {attendanceDrafts.length} élève(s) inscrit(s) dans cette classe
              </p>

              <button
                type="button"
                onClick={markAllPresent}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-50"
              disabled={loadingSessionRecords || attendanceDrafts.length === 0}
              >
                Tout marquer présent
                
              </button>
            </div>

            {loadingSessionRecords ? (
  <div className="rounded-2xl border border-dashed border-blue-200 p-8 text-center">
    <LoaderCircle
      className="mx-auto animate-spin text-[#0a56a4]"
      size={34}
    />
    <p className="mt-4 font-black text-[#092e63]">
      Chargement des élèves inscrits…
    </p>
  </div>
) : attendanceDrafts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-blue-200 p-8 text-center">
                <Users className="mx-auto text-blue-200" size={36} />
                <p className="mt-4 font-black text-[#092e63]">
                  Aucun élève inscrit trouvé
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Vérifie que les élèves sont inscrits avec le statut « Inscrit »
                  dans cette classe.
                </p>
              </div>
            ) : (
              <div className="max-h-[55vh] overflow-y-auto rounded-2xl border border-slate-100">
                <div className="divide-y divide-slate-100">
                  {attendanceDrafts.map((draft) => (
                    <div
                      key={draft.studentId}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_170px_200px] md:items-center"
                    >
                      <div>
                        <p className="font-black text-[#092e63]">
                          {draft.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {draft.studentNumber || "Numéro élève non attribué"}
                        </p>
                      </div>

                      <select
                        value={draft.status}
                        onChange={(event) =>
                          updateAttendanceDraft(
                            draft.studentId,
                            "status",
                            event.target.value
                          )
                        }
                        className={`rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold outline-none ${attendanceStatusStyles[draft.status]}`}
                      >
                        {attendanceStatuses.map((status) => (
                          <option key={status} value={status}>
                            {attendanceStatusLabels[status]}
                          </option>
                        ))}
                      </select>

                      <input
                        value={draft.note}
                        onChange={(event) =>
                          updateAttendanceDraft(
                            draft.studentId,
                            "note",
                            event.target.value
                          )
                        }
                        placeholder="Note éventuelle"
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
                onClick={closeAttendance}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
              >
                Fermer
              </button>

              <button
                type="button"
                disabled={
  savingAttendance ||
  loadingSessionRecords ||
  attendanceDrafts.length === 0
}
                onClick={saveAttendance}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-70"
              >
                {savingAttendance ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Enregistrer les présences
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}