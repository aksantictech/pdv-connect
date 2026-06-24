"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
BookOpen,
CheckCircle2,
Eye,
LoaderCircle,
Mail,
MapPin,
Pencil,
Phone,
Plus,
Power,
UserRound,
Users,
X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";
import PhotoPicker from "./PhotoPicker";
import type {
ChurchPastor,
PastorAssemblyOption,
PastorGender,
PastorMaritalStatus,
PastorRole,
} from "../../types/pastors";
import {
pastorGenderLabels,
pastorMaritalStatusLabels,
pastoralRoleLabels,
} from "../../types/pastors";

type PastorsManagerProps = {
initialPastors: ChurchPastor[];
assemblies: PastorAssemblyOption[];
loadError: string | null;
};

type PastorForm = {
assemblyId: string;
pastoralTitle: string;
pastoralRole: PastorRole;
firstName: string;
lastName: string;
gender: PastorGender;
phone: string;
email: string;
dateOfBirth: string;
dateOfConsecration: string;
maritalStatus: PastorMaritalStatus;
spouseName: string;
childrenCount: string;
biography: string;
isPublic: boolean;
isActive: boolean;
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function createEmptyForm(assemblies: PastorAssemblyOption[]): PastorForm {
return {
assemblyId: assemblies[0]?.id ?? "",
pastoralTitle: "Pasteur",
pastoralRole: "pasteur_assemblee",
firstName: "",
lastName: "",
gender: "homme",
phone: "",
email: "",
dateOfBirth: "",
dateOfConsecration: "",
maritalStatus: "non_renseigne",
spouseName: "",
childrenCount: "0",
biography: "",
isPublic: true,
isActive: true,
};
}

function formatDate(value: string | null) {
if (!value) {
return "Non renseignée";
}

return new Intl.DateTimeFormat("fr-FR").format(
new Date(`${value}T12:00:00`)
);
}

function getInitials(firstName: string, lastName: string) {
return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function PastorsManager({
initialPastors,
assemblies,
loadError,
}: PastorsManagerProps) {
const router = useRouter();
const supabase = createClient();

const [formOpen, setFormOpen] = useState(false);
const [viewingPastor, setViewingPastor] = useState<ChurchPastor | null>(
null
);
const [editingPastor, setEditingPastor] = useState<ChurchPastor | null>(
null
);

const [form, setForm] = useState<PastorForm>(() =>
createEmptyForm(assemblies)
);

const [photoFile, setPhotoFile] = useState<File | null>(null);
const [loading, setLoading] = useState(false);
const [actionId, setActionId] = useState<string | null>(null);
const [formError, setFormError] = useState("");
const [formMessage, setFormMessage] = useState("");

const activePastors = initialPastors.filter(
(pastor) => pastor.is_active
).length;

const publicPastors = initialPastors.filter(
(pastor) => pastor.is_active && pastor.is_public
).length;

function updateForm<K extends keyof PastorForm>(
field: K,
value: PastorForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function closeForm() {
setFormOpen(false);
setEditingPastor(null);
setForm(createEmptyForm(assemblies));
setPhotoFile(null);
setFormError("");
setFormMessage("");
}

function openCreate() {
setEditingPastor(null);
setForm(createEmptyForm(assemblies));
setPhotoFile(null);
setFormError("");
setFormMessage("");
setFormOpen(true);
}

function openEdit(pastor: ChurchPastor) {
setEditingPastor(pastor);
setPhotoFile(null);
setFormError("");
setFormMessage("");

setForm({
  assemblyId: pastor.assembly_id,
  pastoralTitle: pastor.pastoral_title || "Pasteur",
  pastoralRole: pastor.pastoral_role,
  firstName: pastor.first_name,
  lastName: pastor.last_name,
  gender: pastor.gender,
  phone: pastor.phone ?? "",
  email: pastor.email ?? "",
  dateOfBirth: pastor.date_of_birth ?? "",
  dateOfConsecration: pastor.date_of_consecration ?? "",
  maritalStatus: pastor.marital_status,
  spouseName: pastor.spouse_name ?? "",
  childrenCount: String(pastor.children_count ?? 0),
  biography: pastor.biography ?? "",
  isPublic: pastor.is_public,
  isActive: pastor.is_active,
});

setFormOpen(true);

}

async function uploadPastorPhoto(pastorId: string) {
if (!photoFile) {
return;
}

const extension =
  photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

const photoPath = `pastors/${pastorId}/${crypto.randomUUID()}.${extension}`;

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

const { error: updateError } = await supabase.rpc(
  "update_church_pastor_photo",
  {
    p_pastor_id: pastorId,
    p_photo_path: photoPath,
  }
);

if (updateError) {
  throw new Error(updateError.message);
}

}

async function savePastor(event: FormEvent<HTMLFormElement>) {
event.preventDefault();


setFormError("");
setFormMessage("");

if (!form.assemblyId) {
  setFormError("Veuillez sélectionner une assemblée.");
  return;
}

if (!form.firstName.trim() || !form.lastName.trim()) {
  setFormError("Le prénom et le nom sont obligatoires.");
  return;
}

const childrenCount = Number(form.childrenCount || "0");

if (!Number.isInteger(childrenCount) || childrenCount < 0) {
  setFormError("Le nombre d’enfants doit être un entier positif.");
  return;
}

setLoading(true);

try {
  const { data, error } = await supabase.rpc("save_church_pastor", {
    p_payload: {
      pastor_id: editingPastor?.id ?? null,
      assembly_id: form.assemblyId,
      pastoral_title: form.pastoralTitle.trim() || "Pasteur",
      pastoral_role: form.pastoralRole,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      gender: form.gender,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      date_of_birth: form.dateOfBirth || null,
      date_of_consecration: form.dateOfConsecration || null,
      marital_status: form.maritalStatus,
      spouse_name: form.spouseName.trim() || null,
      children_count: childrenCount,
      biography: form.biography.trim() || null,
      is_public: form.isPublic,
      is_active: form.isActive,
    },
  });

  if (error || !data) {
    throw new Error(
      error?.message || "Impossible d’enregistrer le dossier pastoral."
    );
  }

  await uploadPastorPhoto(String(data));

  setFormMessage(
    editingPastor
      ? "Le dossier pastoral a été mis à jour."
      : "Le pasteur a été enregistré avec succès."
  );

  router.refresh();

  window.setTimeout(() => {
    closeForm();
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

async function togglePastorStatus(pastor: ChurchPastor) {
const actionLabel = pastor.is_active ? "désactiver" : "réactiver";


const confirmed = window.confirm(
  `Voulez-vous vraiment ${actionLabel} le dossier de ${pastor.pastoral_title} ${pastor.first_name} ${pastor.last_name} ?`
);

if (!confirmed) {
  return;
}

setActionId(pastor.id);

try {
  const { error } = await supabase.rpc("set_church_pastor_status", {
    p_pastor_id: pastor.id,
    p_is_active: !pastor.is_active,
  });

  if (error) {
    throw new Error(error.message);
  }

  router.refresh();
} catch (error) {
  window.alert(
    error instanceof Error
      ? error.message
      : "Impossible de modifier le statut du pasteur."
  );
} finally {
  setActionId(null);
}

}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Leadership spirituel </p>

      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Gestion des Pasteurs
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Centralisez les dossiers pastoraux, les assemblées, les
        coordonnées, les responsabilités et la visibilité publique.
      </p>
    </div>

    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <Plus size={19} />
      Ajouter un pasteur
    </button>
  </section>

  {loadError ? (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      {loadError}
    </div>
  ) : (
    <>
      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Users className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialPastors.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Dossiers pastoraux
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activePastors}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Pasteurs actifs
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
          <BookOpen className="text-violet-700" size={25} />
          <p className="mt-6 text-3xl font-black text-violet-900">
            {publicPastors}
          </p>
          <p className="mt-2 font-bold text-violet-800">
            Visibles publiquement
          </p>
        </article>
      </section>

      {initialPastors.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center">
          <UserRound className="mx-auto text-blue-200" size={42} />
          <p className="mt-4 font-black text-[#092e63]">
            Aucun pasteur enregistré
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Créez le premier dossier pastoral de CEF Parole de Vie.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialPastors.map((pastor) => (
            <article
              key={pastor.id}
              className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-48 bg-gradient-to-br from-[#061d45] to-[#1680c4]">
                {pastor.photo_url ? (
                  <img
                    src={pastor.photo_url}
                    alt={`${pastor.first_name} ${pastor.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-3xl font-black text-white">
                      {getInitials(pastor.first_name, pastor.last_name)}
                    </span>
                  </div>
                )}

                <span
                  className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold ${
                    pastor.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {pastor.is_active ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="p-6">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  {pastoralRoleLabels[pastor.pastoral_role]}
                </p>

                <h2 className="mt-2 text-xl font-black text-[#092e63]">
                  {pastor.pastoral_title} {pastor.first_name}{" "}
                  {pastor.last_name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    {pastor.assembly
                      ? `${pastor.assembly.name}${
                          pastor.assembly.city
                            ? ` — ${pastor.assembly.city}`
                            : ""
                        }`
                      : "Assemblée non renseignée"}
                  </p>

                  {pastor.phone && (
                    <p className="flex gap-2">
                      <Phone
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0a56a4]"
                      />
                      {pastor.phone}
                    </p>
                  )}

                  {pastor.email && (
                    <p className="flex gap-2">
                      <Mail
                        size={17}
                        className="mt-0.5 shrink-0 text-[#0a56a4]"
                      />
                      <span className="truncate">{pastor.email}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingPastor(pastor)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 px-3 py-2.5 text-xs font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                  >
                    <Eye size={15} />
                    Voir
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(pastor)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 px-3 py-2.5 text-xs font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                  >
                    <Pencil size={15} />
                    Modifier
                  </button>

                  <button
                    type="button"
                    disabled={actionId === pastor.id}
                    onClick={() => togglePastorStatus(pastor)}
                    className={`inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-extrabold transition disabled:opacity-70 ${
                      pastor.is_active
                        ? "border border-red-200 text-red-700 hover:bg-red-50"
                        : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {actionId === pastor.id ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Power size={15} />
                    )}
                    {pastor.is_active ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  )}

  {formOpen && (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              Leadership spirituel
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              {editingPastor
                ? "Modifier le dossier pastoral"
                : "Ajouter un pasteur"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={savePastor} className="p-6 sm:p-8">
          {formError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {formError}
            </div>
          )}

          {formMessage && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0" />
              {formMessage}
            </div>
          )}

          {editingPastor?.photo_url && !photoFile && (
            <div className="mb-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <img
                src={editingPastor.photo_url}
                alt="Photo actuelle du pasteur"
                className="h-16 w-16 rounded-full object-cover"
              />
              <p className="text-sm text-slate-600">
                Photo actuelle. Vous pouvez la remplacer ci-dessous.
              </p>
            </div>
          )}

          <div className="mb-7">
            <PhotoPicker
              label="Photo du pasteur"
              file={photoFile}
              onChange={setPhotoFile}
              onError={setFormError}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Assemblée *
              </span>

              <select
                value={form.assemblyId}
                onChange={(event) =>
                  updateForm("assemblyId", event.target.value)
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
                Responsabilité pastorale *
              </span>

              <select
                value={form.pastoralRole}
                onChange={(event) =>
                  updateForm(
                    "pastoralRole",
                    event.target.value as PastorRole
                  )
                }
                className={inputClassName}
              >
                {(Object.entries(pastoralRoleLabels) as [
                  PastorRole,
                  string
                ][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Titre pastoral
              </span>

              <input
                value={form.pastoralTitle}
                onChange={(event) =>
                  updateForm("pastoralTitle", event.target.value)
                }
                placeholder="Ex. Pasteur, Révérend Pasteur..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Genre
              </span>

              <select
                value={form.gender}
                onChange={(event) =>
                  updateForm(
                    "gender",
                    event.target.value as PastorGender
                  )
                }
                className={inputClassName}
              >
                {(Object.entries(pastorGenderLabels) as [
                  PastorGender,
                  string
                ][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Prénom *
              </span>

              <input
                value={form.firstName}
                onChange={(event) =>
                  updateForm("firstName", event.target.value)
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
                  updateForm("lastName", event.target.value)
                }
                className={inputClassName}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Téléphone
              </span>

              <input
                value={form.phone}
                onChange={(event) =>
                  updateForm("phone", event.target.value)
                }
                placeholder="+243 ..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Adresse e-mail
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateForm("email", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Date de naissance
              </span>

              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) =>
                  updateForm("dateOfBirth", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Date de consécration
              </span>

              <input
                type="date"
                value={form.dateOfConsecration}
                onChange={(event) =>
                  updateForm("dateOfConsecration", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                État civil
              </span>

              <select
                value={form.maritalStatus}
                onChange={(event) =>
                  updateForm(
                    "maritalStatus",
                    event.target.value as PastorMaritalStatus
                  )
                }
                className={inputClassName}
              >
                {(Object.entries(pastorMaritalStatusLabels) as [
                  PastorMaritalStatus,
                  string
                ][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nom du conjoint / de la conjointe
              </span>

              <input
                value={form.spouseName}
                onChange={(event) =>
                  updateForm("spouseName", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nombre d’enfants
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.childrenCount}
                onChange={(event) =>
                  updateForm("childrenCount", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Biographie / présentation publique
              </span>

              <textarea
                value={form.biography}
                onChange={(event) =>
                  updateForm("biography", event.target.value)
                }
                placeholder="Présentez brièvement le parcours, la vision et le ministère du pasteur..."
                className={`${inputClassName} min-h-32 resize-y`}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.isPublic}
                onChange={(event) =>
                  updateForm("isPublic", event.target.checked)
                }
                className="h-4 w-4 accent-[#0a56a4]"
              />
              Afficher ce pasteur sur la page publique
            </label>

            {editingPastor && (
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateForm("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#0a56a4]"
                />
                Dossier pastoral actif
              </label>
            )}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <UserRound size={18} />
                  {editingPastor
                    ? "Enregistrer les modifications"
                    : "Créer le dossier pastoral"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {viewingPastor && (
    <div className="fixed inset-0 z-[190] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-gradient-to-r from-[#061d45] to-[#1680c4] p-6 text-white">
          <div className="flex items-center gap-4">
            {viewingPastor.photo_url ? (
              <img
                src={viewingPastor.photo_url}
                alt={`${viewingPastor.first_name} ${viewingPastor.last_name}`}
                className="h-20 w-20 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/10 text-2xl font-black">
                {getInitials(
                  viewingPastor.first_name,
                  viewingPastor.last_name
                )}
              </span>
            )}

            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-100">
                {pastoralRoleLabels[viewingPastor.pastoral_role]}
              </p>

              <h2 className="mt-2 text-2xl font-black">
                {viewingPastor.pastoral_title} {viewingPastor.first_name}{" "}
                {viewingPastor.last_name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setViewingPastor(null)}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10"
            aria-label="Fermer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              Assemblée
            </p>
            <p className="mt-2 font-black text-[#092e63]">
              {viewingPastor.assembly?.name || "Non renseignée"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {viewingPastor.assembly?.city || "Ville non renseignée"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              Situation familiale
            </p>
            <p className="mt-2 font-black text-[#092e63]">
              {pastorMaritalStatusLabels[viewingPastor.marital_status]}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Conjoint(e) : {viewingPastor.spouse_name || "Non renseigné"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Enfants : {viewingPastor.children_count}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              Coordonnées
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Téléphone : {viewingPastor.phone || "Non renseigné"}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              E-mail : {viewingPastor.email || "Non renseigné"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              Parcours pastoral
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Naissance : {formatDate(viewingPastor.date_of_birth)}
            </p>
            <p className="mt-1 text-sm text-slate-700">
              Consécration : {formatDate(viewingPastor.date_of_consecration)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
              Biographie
            </p>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
              {viewingPastor.biography ||
                "Aucune biographie n’a encore été ajoutée."}
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 p-5">
          <button
            type="button"
            onClick={() => {
              setViewingPastor(null);
              openEdit(viewingPastor);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
          >
            <Pencil size={17} />
            Modifier le dossier
          </button>
        </div>
      </div>
    </div>
  )}
</div>

);
}
