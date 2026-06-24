"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  LoaderCircle,
  Plus,
  Search,
  UserRoundPlus,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  AssemblyOption,
  ChurchMember,
  DepartmentOption,
  MemberStatus,
} from "@/types/members";
import { UserRound } from "lucide-react";
import {
  memberStatusLabels,
  memberStatusStyles,
} from "@/types/members";
import PhotoPicker from "./PhotoPicker";
import MemberActions from "./MemberActions";
import {
  isKinshasaCity,
  KINSHASA_COMMUNES,
  MARITAL_STATUS_OPTIONS,
} from "@/lib/form-options";

type MembersManagerProps = {
  initialMembers: ChurchMember[];
  assemblies: AssemblyOption[];
  departments: DepartmentOption[];
  loadError: string | null;
};

type MemberForm = {
  assemblyId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  commune: string;
  maritalStatus: string;
  occupation: string;
  joinedAt: string;
  status: MemberStatus;
  departmentId: string;
  functionName: string;
  notes: string;
};

const initialForm: MemberForm = {
  assemblyId: "",
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  country: "RDC",
  city: "",
  commune: "",
  maritalStatus: "",
  occupation: "",
  joinedAt: new Date().toISOString().slice(0, 10),
  status: "membre_actif",
  departmentId: "",
  functionName: "Membre",
  notes: "",
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function formatDate(date: string | null) {
  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default function MembersManager({
  initialMembers,
  assemblies,
  departments,
  loadError,
}: MembersManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "all">(
    "all"
  );
  const [form, setForm] = useState<MemberForm>({
    ...initialForm,
    assemblyId: assemblies[0]?.id ?? "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const assemblyDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.assembly_id === form.assemblyId
      ),
    [departments, form.assemblyId]
  );

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return initialMembers.filter((member) => {
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;

      const departmentNames = (member.member_departments ?? [])
        .map((item) => item.department?.name ?? "")
        .join(" ");

      const text = [
        member.member_number,
        member.first_name,
        member.last_name,
        member.phone,
        member.email,
        member.assembly?.name,
        departmentNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && text.includes(keyword);
    });
  }, [initialMembers, search, statusFilter]);

  const activeCount = initialMembers.filter(
    (member) => member.status === "membre_actif"
  ).length;

  const workersCount = initialMembers.filter((member) =>
    ["ouvrier", "responsable"].includes(member.status)
  ).length;

  function updateForm<K extends keyof MemberForm>(
    field: K,
    value: MemberForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeForm() {
    setShowForm(false);
    setFormError("");
    setFormMessage("");
    setPhotoFile(null);
    setForm({
      ...initialForm,
      assemblyId: assemblies[0]?.id ?? "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    setSubmitting(true);

const { data: memberId, error } = await supabase.rpc(
  "create_member_record",
  {      p_assembly_id: form.assemblyId,
      p_first_name: form.firstName.trim(),
      p_last_name: form.lastName.trim(),
      p_phone: form.phone || null,
      p_gender: form.gender || null,
      p_email: form.email || null,
      p_country: form.country || "RDC",
      p_city: form.city || null,
      p_commune: form.commune || null,
      p_marital_status: form.maritalStatus || null,
      p_occupation: form.occupation || null,
      p_joined_at: form.joinedAt,
      p_status: form.status,
      p_department_id: form.departmentId || null,
      p_function_name: form.functionName || "Membre",
      p_notes: form.notes || null,
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }
    if (photoFile && memberId) {
  const extension =
    photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

  const photoPath = `members/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("pdv-media")
    .upload(photoPath, photoFile, {
      cacheControl: "3600",
      contentType: photoFile.type,
      upsert: false,
    });

  if (uploadError) {
    setFormError(
      "Le membre a été créé, mais la photo n’a pas pu être envoyée : " +
        uploadError.message
    );
    router.refresh();
    return;
  }

  const { error: photoError } = await supabase.rpc(
    "update_member_photo",
    {
      p_member_id: memberId,
      p_photo_path: photoPath,
    }
  );

  if (photoError) {
    setFormError(
      "Le membre a été créé, mais l’association de la photo a échoué : " +
        photoError.message
    );
    router.refresh();
    return;
  }
}

    setFormMessage("Le membre a été créé avec succès.");
    router.refresh();

    window.setTimeout(() => {
      closeForm();
    }, 900);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Communauté
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Gestion des membres
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Centralisez les dossiers, statuts, assemblées et ministères des
            membres de CEF Parole de Vie.
          </p>
        </div>


        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Ajouter un membre
        </button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Users className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialMembers.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">Membres enregistrés</p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activeCount}
          </p>
          <p className="mt-2 font-bold text-emerald-800">Membres actifs</p>
        </article>

        <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <UserRoundPlus className="text-cyan-700" size={25} />
          <p className="mt-6 text-3xl font-black text-cyan-900">
            {workersCount}
          </p>
          <p className="mt-2 font-bold text-cyan-800">
            Ouvriers et responsables
          </p>
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
              placeholder="Rechercher un membre, téléphone ou département..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as MemberStatus | "all")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(memberStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {loadError ? (
          <div className="p-10 text-center text-red-700">{loadError}</div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto text-blue-200" size={40} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucun membre trouvé
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ajoutez un membre ou modifiez votre recherche.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMembers.map((member) => {
  const activeDepartment = (member.member_departments ?? []).find(
    (item) => item.is_active
  );

  return (
    <article
      key={member.id}
      className="grid gap-5 px-6 py-5 transition hover:bg-blue-50/60 xl:grid-cols-[minmax(0,1fr)_minmax(240px,0.7fr)_auto] xl:items-center"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-[#0a3d82]">
          {member.photo_url ? (
            <img
              src={member.photo_url}
              alt={`${member.first_name} ${member.last_name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRound size={23} />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-black text-[#092e63]">
              {member.first_name} {member.last_name}
            </p>

            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                memberStatusStyles[member.status]
              }`}
            >
              {memberStatusLabels[member.status]}
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {member.member_number || "Référence en génération"} •{" "}
            {member.phone || "Téléphone non renseigné"}
          </p>
        </div>
      </div>

      <div className="text-sm xl:text-right">
        <p className="font-bold text-slate-700">
          {member.assembly?.name || "Assemblée non renseignée"}
        </p>

        <p className="mt-1 text-slate-500">
          {activeDepartment?.department?.name || "Aucun département"}
          {activeDepartment?.function_name
            ? ` • ${activeDepartment.function_name}`
            : ""}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Intégré le {formatDate(member.joined_at)}
        </p>
      </div>

      <MemberActions
        member={member}
        assemblies={assemblies}
        departments={departments}
      />
    </article>
  );
})}
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Nouveau dossier
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  Ajouter un membre
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
<div className="mb-7">
  <PhotoPicker
    label="Photo du membre"
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
                    onChange={(event) => {
                      updateForm("assemblyId", event.target.value);
                      updateForm("departmentId", "");
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
                    Date d’intégration
                  </span>

                  <input
                    type="date"
                    value={form.joinedAt}
                    onChange={(event) =>
                      updateForm("joinedAt", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Prénom *
                  </span>

                  <input
                    type="text"
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
                    type="text"
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
                    Sexe
                  </span>

                  <select
                    value={form.gender}
                    onChange={(event) =>
                      updateForm("gender", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Non renseigné</option>
                    <option value="Femme">Femme</option>
                    <option value="Homme">Homme</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Statut
                  </span>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as MemberStatus
                      )
                    }
                    className={inputClassName}
                  >
                    {Object.entries(memberStatusLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone
                  </span>

                  <input
                    type="tel"
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
                    Ville
                  </span>

                  <input
                    type="text"
                    value={form.city}
                    onChange={(event) =>
                      updateForm("city", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    {isKinshasaCity(form.city) ? (
  <select
    value={form.commune}
    onChange={(event) =>
      updateForm("commune", event.target.value)
    }
    className={inputClassName}
  >
    <option value="">Sélectionnez une commune</option>

    {KINSHASA_COMMUNES.map((commune) => (
      <option key={commune} value={commune}>
        {commune}
      </option>
    ))}
  </select>
) : (
  <input
    type="text"
    value={form.commune}
    onChange={(event) =>
      updateForm("commune", event.target.value)
    }
    placeholder="Quartier, commune ou territoire"
    className={inputClassName}
  />
)}
                  </span>

                  <input
                    type="text"
                    value={form.commune}
                    onChange={(event) =>
                      updateForm("commune", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    <select
  value={form.maritalStatus}
  onChange={(event) =>
    updateForm("maritalStatus", event.target.value)
  }
  className={inputClassName}
>
  <option value="">Non renseigné</option>
  {MARITAL_STATUS_OPTIONS.map((status) => (
    <option key={status} value={status}>
      {status}
    </option>
  ))}
</select>
                  </span>

                  <input
                    type="text"
                    value={form.maritalStatus}
                    onChange={(event) =>
                      updateForm("maritalStatus", event.target.value)
                    }
                    placeholder="Célibataire, marié(e)..."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Profession
                  </span>

                  <input
                    type="text"
                    value={form.occupation}
                    onChange={(event) =>
                      updateForm("occupation", event.target.value)
                    }
                    className={inputClassName}
                  />
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
                    disabled={!form.assemblyId}
                  >
                    <option value="">Aucun département pour le moment</option>

                    {assemblyDepartments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Fonction dans le département
                  </span>

                  <input
                    type="text"
                    value={form.functionName}
                    onChange={(event) =>
                      updateForm("functionName", event.target.value)
                    }
                    placeholder="Ex. Membre, choriste, responsable..."
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Notes
                  </span>

                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    className={`${inputClassName} min-h-28 resize-y`}
                    placeholder="Informations complémentaires ou notes pastorales..."
                  />
                </label>
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
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Création…
                    </>
                  ) : (
                    <>
                      <UserRoundPlus size={18} />
                      Créer le membre
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