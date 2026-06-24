"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  Save,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  RegistrationStatus,
  StaffProfile,
} from "@/types/new-members";
import { statusLabels } from "@/types/new-members";

type NewMemberFollowupPanelProps = {
  registrationId: string;
  currentStatus: RegistrationStatus;
  assignedToProfileId: string | null;
  convertedMemberId: string | null;
  staff: StaffProfile[];
};

export default function NewMemberFollowupPanel({
  registrationId,
  currentStatus,
  assignedToProfileId: initialAssignedToProfileId,
  convertedMemberId,
  staff,
}: NewMemberFollowupPanelProps) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] =
    useState<RegistrationStatus>(currentStatus);

  const [note, setNote] = useState("");
  const [channel, setChannel] = useState("Téléphone");
  const [nextFollowupDate, setNextFollowupDate] = useState("");

  const [selectedProfileId, setSelectedProfileId] = useState(
    initialAssignedToProfileId ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function saveFollowup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!note.trim()) {
      setErrorMessage("Veuillez renseigner une note de suivi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.rpc("record_new_member_followup", {
      p_registration_id: registrationId,
      p_note: note.trim(),
      p_status: status,
      p_next_followup_date: nextFollowupDate || null,
      p_channel: channel,
      p_assigned_to_profile_id: selectedProfileId || null,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Le suivi a été enregistré avec succès.");
    setNote("");
    setNextFollowupDate("");
    router.refresh();
  }

  async function convertToMember() {
    const confirmed = window.confirm(
      "Confirmer la conversion de cette inscription en membre actif ?"
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");
    setConverting(true);

    const { error } = await supabase.rpc("convert_new_member_to_member", {
      p_registration_id: registrationId,
    });

    setConverting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Le nouveau membre a été converti en membre actif.");
    router.refresh();
  }

  return (
    <aside className="h-fit rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
      <h2 className="text-xl font-black text-[#092e63]">
        Action d’intégration
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Enregistrez un contact, affectez un responsable ou finalisez
        l’intégration.
      </p>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {message && (
        <div className="mt-5 flex gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" />
          {message}
        </div>
      )}

      <form onSubmit={saveFollowup} className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Statut après suivi
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as RegistrationStatus)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Responsable du suivi
          </span>

          <select
            value={selectedProfileId}
            onChange={(event) => setSelectedProfileId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            <option value="">Conserver l’affectation actuelle</option>

            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name}
                {person.job_title ? ` — ${person.job_title}` : ""}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Canal
            </span>

            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0a56a4]"
            >
              <option>Téléphone</option>
              <option>WhatsApp</option>
              <option>Visite à domicile</option>
              <option>À l’Église</option>
              <option>E-mail</option>
              <option>Autre</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Prochain suivi
            </span>

            <input
              type="date"
              value={nextFollowupDate}
              onChange={(event) => setNextFollowupDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0a56a4]"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Note de suivi *
          </span>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ex. Contact téléphonique établi, invitation au culte de dimanche..."
            className="min-h-32 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3.5 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save size={18} />
              Enregistrer le suivi
            </>
          )}
        </button>
      </form>

      <div className="my-7 border-t border-slate-100" />

      {convertedMemberId ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="flex items-center gap-2 font-extrabold text-emerald-800">
            <CheckCircle2 size={19} />
            Membre actif
          </p>

          <p className="mt-2 text-sm leading-6 text-emerald-700">
            Cette inscription a déjà été convertie dans le registre des
            membres.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={convertToMember}
          disabled={converting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {converting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Conversion…
            </>
          ) : (
            <>
              <UserCheck size={18} />
              Convertir en membre actif
            </>
          )}
        </button>
      )}
    </aside>
  );
}