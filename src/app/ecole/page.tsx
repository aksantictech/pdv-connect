import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  BookOpenCheck,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";

const features = [
  {
    title: "Gestion des élèves",
    description:
      "Dossiers scolaires centralisés, inscriptions, réinscriptions et affectation dans les classes.",
    icon: Users,
  },
  {
    title: "Gestion des enseignants",
    description:
      "Répertoire des enseignants, affectations, suivi administratif et encadrement pédagogique.",
    icon: GraduationCap,
  },
  {
    title: "Présences",
    description:
      "Suivi quotidien des présences, absences et retards des élèves et du personnel enseignant.",
    icon: ClipboardCheck,
  },
  {
    title: "Résultats académiques",
    description:
      "Encodage des notes, calcul automatisé des résultats, bulletins et palmarès.",
    icon: BookOpenCheck,
  },
  {
    title: "Communications administratives",
    description:
      "Annonces et communications ciblées aux parents, élèves, enseignants et responsables.",
    icon: Bell,
  },
  {
    title: "Portail sécurisé",
    description:
      "Accès contrôlé pour la direction, le secrétariat, les enseignants et les parents.",
    icon: ShieldCheck,
  },
];

const statistics = [
  { value: "Élèves", label: "Suivi individuel et académique" },
  { value: "Classes", label: "Organisation par année scolaire" },
  { value: "Parents", label: "Communication administrative" },
];

export default function EcolePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative isolate min-h-[620px] overflow-hidden">
        <Image
          src="/images/ecole-pdv.png"
          alt="École Chrétienne Parole du Salut"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#041a3d]/95 via-[#082e65]/80 to-[#0a56a4]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#041a3d]/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-20 lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
              <GraduationCap size={18} />
              École Chrétienne Parole du Salut
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Former, élever et envoyer une génération d’excellence.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              L&apos;École Chrétienne Parole du Salut associe foi, discipline,
              excellence académique et service afin de préparer des enfants et
              des jeunes capables d&apos;impacter leur communauté et leur nation.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/connexion"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-[#0a3d82] shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <UserRoundCheck size={19} />
                Accès administration scolaire
              </Link>

              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              >
                Découvrir le module École
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
              {statistics.map((statistic) => (
                <div
                  key={statistic.value}
                  className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xl font-black text-white">
                    {statistic.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    {statistic.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1680c4]">
              Éducation avec vision
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight text-[#092e63] sm:text-4xl">
              Une école structurée pour accompagner chaque enfant.
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Le module École de PDV Connect permettra à la direction scolaire
              de centraliser les informations académiques, administratives et
              pédagogiques de manière fiable, sécurisée et accessible.
            </p>

            <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-extrabold text-[#092e63]">
                Devise de l&apos;école
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Foi • Excellence • Service
              </p>
            </div>
          </div>

          <div className="relative min-h-[330px] overflow-hidden rounded-[2rem] shadow-xl">
            <Image
              src="/images/ecole-pdv.png"
              alt="Entrée de l'École Chrétienne Parole du Salut"
              fill
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#061d45]/85 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-7 text-white">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-cyan-200">
                Proverbes 22:6
              </p>
              <p className="mt-2 text-xl font-black leading-8">
                Instruis l&apos;enfant selon la voie qu&apos;il doit suivre.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="border-y border-blue-100 bg-white px-5 py-20 lg:px-8"
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
              Chaque espace sera conçu selon les responsabilités de la
              direction, du secrétariat, des enseignants et des parents.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-3xl border border-blue-100 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82] transition group-hover:bg-[#0a3d82] group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-black text-[#092e63]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-[#082553] to-[#0a56a4] px-7 py-12 text-center text-white shadow-xl sm:px-12">
          <GraduationCap className="mx-auto text-cyan-200" size={38} />

          <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
            Une administration scolaire fiable au service de la réussite des
            élèves.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-8 text-blue-100">
            Le portail scolaire sera progressivement activé dans PDV Connect
            pour assurer un suivi complet des élèves, enseignants et résultats
            académiques.
          </p>

          <Link
            href="/connexion"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
          >
            Accéder à l’espace sécurisé
            <UserRoundCheck size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}