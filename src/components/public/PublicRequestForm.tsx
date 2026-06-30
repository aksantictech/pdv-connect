"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
ArrowLeft,
CalendarCheck2,
CheckCircle2,
Heart,
LoaderCircle,
MessageSquareHeart,
ShieldCheck,
type LucideIcon,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

type RequestType = "prayer" | "testimony" | "appointment";

type CmsBlock = {
title: string | null;
subtitle: string | null;
content: string | null;
};

type FormState = {
fullName: string;
phone: string;
email: string;
subject: string;
message: string;
preferredDate: string;
preferredTime: string;
appointmentReason: string;
privacyConsent: boolean;
isTestimonyPublic: boolean;
};

type PageConfig = {
eyebrow: string;
cmsKey: string;
fallbackTitle: string;
fallbackSubtitle: string;
fallbackContent: string;
icon: LucideIcon;
formTitle: string;
formDescription: string;
subjectLabel: string;
subjectPlaceholder: string;
messageLabel: string;
messagePlaceholder: string;
submitLabel: string;
successMessage: string;
};

const pageConfigs: Record<RequestType, PageConfig> = {
prayer: {
eyebrow: "Demander une prière",
cmsKey: "prayer_hero",
fallbackTitle: "Confiez-nous votre sujet de prière.",
fallbackSubtitle: "Demander une prière",
fallbackContent:
"Notre équipe de prière recevra votre demande avec discrétion et portera votre besoin dans la prière.",
icon: Heart,
formTitle: "Votre demande de prière",
formDescription:
"Partagez votre besoin. Notre équipe d’intercession le recevra dans la confidentialité.",
subjectLabel: "Sujet de prière",
subjectPlaceholder: "Ex. Santé, famille, travail, projet...",
messageLabel: "Votre demande *",
messagePlaceholder:
"Décrivez votre sujet de prière avec les informations que vous souhaitez partager.",
submitLabel: "Envoyer ma demande",
successMessage:
"Votre demande de prière a bien été transmise à l’équipe concernée.",
},

testimony: {
eyebrow: "Laisser un témoignage",
cmsKey: "testimony_hero",
fallbackTitle: "Partagez ce que Dieu a accompli dans votre vie.",
fallbackSubtitle: "Laisser un témoignage",
fallbackContent:
"Votre témoignage peut encourager la foi de nombreuses personnes. Il sera relu et validé avant toute publication éventuelle.",
icon: MessageSquareHeart,
formTitle: "Votre témoignage",
formDescription:
"Merci de raconter avec vos propres mots ce que Dieu a fait dans votre vie.",
subjectLabel: "Titre de votre témoignage",
subjectPlaceholder: "Ex. Une guérison, une porte ouverte, une restauration...",
messageLabel: "Votre témoignage *",
messagePlaceholder:
"Partagez votre témoignage de façon claire et respectueuse.",
submitLabel: "Envoyer mon témoignage",
successMessage:
"Votre témoignage a bien été transmis. Il sera relu avant toute éventuelle publication.",
},

appointment: {
eyebrow: "Prendre rendez-vous",
cmsKey: "appointment_hero",
fallbackTitle: "Demandez un rendez-vous pastoral.",
fallbackSubtitle: "Prendre rendez-vous",
fallbackContent:
"Proposez une date et expliquez brièvement votre besoin. L’équipe pastorale vous recontactera pour confirmer le créneau.",
icon: CalendarCheck2,
formTitle: "Votre demande de rendez-vous",
formDescription:
"Proposez un créneau et décrivez brièvement le motif de votre demande.",
subjectLabel: "Motif du rendez-vous",
subjectPlaceholder:
"Ex. Entretien pastoral, accompagnement, conseil, préparation...",
messageLabel: "Informations complémentaires *",
messagePlaceholder:
"Précisez les éléments utiles pour préparer cet échange.",
submitLabel: "Envoyer ma demande",
successMessage:
"Votre demande de rendez-vous a bien été reçue. L’équipe pastorale vous recontactera pour confirmation.",
},
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function createEmptyForm(): FormState {
return {
fullName: "",
phone: "",
email: "",
subject: "",
message: "",
preferredDate: "",
preferredTime: "",
appointmentReason: "",
privacyConsent: false,
isTestimonyPublic: false,
};
}

export default function PublicRequestForm({
requestType,
}: {
requestType: RequestType;
}) {
const supabase = useMemo(() => createClient(), []);
const config = pageConfigs[requestType];
const Icon = config.icon;

const [cmsBlock, setCmsBlock] = useState<CmsBlock | null>(null);
const [form, setForm] = useState<FormState>(createEmptyForm);
const [submitting, setSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

const title = cmsBlock?.title || config.fallbackTitle;
const subtitle = cmsBlock?.subtitle || config.fallbackSubtitle;
const description = cmsBlock?.content || config.fallbackContent;

useEffect(() => {
async function loadCmsBlock() {
const { data } = await supabase
.from("pdv_public_blocks")
.select("title, subtitle, content")
.eq("block_key", config.cmsKey)
.maybeSingle();

  if (data) {
    setCmsBlock(data as CmsBlock);
  }
}

loadCmsBlock();

}, [config.cmsKey, supabase]);

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

if (!form.fullName.trim()) {
  setErrorMessage("Veuillez renseigner votre nom complet.");
  return;
}

if (!form.phone.trim() && !form.email.trim()) {
  setErrorMessage(
    "Veuillez renseigner au moins un numéro de téléphone ou une adresse e-mail."
  );
  return;
}

if (!form.message.trim()) {
  setErrorMessage("Votre message est obligatoire.");
  return;
}

if (requestType === "appointment" && !form.preferredDate) {
  setErrorMessage("Veuillez proposer une date de rendez-vous.");
  return;
}

if (!form.privacyConsent) {
  setErrorMessage(
    "Votre consentement est nécessaire pour envoyer cette demande."
  );
  return;
}

setSubmitting(true);

const { error } = await supabase.rpc("submit_pdv_public_request", {
  p_payload: {
    request_type: requestType,
    full_name: form.fullName.trim(),
    phone: form.phone.trim() || null,
    email: form.email.trim() || null,
    subject: form.subject.trim() || null,
    message: form.message.trim(),
    preferred_date:
      requestType === "appointment" ? form.preferredDate || null : null,
    preferred_time:
      requestType === "appointment" ? form.preferredTime || null : null,
    appointment_reason:
      requestType === "appointment"
        ? form.subject.trim() || null
        : null,
    privacy_consent: form.privacyConsent,
    is_testimony_public:
      requestType === "testimony" ? form.isTestimonyPublic : false,
  },
});

setSubmitting(false);

if (error) {
  setErrorMessage(
    error.message ||
      "Une erreur est survenue. Veuillez réessayer dans quelques instants."
  );
  return;
}

setSuccessMessage(config.successMessage);
setForm(createEmptyForm());

}

return ( <main className="min-h-screen bg-[#f7faff]"> <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-16 text-white lg:px-8"> <div className="mx-auto max-w-6xl"> <Link
         href="/"
         className="inline-flex items-center gap-2 text-sm font-bold text-blue-100 transition hover:text-white"
       > <ArrowLeft size={17} />
Retour à l’accueil </Link>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
            <Icon size={18} />
            {config.eyebrow}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            {title}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100">
            {description}
          </p>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur">
          <ShieldCheck className="text-cyan-200" size={28} />

          <p className="mt-5 text-lg font-black">
            Votre message reste confidentiel.
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-100">
            Les informations transmises sont accessibles uniquement aux
            personnes autorisées à assurer le suivi pastoral.
          </p>
        </div>
      </div>
    </div>
  </section>

  <section className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm sm:p-9"
    >
      <div className="flex items-start gap-4 border-b border-slate-100 pb-7">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
          <Icon size={24} />
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
            {subtitle}
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#092e63]">
            {config.formTitle}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {config.formDescription}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-6 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="shrink-0" size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Nom complet *
          </span>

          <input
            value={form.fullName}
            onChange={(event) =>
              updateField("fullName", event.target.value)
            }
            className={inputClassName}
            placeholder="Votre nom et prénom"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Téléphone
          </span>

          <input
            type="tel"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className={inputClassName}
            placeholder="+243 ..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Adresse e-mail
          </span>

          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={inputClassName}
            placeholder="exemple@email.com"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            {config.subjectLabel}
          </span>

          <input
            value={form.subject}
            onChange={(event) =>
              updateField("subject", event.target.value)
            }
            className={inputClassName}
            placeholder={config.subjectPlaceholder}
          />
        </label>

        {requestType === "appointment" && (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Date souhaitée *
              </span>

              <input
                type="date"
                value={form.preferredDate}
                onChange={(event) =>
                  updateField("preferredDate", event.target.value)
                }
                min={new Date().toISOString().slice(0, 10)}
                className={inputClassName}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Heure souhaitée
              </span>

              <input
                type="time"
                value={form.preferredTime}
                onChange={(event) =>
                  updateField("preferredTime", event.target.value)
                }
                className={inputClassName}
              />
            </label>
          </>
        )}

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            {config.messageLabel}
          </span>

          <textarea
            value={form.message}
            onChange={(event) =>
              updateField("message", event.target.value)
            }
            className={`${inputClassName} min-h-36 resize-y`}
            placeholder={config.messagePlaceholder}
            required
          />
        </label>
      </div>

      {requestType === "testimony" && (
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-blue-50 p-5">
          <input
            type="checkbox"
            checked={form.isTestimonyPublic}
            onChange={(event) =>
              updateField("isTestimonyPublic", event.target.checked)
            }
            className="mt-1 h-4 w-4 accent-[#0a56a4]"
          />

          <span className="text-sm leading-6 text-slate-600">
            J’autorise CEF Parole de Vie à envisager la publication de mon
            témoignage, après validation par l’équipe de communication.
          </span>
        </label>
      )}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-5">
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
          J’accepte que CEF Parole de Vie utilise ces informations
          uniquement pour répondre à ma demande et assurer un suivi
          approprié.
        </span>
      </label>

      <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-100 pt-7 sm:flex-row sm:items-center">
        <p className="flex max-w-md items-center gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck size={18} className="shrink-0 text-[#0a56a4]" />
          Vos informations ne seront pas affichées publiquement.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3.5 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              Envoi en cours…
            </>
          ) : (
            <>
              {config.submitLabel}
              <CheckCircle2 size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  </section>
</main>

);
}
