"use client";

import { useMemo, useState } from "react";
import {
CalendarDays,
CheckCircle2,
ClipboardList,
Eye,
LoaderCircle,
Mail,
MessageSquareHeart,
Phone,
Save,
Search,
ShieldCheck,
X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type RequestType = "testimony" | "appointment";
type RequestStatus =
| "new"
| "in_progress"
| "completed"
| "declined"
| "archived";

export type ManagedPublicRequest = {
id: string;
request_type: RequestType;
full_name: string;
email: string | null;
phone: string | null;
subject: string | null;
message: string;
preferred_date: string | null;
preferred_time: string | null;
appointment_reason: string | null;
is_testimony_public: boolean;
status: RequestStatus;
admin_notes: string | null;
created_at: string;
updated_at: string;
};

const statusLabels: Record<RequestStatus, string> = {
new: "Nouveau",
in_progress: "En cours",
completed: "Traité",
declined: "Refusé",
archived: "Archivé",
};

const statusStyles: Record<RequestStatus, string> = {
new: "bg-blue-100 text-blue-800",
in_progress: "bg-amber-100 text-amber-800",
completed: "bg-emerald-100 text-emerald-800",
declined: "bg-red-100 text-red-800",
archived: "bg-slate-200 text-slate-700",
};

function formatDate(dateValue: string | null) {
if (!dateValue) return "Non renseignée";

return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(dateValue));
}

function formatDateTime(dateValue: string) {
return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
}).format(new Date(dateValue));
}

export default function PublicRequestsManager({
initialRequests,
loadError,
}: {
initialRequests: ManagedPublicRequest[];
loadError: string | null;
}) {
const supabase = useMemo(() => createClient(), []);

const [requests, setRequests] =
useState<ManagedPublicRequest[]>(initialRequests);

const [typeFilter, setTypeFilter] = useState<"all" | RequestType>("all");
const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>(
"all"
);
const [search, setSearch] = useState("");

const [selectedRequest, setSelectedRequest] =
useState<ManagedPublicRequest | null>(null);

const [draftStatus, setDraftStatus] = useState<RequestStatus>("new");
const [draftNotes, setDraftNotes] = useState("");
const [draftTestimonyPublic, setDraftTestimonyPublic] = useState(false);

const [saving, setSaving] = useState(false);
const [actionError, setActionError] = useState("");

const filteredRequests = useMemo(() => {
const keyword = search.trim().toLowerCase();

return requests.filter((request) => {
  const matchesType =
    typeFilter === "all" || request.request_type === typeFilter;

  const matchesStatus =
    statusFilter === "all" || request.status === statusFilter;

  const searchableText = [
    request.full_name,
    request.email,
    request.phone,
    request.subject,
    request.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const matchesSearch =
    !keyword || searchableText.includes(keyword);

  return matchesType && matchesStatus && matchesSearch;
});

}, [requests, search, statusFilter, typeFilter]);

const counts = useMemo(
() => ({
total: requests.length,
new: requests.filter((request) => request.status === "new").length,
appointments: requests.filter(
(request) => request.request_type === "appointment"
).length,
testimonies: requests.filter(
(request) => request.request_type === "testimony"
).length,
}),
[requests]
);

function openRequest(request: ManagedPublicRequest) {
setSelectedRequest(request);
setDraftStatus(request.status);
setDraftNotes(request.admin_notes ?? "");
setDraftTestimonyPublic(request.is_testimony_public);
setActionError("");
}

function closeDialog() {
if (saving) return;


setSelectedRequest(null);
setActionError("");

}

async function saveRequest() {
if (!selectedRequest) return;

setSaving(true);
setActionError("");

const { error } = await supabase.rpc("update_pdv_public_request", {
  p_payload: {
    request_id: selectedRequest.id,
    status: draftStatus,
    admin_notes: draftNotes.trim() || null,
    is_testimony_public:
      selectedRequest.request_type === "testimony"
        ? draftTestimonyPublic
        : false,
  },
});

setSaving(false);

if (error) {
  setActionError(
    error.message ||
      "Impossible d’enregistrer les modifications. Veuillez réessayer."
  );
  return;
}

const updatedRequest: ManagedPublicRequest = {
  ...selectedRequest,
  status: draftStatus,
  admin_notes: draftNotes.trim() || null,
  is_testimony_public:
    selectedRequest.request_type === "testimony"
      ? draftTestimonyPublic
      : false,
  updated_at: new Date().toISOString(),
};

setRequests((current) =>
  current.map((request) =>
    request.id === updatedRequest.id ? updatedRequest : request
  )
);

setSelectedRequest(updatedRequest);

}

return ( <div className="space-y-7"> <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Suivi et accompagnement </p>

      <h1 className="mt-2 text-3xl font-black text-[#092e63]">
        Demandes publiques
      </h1>

      <p className="mt-2 max-w-3xl leading-7 text-slate-600">
        Gérez les demandes de rendez-vous et les témoignages transmis depuis
        le site public.
      </p>
    </div>

    <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
      <ShieldCheck size={19} className="shrink-0" />
      Les demandes de prière ne sont pas affichées dans cet espace.
    </div>
  </div>

  {loadError && (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
      Impossible de charger les demandes : {loadError}
    </div>
  )}

  <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <ClipboardList className="text-[#0a56a4]" size={25} />
      <p className="mt-5 text-3xl font-black text-[#092e63]">
        {counts.total}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Demandes reçues
      </p>
    </article>

    <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <CheckCircle2 className="text-blue-600" size={25} />
      <p className="mt-5 text-3xl font-black text-[#092e63]">
        {counts.new}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Nouvelles demandes
      </p>
    </article>

    <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <CalendarDays className="text-violet-600" size={25} />
      <p className="mt-5 text-3xl font-black text-[#092e63]">
        {counts.appointments}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Rendez-vous
      </p>
    </article>

    <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
      <MessageSquareHeart className="text-pink-600" size={25} />
      <p className="mt-5 text-3xl font-black text-[#092e63]">
        {counts.testimonies}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Témoignages
      </p>
    </article>
  </section>

  <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
    <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
      <label className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={19}
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher une personne, un téléphone ou un sujet..."
          className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <select
        value={typeFilter}
        onChange={(event) =>
          setTypeFilter(event.target.value as "all" | RequestType)
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0a56a4]"
      >
        <option value="all">Tous les types</option>
        <option value="appointment">Rendez-vous</option>
        <option value="testimony">Témoignages</option>
      </select>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value as "all" | RequestStatus)
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0a56a4]"
      >
        <option value="all">Tous les statuts</option>
        <option value="new">Nouveau</option>
        <option value="in_progress">En cours</option>
        <option value="completed">Traité</option>
        <option value="declined">Refusé</option>
        <option value="archived">Archivé</option>
      </select>
    </div>

    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[880px] text-left">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            <th className="px-3 py-4">Type</th>
            <th className="px-3 py-4">Personne</th>
            <th className="px-3 py-4">Sujet</th>
            <th className="px-3 py-4">Date</th>
            <th className="px-3 py-4">Statut</th>
            <th className="px-3 py-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredRequests.map((request) => (
            <tr
              key={request.id}
              className="border-b border-slate-100 last:border-0"
            >
              <td className="px-3 py-4">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-[#0a56a4]">
                  {request.request_type === "appointment"
                    ? "Rendez-vous"
                    : "Témoignage"}
                </span>
              </td>

              <td className="px-3 py-4">
                <p className="font-extrabold text-[#092e63]">
                  {request.full_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {request.phone || request.email || "Contact non renseigné"}
                </p>
              </td>

              <td className="max-w-[260px] px-3 py-4">
                <p className="truncate font-semibold text-slate-700">
                  {request.subject || "Sans objet"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {request.message}
                </p>
              </td>

              <td className="px-3 py-4 text-sm text-slate-600">
                {formatDateTime(request.created_at)}
              </td>

              <td className="px-3 py-4">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${statusStyles[request.status]}`}
                >
                  {statusLabels[request.status]}
                </span>
              </td>

              <td className="px-3 py-4 text-right">
                <button
                  type="button"
                  onClick={() => openRequest(request)}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-100 px-3 py-2 text-xs font-extrabold text-[#0a56a4] transition hover:bg-blue-50"
                >
                  <Eye size={16} />
                  Ouvrir
                </button>
              </td>
            </tr>
          ))}

          {filteredRequests.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-3 py-14 text-center text-sm text-slate-500"
              >
                Aucune demande ne correspond aux filtres sélectionnés.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </section>

  {selectedRequest && (
    <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/55 p-0 sm:items-center sm:justify-center sm:p-5">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8">
        <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              {selectedRequest.request_type === "appointment"
                ? "Demande de rendez-vous"
                : "Témoignage"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              {selectedRequest.full_name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Reçu le {formatDateTime(selectedRequest.created_at)}
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              Coordonnées
            </p>

            <p className="mt-3 font-extrabold text-[#092e63]">
              {selectedRequest.full_name}
            </p>

            {selectedRequest.phone && (
              <a
                href={`tel:${selectedRequest.phone}`}
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#0a56a4]"
              >
                <Phone size={16} />
                {selectedRequest.phone}
              </a>
            )}

            {selectedRequest.email && (
              <a
                href={`mailto:${selectedRequest.email}`}
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#0a56a4]"
              >
                <Mail size={16} />
                {selectedRequest.email}
              </a>
            )}
          </div>

          <div className="rounded-2xl bg-blue-50 p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#0a56a4]">
              Informations
            </p>

            <p className="mt-3 text-sm font-bold text-[#092e63]">
              {selectedRequest.subject || "Sans objet"}
            </p>

            {selectedRequest.request_type === "appointment" && (
              <div className="mt-3 text-sm text-slate-600">
                <p>
                  Date souhaitée :{" "}
                  <strong>{formatDate(selectedRequest.preferred_date)}</strong>
                </p>
                <p className="mt-1">
                  Heure souhaitée :{" "}
                  <strong>
                    {selectedRequest.preferred_time || "Non renseignée"}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-blue-100 bg-white p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
            Message reçu
          </p>
          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">
            {selectedRequest.message}
          </p>
        </section>

        {selectedRequest.request_type === "testimony" && (
          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-blue-50 p-5">
            <input
              type="checkbox"
              checked={draftTestimonyPublic}
              onChange={(event) =>
                setDraftTestimonyPublic(event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#0a56a4]"
            />

            <span className="text-sm leading-6 text-slate-700">
              Témoignage autorisé pour une éventuelle publication après
              validation de l’équipe de communication.
            </span>
          </label>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-[190px_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Statut
            </span>

            <select
              value={draftStatus}
              onChange={(event) =>
                setDraftStatus(event.target.value as RequestStatus)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0a56a4]"
            >
              <option value="new">Nouveau</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Traité</option>
              <option value="declined">Refusé</option>
              <option value="archived">Archivé</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Notes internes
            </span>

            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              className="min-h-28 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
              placeholder="Notes visibles uniquement dans l’administration..."
            />
          </label>
        </div>

        {actionError && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {actionError}
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={closeDialog}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={saveRequest}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <LoaderCircle className="animate-spin" size={17} />
                Enregistrement…
              </>
            ) : (
              <>
                <Save size={17} />
                Enregistrer le suivi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</div>

);
}
