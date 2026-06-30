import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";

import { createClient } from "../../lib/supabase/server";

type NewsBlock = {
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
};

type PublicNewsPost = {
id: string;
title: string;
slug: string;
excerpt: string | null;
content: string | null;
category: string;
cover_image_path: string | null;
published_at: string | null;
};

function formatDate(value: string | null) {
if (!value) return "";

return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(value));
}

export default async function PublicNewsSection() {
const supabase = await createClient();
const now = new Date().toISOString();

const [blockResult, postsResult] = await Promise.all([
supabase
.from("pdv_public_blocks")
.select("title, subtitle, content, primary_label, primary_href")
.eq("block_key", "news")
.maybeSingle(),

supabase
  .from("pdv_news_posts")
  .select(
    "id, title, slug, excerpt, content, category, cover_image_path, published_at"
  )
  .eq("status", "published")
  .lte("published_at", now)
  .order("is_featured", { ascending: false })
  .order("published_at", { ascending: false })
  .limit(3),

]);

const newsBlock = (blockResult.data as NewsBlock | null) ?? null;

// Le bloc est masqué depuis le CMS.
if (!newsBlock) {
return null;
}

const rawPosts = (postsResult.data as PublicNewsPost[] | null) ?? [];

const posts = rawPosts.map((post) => {
let coverImageUrl: string | null = null;


if (post.cover_image_path) {
  const { data } = supabase.storage
    .from("pdv-public")
    .getPublicUrl(post.cover_image_path);

  coverImageUrl = data.publicUrl;
}

return {
  ...post,
  cover_image_url: coverImageUrl,
};


});

const title = newsBlock.title || "Actualités de l’église";
const subtitle =
newsBlock.subtitle ||
"Découvrez les annonces, programmes et événements de CEF Parole de Vie.";

const buttonLabel = newsBlock.primary_label || "Voir toutes les actualités";
const buttonHref = newsBlock.primary_href || "/actualites";

return ( <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10"> <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"> <div className="max-w-2xl"> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Communication </p>


      <h2 className="mt-3 text-4xl font-black text-[#092e63]">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">{subtitle}</p>
    </div>

    <Link
      href={buttonHref}
      className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
    >
      {buttonLabel}
      <ArrowRight size={17} />
    </Link>
  </div>

  {posts.length === 0 ? (
    <div className="mt-8 rounded-[2rem] border border-dashed border-blue-200 bg-white p-10 text-center">
      <Newspaper className="mx-auto text-blue-200" size={42} />

      <p className="mt-4 text-lg font-black text-[#092e63]">
        Les actualités arrivent bientôt
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Les annonces publiées par l’administration apparaîtront dans cet
        espace.
      </p>
    </div>
  ) : (
    <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="relative h-52 bg-gradient-to-br from-[#061d45] to-[#1680c4]">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Newspaper className="text-white/60" size={42} />
              </div>
            )}

            <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-[#0a56a4]">
              {post.category}
            </span>
          </div>

          <div className="p-6">
            <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <CalendarDays size={14} />
              {formatDate(post.published_at)}
            </p>

            <h3 className="mt-4 text-xl font-black leading-7 text-[#092e63]">
              {post.title}
            </h3>

            <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
              {post.excerpt ||
                post.content ||
                "Découvrez cette actualité de CEF Parole de Vie."}
            </p>

            <Link
              href={`/actualites/${post.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4]"
            >
              Lire la suite
              <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  )}
</section>


);
}
