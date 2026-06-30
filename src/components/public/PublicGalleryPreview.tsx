import Link from "next/link";
import { ArrowRight, Camera, ImageIcon } from "lucide-react";

import { createClient } from "../../lib/supabase/server";

type RawGalleryItem = {
id: string;
title: string;
description: string | null;
category: string;
image_path: string;
is_featured: boolean;
created_at: string;
};

type GalleryItem = RawGalleryItem & {
image_url: string;
};

export default async function PublicGalleryPreview() {
const supabase = await createClient();

const { data } = await supabase
.from("pdv_gallery_items")
.select(
"id, title, description, category, image_path, is_featured, created_at"
)
.eq("is_published", true)
.order("is_featured", { ascending: false })
.order("sort_order", { ascending: true })
.order("created_at", { ascending: false })
.limit(3);

const items: GalleryItem[] = ((data ?? []) as RawGalleryItem[]).map(
(item) => {
const { data: imageData } = supabase.storage
.from("pdv-public")
.getPublicUrl(item.image_path);

  return {
    ...item,
    image_url: imageData.publicUrl,
  };
}

);

if (items.length === 0) {
return null;
}

return ( <section id="galerie" className="mx-auto max-w-7xl px-6 py-20 lg:px-10"> <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Galerie </p>

      <h2 className="mt-3 text-4xl font-black text-[#092e63]">
        Les moments qui font vivre notre communauté
      </h2>

      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Revivez en images nos cultes, événements, moments de louange et
        activités de CEF Parole de Vie.
      </p>
    </div>

    <Link
      href="/galerie"
      className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-extrabold text-[#0a56a4] transition hover:bg-blue-50"
    >
      <Camera size={18} />
      Voir toute la galerie
      <ArrowRight size={17} />
    </Link>
  </div>

  <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => (
      <article
        key={item.id}
        className="group overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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

          {item.is_featured && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950">
              À la une
            </span>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-black text-[#092e63]">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-3 line-clamp-2 leading-7 text-slate-600">
              {item.description}
            </p>
          )}

          <Link
            href="/galerie"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4]"
          >
            Voir la galerie
            <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    ))}
  </div>

  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-slate-600">
    <ImageIcon className="shrink-0 text-[#0a56a4]" size={20} />
    Les photos sont publiées et organisées depuis l’espace
    d’administration de PDV Connect.
  </div>
</section>

);
}
