import Link from "next/link";
import {
  ArrowRight,
  Baby,
  HandHeart,
  HeartHandshake,
  Megaphone,
  Mic2,
  ShieldCheck,
  Users,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type MinistryBlock = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  primary_label: string | null;
  primary_href: string | null;
};

const fallbackBlocks: Record<string, MinistryBlock> = {
  ministries_hero: {
    block_key: "ministries_hero",
    title: "Des ministères au service de Dieu, de l’église et de la communauté.",
    subtitle: "Servir ensemble",
    content:
      "Chaque ministère est un espace d’engagement, de croissance et de service. Découvrez les équipes qui font vivre la vision de CEF Parole de Vie.",
    primary_label: "Rejoindre une équipe",
    primary_href: "/rejoindre",
  },
  ministries_intro: {
    block_key: "ministries_intro",
    title: "Trouvez votre place pour servir",
    subtitle: "Nos équipes",
    content:
      "Dieu donne à chacun des dons, des talents et une mission. Nous vous encourageons à vous connecter à un ministère selon vos capacités, votre appel et votre disponibilité.",
    primary_label: null,
    primary_href: null,
  },
  ministry_reception: {
    block_key: "ministry_reception",
    title: "Accueil & intégration",
    subtitle: null,
    content:
      "Accueillir chaque personne, orienter les nouveaux arrivants et favoriser leur intégration dans la famille de l’église.",
    primary_label: null,
    primary_href: null,
  },
  ministry_evangelism: {
    block_key: "ministry_evangelism",
    title: "Évangélisation",
    subtitle: null,
    content:
      "Annoncer l’Évangile, atteindre les familles et conduire des actions missionnaires dans la communauté.",
    primary_label: null,
    primary_href: null,
  },
  ministry_intercession: {
    block_key: "ministry_intercession",
    title: "Intercession",
    subtitle: null,
    content:
      "Porter l’église, les familles, la nation et les différents besoins dans la prière.",
    primary_label: null,
    primary_href: null,
  },
  ministry_worship: {
    block_key: "ministry_worship",
    title: "Louange & adoration",
    subtitle: null,
    content:
      "Conduire l’assemblée dans une atmosphère de louange, d’adoration et de célébration.",
    primary_label: null,
    primary_href: null,
  },
  ministry_youth: {
    block_key: "ministry_youth",
    title: "Jeunesse",
    subtitle: null,
    content:
      "Accompagner les jeunes dans leur foi, leur identité et leur engagement au service de Dieu.",
    primary_label: null,
    primary_href: null,
  },
  ministry_children: {
    block_key: "ministry_children",
    title: "Enfance",
    subtitle: null,
    content:
      "Transmettre la Parole de Dieu aux enfants dans un cadre adapté, joyeux et sécurisant.",
    primary_label: null,
    primary_href: null,
  },
  ministries_cta: {
    block_key: "ministries_cta",
    title: "Vous souhaitez servir avec nous ?",
    subtitle: "Votre engagement compte",
    content:
      "Faites-nous connaître vos domaines d’intérêt. L’équipe d’intégration vous accompagnera pour découvrir le ministère qui correspond le mieux à votre appel.",
    primary_label: "Je souhaite servir",
    primary_href: "/rejoindre",
  },
};

const blockKeys = Object.keys(fallbackBlocks);

export default async function MinisteresPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pdv_public_blocks")
    .select(
      "block_key, title, subtitle, content, primary_label, primary_href"
    )
    .in("block_key", blockKeys);

  const databaseBlocks = (data as MinistryBlock[] | null) ?? [];

  const blocksByKey = new Map(
    databaseBlocks.map((block) => [block.block_key, block])
  );

  function getBlock(key: string) {
    if (error) {
      return fallbackBlocks[key];
    }

    return blocksByKey.get(key) ?? null;
  }

  const hero = getBlock("ministries_hero");
  const intro = getBlock("ministries_intro");
  const cta = getBlock("ministries_cta");

  const ministries = [
    {
      key: "ministry_reception",
      icon: HandHeart,
    },
    {
      key: "ministry_evangelism",
      icon: Megaphone,
    },
    {
      key: "ministry_intercession",
      icon: ShieldCheck,
    },
    {
      key: "ministry_worship",
      icon: Mic2,
    },
    {
      key: "ministry_youth",
      icon: Users,
    },
    {
      key: "ministry_children",
      icon: Baby,
    },
  ]
    .map((item) => ({
      ...item,
      block: getBlock(item.key),
    }))
    .filter(
      (
        item
      ): item is {
        key: string;
        icon: typeof HandHeart;
        block: MinistryBlock;
      } => Boolean(item.block)
    );

  return (
    <main className="min-h-screen bg-[#f7faff]">
      {hero && (
        <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
              {hero.subtitle || "Servir ensemble"}
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              {hero.title}
            </h1>

            {hero.content && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
                {hero.content}
              </p>
            )}

            {hero.primary_label && hero.primary_href && (
              <Link
                href={hero.primary_href}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
              >
                {hero.primary_label}
                <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        {intro && (
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
              {intro.subtitle || "Nos équipes"}
            </p>

            <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
              {intro.title}
            </h2>

            {intro.content && (
              <p className="mt-4 leading-7 text-slate-600">{intro.content}</p>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {ministries.map(({ key, icon: Icon, block }) => (
            <article
              key={key}
              className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0a56a4]">
                <Icon size={25} />
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
      </section>

      {cta && (
        <section className="border-y border-blue-100 bg-white px-5 py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 rounded-[2rem] bg-[#eef7ff] p-8 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0a3d82] text-white">
              <HeartHandshake size={31} />
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
                {cta.subtitle || "Votre engagement compte"}
              </p>

              <h2 className="mt-3 text-3xl font-black text-[#092e63]">
                {cta.title}
              </h2>

              {cta.content && (
                <p className="mt-4 max-w-3xl leading-7 text-slate-600">
                  {cta.content}
                </p>
              )}

              {cta.primary_label && cta.primary_href && (
                <Link
                  href={cta.primary_href}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
                >
                  {cta.primary_label}
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}