"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Pencil,
  Save,
  UserRound,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import PhotoPicker from "./PhotoPicker";
import type {
  AssemblyOption,
  ChurchMember,
  DepartmentOption,
  MemberStatus,
} from "../../types/members";
import { memberStatusLabels } from "../../types/members";
import {
  isKinshasaCity,
  KINSHASA_COMMUNES,
  MARITAL_STATUS_OPTIONS,
} from "@/lib/form-options";

type MemberActionsProps = {
  member: ChurchMember;
  assemblies: AssemblyOption[];
  departments: DepartmentOption[];
};

type EditForm = {
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

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function formatDate(date: string | null) {
  if (!date) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function createEditForm(member: ChurchMember): EditForm {
  const activeDepartment = (member.member_departments ?? []).find(
    (assignment) => assignment.is_active
  );

  return {
    assemblyId: member.assembly_id,
    firstName: member.first_name,
    lastName: member.last_name,
    gender: member.gender ?? "",
    phone: member.phone ?? "",
    email: member.email ?? "",
    country: member.country ?? "RDC",
    city: member.city ?? "",
    commune: member.commune ?? "",
    maritalStatus: member.marital_status ?? "",
    occupation: member.occupation ?? "",
    joinedAt: member.joined_at ?? new Date().toISOString().slice(0, 10),
    status: member.status,
    departmentId: activeDepartment?.department?.id ?? "",
    functionName: activeDepartment?.function_name ?? "Membre",
    notes: member.notes ?? "",
  };
}

export default function MemberActions({
  member,
  assemblies,
  departments,
}: MemberActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"view" | "edit" | null>(null);
  const [form, setForm] = useState<EditForm>(() => createEditForm(member));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const availableDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.assembly_id === form.assemblyId
      ),
    [departments, form.assemblyId]
  );

  function updateField<K extends keyof EditForm>(
    field: K,
    value: EditForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openEdit() {
    setForm(createEditForm(member));
    setPhotoFile(null);
    setErrorMessage("");
    setStatusMessage("");
    setMode("edit");
  }

  function closeModal() {
    setMode(null);
    setPhotoFile(null);
    setErrorMessage("");
    setStatusMessage("");
  }

  async function updatePhoto() {
    if (!photoFile) return;

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const photoPath = `members/${member.id}/${crypto.randomUUID()}.${extension}`;

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

    const { error: photoError } = await supabase.rpc(
      "update_member_photo",
      {
        p_member_id: member.id,
        p_photo_path: photoPath,
      }
    );

    if (photoError) {
      throw new Error(photoError.message);
    }
  }

  async function saveMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setStatusMessage("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrorMessage("Le prénom et le nom sont obligatoires.");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.rpc("update_member_record", {
        p_member_id: member.id,
        p_assembly_id: form.assemblyId,
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

      if (error) {
        throw new Error(error.message);
      }

      await updatePhoto();

      setStatusMessage("Les informations du membre ont été mises à jour.");
      router.refresh();

      window.setTimeout(closeModal, 800);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l’enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActiveStatus() {
    const action = member.is_active ? "désactiver" : "réactiver";

    const confirmed = window.confirm(
      `Confirmer : ${action} le compte de ${member.first_name} ${member.last_name} ?`
    );

    if (!confirmed) return;

    setSaving(true);

    const { error } = await supabase.rpc("set_member_active_status", {
      p_member_id: member.id,
      p_is_active: !member.is_active,
    });

    setSaving(false);

    if (error) {
      window.alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => setMode("view")}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-xs font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
        >
          <Eye size={16} />
          Voir
        </button>

        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-xs font-extrabold text-amber-800 transition hover:bg-amber-50"
        >
          <Pencil size={16} />
          Modifier
        </button>

        <button
          type="button"
          onClick={toggleActiveStatus}
          disabled={saving}
          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition disabled:opacity-60 ${
            member.is_active
              ? "border border-red-200 text-red-700 hover:bg-red-50"
              : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <Ban size={16} />
          {member.is_active ? "Désactiver" : "Réactiver"}
        </button>
      </div>

      {mode === "view" && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-2xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-7">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Dossier membre
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {member.first_name} {member.last_name}
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

            <div className="grid gap-7 p-7 sm:grid-cols-[150px_1fr]">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl bg-blue-100 text-[#0a3d82]">
                {member.photo_url ? (
                  <img
                    src={member.photo_url}
                    alt={`${member.first_name} ${member.last_name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={48} />
                )}
              </div>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Téléphone :</strong> {member.phone || "Non renseigné"}
                </p>
                <p>
                  <strong>E-mail :</strong> {member.email || "Non renseigné"}
                </p>
                <p>
                  <strong>Ville :</strong>{" "}
                  {[member.commune, member.city, member.country]
                    .filter(Boolean)
                    .join(", ") || "Non renseignée"}
                </p>
                <p>
                  <strong>État civil :</strong>{" "}
                  {member.marital_status || "Non renseigné"}
                </p>
                <p>
                  <strong>Profession :</strong>{" "}
                  {member.occupation || "Non renseignée"}
                </p>
                <p>
                  <strong>Date d’intégration :</strong>{" "}
                  {formatDate(member.joined_at)}
                </p>
              </div>
            </div>

            {member.notes && (
              <div className="mx-7 mb-7 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                <strong className="block text-[#092e63]">Notes</strong>
                <span className="mt-2 block">{member.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === "edit" && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Mise à jour membre
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  Modifier {member.first_name} {member.last_name}
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

            <form onSubmit={saveMember} className="p-6 sm:p-8">
              {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {statusMessage && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  <CheckCircle2 size={19} className="shrink-0" />
                  {statusMessage}
                </div>
              )}

              <div className="mb-7">
                <PhotoPicker
                  label="Remplacer la photo du membre"
                  file={photoFile}
                  onChange={setPhotoFile}
                  onError={setErrorMessage}
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
                      updateField("assemblyId", event.target.value);
                      updateField("departmentId", "");
                    }}
                    className={inputClassName}
                  >
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
                      updateField("joinedAt", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Prénom *
                  </span>
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nom *
                  </span>
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Sexe
                  </span>
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      updateField("gender", event.target.value)
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
                      updateField(
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
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
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
                      updateField("email", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Ville
                  </span>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateField("city", event.target.value)
                    }
                    placeholder="Ex. Kinshasa"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Commune / Quartier
                  </span>

                  {isKinshasaCity(form.city) ? (
                    <select
                      value={form.commune}
                      onChange={(event) =>
                        updateField("commune", event.target.value)
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
                      value={form.commune}
                      onChange={(event) =>
                        updateField("commune", event.target.value)
                      }
                      placeholder="Quartier, commune ou territoire"
                      className={inputClassName}
                    />
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    État civil
                  </span>
                  <select
                    value={form.maritalStatus}
                    onChange={(event) =>
                      updateField("maritalStatus", event.target.value)
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
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Profession
                  </span>
                  <input
                    value={form.occupation}
                    onChange={(event) =>
                      updateField("occupation", event.target.value)
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
                      updateField("departmentId", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="">Aucun département</option>
                    {availableDepartments.map((department) => (
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
                    value={form.functionName}
                    onChange={(event) =>
                      updateField("functionName", event.target.value)
                    }
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
                      updateField("notes", event.target.value)
                    }
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
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}