"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  Users,
} from "lucide-react";
import type {
  ReportActivity,
  ReportAssembly,
  ReportDepartment,
  ReportMember,
} from "@/types/reports";

type ReportsDashboardProps = {
  assemblies: ReportAssembly[];
  departments: ReportDepartment[];
  members: ReportMember[];
  activities: ReportActivity[];
  loadError: string | null;
};

type StatusMeta = {
  label: string;
  className: string;
};

const statusMeta: Record<string, StatusMeta> = {
  brouillon: {
    label: "Brouillon",
    className: "bg-slate-100 text-slate-700",
  },
  soumis: {
    label: "Soumis",
    className: "bg-blue-100 text-blue-800",
  },
  valide: {
    label: "Validé",
    className: "bg-emerald-100 text-emerald-800",
  },
  en_cours: {
    label: "En cours",
    className: "bg-cyan-100 text-cyan-800",
  },
  termine: {
    label: "Terminé",
    className: "bg-violet-100 text-violet-800",
  },
  rejete: {
    label: "Rejeté",
    className: "bg-red-100 text-red-800",
  },
  annule: {
    label: "Annulé",
    className: "bg-orange-100 text-orange-800",
  },
};

function getStatusMeta(status: string | null): StatusMeta {
  return (
    statusMeta[status ?? ""] ?? {
      label: status || "Non défini",
      className: "bg-slate-100 text-slate-700",
    }
  );
}

function formatAmount(value: number | string | null) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(date: string | null) {
  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateIsInRange(
  date: string | null,
  startDate: string,
  endDate: string
) {
  if (!startDate && !endDate) return true;
  if (!date) return false;

  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;

  return true;
}

function toCsvValue(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function ReportsDashboard({
  assemblies,
  departments,
  members,
  activities,
  loadError,
}: ReportsDashboardProps) {
  const [assemblyId, setAssemblyId] = useState("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const availableDepartments = useMemo(() => {
    if (assemblyId === "all") return departments;

    return departments.filter(
      (department) => department.assembly_id === assemblyId
    );
  }, [assemblyId, departments]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesAssembly =
        assemblyId === "all" || activity.assembly_id === assemblyId;

      const matchesDepartment =
        departmentId === "all" || activity.department_id === departmentId;

      const matchesDates = dateIsInRange(
        activity.planned_start_date,
        startDate,
        endDate
      );

      return matchesAssembly && matchesDepartment && matchesDates;
    });
  }, [activities, assemblyId, departmentId, startDate, endDate]);

  const scopedMembers = useMemo(() => {
    return members.filter((member) => {
      return assemblyId === "all" || member.assembly_id === assemblyId;
    });
  }, [members, assemblyId]);

  const activeMembers = scopedMembers.filter(
    (member) => member.is_active
  ).length;

  const integrations = scopedMembers.filter((member) =>
    dateIsInRange(member.joined_at, startDate, endDate)
  ).length;

  const completedActivities = filteredActivities.filter(
    (activity) => activity.status === "termine"
  ).length;

  const runningActivities = filteredActivities.filter(
    (activity) => activity.status === "en_cours"
  ).length;

  const validatedActivities = filteredActivities.filter(
    (activity) => activity.status === "valide"
  ).length;

  const completionRate =
    filteredActivities.length > 0
      ? Math.round((completedActivities / filteredActivities.length) * 100)
      : 0;

  const plannedBudget = filteredActivities.reduce(
    (total, activity) => total + Number(activity.budget_planned ?? 0),
    0
  );

  const actualBudget = filteredActivities.reduce(
    (total, activity) => total + Number(activity.budget_actual ?? 0),
    0
  );

  const participantsEstimated = filteredActivities.reduce(
    (total, activity) => total + Number(activity.estimated_participants ?? 0),
    0
  );

  const statusSummary = Object.entries(statusMeta).map(([status, meta]) => ({
    status,
    ...meta,
    count: filteredActivities.filter((activity) => activity.status === status)
      .length,
  }));

  const departmentSummaries = useMemo(() => {
    const scopedDepartments = availableDepartments.filter((department) => {
      return departmentId === "all" || department.id === departmentId;
    });

    return scopedDepartments.map((department) => {
      const departmentActivities = filteredActivities.filter(
        (activity) => activity.department_id === department.id
      );

      const completed = departmentActivities.filter(
        (activity) => activity.status === "termine"
      ).length;

      const planned = departmentActivities.reduce(
        (total, activity) => total + Number(activity.budget_planned ?? 0),
        0
      );

      const actual = departmentActivities.reduce(
        (total, activity) => total + Number(activity.budget_actual ?? 0),
        0
      );

      const rate =
        departmentActivities.length > 0
          ? Math.round((completed / departmentActivities.length) * 100)
          : 0;

      return {
        ...department,
        activityCount: departmentActivities.length,
        completed,
        planned,
        actual,
        rate,
      };
    });
  }, [
    availableDepartments,
    departmentId,
    filteredActivities,
  ]);

  function clearFilters() {
    setAssemblyId("all");
    setDepartmentId("all");
    setStartDate("");
    setEndDate("");
  }

  function applyCurrentMonth() {
    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setStartDate(toInputDate(start));
    setEndDate(toInputDate(end));
  }

  function applyCurrentYear() {
    const now = new Date();

    setStartDate(`${now.getFullYear()}-01-01`);
    setEndDate(`${now.getFullYear()}-12-31`);
  }

  function exportActivitiesCsv() {
    const assemblyMap = new Map(
      assemblies.map((assembly) => [assembly.id, assembly.name])
    );

    const departmentMap = new Map(
      departments.map((department) => [department.id, department.name])
    );

    const rows = [
      [
        "Activité",
        "Assemblée",
        "Département",
        "Type",
        "Date de début",
        "Date de fin",
        "Statut",
        "Participants estimés",
        "Budget planifié",
        "Budget réalisé",
        "Lieu",
      ],
      ...filteredActivities.map((activity) => [
        activity.title,
        assemblyMap.get(activity.assembly_id) || "",
        activity.department_id
          ? departmentMap.get(activity.department_id) || ""
          : "Activité générale",
        activity.activity_type || "",
        activity.planned_start_date || "",
        activity.planned_end_date || "",
        getStatusMeta(activity.status).label,
        activity.estimated_participants ?? 0,
        activity.budget_planned ?? 0,
        activity.budget_actual ?? 0,
        activity.location || "",
      ]),
    ];

    const content = rows
      .map((row) => row.map(toCsvValue).join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${content}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "rapport-activites-pdv-connect.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Pilotage
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Rapports consolidés
          </h1>

          <p className="mt-3 max-w-3xl leading-7 text-slate-600">
            Suivez les activités, l’exécution des plans d’action, les budgets
            et la dynamique des assemblées de CEF Parole de Vie.
          </p>
        </div>

        <button
          type="button"
          onClick={exportActivitiesCsv}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Download size={18} />
          Exporter les activités
        </button>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter size={19} className="text-[#0a56a4]" />
          <h2 className="font-black text-[#092e63]">Périmètre du rapport</h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Assemblée
            </span>

            <select
              value={assemblyId}
              onChange={(event) => {
                setAssemblyId(event.target.value);
                setDepartmentId("all");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Toutes les assemblées</option>

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
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Tous les départements</option>

              {availableDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
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
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Date de fin
            </span>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={applyCurrentMonth}
            className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-[#0a3d82] hover:bg-blue-50"
          >
            Ce mois
          </button>

          <button
            type="button"
            onClick={applyCurrentYear}
            className="rounded-xl border border-blue-200 px-4 py-2 text-sm font-bold text-[#0a3d82] hover:bg-blue-50"
          >
            Cette année
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Réinitialiser
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
              <Users size={25} className="text-[#0a56a4]" />
              <p className="mt-6 text-3xl font-black text-[#092e63]">
                {activeMembers}
              </p>
              <p className="mt-2 font-bold text-slate-700">Membres actifs</p>
              <p className="mt-1 text-xs text-slate-400">
                Selon le périmètre d’assemblée
              </p>
            </article>

            <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
              <CalendarDays size={25} className="text-cyan-700" />
              <p className="mt-6 text-3xl font-black text-cyan-900">
                {integrations}
              </p>
              <p className="mt-2 font-bold text-cyan-800">
                Intégrations enregistrées
              </p>
              <p className="mt-1 text-xs text-cyan-700">
                Selon la période sélectionnée
              </p>
            </article>

            <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <CheckCircle2 size={25} className="text-emerald-700" />
              <p className="mt-6 text-3xl font-black text-emerald-900">
                {completionRate} %
              </p>
              <p className="mt-2 font-bold text-emerald-800">
                Taux de réalisation
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {completedActivities} activité(s) terminée(s)
              </p>
            </article>

            <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
              <BarChart3 size={25} className="text-violet-700" />
              <p className="mt-6 text-3xl font-black text-violet-900">
                {filteredActivities.length}
              </p>
              <p className="mt-2 font-bold text-violet-800">
                Activités suivies
              </p>
              <p className="mt-1 text-xs text-violet-700">
                {runningActivities} en cours • {validatedActivities} validée(s)
              </p>
            </article>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText size={22} className="text-[#0a56a4]" />
                <div>
                  <h2 className="font-black text-[#092e63]">
                    Exécution des activités
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Répartition des activités selon leur état d’avancement.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {statusSummary.map((item) => {
                  const percentage =
                    filteredActivities.length > 0
                      ? Math.round(
                          (item.count / filteredActivities.length) * 100
                        )
                      : 0;

                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between gap-4 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${item.className}`}
                        >
                          {item.label}
                        </span>

                        <span className="font-bold text-slate-700">
                          {item.count} activité(s) — {percentage} %
                        </span>
                      </div>

                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1680c4] transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
              <div className="flex items-center gap-3">
                <Building2 size={22} className="text-amber-700" />
                <div>
                  <h2 className="font-black text-amber-950">
                    Suivi budgétaire
                  </h2>
                  <p className="mt-1 text-sm text-amber-800">
                    Synthèse des budgets enregistrés dans les activités.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div className="rounded-2xl bg-white/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Budget planifié
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-950">
                    {formatAmount(plannedBudget)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Budget réalisé
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-950">
                    {formatAmount(actualBudget)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/80 p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                    Participants estimés
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-950">
                    {participantsEstimated}
                  </p>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="font-black text-[#092e63]">
                Performance par département
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lecture consolidée du volume d’activités, de leur réalisation
                et des budgets associés.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Département</th>
                    <th className="px-6 py-4">Activités</th>
                    <th className="px-6 py-4">Terminées</th>
                    <th className="px-6 py-4">Réalisation</th>
                    <th className="px-6 py-4">Budget planifié</th>
                    <th className="px-6 py-4">Budget réalisé</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {departmentSummaries.map((department) => (
                    <tr key={department.id} className="hover:bg-blue-50/50">
                      <td className="px-6 py-4">
                        <p className="font-black text-[#092e63]">
                          {department.name}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-700">
                        {department.activityCount}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-700">
                        {department.completed}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                          {department.rate} %
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatAmount(department.planned)}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {formatAmount(department.actual)}
                      </td>
                    </tr>
                  ))}

                  {departmentSummaries.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        Aucun département ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-6">
              <h2 className="font-black text-[#092e63]">
                Détail des activités
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Liste des activités prises en compte dans ce rapport.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredActivities.map((activity) => {
                const assembly = assemblies.find(
                  (item) => item.id === activity.assembly_id
                );

                const department = departments.find(
                  (item) => item.id === activity.department_id
                );

                const meta = getStatusMeta(activity.status);

                return (
                  <article
                    key={activity.id}
                    className="grid gap-4 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_220px_180px] lg:items-center"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-black text-[#092e63]">
                          {activity.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">
                        {assembly?.name || "Assemblée non renseignée"} •{" "}
                        {department?.name || "Activité générale"}
                      </p>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p className="font-bold text-slate-700">
                        {formatDate(activity.planned_start_date)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {activity.location || "Lieu non renseigné"}
                      </p>
                    </div>

                    <div className="text-sm lg:text-right">
                      <p className="font-bold text-slate-700">
                        Planifié : {formatAmount(activity.budget_planned)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Réalisé : {formatAmount(activity.budget_actual)}
                      </p>
                    </div>
                  </article>
                );
              })}

              {filteredActivities.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  Aucune activité ne correspond aux filtres sélectionnés.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}