"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CountrySelect, CommuneField } from "../ui/LocationFields";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  Plus,
  School,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import type {
  SchoolAssembly,
  SchoolRecord,
  SchoolYear,
} from "../../types/school";

type SchoolManagerProps = {
  assemblies: SchoolAssembly[];
  initialSchools: SchoolRecord[];
  initialSchoolYears: SchoolYear[];
  loadError: string | null;
};

type SchoolForm = {
  managingAssemblyId: string;
  name: string;
  country: string;
  city: string;
  commune: string;
  address: string;
  phone: string;
  email: string;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string;
  isActive: boolean;
};

type SchoolYearForm = {
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function formatDate(value: string | null) {
  if (!value) return "Non renseignée";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatPeriod(startDate: string, endDate: string) {
  return `${formatDate(startDate)} → ${formatDate(endDate)}`;
}

function emptySchoolForm(assemblies: SchoolAssembly[]): SchoolForm {
  return {
    managingAssemblyId: assemblies[0]?.id ?? "",
    name: "",
    country: "RDC",
    city: "Kinshasa",
    commune: "",
    address: "",
    phone: "",
    email: "",
    responsibleName: "",
    responsiblePhone: "",
    responsibleEmail: "",
    isActive: true,
  };
}

function emptySchoolYearForm(schools: SchoolRecord[]): SchoolYearForm {
  return {
    schoolId: schools[0]?.id ?? "",
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: true,
  };
}

export default function SchoolManager({
  assemblies,
  initialSchools,
  initialSchoolYears,
  loadError,
}: SchoolManagerProps) {
  const supabase = createClient();

  const [schools, setSchools] = useState(initialSchools);
  const [schoolYears, setSchoolYears] = useState(initialSchoolYears);

  const [selectedSchoolId, setSelectedSchoolId] = useState(
    initialSchools[0]?.id ?? ""
  );

  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [showYearForm, setShowYearForm] = useState(false);

  const [editingSchool, setEditingSchool] = useState<SchoolRecord | null>(null);

  const [schoolForm, setSchoolForm] = useState<SchoolForm>(
    emptySchoolForm(assemblies)
  );

  const [yearForm, setYearForm] = useState<SchoolYearForm>(
    emptySchoolYearForm(initialSchools)
  );

  const [loadingSchool, setLoadingSchool] = useState(false);
  const [loadingYear, setLoadingYear] = useState(false);

  const [schoolError, setSchoolError] = useState("");
  const [schoolMessage, setSchoolMessage] = useState("");
  const [yearError, setYearError] = useState("");
  const [yearMessage, setYearMessage] = useState("");

  const activeSchoolsCount = schools.filter((school) => school.is_active).length;

  const managingAssembliesCount = new Set(
    schools.map((school) => school.managing_assembly_id)
  ).size;

  const currentSchoolYearsCount = schoolYears.filter(
    (item) => item.is_current
  ).length;

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId]
  );

  const filteredSchoolYears = useMemo(() => {
    if (!selectedSchoolId) return schoolYears;

    return schoolYears.filter((item) => item.school_id === selectedSchoolId);
  }, [schoolYears, selectedSchoolId]);

  function refreshLocalState(nextSchools?: SchoolRecord[], nextYears?: SchoolYear[]) {
    if (nextSchools) {
      setSchools(nextSchools);
      if (!selectedSchoolId && nextSchools[0]?.id) {
        setSelectedSchoolId(nextSchools[0].id);
      }
    }

    if (nextYears) {
      setSchoolYears(nextYears);
    }
  }

  function updateSchoolForm<K extends keyof SchoolForm>(
    field: K,
    value: SchoolForm[K]
  ) {
    setSchoolForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateYearForm<K extends keyof SchoolYearForm>(
    field: K,
    value: SchoolYearForm[K]
  ) {
    setYearForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetSchoolForm() {
    setSchoolForm(emptySchoolForm(assemblies));
    setEditingSchool(null);
    setSchoolError("");
    setSchoolMessage("");
  }

  function resetYearForm() {
    setYearForm(
      selectedSchool
        ? {
            schoolId: selectedSchool.id,
            name: "",
            startDate: "",
            endDate: "",
            isCurrent: true,
          }
        : emptySchoolYearForm(schools)
    );
    setYearError("");
    setYearMessage("");
  }

  function openCreateSchool() {
    resetSchoolForm();
    setShowSchoolForm(true);
  }

  function openEditSchool(school: SchoolRecord) {
    setEditingSchool(school);
    setSchoolError("");
    setSchoolMessage("");

    setSchoolForm({
      managingAssemblyId: school.managing_assembly_id,
      name: school.name ?? "",
      country: school.country ?? "RDC",
      city: school.city ?? "",
      commune: school.commune ?? "",
      address: school.address ?? "",
      phone: school.phone ?? "",
      email: school.email ?? "",
      responsibleName: school.responsible_name ?? "",
      responsiblePhone: school.responsible_phone ?? "",
      responsibleEmail: school.responsible_email ?? "",
      isActive: school.is_active,
    });

    setShowSchoolForm(true);
  }

  function openCreateYear(prefilledSchoolId?: string) {
    setYearError("");
    setYearMessage("");

    setYearForm({
      schoolId: prefilledSchoolId || selectedSchool?.id || schools[0]?.id || "",
      name: "",
      startDate: "",
      endDate: "",
      isCurrent: true,
    });

    setShowYearForm(true);
  }

  function closeSchoolForm() {
    setShowSchoolForm(false);
    resetSchoolForm();
  }

  function closeYearForm() {
    setShowYearForm(false);
    resetYearForm();
  }

  async function reloadData() {
    const [schoolsResult, yearsResult] = await Promise.all([
      supabase
        .from("schools")
        .select(`
          id,
          organization_id,
          managing_assembly_id,
          name,
          code,
          country,
          city,
          commune,
          address,
          phone,
          email,
          responsible_name,
          responsible_phone,
          responsible_email,
          photo_path,
          is_active,
          created_at,
          updated_at,
          managing_assembly:assemblies(id, name, city, country)
        `)
        .order("name"),

      supabase
        .from("school_years")
        .select(`
          id,
          organization_id,
          assembly_id,
          school_id,
          name,
          start_date,
          end_date,
          is_current,
          created_at
        `)
        .order("start_date", { ascending: false }),
    ]);

    refreshLocalState(
      (schoolsResult.data as SchoolRecord[] | null) ?? [],
      (yearsResult.data as SchoolYear[] | null) ?? []
    );
  }

  async function handleSchoolSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSchoolError("");
    setSchoolMessage("");

    if (!schoolForm.managingAssemblyId) {
      setSchoolError("Veuillez sélectionner l’assemblée gestionnaire.");
      return;
    }

    if (!schoolForm.name.trim()) {
      setSchoolError("Le nom de l’école est obligatoire.");
      return;
    }

    setLoadingSchool(true);

    try {
      if (editingSchool) {
        const { error } = await supabase.rpc("update_school_record", {
          p_school_id: editingSchool.id,
          p_managing_assembly_id: schoolForm.managingAssemblyId,
          p_name: schoolForm.name.trim(),
          p_country: schoolForm.country || "RDC",
          p_city: schoolForm.city || null,
          p_commune: schoolForm.commune || null,
          p_address: schoolForm.address || null,
          p_phone: schoolForm.phone || null,
          p_email: schoolForm.email || null,
          p_responsible_name: schoolForm.responsibleName || null,
          p_responsible_phone: schoolForm.responsiblePhone || null,
          p_responsible_email: schoolForm.responsibleEmail || null,
          p_is_active: schoolForm.isActive,
        });

        if (error) {
          throw new Error(error.message);
        }

        setSchoolMessage("L’école a été mise à jour avec succès.");
      } else {
        const { error } = await supabase.rpc("create_school", {
          p_managing_assembly_id: schoolForm.managingAssemblyId,
          p_name: schoolForm.name.trim(),
          p_country: schoolForm.country || "RDC",
          p_city: schoolForm.city || null,
          p_commune: schoolForm.commune || null,
          p_address: schoolForm.address || null,
          p_phone: schoolForm.phone || null,
          p_email: schoolForm.email || null,
          p_responsible_name: schoolForm.responsibleName || null,
          p_responsible_phone: schoolForm.responsiblePhone || null,
          p_responsible_email: schoolForm.responsibleEmail || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        setSchoolMessage("La nouvelle école a été créée avec succès.");
      }

      await reloadData();

      window.setTimeout(() => {
        closeSchoolForm();
      }, 700);
    } catch (error) {
      setSchoolError(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer l’école."
      );
    } finally {
      setLoadingSchool(false);
    }
  }

  async function handleYearSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setYearError("");
    setYearMessage("");

    if (!yearForm.schoolId) {
      setYearError("Veuillez sélectionner une école.");
      return;
    }

    if (!yearForm.name.trim()) {
      setYearError("Le nom de l’année scolaire est obligatoire.");
      return;
    }

    if (!yearForm.startDate || !yearForm.endDate) {
      setYearError("Veuillez renseigner la date de début et la date de fin.");
      return;
    }

    setLoadingYear(true);

    try {
      const { error } = await supabase.rpc("create_school_year", {
        p_school_id: yearForm.schoolId,
        p_name: yearForm.name.trim(),
        p_start_date: yearForm.startDate,
        p_end_date: yearForm.endDate,
        p_is_current: yearForm.isCurrent,
      });

      if (error) {
        throw new Error(error.message);
      }

      setYearMessage("L’année scolaire a été créée avec succès.");

      await reloadData();
      setSelectedSchoolId(yearForm.schoolId);

      window.setTimeout(() => {
        closeYearForm();
      }, 700);
    } catch (error) {
      setYearError(
        error instanceof Error
          ? error.message
          : "Impossible de créer l’année scolaire."
      );
    } finally {
      setLoadingYear(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082c63] via-[#0a3d82] to-[#1680c4] text-white shadow-xl">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.25fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-100">
              Éducation chrétienne
            </p>

            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              Écoles
              <br />
              chrétiennes
              <br />
              Parole du Salut
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
              Gérez plusieurs écoles, leurs responsables, les années scolaires
              et l’organisation académique dans une interface claire et
              professionnelle.
            </p>

<div className="mt-7 flex flex-wrap gap-3">
  <button
    type="button"
    onClick={openCreateSchool}
    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
  >
    <School size={18} />
    Ajouter une école
  </button>

<button
type="button"
onClick={() => openCreateYear()}
className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"

>

<CalendarDays size={18} />

Nouvelle année scolaire

  </button>

  <Link
    href="/admin/ecole/classes"
    className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/20"
  >
    <Building2 size={18} />
    Ajouter une classe
  </Link>
</div>

          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
              <Building2 size={22} className="text-blue-100" />
              <p className="mt-5 text-3xl font-black">{activeSchoolsCount}</p>
              <p className="mt-1 text-sm font-semibold text-blue-100">
                Écoles actives
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
              <CalendarDays size={22} className="text-blue-100" />
              <p className="mt-5 text-3xl font-black">{currentSchoolYearsCount}</p>
              <p className="mt-1 text-sm font-semibold text-blue-100">
                Années en cours
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-5 backdrop-blur">
              <ChurchIcon />
              <p className="mt-5 text-3xl font-black">{managingAssembliesCount}</p>
              <p className="mt-1 text-sm font-semibold text-blue-100">
                Assemblées gestionnaires
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {loadError ? (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {loadError}
        </div>
      ) : (
        <>
          <section className="mt-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
                  Écoles enregistrées
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  Réseau des écoles
                </h2>
              </div>

              {schools.length > 0 && (
                <select
                  value={selectedSchoolId}
                  onChange={(event) => setSelectedSchoolId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 sm:w-[340px]"
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {schools.map((school) => (
                <article
                  key={school.id}
                  className={`rounded-[2rem] border bg-white p-6 shadow-sm transition ${
                    selectedSchoolId === school.id
                      ? "border-[#0a56a4] ring-4 ring-blue-100"
                      : "border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                        École
                      </p>
                      <h3 className="mt-2 text-2xl font-black text-[#092e63]">
                        {school.name}
                      </h3>

                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p className="flex gap-2">
                          <MapPin
                            size={17}
                            className="mt-0.5 shrink-0 text-[#0a56a4]"
                          />
                          {[school.commune, school.city, school.country]
                            .filter(Boolean)
                            .join(", ") || "Localisation non renseignée"}
                        </p>

                        {school.phone && (
                          <p className="flex gap-2">
                            <Phone
                              size={17}
                              className="mt-0.5 shrink-0 text-[#0a56a4]"
                            />
                            {school.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-extrabold ${
                        school.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {school.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
                        Responsable de l’école
                      </p>
                      <p className="mt-2 font-black text-[#092e63]">
                        {school.responsible_name || "Non renseigné"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {school.responsible_phone || "Téléphone non renseigné"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {school.responsible_email || "Email non renseigné"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                        Assemblée gestionnaire
                      </p>
                      <p className="mt-2 font-black text-[#092e63]">
                        {school.managing_assembly?.name || "Non renseignée"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {[school.managing_assembly?.city, school.managing_assembly?.country]
                          .filter(Boolean)
                          .join(", ") || "Localisation non renseignée"}
                      </p>
                    </div>
                  </div>

                  {school.address && (
                    <div className="mt-4 rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
                      <span className="font-bold text-slate-700">Adresse : </span>
                      {school.address}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSchoolId(school.id);
                        openEditSchool(school);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 px-4 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                    >
                      <Pencil size={17} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSchoolId(school.id);
                        openCreateYear(school.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#0a3d82] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
                    >
                      <CalendarDays size={17} />
                      Nouvelle année
                    </button>
                  </div>
                </article>
              ))}

              {schools.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center">
                  <School className="mx-auto text-blue-200" size={42} />
                  <p className="mt-4 font-black text-[#092e63]">
                    Aucune école enregistrée
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Commencez par créer la première école.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
                  Années scolaires
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {selectedSchool?.name || "Toutes les écoles"}
                </h2>
                {selectedSchool?.managing_assembly?.name && (
                  <p className="mt-2 text-sm text-slate-500">
                    Gérée par {selectedSchool.managing_assembly.name}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openCreateYear(selectedSchool?.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
              >
                <Plus size={17} />
                Ajouter une année scolaire
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSchoolYears.map((item) => (
                <article
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-[#092e63]">
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatPeriod(item.start_date, item.end_date)}
                      </p>
                    </div>

                    {item.is_current && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                        En cours
                      </span>
                    )}
                  </div>
                </article>
              ))}

              {filteredSchoolYears.length === 0 && (
                <div className="col-span-full rounded-3xl border border-dashed border-blue-200 bg-blue-50/40 p-10 text-center">
                  <CalendarDays className="mx-auto text-blue-200" size={40} />
                  <p className="mt-4 font-black text-[#092e63]">
                    Aucune année scolaire trouvée
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Créez une année scolaire pour cette école.
                  </p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {showSchoolForm && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-4xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Gestion des écoles
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {editingSchool ? "Modifier l’école" : "Ajouter une école"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSchoolForm}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSchoolSubmit} className="p-6 sm:p-8">
              {schoolError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {schoolError}
                </div>
              )}

              {schoolMessage && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {schoolMessage}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nom de l’école *
                  </span>
                  <input
                    value={schoolForm.name}
                    onChange={(event) =>
                      updateSchoolForm("name", event.target.value)
                    }
                    placeholder="Ex. École Chrétienne Parole du Salut — Lemba"
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Assemblée gestionnaire *
                  </span>
                  <select
                    value={schoolForm.managingAssemblyId}
                    onChange={(event) =>
                      updateSchoolForm("managingAssemblyId", event.target.value)
                    }
                    className={inputClassName}
                    required
                  >
                    {assemblies.map((assembly) => (
                      <option key={assembly.id} value={assembly.id}>
                        {assembly.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
  <span className="mb-2 block text-sm font-bold text-slate-700">
    Pays
  </span>

<CountrySelect
value={schoolForm.country}
onChange={(value) => updateSchoolForm("country", value)}
className={inputClassName}
/> </label>


                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Ville
                  </span>
                  <input
                    value={schoolForm.city}
                    onChange={(event) =>
                      updateSchoolForm("city", event.target.value)
                    }
                    placeholder="Ex. Kinshasa"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
  <span className="mb-2 block text-sm font-bold text-slate-700">
    Commune / Quartier
  </span>

<CommuneField
city={schoolForm.city}
value={schoolForm.commune}
onChange={(value) => updateSchoolForm("commune", value)}
className={inputClassName}
placeholder="Ex. Lemba"
/> </label>


                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Adresse
                  </span>
                  <input
                    value={schoolForm.address}
                    onChange={(event) =>
                      updateSchoolForm("address", event.target.value)
                    }
                    placeholder="Rue, numéro, référence..."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone de l’école
                  </span>
                  <input
                    value={schoolForm.phone}
                    onChange={(event) =>
                      updateSchoolForm("phone", event.target.value)
                    }
                    placeholder="+243 ..."
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    E-mail de l’école
                  </span>
                  <input
                    type="email"
                    value={schoolForm.email}
                    onChange={(event) =>
                      updateSchoolForm("email", event.target.value)
                    }
                    placeholder="ecole@paroledevie.org"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Responsable de l’école
                  </span>
                  <input
                    value={schoolForm.responsibleName}
                    onChange={(event) =>
                      updateSchoolForm("responsibleName", event.target.value)
                    }
                    placeholder="Nom du responsable"
                    className={inputClassName}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Téléphone du responsable
                  </span>
                  <input
                    value={schoolForm.responsiblePhone}
                    onChange={(event) =>
                      updateSchoolForm("responsiblePhone", event.target.value)
                    }
                    placeholder="+243 ..."
                    className={inputClassName}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    E-mail du responsable
                  </span>
                  <input
                    type="email"
                    value={schoolForm.responsibleEmail}
                    onChange={(event) =>
                      updateSchoolForm("responsibleEmail", event.target.value)
                    }
                    placeholder="responsable@paroledevie.org"
                    className={inputClassName}
                  />
                </label>

                {editingSchool && (
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={schoolForm.isActive}
                      onChange={(event) =>
                        updateSchoolForm("isActive", event.target.checked)
                      }
                      className="h-4 w-4 accent-[#0a56a4]"
                    />
                    École active
                  </label>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeSchoolForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loadingSchool}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingSchool ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <School size={18} />
                      {editingSchool ? "Enregistrer" : "Créer l’école"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showYearForm && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto my-4 max-w-3xl rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  École chrétienne
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  Nouvelle année scolaire
                </h2>
              </div>

              <button
                type="button"
                onClick={closeYearForm}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleYearSubmit} className="p-6 sm:p-8">
              {yearError && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {yearError}
                </div>
              )}

              {yearMessage && (
                <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  <CheckCircle2 size={18} className="shrink-0" />
                  {yearMessage}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    École *
                  </span>
                  <select
                    value={yearForm.schoolId}
                    onChange={(event) =>
                      updateYearForm("schoolId", event.target.value)
                    }
                    className={inputClassName}
                    required
                  >
                    <option value="">Sélectionnez une école</option>
                    {schools
                      .filter((school) => school.is_active)
                      .map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Nom de l’année scolaire *
                  </span>
                  <input
                    value={yearForm.name}
                    onChange={(event) =>
                      updateYearForm("name", event.target.value)
                    }
                    placeholder="Ex. 2026-2027"
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date de début *
                  </span>
                  <input
                    type="date"
                    value={yearForm.startDate}
                    onChange={(event) =>
                      updateYearForm("startDate", event.target.value)
                    }
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Date de fin *
                  </span>
                  <input
                    type="date"
                    value={yearForm.endDate}
                    onChange={(event) =>
                      updateYearForm("endDate", event.target.value)
                    }
                    className={inputClassName}
                    required
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={yearForm.isCurrent}
                    onChange={(event) =>
                      updateYearForm("isCurrent", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#0a56a4]"
                  />
                  Définir comme année scolaire active
                </label>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeYearForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={loadingYear}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingYear ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <CalendarDays size={18} />
                      Créer l’année scolaire
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

function ChurchIcon() {
  return <Users size={22} className="text-blue-100" />;
}