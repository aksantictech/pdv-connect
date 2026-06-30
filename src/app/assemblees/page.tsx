import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Church,
  Globe2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  UserRound,
  Users,
} from "lucide-react";

import AssembliesMap, {
  type PublicAssemblyMapItem,
} from "../../components/public/AssembliesMap";
import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type CmsBlock = {
  block_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  primary_label: string | null;
  primary_href: string | null;
};

type Assembly = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  commune: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  pastor_name: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  google_maps_url: string | null;
};

const fallbackHero: CmsBlock = {
  block_key: "assemblies_hero",
  title: "Une église, plusieurs assemblées, une même vision",
  subtitle: "Nos assemblées",
  content:
    "Retrouvez CEF Parole de Vie près de chez vous et prenez contact avec l’assemblée de votre choix.",
  primary_label: "Je suis nouveau",
  primary_href: "/rejoindre",
};

const fallbackCta: CmsBlock = {
  block_key: "assemblies_cta",
  title: "Vous ne trouvez pas encore une assemblée près de chez vous ?",
  subtitle: "Restons connectés",
  content:
    "Contactez notre équipe ou remplissez le formulaire d’intégration. Nous vous orienterons vers l’assemblée ou le responsable le plus approprié.",
  primary_label: "Nous rejoindre",
  primary_href: "/rejoindre",
};

function numberValue(value: number | string | null) {
  if (value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatLocation(assembly: Assembly) {
  return [assembly.commune, assembly.city, assembly.country]
    .filter(Boolean)
    .join(" • ");
}

function buildMapsUrl(assembly: Assembly) {
  if (assembly.google_maps_url?.trim()) {
    return assembly.google_maps_url.trim();
  }

  const latitude = numberValue(assembly.latitude);
  const longitude = numberValue(assembly.longitude);

  if (latitude !== null && longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${latitude},${longitude}`
    )}`;
  }

  const searchText = [
    assembly.name,
    assembly.address,
    assembly.commune,
    assembly.city,
    assembly.country,
  ]
    .filter(Boolean)
    .join(", ");

  if (!searchText) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    searchText
  )}`;
}

export default async function AssembliesPage() {
  const supabase = await createClient();

  const [blocksResult, assembliesResult] = await Promise.all([
    supabase
      .from("pdv_public_blocks")
      .select(
        "block_key, title, subtitle, content, primary_label, primary_href"
      )
      .in("block_key", ["assemblies_hero", "assemblies_cta"]),

    supabase.rpc("get_public_assemblies"),
  ]);

  const blocks = new Map(
    ((blocksResult.data ?? []) as CmsBlock[]).map((block) => [
      block.block_key,
      block,
    ])
  );

  const hero = blocks.get("assemblies_hero") ?? fallbackHero;
  const cta = blocks.get("assemblies_cta") ?? fallbackCta;

  const assemblies = (assembliesResult.data ?? []) as Assembly[];

  const mapAssemblies: PublicAssemblyMapItem[] = assemblies.flatMap(
    (assembly) => {
      const latitude = numberValue(assembly.latitude);
      const longitude = numberValue(assembly.longitude);

      if (latitude === null || longitude === null) {
        return [];
      }

      return [
        {
          id: assembly.id,
          name: assembly.name,
          location: formatLocation(assembly) || "Localisation renseignée",
          pastorName: assembly.pastor_name,
          latitude,
          longitude,
          mapsUrl: buildMapsUrl(assembly),
        },
      ];
    }
  );

  return (
    <main className="min-h-screen bg-[#f7faff]">
      <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.62fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
              <Church size={18} />
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
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                {hero.primary_label}
                <ArrowRight size={18} />
              </Link>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-7 backdrop-blur">
            <Building2 className="text-cyan-200" size={34} />

            <p className="mt-6 text-4xl font-black">{assemblies.length}</p>

            <p className="mt-1 text-sm font-semibold text-blue-100">
              assemblée{assemblies.length > 1 ? "s" : ""} active
              {assemblies.length > 1 ? "s" : ""}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-cyan-100">
              <Globe2 size={17} />
              Une vision, plusieurs implantations
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Trouver une assemblée
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Nos assemblées sur la carte
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Sélectionnez une épingle pour consulter les informations de
            l’assemblée et ouvrir directement l’itinéraire.
          </p>
        </div>

        {mapAssemblies.length > 0 ? (
          <div className="mt-10">
            <AssembliesMap assemblies={mapAssemblies} />
          </div>
        ) : (
          <div className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50 px-7 py-10 text-center">
            <MapPin className="mx-auto text-[#0a56a4]" size={36} />
            <p className="mt-4 font-black text-[#092e63]">
              Carte en préparation
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Les coordonnées GPS des assemblées seront ajoutées depuis
              l’administration afin de les afficher sur cette carte.
            </p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Nos implantations
          </p>

          <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
            Découvrez les assemblées de CEF Parole de Vie
          </h2>
        </div>

        {assembliesResult.error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            Les informations sur les assemblées sont temporairement
            indisponibles.
          </div>
        )}

        {assemblies.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-blue-100 bg-white px-6 py-16 text-center shadow-sm">
            <Church className="mx-auto text-blue-200" size={46} />

            <h3 className="mt-5 text-2xl font-black text-[#092e63]">
              Les assemblées seront bientôt disponibles
            </h3>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {assemblies.map((assembly) => {
              const mapsUrl = buildMapsUrl(assembly);

              return (
                <article
                  key={assembly.id}
                  className="rounded-[2rem] border border-blue-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a56a4]">
                    <Church size={24} />
                  </div>

                  <h3 className="mt-6 text-xl font-black text-[#092e63]">
                    {assembly.name}
                  </h3>

                  {formatLocation(assembly) && (
                    <p className="mt-2 text-sm font-bold text-[#1680c4]">
                      {formatLocation(assembly)}
                    </p>
                  )}

                  <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                    {assembly.address && (
                      <div className="flex gap-3">
                        <MapPin
                          className="mt-0.5 shrink-0 text-[#0a56a4]"
                          size={18}
                        />
                        <span>{assembly.address}</span>
                      </div>
                    )}

                    {assembly.pastor_name && (
                      <div className="flex gap-3">
                        <UserRound
                          className="mt-0.5 shrink-0 text-[#0a56a4]"
                          size={18}
                        />
                        <span>Pasteur : {assembly.pastor_name}</span>
                      </div>
                    )}

                    {assembly.phone && (
                      <a
                        href={`tel:${assembly.phone}`}
                        className="flex gap-3 font-semibold text-[#0a56a4] hover:underline"
                      >
                        <Phone className="mt-0.5 shrink-0" size={18} />
                        {assembly.phone}
                      </a>
                    )}

                    {assembly.email && (
                      <a
                        href={`mailto:${assembly.email}`}
                        className="flex gap-3 break-all font-semibold text-[#0a56a4] hover:underline"
                      >
                        <Mail className="mt-0.5 shrink-0" size={18} />
                        {assembly.email}
                      </a>
                    )}
                  </div>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
                    >
                      <Navigation size={17} />
                      Ouvrir l’itinéraire
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
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