"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  Building2,
  CheckCircle2,
  ClipboardList,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type {
  DepartmentAssembly,
  DepartmentMember,
  DepartmentRecord,
} from "@/types/departments";

type DepartmentsManagerProps = {
  initialDepartments: DepartmentRecord[];
  assemblies: DepartmentAssembly[];
  members: DepartmentMember[];
  loadError: string | null;
};

type DepartmentForm = {
  assemblyId: string;
  name: string;
  code: string;
  description: string;
  objectives: string;
  meetingFrequency: string;
  responsibleMemberId: string;
};

const meetingFrequencies = [
  "Hebdomadaire",
  "Bimensuelle",
  "Mensuelle",
  "Trimestrielle",
  "Selon le programme",
];

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function makeEmptyForm(assemblyId = ""): DepartmentForm {
  return {
    assemblyId,
    name: "",
    code: "",
    description: "",
    objectives: "",
    meetingFrequency: "Mensuelle",
    responsibleMemberId: "",
  };
}

export default function DepartmentsManager({
  initialDepartments,
  assemblies,
  members,
  loadError,
}: DepartmentsManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"create" | "edit" | "view" | null>(null);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentRecord | null>(null);

  const [form, setForm] = useState<DepartmentForm>(() =>
    makeEmptyForm(assemblies[0]?.id ?? "")
  );

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const activeDepartments = initialDepartments.filter(
    (department) => department.is_active
  ).length;

  const inactiveDepartments = initialDepartments.filter(
    (department) => !department.is_active
  ).length;

  const availableMembers = useMemo(
    () =>
      members.filter((member) => member.assembly_id === form.assemblyId),
    [members, form.assemblyId]
  );

  function updateForm<K extends keyof DepartmentForm>(
    field: K,
    value: DepartmentForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeModal() {
    setMode(null);
    setSelectedDepartment(null);
    setForm(makeEmptyForm(assemblies[0]?.id ?? ""));
    setFormError("");
    setFormMessage("");
  }

  function openCreate() {
    setSelectedDepartment(null);
    setForm(makeEmptyForm(assemblies[0]?.id ?? ""));
    setFormError("");
    setFormMessage("");
    setMode("create");
  }

  function openView(department: DepartmentRecord) {
    setSelectedDepartment(department);
    setMode("view");
  }

  function openEdit(department: DepartmentRecord) {
    setSelectedDepartment(department);

    setForm({
      assemblyId: department.assembly_id,
      name: department.name,
      code: department.code ?? "",
      description: department.description ?? "",
      objectives: department.objectives ?? "",
      meetingFrequency: department.meeting_frequency ?? "Mensuelle",
      responsibleMemberId: department.responsible_member_id ?? "",
    });

    setFormError("");
    setFormMessage("");
    setMode("edit");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormMessage("");

    if (!form.assemblyId) {
      setFormError("Veuillez sélectionner une assemblée.");
      return;
    }

    if (!form.name.trim()) {
      setFormError("Le nom du département est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && selectedDepartment) {
        const { error } = await supabase.rpc("update_department_record", {
          p_department_id: selectedDepartment.id,
          p_assembly_id: form.assemblyId,
          p_name: form.name.trim(),
          p_code: form.code || null,
          p_description: form.description || null,
          p_objectives: form.objectives || null,
          p_meeting_frequency: form.meetingFrequency || null,
          p_responsible_member_id: form.responsibleMemberId || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        setFormMessage("Le département a été mis à jour avec succès.");
      } else {
        const { error } = await supabase.rpc("create_department_record", {
          p_assembly_id: form.assemblyId,
          p_name: form.name.trim(),
          p_code: form.code || null,
          p_description: form.description || null,
          p_objectives: form.objectives || null,
          p_meeting_frequency: form.meetingFrequency || null,
          p_responsible_member_id: form.responsibleMemberId || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        setFormMessage("Le département a été créé avec succès.");
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

  async function toggleDepartmentStatus(department: DepartmentRecord) {
    const action = department.is_active ? "désactiver" : "réactiver";

    const confirmed = window.confirm(
      `Confirmer : ${action} le département « ${department.name} » ?`
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase.rpc("set_department_active_status", {
      p_department_id: department.id,
      p_is_active: !department.is_active,
    });

    setLoading(false);

    if (error) {
      window.alert(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Ministères
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Départements et ministères
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Organisez les équipes de service, les responsables, les objectifs
            et les activités de chaque ministère de CEF Parole de Vie.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Ajouter un département
        </button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Building2 className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialDepartments.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Départements enregistrés
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activeDepartments}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Départements actifs
          </p>
        </article>

        <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <Ban className="text-amber-700" size={25} />
          <p className="mt-6 text-3xl font-black text-amber-900">
            {inactiveDepartments}
          </p>
          <p className="mt-2 font-bold text-amber-800">
            Départements inactifs
          </p>
        </article>
      </section>

      {loadError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {loadError}
        </div>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialDepartments.map((department) => (
            <article
              key={department.id}
              className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                  <Users size={24} />
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                    department.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {department.is_active ? "Actif" : "Inactif"}
                </span>
              </div>

              <h2 className="mt-6 text-xl font-black text-[#092e63]">
                {department.name}
              </h2>

              {department.code && (
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#1680c4]">
                  {department.code}
                </p>
              )}

              <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">
                {department.description ||
                  "Aucune description n’a encore été renseignée."}
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
                <p className="font-bold text-[#092e63]">
                  {department.responsible
                    ? `${department.responsible.first_name} ${department.responsible.last_name}`
                    : "Responsable à définir"}
                </p>

                <p className="mt-1 text-slate-500">
                  {department.assembly?.name || "Assemblée non renseignée"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Réunion : {department.meeting_frequency || "Non définie"}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openView(department)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-200 px-2 py-2.5 text-xs font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                >
                  <Eye size={15} />
                  Voir
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(department)}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-amber-200 px-2 py-2.5 text-xs font-extrabold text-amber-800 transition hover:bg-amber-50"
                >
                  <Pencil size={15} />
                  Modifier
                </button>

                <button
                  type="button"
                  onClick={() => toggleDepartmentStatus(department)}
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-xs font-extrabold transition disabled:opacity-60 ${
                    department.is_active
                      ? "border border-red-200 text-red-700 hover:bg-red-50"
                      : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <Ban size={15} />
                  {department.is_active ? "Désactiver" : "Réactiver"}
                </button>
              </div>
            </article>
          ))}

          {initialDepartments.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center">
              <Users className="mx-auto text-blue-200" size={42} />
              <p className="mt-4 font-black text-[#092e63]">
                Aucun département enregistré
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Ajoutez les départements de CEF Parole de Vie pour commencer.
              </p>
            </div>
          )}
        </section>
      )}

      {mode === "view" && selectedDepartment && (
        <div className="fixed inset-0 z-[130] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-2xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-7">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Fiche département
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {selectedDepartment.name}
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
                    Assemblée
                  </p>
                  <p className="mt-2 font-black text-[#092e63]">
                    {selectedDepartment.assembly?.name || "Non renseignée"}
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-xs font-bold uppercase text-[#1680c4]">
                    Responsable
                  </p>
                  <p className="mt-2 font-black text-[#092e63]">
                    {selectedDepartment.responsible
                      ? `${selectedDepartment.responsible.first_name} ${selectedDepartment.responsible.last_name}`
                      : "Non défini"}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-black text-[#092e63]">Description</p>
                <p className="mt-2 leading-7 text-slate-600">
                  {selectedDepartment.description ||
                    "Aucune description n’a été renseignée."}
                </p>
              </div>

              <div>
                <p className="font-black text-[#092e63]">Objectifs</p>
                <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-600">
                  {selectedDepartment.objectives ||
                    "Aucun objectif n’a été renseigné."}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5">
                <ClipboardList className="text-[#0a56a4]" size={22} />
                <p className="text-sm font-bold text-slate-700">
                  Fréquence de réunion :{" "}
                  {selectedDepartment.meeting_frequency || "Non définie"}
                </p>
              </div>
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
                  Ministère
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {mode === "edit"
                    ? "Modifier le département"
                    : "Ajouter un département"}
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
                    Code interne
                  </span>

                  <input
                    value={form.code}
                    onChange={(event) =>
                      updateForm("code", event.target.value)
                    }
                    placeholder="Ex. CHOR, ACC, EVANG"
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nom du département *
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="Ex. Département de la Chorale"
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Responsable
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
                    Fréquence de réunion
                  </span>

                  <select
                    value={form.meetingFrequency}
                    onChange={(event) =>
                      updateForm("meetingFrequency", event.target.value)
                    }
                    className={inputClassName}
                  >
                    {meetingFrequencies.map((frequency) => (
                      <option key={frequency} value={frequency}>
                        {frequency}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Description / mission
                  </span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Rôle principal et mission du département..."
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Objectifs du département
                  </span>

                  <textarea
                    value={form.objectives}
                    onChange={(event) =>
                      updateForm("objectives", event.target.value)
                    }
                    placeholder="Ex. Encadrer la chorale, planifier les répétitions, assurer la qualité musicale..."
                    className={`${inputClassName} min-h-28 resize-y`}
                  />
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
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
                      <Save size={18} />
                      {mode === "edit"
                        ? "Enregistrer les modifications"
                        : "Créer le département"}
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