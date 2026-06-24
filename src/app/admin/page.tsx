import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Church,
  ClipboardList,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  status: string;
  created_at: string;
  assemblies: {
    name: string;
  } | null;
};

const statusStyles: Record<string, string> = {
  soumis: "bg-blue-100 text-blue-800",
  contacte: "bg-amber-100 text-amber-800",
  en_suivi: "bg-violet-100 text-violet-800",
  oriente: "bg-cyan-100 text-cyan-800",
  integre: "bg-emerald-100 text-emerald-800",
  sans_suite: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<string, string> = {
  soumis: "À contacter",
  contacte: "Contacté",
  en_suivi: "En suivi",
  oriente: "Orienté",
  integre: "Intégré",
  sans_suite: "Sans suite",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
membersResult,
registrationsResult,
departmentsResult,
activitiesResult,
pastorsResult,
recentRegistrationsResult,
] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("new_member_registrations")
      .select("*", { count: "exact", head: true })
      .in("status", ["soumis", "contacte", "en_suivi", "oriente"]),

    supabase
      .from("departments")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),

    supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .in("status", ["soumis", "valide", "en_cours"]),

      supabase
.from("church_pastors")
.select("id", { count: "exact", head: true })
.eq("is_active", true),


    supabase
      .from("new_member_registrations")
      .select(
        "id, first_name, last_name, phone, status, created_at, assemblies(name)"
      )
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const recentRegistrations =
    (recentRegistrationsResult.data as unknown as Registration[]) ?? [];

const pastorsCount = pastorsResult.count ?? 0;


  const statistics = [
    {
      label: "Membres actifs",
      value: membersResult.count ?? 0,
      description: "Base centralisée de l’Église",
      icon: Users,
      href: "/admin/membres",
    },
    {
      label: "Nouveaux membres",
      value: registrationsResult.count ?? 0,
      description: "En attente de suivi ou d’intégration",
      icon: UserPlus,
      href: "/admin/nouveaux-membres",
    },
    {
      label: "Départements actifs",
      value: departmentsResult.count ?? 0,
      description: "Ministères et équipes de service",
      icon: Church,
      href: "/admin/departements",
    },
    {
      label: "Activités en cours",
      value: activitiesResult.count ?? 0,
      description: "Plans soumis, validés ou actifs",
      icon: CalendarDays,
      href: "/admin/activites",
    },
    {
label: "Pasteurs actifs",
value: pastorsCount,
description: "Leadership spirituel de l’Église",
icon: UserRound,
href: "/admin/pasteurs",
},

  ];

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Tableau de bord
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Pilotage de l’œuvre
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Vue consolidée des membres, nouveaux inscrits, départements et
            activités de CEF Parole de Vie.
          </p>
        </div>

        <Link
          href="/admin/nouveaux-membres"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          Voir les nouveaux membres
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Link
              key={statistic.label}
              href={statistic.href}
              className="group rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82] transition group-hover:bg-[#0a3d82] group-hover:text-white">
                  <Icon size={23} />
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0a56a4]"
                />
              </div>

              <p className="mt-7 text-3xl font-black text-[#092e63]">
                {statistic.value}
              </p>

              <h2 className="mt-2 font-extrabold text-slate-800">
                {statistic.label}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {statistic.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-3xl border border-blue-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-black text-[#092e63]">
                Dernières inscriptions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Nouveaux membres enregistrés depuis le site ou QR Code.
              </p>
            </div>

            <Link
              href="/admin/nouveaux-membres"
              className="text-sm font-extrabold text-[#0a56a4]"
            >
              Tout voir
            </Link>
          </div>

          {recentRegistrations.length === 0 ? (
            <div className="p-10 text-center">
              <UserPlus className="mx-auto text-blue-200" size={36} />
              <p className="mt-4 font-bold text-[#092e63]">
                Aucune inscription récente
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Les inscriptions du formulaire public apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-extrabold text-[#092e63]">
                      {registration.first_name} {registration.last_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {registration.phone} •{" "}
                      {registration.assemblies?.name ?? "Assemblée"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-500">
                      {formatDate(registration.created_at)}
                    </p>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        statusStyles[registration.status] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {statusLabels[registration.status] ??
                        registration.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-[#082553] to-[#0a56a4] p-7 text-white shadow-xl">
          <ClipboardList className="text-cyan-200" size={31} />

          <h2 className="mt-7 text-2xl font-black">
            Priorités administratives
          </h2>

          <div className="mt-6 space-y-4">
            {[
              "Suivre chaque nouveau membre inscrit.",
              "Compléter progressivement la base des membres.",
              "Attribuer les responsables des départements.",
              "Planifier les premières activités ministérielles.",
            ].map((item) => (
              <div key={item} className="flex gap-3">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-cyan-200"
                />
                <p className="text-sm leading-6 text-blue-100">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}