import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  HeartHandshake,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NewMemberFollowupPanel from "../../../../components/admin/NewMemberFollowupPanel";import type {
  Followup,
  NewMemberRegistration,
  StaffProfile,
} from "@/types/new-members";
import { statusLabels, statusStyles } from "@/types/new-members";

type NewMemberDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: string | null) {
  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default async function NewMemberDetailPage({
  params,
}: NewMemberDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("new_member_registrations")
    .select(`
      id,
      organization_id,
      assembly_id,
      requested_department_id,
      assigned_to_profile_id,
      first_name,
      last_name,
      gender,
      phone,
      email,
      country,
      city,
      commune,
      first_visit_date,
      needs_prayer,
      needs_counselling,
      wants_baptism,
      message,
      status,
      converted_member_id,
      created_at,
      assembly:assemblies(name, city),
      department:departments(name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const registration = data as unknown as NewMemberRegistration;

  const [followupsResult, staffResult, assignedProfileResult] =
    await Promise.all([
      supabase
        .from("integration_followups")
        .select(`
          id,
          followup_date,
          channel,
          note,
          next_followup_date,
          status_after_followup,
          profile:profiles(full_name)
        `)
        .eq("registration_id", registration.id)
        .order("followup_date", { ascending: false }),

      supabase
        .from("profiles")
        .select("id, full_name, job_title, assembly_id")
        .eq("organization_id", registration.organization_id)
        .eq("is_active", true)
        .order("full_name"),

      registration.assigned_to_profile_id
        ? supabase
            .from("profiles")
            .select("full_name")
            .eq("id", registration.assigned_to_profile_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const followups = (followupsResult.data as unknown as Followup[] | null) ?? [];
  const staff = (staffResult.data as StaffProfile[] | null) ?? [];
  const assignedProfile = assignedProfileResult.data as {
  full_name: string;
} | null;

const needs = [
  registration.needs_prayer ? "Prière" : null,
  registration.needs_counselling ? "Entretien / accompagnement" : null,
  registration.wants_baptism ? "Baptême" : null,
].filter((need): need is string => Boolean(need));

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/admin/nouveaux-membres"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4] transition hover:gap-3"
      >
        <ArrowLeft size={18} />
        Retour aux nouveaux membres
      </Link>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                <UserRound size={28} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Nouveau membre
                </p>

                <h1 className="mt-2 text-3xl font-black text-[#092e63]">
                  {registration.first_name} {registration.last_name}
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Inscription reçue le {formatDate(registration.created_at)}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${
                statusStyles[registration.status]
              }`}
            >
              {statusLabels[registration.status]}
            </span>
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-100 pt-7 sm:grid-cols-2">
            <div className="flex gap-3">
              <Phone className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Téléphone
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {registration.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  E-mail
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {registration.email || "Non renseigné"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Localisation
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {[registration.commune, registration.city, registration.country]
                    .filter(Boolean)
                    .join(", ") || "Non renseignée"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Building2 className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Assemblée
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {registration.assembly?.name || "Non renseignée"}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CalendarDays className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Première visite
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {formatDate(registration.first_visit_date)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <HeartHandshake className="mt-0.5 text-[#0a56a4]" size={19} />
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">
                  Ministère souhaité
                </p>
                <p className="mt-1 font-semibold text-slate-700">
                  {registration.department?.name || "À orienter"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-blue-50 p-5">
              <p className="font-extrabold text-[#092e63]">
                Besoins exprimés
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {needs.length > 0 ? (
                  needs.map((need) => (
                    <span
                      key={need}
                      className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-[#0a3d82]"
                    >
                      {need}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Aucun besoin spécifique renseigné.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="font-extrabold text-[#092e63]">
                Responsable affecté
              </p>

              <p className="mt-3 text-sm font-semibold text-slate-600">
                {assignedProfile?.full_name || "Aucun responsable affecté"}
              </p>
            </div>
          </div>

          {registration.message && (
            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <p className="font-extrabold text-[#092e63]">Message reçu</p>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">
                {registration.message}
              </p>
            </div>
          )}
        </article>

        <NewMemberFollowupPanel
          registrationId={registration.id}
          currentStatus={registration.status}
          assignedToProfileId={registration.assigned_to_profile_id}
          convertedMemberId={registration.converted_member_id}
          staff={staff}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-7 py-5">
          <h2 className="text-xl font-black text-[#092e63]">
            Historique de suivi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tous les contacts et actions réalisés pour cette inscription.
          </p>
        </div>

        {followups.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Aucun suivi n’a encore été enregistré.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {followups.map((followup) => (
              <article key={followup.id} className="px-7 py-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <p className="font-black text-[#092e63]">
                      {followup.profile?.full_name || "Équipe PDV Connect"}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#1680c4]">
                      {followup.channel || "Suivi"} •{" "}
                      {formatDate(followup.followup_date)}
                    </p>
                  </div>

                  {followup.status_after_followup && (
                    <span
                      className={`h-fit w-fit rounded-full px-3 py-1 text-xs font-extrabold ${
                        statusStyles[followup.status_after_followup]
                      }`}
                    >
                      {statusLabels[followup.status_after_followup]}
                    </span>
                  )}
                </div>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
                  {followup.note}
                </p>

                {followup.next_followup_date && (
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Prochain suivi : {formatDate(followup.next_followup_date)}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}