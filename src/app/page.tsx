import Image from "next/image";
import Link from "next/link";
import PublicNewsSection from "../components/public/PublicNewsSection";
import PublicGalleryPreview from "../components/public/PublicGalleryPreview";
import {
ArrowRight,
BookOpen,
CalendarDays,
Church,
Clock3,
Heart,
Mail,
MapPin,
MessageSquareText,
Phone,
PlayCircle,
Quote,
Users,
} from "lucide-react";
export const dynamic = "force-dynamic";

const churchEmail = process.env.NEXT_PUBLIC_CHURCH_CONTACT_EMAIL ?? "";
const churchPhone = process.env.NEXT_PUBLIC_CHURCH_PHONE ?? "";

const actions = [
{
title: "Nous rejoindre",
description:
"Inscrivez-vous pour être accueilli et accompagné dans votre parcours.",
href: "/rejoindre",
icon: Users,
tone: "border-emerald-100 bg-emerald-50 text-emerald-800",
},
{
title: "Demander une prière",
description: "Confiez votre sujet de prière en toute discrétion.",
href: "/priere",
icon: Heart,
tone: "border-rose-100 bg-rose-50 text-rose-800",
},
{
title: "Laisser un témoignage",
description: "Partagez ce que Dieu a accompli dans votre vie.",
href: "/temoignage",
icon: MessageSquareText,
tone: "border-violet-100 bg-violet-50 text-violet-800",
},
{
title: "Prendre rendez-vous",
description: "Demandez un entretien pastoral ou un accompagnement.",
href: "/rendez-vous",
icon: CalendarDays,
tone: "border-cyan-100 bg-cyan-50 text-cyan-800",
},
];

export default function HomePage() {
return ( <main className="overflow-hidden bg-[#f7faff] text-[#092e63]"> <section className="relative isolate overflow-hidden bg-[#031b42]"> <Image
       src="/images/culte-assemblee.jpeg"
       alt="Assemblée de CEF Parole de Vie en culte"
       fill
       priority
       className="object-cover object-center"
     />

    <div className="absolute inset-0 bg-gradient-to-r from-[#02142f]/95 via-[#06285a]/85 to-[#06285a]/30" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#031b42] to-transparent" />

    <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
      <div className="max-w-3xl">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 rounded-full bg-white/10 p-1 backdrop-blur-md float-soft">
            <div className="absolute inset-0 rounded-full border border-white/20 pulse-soft" />

            <div className="relative h-full w-full overflow-hidden rounded-full bg-white">
              <Image
                src="/images/logo-pdv.jpeg"
                alt="Logo CEF Parole de Vie"
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#31b6ff]">
              Bienvenue
            </p>

            <p className="mt-1 text-sm text-blue-100">
              Une église, une famille, une destinée
            </p>
          </div>
        </div>

        <h1 className="font-serif text-5xl font-black leading-[1.03] text-white sm:text-6xl lg:text-[5.1rem]">
          Bienvenue à
          <span className="mt-2 block">CEF Parole de Vie</span>
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50 sm:text-xl">
          Une communauté de foi, d’adoration et de transformation au cœur
          de Kinshasa.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/vision"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0b73df] px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-950/30 transition hover:bg-[#075caf]"
          >
            Découvrir l’église
            <ArrowRight size={19} />
          </Link>

          <a
            href="https://www.youtube.com/@CEFLAPAROLEDEVIE"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
          >
            <PlayCircle size={19} />
            Suivre un culte
          </a>
        </div>
      </div>

      <div className="relative hidden min-h-[420px] lg:block">
          <a
    href="https://www.youtube.com/@CEFLAPAROLEDEVIE"
    target="_blank"
    rel="noreferrer"
    className="absolute right-8 top-3 z-30 inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-black text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-1 hover:bg-red-700"
  >
    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
    EN DIRECT
  </a>
        <div className="absolute right-8 top-1/2 h-[355px] w-[355px] -translate-y-1/2">
          <div className="absolute inset-0 rounded-full border border-blue-300/30 spin-slow" />
          <div className="absolute inset-3 rounded-full border border-white/15" />
          <div className="absolute inset-7 rounded-full bg-blue-400/15 blur-2xl pulse-soft" />

          <div className="absolute inset-7 overflow-hidden rounded-full border-4 border-white/20 shadow-2xl float-soft">
            <Image
              src="/images/pasteur-goby-diadia.jpeg"
              alt="Pasteur Goby Diadia"
              fill
              sizes="355px"
              className="object-cover"
            />
          </div>

          <div className="absolute -right-1 top-10 h-10 w-10 rounded-full bg-[#31b6ff]/80 blur-[1px]" />
          <div className="absolute bottom-8 -left-2 h-6 w-6 rounded-full bg-white/70" />
        </div>
      </div>
    </div>
  </section>

  <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-6 lg:px-10">
    <div className="grid gap-4 rounded-[2rem] bg-white p-5 shadow-2xl shadow-blue-950/10 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.title}
            href={action.href}
            className={`group rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${action.tone}`}
          >
            <Icon size={24} />

            <h2 className="mt-5 text-lg font-black">{action.title}</h2>

            <p className="mt-2 text-sm leading-6 opacity-80">
              {action.description}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold">
              Accéder
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-1"
              />
            </span>
          </Link>
        );
      })}
    </div>
  </section>

  <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div className="grid gap-10 rounded-[2rem] bg-white p-7 shadow-sm lg:grid-cols-[1fr_0.9fr] lg:p-10">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          À propos du Pasteur
        </p>

        <h2 className="mt-4 font-serif text-4xl font-black text-[#092e63] sm:text-5xl">
          Pasteur Goby Diadia
        </h2>

        <p className="mt-3 text-lg font-bold text-[#0b73df]">
          Pasteur de CEF Parole de Vie
        </p>

        <p className="mt-6 max-w-2xl leading-8 text-slate-600">
          À travers la prédication, l’enseignement biblique et
          l’accompagnement spirituel, le Pasteur Goby Diadia conduit la
          communauté dans une foi vivante, responsable et centrée sur la
          Parole de Dieu.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <BookOpen className="text-[#0b73df]" size={23} />
            <p className="mt-4 font-black text-[#092e63]">Prédication</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Une Parole qui éclaire et transforme.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Users className="text-[#0b73df]" size={23} />
            <p className="mt-4 font-black text-[#092e63]">Communauté</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Une famille qui grandit ensemble.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <Heart className="text-[#0b73df]" size={23} />
            <p className="mt-4 font-black text-[#092e63]">Prière</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Marcher chaque jour avec Dieu.
            </p>
          </div>
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-100">
        <Image
          src="/images/pasteur-goby-diadia.jpeg"
          alt="Pasteur Goby Diadia tenant une Bible"
          fill
          className="object-cover object-center"
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#031b42]/90 to-transparent p-7 pt-20">
          <p className="text-lg font-black text-white">
            Une église, une famille, une destinée.
          </p>
        </div>
      </div>
    </div>
  </section>

  <PublicGalleryPreview />

<PublicNewsSection />
  


<section className="bg-[#06295e]">

    <div className="mx-auto grid max-w-7xl gap-7 px-6 py-12 text-white md:grid-cols-2 lg:grid-cols-5 lg:px-10">
      <div>
        <p className="text-xl font-black">Infos pratiques</p>
        <p className="mt-3 text-sm leading-6 text-blue-100">
          Rejoignez-nous et grandissons ensemble dans la présence de Dieu.
        </p>
      </div>

      <div className="flex gap-3">
        <CalendarDays className="mt-1 text-[#4cbdfd]" size={22} />
        <div>
          <p className="font-black">Culte du dimanche</p>
          <p className="mt-1 text-sm text-blue-100">08h00 – 11h30</p>
          <p className="text-sm text-blue-100">Célébration & louange</p>
        </div>
      </div>

      <div className="flex gap-3">
        <BookOpen className="mt-1 text-[#4cbdfd]" size={22} />
        <div>
          <p className="font-black">Étude biblique</p>
          <p className="mt-1 text-sm text-blue-100">
            Mercredi 18h00 – 19h30
          </p>
          <p className="text-sm text-blue-100">
            Approfondissons la Parole
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Heart className="mt-1 text-[#4cbdfd]" size={22} />
        <div>
          <p className="font-black">Prière</p>
          <p className="mt-1 text-sm text-blue-100">
            Vendredi 18h00 – 19h00
          </p>
          <p className="text-sm text-blue-100">Veillée de prière</p>
        </div>
      </div>

      <div className="flex gap-3">
        <MapPin className="mt-1 text-[#4cbdfd]" size={22} />
        <div>
          <p className="font-black">Adresse</p>
          <p className="mt-1 text-sm text-blue-100">Limete, Kinshasa</p>
          <p className="text-sm text-blue-100">
            République Démocratique du Congo
          </p>
        </div>
      </div>
    </div>
  </section>

  <footer className="bg-[#031b42]">
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-blue-100 sm:flex-row sm:items-center sm:justify-between lg:px-10">
      <div className="flex items-center gap-3">
        <Church size={24} className="text-[#4cbdfd]" />

        <div>
          <p className="font-black text-white">PDV Connect</p>
          <p className="mt-1">Restez connectés, restez bénis.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {churchEmail ? (
          <a
            href={`mailto:${churchEmail}`}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <Mail size={16} />
            Nous écrire
          </a>
        ) : null}

        {churchPhone ? (
          <a
            href={`tel:${churchPhone}`}
            className="inline-flex items-center gap-2 hover:text-white"
          >
            <Phone size={16} />
            Nous appeler
          </a>
        ) : null}

        <span className="inline-flex items-center gap-2">
          <Clock3 size={16} />
          CEF Parole de Vie
        </span>
      </div>
    </div>
  </footer>
  
</main>

);
}
