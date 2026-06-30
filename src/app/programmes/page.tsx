import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Heart,
  Sparkles,
  Users,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type ProgrammeBlock = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  primary_label: string | null;
  primary_href: string | null;
};

const fallbackBlocks: Record<string, ProgrammeBlock> = {
  programmes_hero: {
    block_key: "programmes_hero",
    title: "Grandissons ensemble dans la présence de Dieu",
    subtitle: "Programmes de l’église",
    content:
      "Découvrez nos temps de culte, d’étude biblique, de prière et de communion fraternelle.",
    primary_label: "Je suis nouveau",
    primary_href: "/rejoindre",
  },
  programmes_sunday: {
    block_key: "programmes_sunday",
    title: "Culte de célébration",
    subtitle: "Chaque dimanche • 08h00 à 11h30",
    content:
      "Un temps de louange, de prédication, de communion fraternelle et de croissance dans la Parole de Dieu.",
    primary_label: null,
    primary_href: null,
  },
  programmes_bible: {
    block_key: "programmes_bible",
    title: "Étude biblique",
    subtitle: "Chaque mercredi • 18h00 à 19h30",
    content:
      "Un espace pour approfondir la Bible, poser des questions et grandir dans la compréhension de la foi.",
    primary_label: null,
    primary_href: null,
  },
  programmes_prayer: {
    block_key: "programmes_prayer",
    title: "Temps de prière",
    subtitle: "Chaque vendredi • 18h00 à 19h00",
    content:
      "Nous nous réunissons pour intercéder pour les familles, l’église, la ville et les nations.",
    primary_label: null,
    primary_href: null,
  },
  programmes_youth: {
    block_key: "programmes_youth",
    title: "Rencontre des jeunes",
    subtitle: "Programme selon calendrier",
    content:
      "Des temps adaptés aux jeunes pour grandir dans la foi, développer leurs talents et servir leur génération.",
    primary_label: null,
    primary_href: null,
  },
  programmes_cta: {
    block_key: "programmes_cta",
    title: "Vous souhaitez participer à la vie de l’église ?",
    subtitle: "Bienvenue dans la famille",
    content:
      "Notre équipe se tient disponible pour vous orienter vers un culte, un programme ou un parcours d’intégration adapté.",
    primary_label: "Nous rejoindre",
    primary_href: "/rejoindre",
  },
};

const programmeCards = [
  { key: "programmes_sunday", icon: CalendarDays },
  { key: "programmes_bible", icon: BookOpen },
  { key: "programmes_prayer", icon: Heart },
  { key: "programmes_youth", icon: Users },
];

export default async function ProgrammesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pdv_public_blocks")
    .select(
      "block_key, title, subtitle, content, primary_label, primary_href"
    )
    .in("block_key", Object.keys(fallbackBlocks));

  const blocksByKey = new Map(
    ((data ?? []) as ProgrammeBlock[]).map((block) => [
      block.block_key,
      block,
    ])
  );

  function getBlock(key: string) {
    return blocksByKey.get(key) ?? fallbackBlocks[key];
  }

  const hero = getBlock("programmes_hero");
  const cta = getBlock("programmes_cta");

  return (
    <main className="min-h-screen bg-[#f7faff]">
      <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
            <Sparkles size={18} />
            {hero.subtitle}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            {hero.title}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            {hero.content}
          </p>

          {hero.primary_label && hero.primary_href && (
            <Link
              href={hero.primary_href}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] shadow-lg transition hover:bg-blue-50"
            >
              {hero.primary_label}
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Nos rendez-vous
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Des temps pour prier, apprendre et grandir ensemble
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {programmeCards.map(({ key, icon: Icon }) => {
            const block = getBlock(key);

            return (
              <article
                key={key}
                className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a56a4]">
                  <Icon size={24} />
                </div>

                <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[#1680c4]">
                  {block.subtitle}
                </p>

                <h3 className="mt-2 text-2xl font-black text-[#092e63]">
                  {block.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {block.content}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-blue-100 bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#eef7ff] px-7 py-10 text-center sm:px-12">
          <Users className="mx-auto text-[#0a56a4]" size={34} />

          <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            {cta.subtitle}
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63]">
            {cta.title}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            {cta.content}
          </p>

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
      </section>
    </main>
  );
}