"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
Building2,
CheckCircle2,
GraduationCap,
LoaderCircle,
Plus,
School,
Users,
X,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import type {
SchoolClassOption,
SchoolOption,
SchoolYear,
} from "../../types/school";

type SchoolClassesManagerProps = {
schools: SchoolOption[];
schoolYears: SchoolYear[];
initialClasses: SchoolClassOption[];
loadError: string | null;
};

type ClassForm = {
schoolId: string;
schoolYearId: string;
name: string;
levelName: string;
sectionName: string;
capacity: string;
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function emptyForm(
schools: SchoolOption[],
schoolYears: SchoolYear[]
): ClassForm {
const schoolId = schools[0]?.id ?? "";

const currentYear =
schoolYears.find(
(year) => year.school_id === schoolId && year.is_current
) ?? schoolYears.find((year) => year.school_id === schoolId);

return {
schoolId,
schoolYearId: currentYear?.id ?? "",
name: "",
levelName: "",
sectionName: "",
capacity: "35",
};
}

export default function SchoolClassesManager({
schools,
schoolYears,
initialClasses,
loadError,
}: SchoolClassesManagerProps) {
const router = useRouter();
const supabase = createClient();

const [schoolFilter, setSchoolFilter] = useState("all");
const [formOpen, setFormOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [formError, setFormError] = useState("");
const [formMessage, setFormMessage] = useState("");
const [form, setForm] = useState<ClassForm>(() =>
emptyForm(schools, schoolYears)
);

const availableYears = useMemo(
() =>
schoolYears.filter(
(year) => year.school_id === form.schoolId && year.is_active
),
[form.schoolId, schoolYears]
);

const displayedClasses = useMemo(() => {
if (schoolFilter === "all") {
return initialClasses;
}

return initialClasses.filter(
  (schoolClass) => schoolClass.school_id === schoolFilter
);

}, [initialClasses, schoolFilter]);

function closeForm() {
setFormOpen(false);
setForm(emptyForm(schools, schoolYears));
setFormError("");
setFormMessage("");
}

function openForm() {
setForm(emptyForm(schools, schoolYears));
setFormError("");
setFormMessage("");
setFormOpen(true);
}

function changeSchool(schoolId: string) {
const currentYear =
schoolYears.find(
(year) => year.school_id === schoolId && year.is_current
) ?? schoolYears.find((year) => year.school_id === schoolId);

setForm((current) => ({
  ...current,
  schoolId,
  schoolYearId: currentYear?.id ?? "",
}));

}

async function saveClass(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setFormError("");
setFormMessage("");

if (!form.schoolId) {
  setFormError("Veuillez sélectionner une école.");
  return;
}

if (!form.schoolYearId) {
  setFormError(
    "Veuillez créer ou sélectionner une année scolaire pour cette école."
  );
  return;
}

if (!form.name.trim()) {
  setFormError("Le nom de la classe est obligatoire.");
  return;
}

const capacity = Number(form.capacity);

if (!Number.isInteger(capacity) || capacity < 1) {
  setFormError("La capacité doit être un nombre entier supérieur à zéro.");
  return;
}

setLoading(true);

try {
  const { error } = await supabase.rpc("create_school_class", {
    p_school_year_id: form.schoolYearId,
    p_name: form.name.trim(),
    p_level_name: form.levelName.trim() || null,
    p_section_name: form.sectionName.trim() || null,
    p_capacity: capacity,
  });

  if (error) {
    throw new Error(error.message);
  }

  setFormMessage("La classe a été créée avec succès.");
  router.refresh();

  window.setTimeout(() => {
    closeForm();
  }, 800);
} catch (error) {
  setFormError(
    error instanceof Error
      ? error.message
      : "Impossible de créer la classe."
  );
} finally {
  setLoading(false);
}

}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
École chrétienne </p>

      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Gestion des classes
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Créez les classes par école et année scolaire, puis affectez les
        enseignants et les élèves dans les modules correspondants.
      </p>
    </div>

    <button
      type="button"
      onClick={openForm}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <Plus size={19} />
      Ajouter une classe
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
          <Building2 className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialClasses.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Classes enregistrées
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {initialClasses.filter((item) => item.is_active).length}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Classes actives
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
          <School className="text-violet-700" size={25} />
          <p className="mt-6 text-3xl font-black text-violet-900">
            {schools.length}
          </p>
          <p className="mt-2 font-bold text-violet-800">
            Écoles concernées
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <select
            value={schoolFilter}
            onChange={(event) => setSchoolFilter(event.target.value)}
            className={`${inputClassName} max-w-md`}
          >
            <option value="all">Toutes les écoles</option>

            {schools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>

        {displayedClasses.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucune classe enregistrée
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Cliquez sur « Ajouter une classe » pour commencer.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {displayedClasses.map((schoolClass) => {
              const school = schools.find(
                (item) => item.id === schoolClass.school_id
              );

              const schoolYear = schoolYears.find(
                (item) => item.id === schoolClass.school_year_id
              );

              return (
                <article
                  key={schoolClass.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
                    Classe
                  </p>

                  <h2 className="mt-2 text-xl font-black text-[#092e63]">
                    {schoolClass.name}
                  </h2>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>
                      <strong>École :</strong>{" "}
                      {school?.name || "Non définie"}
                    </p>
                    <p>
                      <strong>Année :</strong>{" "}
                      {schoolYear?.name || "Non définie"}
                    </p>
                    <p>
                      <strong>Niveau :</strong>{" "}
                      {schoolClass.level_name || "Non renseigné"}
                    </p>
                    <p>
                      <strong>Section :</strong>{" "}
                      {schoolClass.section_name || "Non renseignée"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={16} className="text-[#0a56a4]" />
                      Capacité : {schoolClass.capacity ?? "—"} élèves
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  )}

  {formOpen && (
    <div className="fixed inset-0 z-[160] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              École chrétienne
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              Ajouter une classe
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={saveClass} className="p-6 sm:p-8">
          {formError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {formError}
            </div>
          )}

          {formMessage && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              {formMessage}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                École *
              </span>

              <select
                value={form.schoolId}
                onChange={(event) => changeSchool(event.target.value)}
                className={inputClassName}
                required
              >
                <option value="">Sélectionnez une école</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Année scolaire *
              </span>

              <select
                value={form.schoolYearId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    schoolYearId: event.target.value,
                  }))
                }
                className={inputClassName}
                required
              >
                <option value="">Sélectionnez une année scolaire</option>

                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}
                    {year.is_current ? " — En cours" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nom de la classe *
              </span>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex. 1ère Année Primaire A"
                className={inputClassName}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Niveau
              </span>

              <input
                value={form.levelName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    levelName: event.target.value,
                  }))
                }
                placeholder="Ex. Primaire"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Section
              </span>

              <input
                value={form.sectionName}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sectionName: event.target.value,
                  }))
                }
                placeholder="Ex. A"
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Capacité d’accueil *
              </span>

              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    capacity: event.target.value,
                  }))
                }
                className={inputClassName}
                required
              />
            </label>
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white disabled:opacity-70"
            >
              {loading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Plus size={18} />
              )}
              Créer la classe
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}
