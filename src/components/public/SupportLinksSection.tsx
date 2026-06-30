import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  HeartHandshake,
  MessageSquareHeart,
  ShieldCheck,
} from "lucide-react";

const actions = [
  {
    title: "Demander une prière",
    description:
      "Confiez votre sujet de prière à une équipe qui le recevra avec discrétion.",
    href: "/priere",
    icon: HeartHandshake,
    badge: "Confidentiel",
  },
  {
    title: "Laisser un témoignage",
    description:
      "Partagez ce que Dieu a accompli dans votre vie pour encourager d’autres personnes.",
    href: "/temoignage",
    icon: MessageSquareHeart,
    badge: "À valider",
  },
  {
    title: "Prendre rendez-vous",
    description:
      "Demandez un entretien pastoral ou un temps d’accompagnement personnalisé.",
    href: "/rendez-vous",
    icon: CalendarCheck2,
    badge: "Accompagnement",
  },
];

export default function SupportLinksSection() {
  return (
    <section className="border-y border-blue-100 bg-[#f7faff] px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1680c4]">
            Nous sommes à vos côtés
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Un besoin, une question ou un sujet à partager ?
          </h2>

          <p className="mt-4 leading-8 text-slate-600">
            CEF Parole de Vie vous accompagne par la prière, l’écoute, le
            partage de témoignages et les rendez-vous pastoraux.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {actions.map(({ title, description, href, icon: Icon, badge }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82] transition group-hover:bg-[#0a3d82] group-hover:text-white">
                  <Icon size={24} />
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#0a56a4]">
                  {badge}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black text-[#092e63]">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">{description}</p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4]">
                Accéder au formulaire
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-4 text-sm leading-6 text-slate-600">
          <ShieldCheck className="shrink-0 text-[#0a56a4]" size={20} />
          Les informations transmises sont traitées de manière responsable. Les
          demandes de prière ne sont pas affichées dans les espaces
          administratifs généraux.
        </div>
      </div>
    </section>
  );
}