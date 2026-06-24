"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Globe2,
  LoaderCircle,
  MapPin,
  Pencil,
  Plus,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  COUNTRIES,
  isKinshasaCity,
  KINSHASA_COMMUNES,
} from "@/lib/form-options";
import PhotoPicker from "@/components/admin/PhotoPicker";
import type { AssemblyRecord } from "@/types/assemblies";

type AssembliesManagerProps = {
  initialAssemblies: AssemblyRecord[];
  loadError: string | null;
};

type AssemblyForm = {
  name: string;
  country: string;
  city: string;
  commune: string;
  address: string;
  phone: string;
  email: string;
  pastorName: string;
  timezone: string;
  isActive: boolean;
};

const emptyForm: AssemblyForm = {
  name: "",
  country: "RDC",
  city: "",
  commune: "",
  address: "",
  phone: "",
  email: "",
  pastorName: "",
  timezone: "Africa/Kinshasa",
  isActive: true,
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

export default function AssembliesManager({
  initialAssemblies,
  loadError,
}: AssembliesManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [editingAssembly, setEditingAssembly] =
    useState<AssemblyRecord | null>(null);

  const [form, setForm] = useState<AssemblyForm>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const activeAssemblies = initialAssemblies.filter(
    (assembly) => assembly.is_active
  ).length;

  const coveredCountries = new Set(
    initialAssemblies
      .map((assembly) => assembly.country)
      .filter((country): country is string => Boolean(country))
  ).size;

  function updateForm<K extends keyof AssemblyForm>(
    field: K,
    value: AssemblyForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function closeForm() {
    setShowForm(false);
    setEditingAssembly(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setFormError("");
    setFormMessage("");
  }

  function openCreate() {
    setEditingAssembly(null);
    setForm(emptyForm);
    setPhotoFile(null);
    setFormError("");
    setFormMessage("");
    setShowForm(true);
  }

  function openEdit(assembly: AssemblyRecord) {
    setEditingAssembly(assembly);
    setPhotoFile(null);
    setFormError("");
    setFormMessage("");

    setForm({
      name: assembly.name,
      country: assembly.country || "RDC",
      city: assembly.city ?? "",
      commune: assembly.commune ?? "",
      address: assembly.address ?? "",
      phone: assembly.phone ?? "",
      email: assembly.email ?? "",
      pastorName: assembly.pastor_name ?? "",
      timezone: assembly.timezone || "Africa/Kinshasa",
      isActive: assembly.is_active,
    });

    setShowForm(true);
  }

  async function uploadAssemblyPhoto(assemblyId: string) {
    if (!photoFile) return;

    const extension =
      photoFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const photoPath = `assemblies/${assemblyId}/${crypto.randomUUID()}.${extension}`;

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
      "update_assembly_photo",
      {
        p_assembly_id: assemblyId,
        p_photo_path: photoPath,
      }
    );

    if (photoError) {
      throw new Error(photoError.message);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setFormMessage("");

    if (!form.name.trim()) {
      setFormError("Le nom de l’assemblée est obligatoire.");
      return;
    }

    setLoading(true);

    try {
      let assemblyId = editingAssembly?.id ?? null;

      if (editingAssembly) {
        const { error } = await supabase.rpc("update_assembly_record", {
          p_assembly_id: editingAssembly.id,
          p_name: form.name.trim(),
          p_country: form.country || "RDC",
          p_city: form.city || null,
          p_commune: form.commune || null,
          p_address: form.address || null,
          p_phone: form.phone || null,
          p_email: form.email || null,
          p_pastor_name: form.pastorName || null,
          p_timezone: form.timezone || "Africa/Kinshasa",
          p_is_active: form.isActive,
        });

        if (error) {
          throw new Error(error.message);
        }
      } else {
        const { data, error } = await supabase.rpc(
          "create_assembly_record",
          {
            p_name: form.name.trim(),
            p_country: form.country || "RDC",
            p_city: form.city || null,
            p_commune: form.commune || null,
            p_address: form.address || null,
            p_phone: form.phone || null,
            p_email: form.email || null,
            p_pastor_name: form.pastorName || null,
            p_timezone: form.timezone || "Africa/Kinshasa",
          }
        );

        if (error || !data) {
          throw new Error(
            error?.message ||
              "Impossible de créer l’assemblée pour le moment."
          );
        }

        assemblyId = data as string;
      }

      if (photoFile && assemblyId) {
        await uploadAssemblyPhoto(assemblyId);
      }

      setFormMessage(
        editingAssembly
          ? "Les informations de l’assemblée ont été mises à jour."
          : "La nouvelle assemblée a été créée avec succès."
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

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Expansion
          </p>

          <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Assemblées et implantations
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Centralisez les informations des assemblées locales et préparez
            l’expansion de CEF Parole de Vie dans plusieurs villes et pays.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Ajouter une assemblée
        </button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Building2 className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialAssemblies.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Assemblées enregistrées
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activeAssemblies}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Assemblées actives
          </p>
        </article>

        <article className="rounded-3xl border border-cyan-100 bg-cyan-50 p-6">
          <Globe2 className="text-cyan-700" size={25} />
          <p className="mt-6 text-3xl font-black text-cyan-900">
            {coveredCountries}
          </p>
          <p className="mt-2 font-bold text-cyan-800">Pays couverts</p>
        </article>
      </section>

      {loadError ? (
        <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
          {loadError}
        </div>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialAssemblies.map((assembly) => (
            <article
              key={assembly.id}
              className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#082553] to-[#1680c4]">
                {assembly.photo_url ? (
                  <img
                    src={assembly.photo_url}
                    alt={assembly.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 size={55} className="text-white/75" />
                )}

                <span
                  className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-extrabold ${
                    assembly.is_active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {assembly.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-black text-[#092e63]">
                  {assembly.name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="flex gap-2">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    {[assembly.commune, assembly.city, assembly.country]
                      .filter(Boolean)
                      .join(", ") || "Localisation non renseignée"}
                  </p>

                  <p className="flex gap-2">
                    <Users
                      size={17}
                      className="mt-0.5 shrink-0 text-[#0a56a4]"
                    />
                    {assembly.pastor_name
                      ? `Pasteur : ${assembly.pastor_name}`
                      : "Pasteur non renseigné"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openEdit(assembly)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                >
                  <Pencil size={17} />
                  Modifier l’assemblée
                </button>
              </div>
            </article>
          ))}

          {initialAssemblies.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center">
              <Building2 className="mx-auto text-blue-200" size={42} />
              <p className="mt-4 font-black text-[#092e63]">
                Aucune assemblée enregistrée
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Commencez par créer la première assemblée de CEF Parole de Vie.
              </p>
            </div>
          )}
        </section>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Assemblée / implantation
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {editingAssembly
                    ? "Modifier l’assemblée"
                    : "Ajouter une assemblée"}
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
                  label="Photo de l’assemblée"
                  file={photoFile}
                  onChange={setPhotoFile}
                  onError={setFormError}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nom de l’assemblée *
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="Ex. CEF Parole de Vie — Bruxelles"
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Pays
                  </span>

                  <input
                    list="country-options"
                    value={form.country}
                    onChange={(event) =>
                      updateForm("country", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Choisissez ou saisissez un pays"
                  />

                  <datalist id="country-options">
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Ville
                  </span>

                  <input
                    value={form.city}
                    onChange={(event) => {
                      updateForm("city", event.target.value);

                      if (!isKinshasaCity(event.target.value)) {
                        updateForm("commune", "");
                      }
                    }}
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
                      value={form.commune}
                      onChange={(event) =>
                        updateForm("commune", event.target.value)
                      }
                      placeholder="Quartier, commune ou territoire"
                      className={inputClassName}
                    />
                  )}
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Pasteur responsable
                  </span>

                  <input
                    value={form.pastorName}
                    onChange={(event) =>
                      updateForm("pastorName", event.target.value)
                    }
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Adresse
                  </span>

                  <input
                    value={form.address}
                    onChange={(event) =>
                      updateForm("address", event.target.value)
                    }
                    placeholder="Rue, numéro, référence..."
                    className={inputClassName}
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
                    Fuseau horaire
                  </span>

                  <select
                    value={form.timezone}
                    onChange={(event) =>
                      updateForm("timezone", event.target.value)
                    }
                    className={inputClassName}
                  >
                    <option value="Africa/Kinshasa">Afrique/Kinshasa</option>
                    <option value="Africa/Lubumbashi">
                      Afrique/Lubumbashi
                    </option>
                    <option value="Europe/Brussels">Europe/Bruxelles</option>
                    <option value="America/Toronto">Amérique/Toronto</option>
                  </select>
                </label>

                {editingAssembly && (
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        updateForm("isActive", event.target.checked)
                      }
                      className="h-4 w-4 accent-[#0a56a4]"
                    />
                    Assemblée active
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
                      <Building2 size={18} />
                      {editingAssembly
                        ? "Enregistrer les modifications"
                        : "Créer l’assemblée"}
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