import Image from "next/image";
import Link from "next/link";
import {
ArrowRight,
Bell,
BookOpenCheck,
ClipboardCheck,
GraduationCap,
ShieldCheck,
UserRoundCheck,
Users,
type LucideIcon,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type SchoolBlock = {
block_key: string;
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
secondary_label: string | null;
secondary_href: string | null;
image_path: string | null;
image_url?: string | null;
};

const blockKeys = [
"school_hero",
"school_intro",
"school_academic",
"school_spiritual",
"school_community",
"school_feature_students",
"school_feature_teachers",
"school_feature_attendance",
"school_feature_results",
"school_feature_communications",
"school_feature_portal",
"school_admission",
"school_contact",
"school_cta",
];

const fallbackBlocks: Record<string, SchoolBlock> = {
school_hero: {
block_key: "school_hero",
title: "Former, élever et envoyer une génération d’excellence.",
subtitle: "École Chrétienne Parole du Salut",
content:
"L’École Chrétienne Parole du Salut associe foi, discipline, excellence académique et service afin de préparer des enfants et des jeunes capables d’impacter leur communauté et leur nation.",
primary_label: "Découvrir le module École",
primary_href: "#fonctionnalites",
secondary_label: "Accès administration scolaire",
secondary_href: "/connexion",
image_path: null,
},
school_intro: {
block_key: "school_intro",
title: "Une école structurée pour accompagner chaque enfant.",
subtitle: "Éducation avec vision",
content:
"Le module École de PDV Connect centralise les informations académiques, administratives et pédagogiques de manière fiable, sécurisée et accessible.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_academic: {
block_key: "school_academic",
title: "Excellence académique",
subtitle: null,
content:
"Un enseignement rigoureux adapté aux besoins des élèves, avec un suivi régulier de leur parcours scolaire.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_spiritual: {
block_key: "school_spiritual",
title: "Formation chrétienne",
subtitle: null,
content:
"Une transmission des valeurs bibliques pour aider les enfants à grandir dans la foi, le respect et l’intégrité.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_community: {
block_key: "school_community",
title: "Partenariat avec les familles",
subtitle: null,
content:
"Une relation de confiance entre l’école, les enseignants et les parents pour accompagner chaque enfant vers la réussite.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_students: {
block_key: "school_feature_students",
title: "Gestion des élèves",
subtitle: null,
content:
"Dossiers scolaires centralisés, inscriptions, réinscriptions et affectation dans les classes.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_teachers: {
block_key: "school_feature_teachers",
title: "Gestion des enseignants",
subtitle: null,
content:
"Répertoire des enseignants, affectations, suivi administratif et encadrement pédagogique.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_attendance: {
block_key: "school_feature_attendance",
title: "Présences",
subtitle: null,
content:
"Suivi quotidien des présences, absences et retards des élèves et du personnel enseignant.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_results: {
block_key: "school_feature_results",
title: "Résultats académiques",
subtitle: null,
content:
"Encodage des notes, calcul automatisé des résultats, bulletins et palmarès.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_communications: {
block_key: "school_feature_communications",
title: "Communications administratives",
subtitle: null,
content:
"Annonces et communications ciblées aux parents, élèves, enseignants et responsables.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_feature_portal: {
block_key: "school_feature_portal",
title: "Portail sécurisé",
subtitle: null,
content:
"Accès contrôlé pour la direction, le secrétariat, les enseignants et les parents.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_admission: {
block_key: "school_admission",
title: "Préinscriptions et admissions",
subtitle: "Inscrire votre enfant",
content:
"Contactez notre équipe administrative pour connaître les conditions d’admission, les classes disponibles et les documents nécessaires à l’inscription.",
primary_label: "Prendre contact",
primary_href: "/rejoindre",
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_contact: {
block_key: "school_contact",
title: "Besoin de plus d’informations ?",
subtitle: "Contact de l’école",
content:
"Notre équipe est disponible pour répondre à vos questions concernant les inscriptions, les programmes scolaires et la vie de l’établissement.",
primary_label: null,
primary_href: null,
secondary_label: null,
secondary_href: null,
image_path: null,
},
school_cta: {
block_key: "school_cta",
title:
"Une administration scolaire fiable au service de la réussite des élèves.",
subtitle: "PDV Connect — Module École",
content:
"Le portail scolaire permet le suivi complet des élèves, enseignants, présences et résultats académiques.",
primary_label: "Accéder à l’espace sécurisé",
primary_href: "/connexion",
secondary_label: null,
secondary_href: null,
image_path: null,
},
};

const featureConfigs: Array<{ key: string; icon: LucideIcon }> = [
{ key: "school_feature_students", icon: Users },
{ key: "school_feature_teachers", icon: GraduationCap },
{ key: "school_feature_attendance", icon: ClipboardCheck },
{ key: "school_feature_results", icon: BookOpenCheck },
{ key: "school_feature_communications", icon: Bell },
{ key: "school_feature_portal", icon: ShieldCheck },
];

const valueConfigs: Array<{ key: string; icon: LucideIcon }> = [
{ key: "school_academic", icon: BookOpenCheck },
{ key: "school_spiritual", icon: ShieldCheck },
{ key: "school_community", icon: Users },
];

export default async function EcolePage() {
const supabase = await createClient();

const { data, error } = await supabase
.from("pdv_public_blocks")
.select(
"block_key, title, subtitle, content, primary_label, primary_href, secondary_label, secondary_href, image_path"
)
.in("block_key", blockKeys);

const rawBlocks = (data as SchoolBlock[] | null) ?? [];

const blocksByKey = new Map(
rawBlocks.map((block) => {
let imageUrl: string | null = null;

  if (block.image_path) {
    const { data: imageData } = supabase.storage
      .from("pdv-public")
      .getPublicUrl(block.image_path);

    imageUrl = imageData.publicUrl;
  }

  return [
    block.block_key,
    {
      ...block,
      image_url: imageUrl,
    },
  ];
})

);

function getBlock(key: string) {
if (error) {
return fallbackBlocks[key];
}

return blocksByKey.get(key) ?? null;

}

const hero = getBlock("school_hero");
const intro = getBlock("school_intro");
const admission = getBlock("school_admission");
const contact = getBlock("school_contact");
const cta = getBlock("school_cta");

const values = valueConfigs
.map((item) => ({
...item,
block: getBlock(item.key),
}))
.filter(
(
item
): item is {
key: string;
icon: LucideIcon;
block: SchoolBlock;
} => Boolean(item.block)
);

const features = featureConfigs
.map((item) => ({
...item,
block: getBlock(item.key),
}))
.filter(
(
item
): item is {
key: string;
icon: LucideIcon;
block: SchoolBlock;
} => Boolean(item.block)
);

return ( <main className="min-h-screen bg-slate-50">
{hero && ( <section className="relative isolate min-h-[590px] overflow-hidden">
{hero.image_url ? (
<img
src={hero.image_url}
alt={hero.title || "École Chrétienne Parole du Salut"}
className="absolute inset-0 h-full w-full object-cover"
/>
) : ( <Image
           src="/images/ecole-pdv.png"
           alt="École Chrétienne Parole du Salut"
           fill
           priority
           className="object-cover object-center"
         />
)}

      <div className="absolute inset-0 bg-gradient-to-r from-[#041a3d]/95 via-[#082e65]/80 to-[#0a56a4]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041a3d]/70 via-transparent to-transparent" />

      <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-5 py-20 lg:px-8">
        <div className="max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
            <GraduationCap size={18} />
            {hero.subtitle || "École Chrétienne Parole du Salut"}
          </div>

          <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>

          {hero.content && (
            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              {hero.content}
            </p>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {hero.primary_label && hero.primary_href && (
              <Link
                href={hero.primary_href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-[#0a3d82] shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                {hero.primary_label}
                <ArrowRight size={18} />
              </Link>
            )}

            {hero.secondary_label && hero.secondary_href && (
              <Link
                href={hero.secondary_href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                <UserRoundCheck size={19} />
                {hero.secondary_label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )}

  {intro && (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1680c4]">
            {intro.subtitle || "Éducation avec vision"}
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-[#092e63] sm:text-4xl">
            {intro.title}
          </h2>

          {intro.content && (
            <p className="mt-6 leading-8 text-slate-600">{intro.content}</p>
          )}

          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="font-extrabold text-[#092e63]">
              Devise de l’école
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Foi • Excellence • Service
            </p>
          </div>
        </div>

        <div className="relative min-h-[330px] overflow-hidden rounded-[2rem] shadow-xl">
          {intro.image_url ? (
            <img
              src={intro.image_url}
              alt={intro.title || "École Chrétienne Parole du Salut"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src="/images/ecole-pdv.png"
              alt="Entrée de l’École Chrétienne Parole du Salut"
              fill
              className="object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#061d45]/85 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-200">
              Proverbes 22:6
            </p>
            <p className="mt-2 text-xl font-black leading-8">
              Instruis l’enfant selon la voie qu’il doit suivre.
            </p>
          </div>
        </div>
      </div>
    </section>
  )}

  {values.length > 0 && (
    <section className="border-y border-blue-100 bg-white px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ key, icon: Icon, block }) => (
            <article
              key={key}
              className="rounded-3xl border border-blue-100 bg-slate-50 p-7"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
                <Icon size={24} />
              </div>

              <h3 className="mt-6 text-xl font-black text-[#092e63]">
                {block.title}
              </h3>

              {block.content && (
                <p className="mt-3 leading-7 text-slate-600">
                  {block.content}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )}

  <section
    id="fonctionnalites"
    className="border-b border-blue-100 bg-white px-5 py-20 lg:px-8"
  >
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1680c4]">
          PDV Connect — Module École
        </p>

        <h2 className="mt-4 text-3xl font-black text-[#092e63] sm:text-4xl">
          Les fonctionnalités prévues pour l’administration scolaire.
        </h2>

        <p className="mt-4 leading-8 text-slate-600">
          Chaque espace est conçu selon les responsabilités de la direction,
          du secrétariat, des enseignants et des parents.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ key, icon: Icon, block }) => (
          <article
            key={key}
            className="group rounded-3xl border border-blue-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82] transition group-hover:bg-[#0a3d82] group-hover:text-white">
              <Icon size={24} />
            </div>

            <h3 className="mt-6 text-xl font-black text-[#092e63]">
              {block.title}
            </h3>

            {block.content && (
              <p className="mt-3 leading-7 text-slate-600">
                {block.content}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  </section>

  {admission && (
    <section id="admission" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="rounded-[2rem] bg-[#eef7ff] px-7 py-10 sm:px-10">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          {admission.subtitle || "Inscrire votre enfant"}
        </p>

        <h2 className="mt-3 text-3xl font-black text-[#092e63]">
          {admission.title}
        </h2>

        {admission.content && (
          <p className="mt-4 max-w-3xl leading-8 text-slate-600">
            {admission.content}
          </p>
        )}

        {admission.primary_label && admission.primary_href && (
          <Link
            href={admission.primary_href}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3.5 font-extrabold text-white transition hover:bg-[#072d61]"
          >
            {admission.primary_label}
            <ArrowRight size={18} />
          </Link>
        )}
      </div>
    </section>
  )}

  {contact && (
    <section id="contact-ecole" className="border-y border-blue-100 bg-white px-5 py-14 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          {contact.subtitle || "Contact de l’école"}
        </p>

        <h2 className="mt-3 text-3xl font-black text-[#092e63]">
          {contact.title}
        </h2>

        {contact.content && (
          <p className="mx-auto mt-4 max-w-3xl leading-8 text-slate-600">
            {contact.content}
          </p>
        )}
      </div>
    </section>
  )}

  {cta && (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="rounded-[2rem] bg-gradient-to-r from-[#082553] to-[#0a56a4] px-7 py-12 text-center text-white shadow-xl sm:px-12">
        <GraduationCap className="mx-auto text-cyan-200" size={38} />

        <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
          {cta.subtitle || "PDV Connect — Module École"}
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
          {cta.title}
        </h2>

        {cta.content && (
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-blue-100">
            {cta.content}
          </p>
        )}

        {cta.primary_label && cta.primary_href && (
          <Link
            href={cta.primary_href}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
          >
            {cta.primary_label}
            <UserRoundCheck size={18} />
          </Link>
        )}
      </div>
    </section>
  )}
</main>

);
}
