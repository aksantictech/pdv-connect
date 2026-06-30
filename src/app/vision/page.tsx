import { Globe2, HeartHandshake, Megaphone } from "lucide-react";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type VisionBlock = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
};

const fallbackBlocks: Record<string, VisionBlock> = {
  vision_hero: {
    block_key: "vision_hero",
    title:
      "Une vision fondée sur la Parole, portée par la foi et tournée vers les nations.",
    subtitle: "CEF Parole de Vie",
    content:
      "CEF Parole de Vie a pour ambition de faire grandir des disciples, former des ouvriers et étendre l’œuvre de Dieu à travers les villes et les nations.",
  },
  vision_mission: {
    block_key: "vision_mission",
    title: "Notre mission",
    subtitle: null,
    content:
      "Accompagner les croyants dans leur croissance spirituelle et former des serviteurs engagés.",
  },
  vision_vision: {
    block_key: "vision_vision",
    title: "Notre vision",
    subtitle: null,
    content:
      "Étendre la Parole de Vie à travers le monde par des assemblées solides, structurées et missionnaires.",
  },
  vision_engagement: {
    block_key: "vision_engagement",
    title: "Notre engagement",
    subtitle: null,
    content:
      "Servir avec excellence, annoncer l’Évangile et impacter durablement les familles et les communautés.",
  },
};

export default async function VisionPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pdv_public_blocks")
    .select("block_key, title, subtitle, content")
    .in("block_key", [
      "vision_hero",
      "vision_mission",
      "vision_vision",
      "vision_engagement",
    ]);

  const databaseBlocks = (data as VisionBlock[] | null) ?? [];

  const blocksByKey = new Map(
    databaseBlocks.map((block) => [block.block_key, block])
  );

  const hero = error
    ? fallbackBlocks.vision_hero
    : blocksByKey.get("vision_hero");

  const cards = [
    {
      key: "vision_mission",
      icon: HeartHandshake,
      fallback: fallbackBlocks.vision_mission,
    },
    {
      key: "vision_vision",
      icon: Globe2,
      fallback: fallbackBlocks.vision_vision,
    },
    {
      key: "vision_engagement",
      icon: Megaphone,
      fallback: fallbackBlocks.vision_engagement,
    },
  ]
    .map((item) => ({
      ...item,
      block: error ? item.fallback : blocksByKey.get(item.key),
    }))
    .filter(
      (
        item
      ): item is {
        key: string;
        icon: typeof HeartHandshake;
        fallback: VisionBlock;
        block: VisionBlock;
      } => Boolean(item.block)
    );

  return (
    <main className="min-h-screen bg-slate-50">
      {hero && (
        <section className="bg-gradient-to-br from-[#082553] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
              {hero.subtitle || "CEF Parole de Vie"}
            </p>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              {hero.title}
            </h1>

            {hero.content && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
                {hero.content}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">
        {cards.map(({ key, icon: Icon, block }) => (
          <article
            key={key}
            className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm"
          >
            <Icon className="text-[#0a56a4]" size={28} />

            <h2 className="mt-6 text-xl font-black text-[#092e63]">
              {block.title}
            </h2>

            {block.content && (
              <p className="mt-3 leading-7 text-slate-600">{block.content}</p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}