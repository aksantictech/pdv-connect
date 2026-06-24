"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileText,
  LoaderCircle,
  MapPin,
  Pencil,
  PlayCircle,
  Plus,
  Save,
  Send,
  Users,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import type {
  ActivityAssemblyOption,
  ActivityDepartmentOption,
  ActivityMemberOption,
  ActivityRecord,
  ActivityStatus,
} from "../../types/activities";
import {
  activityStatusLabels,
  activityStatusStyles,
} from "../../types/activities";

type ActivitiesManagerProps = {
  initialActivities: ActivityRecord[];
  assemblies: ActivityAssemblyOption[];
  departments: ActivityDepartmentOption[];
  members: ActivityMemberOption[];
  loadError: string | null;
};

type ActivityForm = {
  assemblyId: string;
  departmentId: string;
  title: string;
  activityType: string;
  periodicity: string;
  description: string;
  expectedResults: string;
  plannedStartDate: string;
  plannedEndDate: string;
  location: string;
  responsibleMemberId: string;
  estimatedParticipants: string;
  budgetPlanned: string;
};

type StatusForm = {
  status: ActivityStatus;
  statusNote: string;
  actualResults: string;
  reportSummary: string;
  budgetActual: string;
};

const activityTypes = [
  "Culte / célébration",
  "Évangélisation",
  "Intercession",
  "Réunion départementale",
  "Formation",
  "Action sociale",
  "Répétition / pratique",
  "Visite pastorale",
  "Jeunesse",
  "École",
  "Communication",
  "Autre",
];

const periodicities = [
  "Ponctuelle",
  "Hebdomadaire",
  "Bimensuelle",
  "Mensuelle",
  "Trimestrielle",
  "Semestrielle",
  "Annuelle",
];

const statusTransitions: Record<ActivityStatus, ActivityStatus[]> = {
  brouillon: ["brouillon", "soumis", "annule"],
  soumis: ["soumis", "valide", "rejete", "annule"],
  valide: ["valide", "en_cours", "annule"],
  en_cours: ["en_cours", "termine", "annule"],
  termine: ["termine"],
  rejete: ["rejete", "brouillon", "annule"],
  annule: ["annule"],
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function makeEmptyForm(assemblyId = ""): ActivityForm {
  return {
    assemblyId,
    departmentId: "",
    title: "",
    activityType: "",
    periodicity: "Ponctuelle",
    description: "",
    expectedResults: "",
    plannedStartDate: "",
    plannedEndDate: "",
    location: "",
    responsibleMemberId: "",
    estimatedParticipants: "",
    budgetPlanned: "",
  };
}

function formatDate(date: string | null) {
  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatAmount(value: number | string | null) {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function getSuggestedStatus(activity: ActivityRecord): ActivityStatus {
  if (activity.status === "brouillon") return "soumis";
  if (activity.status === "soumis") return "valide";
  if (activity.status === "valide") return "en_cours";
  if (activity.status === "en_cours") return "termine";

  return activity.status;
}

function getActionLabel(status: ActivityStatus) {
  if (status === "brouillon") return "Soumettre";
  if (status === "soumis") return "Valider";
  if (status === "valide") return "Démarrer";
  if (status === "en_cours") return "Clôturer";

  return "Suivi";
}

export default function ActivitiesManager({
  initialActivities,
  assemblies,
  departments,
  members,
  loadError,
}: ActivitiesManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<
    "create" | "edit" | "view" | "status" | null
  >(null);

  const [selectedActivity, setSelectedActivity] =
    useState<ActivityRecord | null>(null);

  const [form, setForm] = useState<ActivityForm>(() =>
    makeEmptyForm(assemblies[0]?.id ?? "")
  );

  const [statusForm, setStatusForm] = useState<StatusForm>({
    status: "brouillon",
    statusNote: "",
    actualResults: "",
    reportSummary: "",
    budgetActual: "",
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ActivityStatus | "all">("all");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const availableDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.assembly_id === form.assemblyId
      ),
    [departments, form.assemblyId]
  );

  const availableMembers = useMemo(
    () =>
      members.filter((member) => member.assembly_id === form.assemblyId),
    [members, form.assemblyId]
  );

  const filteredActivities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return initialActivities.filter((activity) => {
      const matchesStatus =
        statusFilter === "all" || activity.status === statusFilter;

      const text = [
        activity.title,
        activity.activity_type,
        activity.department?.name,
        activity.assembly?.name,
        activity.responsible
          ? `${activity.responsible.first_name} ${activity.responsible.last_name}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && text.includes(keyword);
    });
  }, [initialActivities, search, statusFilter]);

  const plannedCount = initialActivities.filter((activity) =>
    ["brouillon", "soumis", "valide"].includes(activity.status)
  ).length;

  const runningCount = initialActivities.filter(
    (activity) => activity.status === "en_cours"
  ).length;

  const completedCount = initialActivities.filter(
    (activity) => activity.status === "termine"
  ).length;

  function updateForm<K extends keyof ActivityForm>(
    field: K,
    value: ActivityForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateStatusForm<K extends keyof StatusForm>(
    field: K,
    value: StatusForm[K]
  ) {
    setStatusForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeModal() {
    setMode(null);
    setSelectedActivity(null);
    setForm(makeEmptyForm(assemblies[0]?.id ?? ""));
    setFormError("");
    setFormMessage("");
  }

  function openCreate() {
    setSelectedActivity(null);
    setForm(makeEmptyForm(assemblies[0]?.id ?? ""));
    setFormError("");
    setFormMessage("");
    setMode("create");
  }

  function openEdit(activity: ActivityRecord) {
    setSelectedActivity(activity);

    setForm({
      assemblyId: activity.assembly_id,
      departmentId: activity.department_id ?? "",
      title: activity.title,
      activityType: activity.activity_type ?? "",
      periodicity: activity.periodicity ?? "Ponctuelle",
      description: activity.description ?? "",
      expectedResults: activity.expected_results ?? "",
      plannedStartDate: activity.planned_start_date ?? "",
      plannedEndDate: activity.planned_end_date ?? "",
      location: activity.location ?? "",
      responsibleMemberId: activity.responsible_member_id ?? "",
      estimatedParticipants: activity.estimated_participants?.toString() ?? "",
      budgetPlanned:
        activity.budget_planned !== null
          ? String(activity.budget_planned)
          : "",
    });

    setFormError("");
    setFormMessage("");
    setMode("edit");
  }

  function openStatus(
    activity: ActivityRecord,
    suggestedStatus?: ActivityStatus
  ) {
    setSelectedActivity(activity);

    setStatusForm({
      status: suggestedStatus ?? activity.status,
      statusNote: activity.status_note ?? "",
      actualResults: activity.actual_results ?? "",
      reportSummary: activity.report_summary ?? "",
      budgetActual:
        activity.budget_actual !== null
          ? String(activity.budget_actual)
          : "",
    });

    setFormError("");
    setFormMessage("");
    setMode("status");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormMessage("");

    if (!form.assemblyId) {
      setFormError("Veuillez sélectionner une assemblée.");
      return;
    }

    if (!form.title.trim()) {
      setFormError("Le titre de l’activité est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      const rpcPayload = {
        p_assembly_id: form.assemblyId,
        p_department_id: form.departmentId || null,
        p_title: form.title.trim(),
        p_activity_type: form.activityType || null,
        p_periodicity: form.periodicity || null,
        p_planned_start_date: form.plannedStartDate || null,
        p_planned_end_date: form.plannedEndDate || null,
        p_location: form.location || null,
        p_responsible_member_id: form.responsibleMemberId || null,
        p_estimated_participants: form.estimatedParticipants
          ? Number(form.estimatedParticipants)
          : null,
        p_budget_planned: form.budgetPlanned
          ? Number(form.budgetPlanned)
          : 0,
        p_description: form.description || null,
        p_expected_results: form.expectedResults || null,
      };

      if (mode === "edit" && selectedActivity) {
        const { error } = await supabase.rpc("update_activity_record", {
          p_activity_id: selectedActivity.id,
          ...rpcPayload,
        });

        if (error) throw new Error(error.message);

        setFormMessage("L’activité a été mise à jour avec succès.");
      } else {
        const { error } = await supabase.rpc(
          "create_activity_record",
          rpcPayload
        );

        if (error) throw new Error(error.message);

        setFormMessage("L’activité a été créée en brouillon.");
      }

      router.refresh();

      window.setTimeout(() => {
        closeModal();
      }, 900);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Une erreur inattendue est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedActivity) return;

    setFormError("");
    setFormMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.rpc("update_activity_status", {
        p_activity_id: selectedActivity.id,
        p_status: statusForm.status,
        p_status_note: statusForm.statusNote || null,
        p_actual_results: statusForm.actualResults || null,
        p_report_summary: statusForm.reportSummary || null,
        p_budget_actual: statusForm.budgetActual
          ? Number(statusForm.budgetActual)
          : null,
      });

      if (error) throw new Error(error.message);

      setFormMessage("Le statut de l’activité a été mis à jour.");
      router.refresh();

      window.setTimeout(() => {
        closeModal();
      }, 900);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour le statut."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Planification
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Activités et plans d’action
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Planifiez les actions des ministères, soumettez-les pour validation
            et produisez progressivement les rapports de réalisation.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Ajouter une activité
        </button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <CalendarDays className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {plannedCount}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Activités planifiées
          </p>
        </article>

        <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <PlayCircle className="text-cyan-700" size={25} />
          <p className="mt-6 text-3xl font-black text-cyan-900">
            {runningCount}
          </p>
          <p className="mt-2 font-bold text-cyan-800">
            Activités en cours
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {completedCount}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Activités terminées
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher une activité, un département ou une assemblée..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 lg:max-w-xl"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ActivityStatus | "all")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            <option value="all">Tous les statuts</option>

            {Object.entries(activityStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="p-10 text-center text-red-700">{loadError}</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucune activité trouvée
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Créez une première activité ou modifiez votre recherche.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((activity) => (
              <article
                key={activity.id}
                className="grid gap-5 px-6 py-6 transition hover:bg-blue-50/50 xl:grid-cols-[minmax(0,1fr)_260px_auto] xl:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-black text-[#092e63]">
                      {activity.title}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        activityStatusStyles[activity.status]
                      }`}
                    >
                      {activityStatusLabels[activity.status]}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {activity.department?.name || "Activité générale"} •{" "}
                    {activity.activity_type || "Type non défini"}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatDate(activity.planned_start_date)}
                    {activity.planned_end_date
                      ? ` au ${formatDate(activity.planned_end_date)}`
                      : ""}
                  </p>
                </div>

                <div className="space-y-1 text-sm xl:text-right">
                  <p className="font-bold text-slate-700">
                    {activity.assembly?.name || "Assemblée non renseignée"}
                  </p>

                  <p className="text-slate-500">
                    {activity.responsible
                      ? `${activity.responsible.first_name} ${activity.responsible.last_name}`
                      : "Responsable à définir"}
                  </p>

                  <p className="text-xs text-slate-400">
                    Budget : {formatAmount(activity.budget_planned)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setMode("view");
                    }}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 px-2 py-2.5 text-xs font-extrabold text-[#0a3d82] hover:bg-blue-50"
                  >
                    <Eye size={15} />
                    Voir
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(activity)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-amber-200 px-2 py-2.5 text-xs font-extrabold text-amber-800 hover:bg-amber-50"
                  >
                    <Pencil size={15} />
                    Modifier
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStatus(activity, getSuggestedStatus(activity))
                    }
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-200 px-2 py-2.5 text-xs font-extrabold text-emerald-800 hover:bg-emerald-50"
                  >
                    {activity.status === "brouillon" ? (
                      <Send size={15} />
                    ) : (
                      <ClipboardCheck size={15} />
                    )}
                    {getActionLabel(activity.status)}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {mode === "view" && selectedActivity && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-3xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-7">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Fiche activité
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {selectedActivity.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-6 p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase text-[#1680c4]">
                    Statut
                  </p>
                  <p className="mt-2 font-black text-[#092e63]">
                    {activityStatusLabels[selectedActivity.status]}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase text-[#1680c4]">
                    Responsable
                  </p>
                  <p className="mt-2 font-black text-[#092e63]">
                    {selectedActivity.responsible
                      ? `${selectedActivity.responsible.first_name} ${selectedActivity.responsible.last_name}`
                      : "Non défini"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <p className="flex gap-2 text-sm text-slate-600">
                  <CalendarDays size={18} className="text-[#0a56a4]" />
                  Du {formatDate(selectedActivity.planned_start_date)} au{" "}
                  {formatDate(selectedActivity.planned_end_date)}
                </p>

                <p className="flex gap-2 text-sm text-slate-600">
                  <MapPin size={18} className="text-[#0a56a4]" />
                  {selectedActivity.location || "Lieu non renseigné"}
                </p>
              </div>

              <div>
                <p className="font-black text-[#092e63]">Description</p>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                  {selectedActivity.description ||
                    "Aucune description n’a été renseignée."}
                </p>
              </div>

              <div>
                <p className="font-black text-[#092e63]">Résultats attendus</p>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                  {selectedActivity.expected_results ||
                    "Aucun résultat attendu n’a été renseigné."}
                </p>
              </div>

              {selectedActivity.actual_results && (
                <div>
                  <p className="font-black text-[#092e63]">
                    Résultats obtenus
                  </p>
                  <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                    {selectedActivity.actual_results}
                  </p>
                </div>
              )}

              {selectedActivity.report_summary && (
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="flex items-center gap-2 font-black text-[#092e63]">
                    <FileText size={20} />
                    Rapport de réalisation
                  </p>

                  <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                    {selectedActivity.report_summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(mode === "create" || mode === "edit") && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Planification ministérielle
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {mode === "edit"
                    ? "Modifier l’activité"
                    : "Ajouter une activité"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
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

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Assemblée *
                  </span>

                  <select
                    value={form.assemblyId}
                    onChange={(event) => {
                      updateForm("assemblyId", event.target.value);
                      updateForm("departmentId", "");
                      updateForm("responsibleMemberId", "");
                    }}
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
                    Département
                  </span>

                  <select
                    value={form.departmentId}
                    onChange={(event) =>
                      updateForm("departmentId", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Activité générale de l’Église</option>

                    {availableDepartments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Titre de l’activité *
                  </span>

                  <input
                    value={form.title}
                    onChange={(event) =>
                      updateForm("title", event.target.value)
                    }
                    placeholder="Ex. Grande campagne d’évangélisation"
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Type d’activité
                  </span>

                  <select
                    value={form.activityType}
                    onChange={(event) =>
                      updateForm("activityType", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Sélectionnez un type</option>

                    {activityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Périodicité
                  </span>

                  <select
                    value={form.periodicity}
                    onChange={(event) =>
                      updateForm("periodicity", event.target.value)
                    }
                    className={inputClassName}
                  >
                    {periodicities.map((periodicity) => (
                      <option key={periodicity} value={periodicity}>
                        {periodicity}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date de début
                  </span>

                  <input
                    type="date"
                    value={form.plannedStartDate}
                    onChange={(event) =>
                      updateForm("plannedStartDate", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date de fin
                  </span>

                  <input
                    type="date"
                    value={form.plannedEndDate}
                    onChange={(event) =>
                      updateForm("plannedEndDate", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Lieu
                  </span>

                  <input
                    value={form.location}
                    onChange={(event) =>
                      updateForm("location", event.target.value)
                    }
                    placeholder="Église, quartier, salle..."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Responsable de l’activité
                  </span>

                  <select
                    value={form.responsibleMemberId}
                    onChange={(event) =>
                      updateForm("responsibleMemberId", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">À définir ultérieurement</option>

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
                    Participants estimés
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={form.estimatedParticipants}
                    onChange={(event) =>
                      updateForm("estimatedParticipants", event.target.value)
                    }
                    placeholder="Ex. 100"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Budget planifié
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budgetPlanned}
                    onChange={(event) =>
                      updateForm("budgetPlanned", event.target.value)
                    }
                    placeholder="0"
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Description
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Décrivez brièvement le déroulement de l’activité..."
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Résultats attendus
                  </span>

                  <textarea
                    value={form.expectedResults}
                    onChange={(event) =>
                      updateForm("expectedResults", event.target.value)
                    }
                    placeholder="Ex. 50 nouveaux contacts, 20 personnes accompagnées..."
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {mode === "edit"
                        ? "Enregistrer les modifications"
                        : "Créer l’activité"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mode === "status" && selectedActivity && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-3xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-7">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Suivi de l’activité
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {selectedActivity.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={saveStatus} className="p-7">
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

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nouveau statut
                  </span>

                  <select
                    value={statusForm.status}
                    onChange={(event) =>
                      updateStatusForm(
                        "status",
                        event.target.value as ActivityStatus
                      )
                    }
                    className={inputClassName}
                  >
                    {statusTransitions[selectedActivity.status].map(
                      (status) => (
                        <option key={status} value={status}>
                          {activityStatusLabels[status]}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Budget réalisé
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={statusForm.budgetActual}
                    onChange={(event) =>
                      updateStatusForm("budgetActual", event.target.value)
                    }
                    placeholder="0"
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Note de suivi ou décision
                  </span>

                  <textarea
                    value={statusForm.statusNote}
                    onChange={(event) =>
                      updateStatusForm("statusNote", event.target.value)
                    }
                    placeholder="Ex. Activité validée par le Pasteur, sous réserve de disponibilité de la salle..."
                    className={`${inputClassName} min-h-24 resize-y`}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Résultats obtenus
                  </span>

                  <textarea
                    value={statusForm.actualResults}
                    onChange={(event) =>
                      updateStatusForm("actualResults", event.target.value)
                    }
                    placeholder="Nombre de participants, conversions, visites, actions réalisées..."
                    className={`${inputClassName} min-h-24 resize-y`}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Synthèse du rapport
                  </span>

                  <textarea
                    value={statusForm.reportSummary}
                    onChange={(event) =>
                      updateStatusForm("reportSummary", event.target.value)
                    }
                    placeholder="Points saillants, difficultés, leçons et recommandations..."
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={18} />
                      Enregistrer le suivi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}