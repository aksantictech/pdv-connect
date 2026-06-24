"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type {
  NewMemberRegistration,
  RegistrationStatus,
} from "@/types/new-members";
import { statusLabels, statusStyles } from "@/types/new-members";

type NewMembersListProps = {
  registrations: NewMemberRegistration[];
  loadError: string | null;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function NewMembersList({
  registrations,
  loadError,
}: NewMembersListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | "all">("all");

  const filteredRegistrations = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return registrations.filter((registration) => {
      const matchesStatus =
        status === "all" || registration.status === status;

      const searchableText = [
        registration.first_name,
        registration.last_name,
        registration.phone,
        registration.email,
        registration.assembly?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchableText.includes(keyword);
    });
  }, [registrations, search, status]);

  const pendingCount = registrations.filter((item) =>
    ["soumis", "contacte", "en_suivi", "oriente"].includes(item.status)
  ).length;

  const integratedCount = registrations.filter(
    (item) => item.status === "integre"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Intégration
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Nouveaux membres
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Gérez les inscriptions reçues depuis le formulaire public ou le QR
            Code de CEF Parole de Vie.
          </p>
        </div>

        <Link
          href="/rejoindre"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          Ouvrir le formulaire public
          <ArrowRight size={18} />
        </Link>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <UserPlus className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {registrations.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">Total inscriptions</p>
        </article>

        <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <UsersRound className="text-amber-700" size={25} />
          <p className="mt-6 text-3xl font-black text-amber-900">
            {pendingCount}
          </p>
          <p className="mt-2 font-bold text-amber-800">À suivre</p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <UsersRound className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {integratedCount}
          </p>
          <p className="mt-2 font-bold text-emerald-800">Déjà intégrés</p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un nom, téléphone ou assemblée..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as RegistrationStatus | "all")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="p-8 text-center text-red-700">{loadError}</div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <UserPlus className="mx-auto text-blue-200" size={38} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucune inscription trouvée
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Les nouvelles inscriptions apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRegistrations.map((registration) => (
              <Link
                key={registration.id}
                href={`/admin/nouveaux-membres/${registration.id}`}
                className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-blue-50/60 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <p className="font-black text-[#092e63]">
                    {registration.first_name} {registration.last_name}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {registration.phone}
                    {registration.assembly?.name
                      ? ` • ${registration.assembly.name}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-xs font-medium text-slate-500">
                    {formatDate(registration.created_at)}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      statusStyles[registration.status]
                    }`}
                  >
                    {statusLabels[registration.status]}
                  </span>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#0a56a4]"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}