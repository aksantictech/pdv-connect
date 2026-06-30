"use client";

import {
useEffect,
useMemo,
useState,
type FormEvent,
} from "react";
import Link from "next/link";
import {
ArrowLeft,
CheckCircle2,
HeartHandshake,
LoaderCircle,
ShieldCheck,
UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Assembly = {
id: string;
name: string;
city: string | null;
country: string | null;
};

type Department = {
id: string;
assembly_id: string;
name: string;
};

type JoinBlock = {
block_key: string;
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
};

type FormState = {
assemblyId: string;
firstName: string;
lastName: string;
gender: string;
phone: string;
email: string;
country: string;
city: string;
commune: string;
firstVisitDate: string;
departmentId: string;
needsPrayer: boolean;
needsCounselling: boolean;
wantsBaptism: boolean;
message: string;
privacyConsent: boolean;
};

const initialForm: FormState = {
assemblyId: "",
firstName: "",
lastName: "",
gender: "",
phone: "",
email: "",
country: "RDC",
city: "",
commune: "",
firstVisitDate: new Date().toISOString().slice(0, 10),
departmentId: "",
needsPrayer: false,
needsCounselling: false,
wantsBaptism: false,
message: "",
privacyConsent: false,
};

const fallbackBlocks: Record<string, JoinBlock> = {
joining_hero: {
block_key: "joining_hero",
title: "Bienvenue à CEF",
subtitle: "Parole de Vie.",
content:
"Complétez ce formulaire afin que notre équipe puisse vous accueillir, vous accompagner et vous aider à trouver votre place dans la communauté.",
primary_label: null,
primary_href: null,
},
joining_welcome: {
block_key: "joining_welcome",
title: "Un accueil personnalisé",
subtitle: "Parcours d’intégration",
content:
"Votre inscription sera reçue par l’équipe d’intégration de votre assemblée.",
primary_label: null,
primary_href: null,
},
joining_form: {
block_key: "joining_form",
title: "Vos informations",
subtitle: "Formulaire d’intégration",
content: "Les champs marqués d’un astérisque sont obligatoires.",
primary_label: null,
primary_href: null,
},
joining_support: {
block_key: "joining_support",
title: "Comment pouvons-nous vous accompagner ?",
subtitle: "Accompagnement pastoral",
content:
"Sélectionnez les besoins pour lesquels vous souhaitez être accompagné(e) par l’équipe de l’église.",
primary_label: null,
primary_href: null,
},
joining_privacy: {
block_key: "joining_privacy",
title:
"J’accepte que CEF Parole de Vie utilise ces informations uniquement pour mon accueil, mon suivi pastoral et mon intégration dans la communauté.",
subtitle: "Confidentialité",
content:
"Vos informations sont protégées et accessibles uniquement aux personnes autorisées.",
primary_label: null,
primary_href: null,
},
};

const joinBlockKeys = Object.keys(fallbackBlocks);

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

export default function RejoindrePage() {
const supabase = useMemo(() => createClient(), []);

const [assemblies, setAssemblies] = useState<Assembly[]>([]);
const [departments, setDepartments] = useState<Department[]>([]);
const [cmsBlocks, setCmsBlocks] =
useState<Record<string, JoinBlock>>(fallbackBlocks);
const [cmsReady, setCmsReady] = useState(false);

const [form, setForm] = useState<FormState>(initialForm);
const [loadingOptions, setLoadingOptions] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

const availableDepartments = useMemo(
() =>
departments.filter(
(department) => department.assembly_id === form.assemblyId
),
[departments, form.assemblyId]
);

function getBlock(blockKey: string) {
if (!cmsReady) {
return fallbackBlocks[blockKey];
}

return cmsBlocks[blockKey] ?? null;

}

const heroBlock = getBlock("joining_hero");
const welcomeBlock = getBlock("joining_welcome");
const formBlock = getBlock("joining_form");
const supportBlock = getBlock("joining_support");
const privacyBlock =
getBlock("joining_privacy") ?? fallbackBlocks.joining_privacy;

useEffect(() => {
async function loadOptions() {
setLoadingOptions(true);
setErrorMessage("");

  const [assembliesResult, departmentsResult, cmsResult] =
    await Promise.all([
      supabase
        .from("assemblies")
        .select("id, name, city, country")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("departments")
        .select("id, assembly_id, name")
        .eq("is_active", true)
        .order("name"),

      supabase
        .from("pdv_public_blocks")
        .select(
          "block_key, title, subtitle, content, primary_label, primary_href"
        )
        .in("block_key", joinBlockKeys),
    ]);

  if (!cmsResult.error) {
    const loadedBlocks = (cmsResult.data ?? []) as JoinBlock[];

    const blocksMap = Object.fromEntries(
      loadedBlocks.map((block) => [block.block_key, block])
    ) as Record<string, JoinBlock>;

    setCmsBlocks(blocksMap);
    setCmsReady(true);
  }

  if (assembliesResult.error || departmentsResult.error) {
    setErrorMessage(
      "Impossible de charger les informations nécessaires. Veuillez réessayer."
    );
    setLoadingOptions(false);
    return;
  }

  const loadedAssemblies = (assembliesResult.data ?? []) as Assembly[];
  const loadedDepartments = (departmentsResult.data ?? []) as Department[];

  setAssemblies(loadedAssemblies);
  setDepartments(loadedDepartments);

  if (loadedAssemblies.length > 0) {
    setForm((current) => ({
      ...current,
      assemblyId: current.assemblyId || loadedAssemblies[0].id,
    }));
  }

  setLoadingOptions(false);
}

loadOptions();

}, [supabase]);

function updateField<K extends keyof FormState>(
field: K,
value: FormState[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setErrorMessage("");
setSuccessMessage("");

if (!form.assemblyId) {
  setErrorMessage("Veuillez sélectionner une assemblée.");
  return;
}

if (!form.privacyConsent) {
  setErrorMessage(
    "Votre consentement est nécessaire pour enregistrer vos informations."
  );
  return;
}

setSubmitting(true);

const { error } = await supabase.rpc("submit_new_member_registration", {
  p_assembly_id: form.assemblyId,
  p_first_name: form.firstName,
  p_last_name: form.lastName,
  p_phone: form.phone,
  p_gender: form.gender || null,
  p_email: form.email || null,
  p_country: form.country || "RDC",
  p_city: form.city || null,
  p_commune: form.commune || null,
  p_first_visit_date: form.firstVisitDate,
  p_requested_department_id: form.departmentId || null,
  p_needs_prayer: form.needsPrayer,
  p_needs_counselling: form.needsCounselling,
  p_wants_baptism: form.wantsBaptism,
  p_message: form.message || null,
  p_privacy_consent: form.privacyConsent,
});

setSubmitting(false);

if (error) {
  setErrorMessage(
    error.message ||
      "Une erreur est survenue pendant l’enregistrement. Veuillez réessayer."
  );
  return;
}

setSuccessMessage(
  "Votre inscription a bien été enregistrée. L’équipe d’intégration vous contactera bientôt."
);

setForm({
  ...initialForm,
  assemblyId: form.assemblyId,
});

}

return ( <main className="min-h-screen bg-slate-50">
{heroBlock && ( <section className="border-b border-blue-100 bg-gradient-to-br from-[#082553] via-[#0a3d82] to-[#1680c4] px-5 py-14 text-white lg:px-8"> <div className="mx-auto max-w-6xl"> <Link
           href="/"
           className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 transition hover:text-white"
         > <ArrowLeft size={17} />
Retour à l’accueil </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
              <UserPlus size={17} />
              Parcours d’intégration
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl">
              {heroBlock.title || "Bienvenue à CEF"}
              {heroBlock.subtitle && (
                <span className="block text-cyan-200">
                  {heroBlock.subtitle}
                </span>
              )}
            </h1>

            {heroBlock.content && (
              <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100">
                {heroBlock.content}
              </p>
            )}
          </div>

          {welcomeBlock && (
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <div className="flex gap-3">
                <HeartHandshake
                  className="shrink-0 text-cyan-200"
                  size={27}
                />

                <div>
                  {welcomeBlock.subtitle && (
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                      {welcomeBlock.subtitle}
                    </p>
                  )}

                  <p className="mt-1 font-extrabold">
                    {welcomeBlock.title}
                  </p>

                  {welcomeBlock.content && (
                    <p className="mt-1 text-sm leading-6 text-blue-100">
                      {welcomeBlock.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )}

  <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-9"
    >
      {loadingOptions ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <LoaderCircle className="animate-spin text-[#0a56a4]" size={34} />
          <p className="mt-4 font-bold text-[#092e63]">
            Chargement du formulaire…
          </p>
        </div>
      ) : (
        <>
          <div className="mb-9 flex items-start gap-4 border-b border-slate-100 pb-7">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
              <UserPlus size={24} />
            </div>

            <div>
              {formBlock?.subtitle && (
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  {formBlock.subtitle}
                </p>
              )}

              <h2 className="mt-1 text-2xl font-black text-[#092e63]">
                {formBlock?.title || "Vos informations"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {formBlock?.content ||
                  "Les champs marqués d’un astérisque sont obligatoires."}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="shrink-0" size={20} />
              <span>{successMessage}</span>
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
                  updateField("assemblyId", event.target.value);
                  updateField("departmentId", "");
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
                Date de première visite
              </span>

              <input
                type="date"
                value={form.firstVisitDate}
                onChange={(event) =>
                  updateField("firstVisitDate", event.target.value)
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
                  updateField("firstName", event.target.value)
                }
                className={inputClassName}
                placeholder="Votre prénom"
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
                  updateField("lastName", event.target.value)
                }
                className={inputClassName}
                placeholder="Votre nom"
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
                Téléphone *
              </span>

              <input
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                className={inputClassName}
                placeholder="+243 ..."
                required
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
                placeholder="exemple@email.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Pays
              </span>

              <input
                type="text"
                value={form.country}
                onChange={(event) =>
                  updateField("country", event.target.value)
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
                  updateField("city", event.target.value)
                }
                className={inputClassName}
                placeholder="Ex. Kinshasa"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Commune / Quartier
              </span>

              <input
                type="text"
                value={form.commune}
                onChange={(event) =>
                  updateField("commune", event.target.value)
                }
                className={inputClassName}
                placeholder="Ex. Lemba"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Département ou ministère souhaité
              </span>

              <select
                value={form.departmentId}
                onChange={(event) =>
                  updateField("departmentId", event.target.value)
                }
                className={inputClassName}
                disabled={!form.assemblyId}
              >
                <option value="">Je souhaite être orienté(e)</option>

                {availableDepartments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Un message ou un besoin particulier
              </span>

              <textarea
                value={form.message}
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="Partagez-nous ce que vous souhaitez nous communiquer."
              />
            </label>
          </div>

          {supportBlock && (
            <div className="mt-8 rounded-2xl bg-blue-50 p-5">
              {supportBlock.subtitle && (
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  {supportBlock.subtitle}
                </p>
              )}

              <p className="mt-1 font-extrabold text-[#092e63]">
                {supportBlock.title}
              </p>

              {supportBlock.content && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {supportBlock.content}
                </p>
              )}

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.needsPrayer}
                    onChange={(event) =>
                      updateField("needsPrayer", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#0a56a4]"
                  />
                  J’ai besoin de prière
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.needsCounselling}
                    onChange={(event) =>
                      updateField("needsCounselling", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#0a56a4]"
                  />
                  Je souhaite un entretien
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                  <input
                    type="checkbox"
                    checked={form.wantsBaptism}
                    onChange={(event) =>
                      updateField("wantsBaptism", event.target.checked)
                    }
                    className="h-4 w-4 accent-[#0a56a4]"
                  />
                  Je souhaite le baptême
                </label>
              </div>
            </div>
          )}

          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-5">
            <input
              type="checkbox"
              checked={form.privacyConsent}
              onChange={(event) =>
                updateField("privacyConsent", event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-[#0a56a4]"
              required
            />

            <span className="text-sm leading-6 text-slate-600">
              {privacyBlock.title}
            </span>
          </label>

          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck size={18} className="shrink-0 text-[#0a56a4]" />
              {privacyBlock.content}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3.5 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={18} />
                  Enregistrement…
                </>
              ) : (
                <>
                  Envoyer mon inscription
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  </section>
</main>

);
}
