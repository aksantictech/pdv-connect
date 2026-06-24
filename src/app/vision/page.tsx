import { Globe2, HeartHandshake, Megaphone } from "lucide-react";

export default function VisionPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-[#082553] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
            CEF Parole de Vie
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            Une vision fondée sur la Parole, portée par la foi et tournée vers
            les nations.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            CEF Parole de Vie a pour ambition de faire grandir des disciples,
            former des ouvriers et étendre l’œuvre de Dieu à travers les villes
            et les nations.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">
        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <HeartHandshake className="text-[#0a56a4]" size={28} />
          <h2 className="mt-6 text-xl font-black text-[#092e63]">
            Notre mission
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Accompagner les croyants dans leur croissance spirituelle et former
            des serviteurs engagés.
          </p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <Globe2 className="text-[#0a56a4]" size={28} />
          <h2 className="mt-6 text-xl font-black text-[#092e63]">
            Notre vision
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Étendre la Parole de Vie à travers le monde par des assemblées
            solides, structurées et missionnaires.
          </p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-7 shadow-sm">
          <Megaphone className="text-[#0a56a4]" size={28} />
          <h2 className="mt-6 text-xl font-black text-[#092e63]">
            Notre engagement
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Servir avec excellence, annoncer l’Évangile et impacter durablement
            les familles et les communautés.
          </p>
        </article>
      </section>
    </main>
  );
}