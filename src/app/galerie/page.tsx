import Link from "next/link";
import {
ArrowRight,
Camera,
ImageIcon,
Sparkles,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

type GalleryHero = {
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
};

type GalleryItem = {
id: string;
title: string;
description: string | null;
category: string;
image_path: string;
is_featured: boolean;
sort_order: number;
created_at: string;
image_url: string;
};

const fallbackHero: GalleryHero = {
title: "Découvrez la vie de CEF Parole de Vie",
subtitle: "Galerie photos",
content:
"Revivez en images nos cultes, moments de louange, activités communautaires, événements et actions de l’église.",
primary_label: "Voir les actualités",
primary_href: "/actualites",
};

function isExternalLink(href: string) {
return (
href.startsWith("http://") ||
href.startsWith("https://") ||
href.startsWith("mailto:") ||
href.startsWith("tel:")
);
}

function GalleryAction({
href,
label,
}: {
href: string;
label: string;
}) {
const className =
"mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50";

if (href.startsWith("#") || isExternalLink(href)) {
const openNewTab =
href.startsWith("http://") || href.startsWith("https://");

return (
  <a
    href={href}
    target={openNewTab ? "_blank" : undefined}
    rel={openNewTab ? "noreferrer" : undefined}
    className={className}
  >
    {label}
    <ArrowRight size={18} />
  </a>
);

}

return ( <Link href={href} className={className}>
{label} <ArrowRight size={18} /> </Link>
);
}

function formatDate(value: string) {
return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(value));
}

export default async function GaleriePage() {
const supabase = await createClient();

const [heroResult, galleryResult] = await Promise.all([
supabase
.from("pdv_public_blocks")
.select("title, subtitle, content, primary_label, primary_href")
.eq("block_key", "gallery_hero")
.maybeSingle(),

supabase
  .from("pdv_gallery_items")
  .select(
    "id, title, description, category, image_path, is_featured, sort_order, created_at"
  )
  .eq("is_published", true)
  .order("is_featured", { ascending: false })
  .order("sort_order", { ascending: true })
  .order("created_at", { ascending: false }),

]);

const hero = (heroResult.data as GalleryHero | null) ?? fallbackHero;

const items: GalleryItem[] = ((galleryResult.data ?? []) as Omit<
GalleryItem,
"image_url"

> []).map((item) => {
const { data: imageData } = supabase.storage
.from("pdv-public")
.getPublicUrl(item.image_path);

return {
  ...item,
  image_url: imageData.publicUrl,
};

});

const featuredItem = items.find((item) => item.is_featured) ?? items[0];
const categories = [...new Set(items.map((item) => item.category))];

return ( <main className="min-h-screen bg-[#f7faff]"> <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8"> <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.65fr] lg:items-end"> <div> <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur"> <Camera size={18} />
{hero.subtitle || "Galerie photos"} </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
          {hero.title || fallbackHero.title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          {hero.content || fallbackHero.content}
        </p>

        {hero.primary_label && hero.primary_href && (
          <GalleryAction
            href={hero.primary_href}
            label={hero.primary_label}
          />
        )}
      </div>

      <div className="rounded-[2rem] border border-white/15 bg-white/10 p-7 backdrop-blur">
        <ImageIcon className="text-cyan-200" size={34} />

        <p className="mt-6 text-4xl font-black">{items.length}</p>
        <p className="mt-1 text-sm font-semibold text-blue-100">
          moment{items.length > 1 ? "s" : ""} partagé
          {items.length > 1 ? "s" : ""} avec la communauté
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm text-cyan-100">
          <Sparkles size={17} />
          Cultes, événements et vie communautaire
        </div>
      </div>
    </div>
  </section>

  {featuredItem && (
    <section className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
      <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#092e63] shadow-xl">
        <img
          src={featuredItem.image_url}
          alt={featuredItem.title}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#031b42]/90 via-[#031b42]/35 to-transparent" />

        <div className="relative flex min-h-[420px] max-w-2xl flex-col justify-end p-7 text-white sm:p-10">
          <span className="w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-amber-950">
            À la une
          </span>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-cyan-200">
            {featuredItem.category}
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            {featuredItem.title}
          </h2>

          {featuredItem.description && (
            <p className="mt-4 max-w-xl leading-7 text-blue-100">
              {featuredItem.description}
            </p>
          )}
        </div>
      </div>
    </section>
  )}

  <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          En images
        </p>

        <h2 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
          Les moments qui font vivre notre communauté
        </h2>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0a56a4]"
            >
              {category}
            </span>
          ))}
        </div>
      )}
    </div>

    {galleryResult.error && (
      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        Impossible de charger les photos de la galerie.
      </div>
    )}

    {items.length === 0 ? (
      <div className="mt-10 rounded-[2rem] border border-blue-100 bg-white px-6 py-16 text-center shadow-sm">
        <ImageIcon className="mx-auto text-blue-200" size={46} />

        <h3 className="mt-5 text-xl font-black text-[#092e63]">
          La galerie est en préparation
        </h3>

        <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
          Les prochains cultes, activités et événements de CEF Parole de
          Vie seront bientôt partagés ici.
        </p>
      </div>
    ) : (
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[#092e63] backdrop-blur">
                {item.category}
              </span>
            </div>

            <div className="p-6">
              <p className="text-xs font-bold text-slate-400">
                {formatDate(item.created_at)}
              </p>

              <h3 className="mt-2 text-xl font-black text-[#092e63]">
                {item.title}
              </h3>

              {item.description && (
                <p className="mt-3 line-clamp-3 leading-7 text-slate-600">
                  {item.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
</main>

);
}
