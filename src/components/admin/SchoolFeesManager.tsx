"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
Banknote,
CalendarDays,
CheckCircle2,
Edit3,
Landmark,
LoaderCircle,
Plus,
Save,
Settings,
Trash2,
X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
feeCategoryLabels,
type FeeCategory,
type SchoolFeePlan,
type SchoolFeeSchool,
type SchoolFeeYear,
} from "@/types/school-fees";

type SchoolFeesManagerProps = {
schools: SchoolFeeSchool[];
schoolYears: SchoolFeeYear[];
initialPlans: SchoolFeePlan[];
loadError: string | null;
};

type InstallmentDraft = {
id: string;
title: string;
dueDate: string;
amount: string;
isRequired: boolean;
};

type FeePlanForm = {
schoolId: string;
schoolYearId: string;
category: FeeCategory;
name: string;
registrationFee: string;
tuitionFee: string;
currency: string;
isActive: boolean;
installments: InstallmentDraft[];
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function toNumber(value: number | string | null | undefined) {
const numberValue = Number(value ?? 0);
return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatMoney(
value: number | string | null | undefined,
currency = "USD"
) {
return new Intl.NumberFormat("fr-FR", {
style: "currency",
currency,
maximumFractionDigits: 2,
}).format(toNumber(value));
}

function createInstallment(): InstallmentDraft {
return {
id: `${Date.now()}-${Math.random()}`,
title: "",
dueDate: "",
amount: "",
isRequired: true,
};
}

function createEmptyForm(
schools: SchoolFeeSchool[],
schoolYears: SchoolFeeYear[]
): FeePlanForm {
const schoolId = schools[0]?.id ?? "";

const schoolYear =
schoolYears.find(
(year) => year.school_id === schoolId && year.is_current
) ?? schoolYears.find((year) => year.school_id === schoolId);

return {
schoolId,
schoolYearId: schoolYear?.id ?? "",
category: "primaire",
name: "Frais scolaires - Primaire",
registrationFee: "0",
tuitionFee: "0",
currency: "USD",
isActive: true,
installments: [],
};
}

export default function SchoolFeesManager({
schools,
schoolYears,
initialPlans,
loadError,
}: SchoolFeesManagerProps) {
const router = useRouter();
const supabase = createClient();

const [schoolFilter, setSchoolFilter] = useState("all");
const [formOpen, setFormOpen] = useState(false);
const [editingPlan, setEditingPlan] = useState<SchoolFeePlan | null>(null);
const [form, setForm] = useState<FeePlanForm>(() =>
createEmptyForm(schools, schoolYears)
);
const [loading, setLoading] = useState(false);
const [formError, setFormError] = useState("");
const [formMessage, setFormMessage] = useState("");

const availableYears = useMemo(
() =>
schoolYears.filter(
(year) => year.school_id === form.schoolId && year.is_active
),
[schoolYears, form.schoolId]
);

const filteredPlans = useMemo(() => {
if (schoolFilter === "all") {
return initialPlans;
}

return initialPlans.filter((plan) => plan.school_id === schoolFilter);

}, [initialPlans, schoolFilter]);

const totalConfigured = initialPlans.reduce(
(total, plan) =>
total + toNumber(plan.registration_fee) + toNumber(plan.tuition_fee),
0
);

const activePlans = initialPlans.filter((plan) => plan.is_active).length;

const installmentTotal = form.installments.reduce(
(total, installment) => total + toNumber(installment.amount),
0
);

function closeForm() {
setFormOpen(false);
setEditingPlan(null);
setForm(createEmptyForm(schools, schoolYears));
setFormError("");
setFormMessage("");
}

function openCreate() {
setEditingPlan(null);
setForm(createEmptyForm(schools, schoolYears));
setFormError("");
setFormMessage("");
setFormOpen(true);
}

function openEdit(plan: SchoolFeePlan) {
setEditingPlan(plan);

setForm({
  schoolId: plan.school_id,
  schoolYearId: plan.school_year_id,
  category: plan.category,
  name: plan.name,
  registrationFee: String(toNumber(plan.registration_fee)),
  tuitionFee: String(toNumber(plan.tuition_fee)),
  currency: plan.currency || "USD",
  isActive: plan.is_active,
  installments: plan.installments.map((installment) => ({
    id: installment.id,
    title: installment.title,
    dueDate: installment.due_date ?? "",
    amount: String(toNumber(installment.amount)),
    isRequired: installment.is_required,
  })),
});

setFormError("");
setFormMessage("");
setFormOpen(true);

}

function changeSchool(schoolId: string) {
const schoolYear =
schoolYears.find(
(year) => year.school_id === schoolId && year.is_current
) ?? schoolYears.find((year) => year.school_id === schoolId);

setForm((current) => ({
  ...current,
  schoolId,
  schoolYearId: schoolYear?.id ?? "",
}));

}

function changeCategory(category: FeeCategory) {
setForm((current) => ({
...current,
category,
name:
current.name.startsWith("Frais scolaires")
? `Frais scolaires - ${feeCategoryLabels[category]}`
: current.name,
}));
}

function addInstallment() {
setForm((current) => ({
...current,
installments: [...current.installments, createInstallment()],
}));
}

function removeInstallment(id: string) {
setForm((current) => ({
...current,
installments: current.installments.filter(
(installment) => installment.id !== id
),
}));
}

function updateInstallment(
id: string,
field: keyof Omit<InstallmentDraft, "id">,
value: string | boolean
) {
setForm((current) => ({
...current,
installments: current.installments.map((installment) =>
installment.id === id
? {
...installment,
[field]: value,
}
: installment
),
}));
}

async function savePlan(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setFormError("");
setFormMessage("");

if (!form.schoolId || !form.schoolYearId) {
  setFormError("Veuillez sélectionner une école et une année scolaire.");
  return;
}

if (!form.name.trim()) {
  setFormError("Le nom du plan de frais est obligatoire.");
  return;
}

const registrationFee = toNumber(form.registrationFee);
const tuitionFee = toNumber(form.tuitionFee);

if (registrationFee < 0 || tuitionFee < 0) {
  setFormError("Les montants doivent être positifs ou nuls.");
  return;
}

const cleanInstallments = form.installments.filter(
  (installment) =>
    installment.title.trim() ||
    installment.amount.trim() ||
    installment.dueDate
);

for (const installment of cleanInstallments) {
  if (!installment.title.trim()) {
    setFormError("Chaque échéance doit avoir un libellé.");
    return;
  }

  if (!installment.amount.trim() || toNumber(installment.amount) < 0) {
    setFormError("Chaque échéance doit avoir un montant valide.");
    return;
  }
}

if (
  cleanInstallments.length > 0 &&
  Math.abs(installmentTotal - tuitionFee) > 0.01
) {
  setFormError(
    "La somme des échéances doit être égale aux frais scolaires annuels."
  );
  return;
}

setLoading(true);

try {
  const { error } = await supabase.rpc("save_school_fee_plan", {
    p_payload: {
      fee_plan_id: editingPlan?.id ?? null,
      school_id: form.schoolId,
      school_year_id: form.schoolYearId,
      category: form.category,
      name: form.name.trim(),
      registration_fee: registrationFee,
      tuition_fee: tuitionFee,
      currency: form.currency,
      is_active: form.isActive,
      installments: cleanInstallments.map((installment, index) => ({
        title: installment.title.trim(),
        due_date: installment.dueDate || null,
        amount: toNumber(installment.amount),
        sort_order: index + 1,
        is_required: installment.isRequired,
      })),
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  setFormMessage(
    editingPlan
      ? "Le plan de frais a été mis à jour."
      : "Le plan de frais a été créé avec succès."
  );

  router.refresh();

  window.setTimeout(() => {
    closeForm();
  }, 900);
} catch (error) {
  setFormError(
    error instanceof Error
      ? error.message
      : "Impossible d’enregistrer le plan de frais."
  );
} finally {
  setLoading(false);
}

}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
École chrétienne </p>

      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Frais et paramètres scolaires
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Paramétrez les frais d’inscription, frais scolaires et échéances
        de paiement pour chaque école et chaque année scolaire.
      </p>
    </div>

    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <Plus size={19} />
      Nouveau plan de frais
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
          <Settings className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialPlans.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Plans configurés
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {activePlans}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Plans actuellement actifs
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
          <Landmark className="text-violet-700" size={25} />
          <p className="mt-6 text-2xl font-black text-violet-900">
            {formatMoney(totalConfigured)}
          </p>
          <p className="mt-2 font-bold text-violet-800">
            Montant annuel configuré
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

        {filteredPlans.length === 0 ? (
          <div className="p-12 text-center">
            <Banknote className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucun plan de frais configuré
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Créez un plan pour la catégorie primaire ou secondaire.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan) => {
              const total =
                toNumber(plan.registration_fee) +
                toNumber(plan.tuition_fee);

              return (
                <article
                  key={plan.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-[#1680c4]">
                        {feeCategoryLabels[plan.category]}
                      </p>

                      <h2 className="mt-2 text-lg font-black text-[#092e63]">
                        {plan.name}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                        plan.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {plan.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-slate-600">
                    <p>
                      <strong>École :</strong>{" "}
                      {plan.school?.name || "Non renseignée"}
                    </p>

                    <p>
                      <strong>Année :</strong>{" "}
                      {plan.school_year?.name || "Non renseignée"}
                    </p>

                    <p>
                      <strong>Inscription :</strong>{" "}
                      {formatMoney(plan.registration_fee, plan.currency)}
                    </p>

                    <p>
                      <strong>Frais scolaires :</strong>{" "}
                      {formatMoney(plan.tuition_fee, plan.currency)}
                    </p>

                    <p className="font-black text-[#0a3d82]">
                      Total annuel : {formatMoney(total, plan.currency)}
                    </p>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#0a56a4]" />
                      <p className="text-sm font-black text-[#092e63]">
                        Échéances
                      </p>
                    </div>

                    {plan.installments.length === 0 ? (
                      <p className="mt-3 text-sm text-slate-500">
                        Paiement unique ou échéances non définies.
                      </p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {plan.installments.map((installment) => (
                          <div
                            key={installment.id}
                            className="flex items-center justify-between gap-3 text-xs text-slate-600"
                          >
                            <span>
                              {installment.title}
                              {installment.due_date
                                ? ` — ${new Intl.DateTimeFormat("fr-FR").format(
                                    new Date(
                                      `${installment.due_date}T12:00:00`
                                    )
                                  )}`
                                : ""}
                            </span>

                            <strong className="text-[#092e63]">
                              {formatMoney(
                                installment.amount,
                                plan.currency
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Modifier le plan
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  )}

  {formOpen && (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              Paramètres financiers
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              {editingPlan
                ? "Modifier le plan de frais"
                : "Créer un plan de frais"}
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

        <form onSubmit={savePlan} className="p-6 sm:p-8">
          {formError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {formError}
            </div>
          )}

          {formMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0" />
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

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Catégorie *
              </span>

              <select
                value={form.category}
                onChange={(event) =>
                  changeCategory(event.target.value as FeeCategory)
                }
                className={inputClassName}
              >
                <option value="primaire">Primaire</option>
                <option value="secondaire">Secondaire</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Devise *
              </span>

              <select
                value={form.currency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    currency: event.target.value,
                  }))
                }
                className={inputClassName}
              >
                <option value="USD">USD — Dollar américain</option>
                <option value="CDF">CDF — Franc congolais</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nom du plan de frais *
              </span>

              <input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ex. Frais scolaires - Primaire 2026-2027"
                className={inputClassName}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Frais d’inscription
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.registrationFee}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    registrationFee: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Frais scolaires annuels
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.tuitionFee}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tuitionFee: event.target.value,
                  }))
                }
                className={inputClassName}
              />
            </label>
          </div>

          <section className="mt-8 rounded-3xl border border-amber-100 bg-amber-50/50 p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-black text-[#092e63]">
                  Échéances de paiement
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  La somme des échéances doit correspondre aux frais
                  scolaires annuels.
                </p>
              </div>

              <button
                type="button"
                onClick={addInstallment}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-extrabold text-amber-800 transition hover:bg-amber-100"
              >
                <Plus size={16} />
                Ajouter une échéance
              </button>
            </div>

            {form.installments.length > 0 && (
              <div className="mt-5 space-y-3">
                {form.installments.map((installment, index) => (
                  <div
                    key={installment.id}
                    className="grid gap-3 rounded-2xl border border-amber-100 bg-white p-4 md:grid-cols-[minmax(0,1fr)_170px_160px_auto]"
                  >
                    <input
                      value={installment.title}
                      onChange={(event) =>
                        updateInstallment(
                          installment.id,
                          "title",
                          event.target.value
                        )
                      }
                      placeholder={`Ex. ${index + 1}ère échéance`}
                      className={inputClassName}
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={installment.amount}
                      onChange={(event) =>
                        updateInstallment(
                          installment.id,
                          "amount",
                          event.target.value
                        )
                      }
                      placeholder="Montant"
                      className={inputClassName}
                    />

                    <input
                      type="date"
                      value={installment.dueDate}
                      onChange={(event) =>
                        updateInstallment(
                          installment.id,
                          "dueDate",
                          event.target.value
                        )
                      }
                      className={inputClassName}
                    />

                    <button
                      type="button"
                      onClick={() => removeInstallment(installment.id)}
                      className="rounded-xl border border-red-200 px-3 py-2.5 text-red-700 transition hover:bg-red-50"
                      aria-label="Supprimer l’échéance"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm">
              <span className="font-bold text-slate-600">
                Total des échéances :
              </span>{" "}
              <span className="font-black text-[#0a3d82]">
                {formatMoney(installmentTotal, form.currency)}
              </span>
            </div>
          </section>

          {editingPlan && (
            <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#0a56a4]"
              />
              Plan de frais actif
            </label>
          )}

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
                  <Save size={18} />
                  {editingPlan
                    ? "Enregistrer les modifications"
                    : "Créer le plan de frais"}
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
