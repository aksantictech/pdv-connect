import Link from "next/link";
import {
  ArrowRight,
  MessageSquareHeart,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type TestimoniesHero = {
  title: string | null;
  subtitle: string | null;
  content: string | null;
  primary_label: string | null;
  primary_href: string | null;
};

type PublishedTestimony = {
  id: string;
  title: string;
  message: string;
  display_name: string;
  published_at: string;
};

const fallbackHero: TestimoniesHero = {
  title: "Les témoignages de la grâce de Dieu",
  subtitle: "Témoignages",
  content:
    "Découvrez des récits de foi, de restauration, de guérison et de transformation partagés par les membres de CEF Parole de Vie.",
  primary_label: "Laisser mon témoignage",
  primary_href: "/temoignage",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function TemoignagesPage() {
  const supabase = await createClient();

  const [heroResult, testimoniesResult] = await Promise.all([
    supabase
      .from("pdv_public_blocks")
      .select("title, subtitle, content, primary_label, primary_href")
      .eq("block_key", "testimonies_hero")
      .maybeSingle(),

    supabase.rpc("get_published_pdv_testimonies", {
      p_limit: 24,
    }),
  ]);

  const hero =
    (heroResult.data as TestimoniesHero | null) ?? fallbackHero;

  const testimonies =
    (testimoniesResult.data as PublishedTestimony[] | null) ?? [];

  return (
    <main className="min-h-screen bg-[#f7faff]">
      <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
              <MessageSquareHeart size={18} />
              {hero.subtitle || "Témoignages"}
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
              {hero.title || fallbackHero.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
              {hero.content || fallbackHero.content}
            </p>

            <Link
              href={hero.primary_href || "/temoignage"}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              {hero.primary_label || "Laisser mon témoignage"}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-7 backdrop-blur">
            <Quote className="text-cyan-200" size={34} />

            <p className="mt-6 text-4xl font-black">{testimonies.length}</p>

            <p className="mt-1 text-sm font-semibold text-blue-100">
              témoignage{testimonies.length > 1 ? "s" : ""} validé
              {testimonies.length > 1 ? "s" : ""} et partagé
              {testimonies.length > 1 ? "s" : ""}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-cyan-100">
              <Sparkles size={17} />
              Partageons ce que Dieu accomplit
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm leading-6 text-slate-600 shadow-sm">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#0a56a4]" size={20} />
          Les témoignages sont publiés uniquement après validation par
          l’administration de CEF Parole de Vie. Les coordonnées personnelles
          ne sont jamais affichées.
        </div>

        {testimoniesResult.error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Les témoignages sont temporairement indisponibles.
          </div>
        )}

        {testimonies.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-blue-100 bg-white px-6 py-16 text-center shadow-sm">
            <MessageSquareHeart
              className="mx-auto text-blue-200"
              size={46}
            />

            <h2 className="mt-5 text-2xl font-black text-[#092e63]">
              Les premiers témoignages arrivent bientôt
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              Partagez ce que Dieu a accompli dans votre vie afin d’encourager
              la foi de toute la communauté.
            </p>

            <Link
              href="/temoignage"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
            >
              Partager mon témoignage
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonies.map((testimony) => (
              <article
                key={testimony.id}
                className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Quote className="text-[#1680c4]" size={28} />

                <p className="mt-6 text-sm font-black uppercase tracking-[0.13em] text-[#1680c4]">
                  Témoignage de {testimony.display_name}
                </p>

                <h2 className="mt-3 text-xl font-black text-[#092e63]">
                  {testimony.title}
                </h2>

                <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
                  {testimony.message}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">
                  Partagé le {formatDate(testimony.published_at)}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-blue-100 bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#eef7ff] px-7 py-10 text-center sm:px-12">
          <MessageSquareHeart
            className="mx-auto text-[#0a56a4]"
            size={34}
          />

          <h2 className="mt-5 text-3xl font-black text-[#092e63]">
            Votre histoire peut fortifier une autre personne.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Partagez votre témoignage avec simplicité. Il sera relu avant toute
            publication éventuelle sur le site.
          </p>

          <Link
            href="/temoignage"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
          >
            Laisser un témoignage
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}