import Link from "next/link";
import { notFound } from "next/navigation";
import {
ArrowLeft,
ArrowRight,
CalendarDays,
Newspaper,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/server";
import type { NewsPost } from "../../../types/news";

export const dynamic = "force-dynamic";

type RawPublicPost = Omit<NewsPost, "cover_image_url">;

type NewsDetailPageProps = {
params: Promise<{
slug: string;
}>;
};

function formatDate(value: string | null) {
if (!value) return "";

return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "long",
year: "numeric",
}).format(new Date(value));
}

export default async function NewsDetailPage({
params,
}: NewsDetailPageProps) {
const { slug } = await params;
const supabase = await createClient();

const { data: postData } = await supabase
.from("pdv_news_posts")
.select(`       id,
      title,
      slug,
      excerpt,
      content,
      category,
      cover_image_path,
      status,
      is_featured,
      published_at,
      created_at,
      updated_at
    `)
.eq("slug", slug)
.eq("status", "published")
.lte("published_at", new Date().toISOString())
.maybeSingle();

if (!postData) {
notFound();
}

const rawPost = postData as RawPublicPost;

let coverImageUrl: string | null = null;

if (rawPost.cover_image_path) {
const { data: imageData } = supabase.storage
.from("pdv-public")
.getPublicUrl(rawPost.cover_image_path);


coverImageUrl = imageData.publicUrl;

}

const post: NewsPost = {
...rawPost,
cover_image_url: coverImageUrl,
};

const { data: relatedData } = await supabase
.from("pdv_news_posts")
.select(`       id,
      title,
      slug,
      excerpt,
      content,
      category,
      cover_image_path,
      status,
      is_featured,
      published_at,
      created_at,
      updated_at
    `)
.eq("status", "published")
.eq("category", post.category)
.neq("id", post.id)
.lte("published_at", new Date().toISOString())
.order("published_at", { ascending: false })
.limit(3);

const relatedPosts = ((relatedData as RawPublicPost[] | null) ?? []).map(
(relatedPost) => {
let relatedImageUrl: string | null = null;


  if (relatedPost.cover_image_path) {
    const { data: imageData } = supabase.storage
      .from("pdv-public")
      .getPublicUrl(relatedPost.cover_image_path);

    relatedImageUrl = imageData.publicUrl;
  }

  return {
    ...relatedPost,
    cover_image_url: relatedImageUrl,
  } as NewsPost;
}


);

return ( <main className="min-h-screen bg-[#f7faff]"> <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-12 text-white lg:px-8"> <div className="mx-auto max-w-5xl"> <Link
         href="/actualites"
         className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-100 transition hover:text-white"
       > <ArrowLeft size={17} />
Toutes les actualités </Link>


      <div className="mt-10 flex flex-wrap items-center gap-3 text-sm font-bold text-cyan-200">
        <span>{post.category}</span>
        <span className="h-1 w-1 rounded-full bg-cyan-200" />
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={15} />
          {formatDate(post.published_at)}
        </span>
      </div>

      <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
          {post.excerpt}
        </p>
      )}
    </div>
  </section>

  <article className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
    {post.cover_image_url ? (
      <img
        src={post.cover_image_url}
        alt={post.title}
        className="h-[280px] w-full rounded-[2rem] object-cover shadow-xl shadow-blue-950/10 sm:h-[420px]"
      />
    ) : (
      <div className="flex h-[280px] items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#061d45] to-[#1680c4] shadow-xl shadow-blue-950/10 sm:h-[420px]">
        <Newspaper className="text-white/65" size={70} />
      </div>
    )}

    <div className="mx-auto max-w-3xl py-12">
      <div className="whitespace-pre-line text-base leading-8 text-slate-700 sm:text-lg">
        {post.content ||
          post.excerpt ||
          "Le contenu détaillé de cette publication sera bientôt disponible."}
      </div>

      <Link
        href="/actualites"
        className="mt-12 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
      >
        <ArrowLeft size={17} />
        Retour aux actualités
      </Link>
    </div>
  </article>

  {relatedPosts.length > 0 && (
    <section className="border-t border-blue-100 bg-white px-5 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          Même catégorie
        </p>

        <h2 className="mt-3 text-3xl font-black text-[#092e63]">
          Autres actualités à découvrir
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {relatedPosts.map((relatedPost) => (
            <article
              key={relatedPost.id}
              className="overflow-hidden rounded-3xl border border-blue-100 bg-[#f7faff] transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="h-40 bg-gradient-to-br from-[#061d45] to-[#1680c4]">
                {relatedPost.cover_image_url ? (
                  <img
                    src={relatedPost.cover_image_url}
                    alt={relatedPost.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Newspaper className="text-white/60" size={36} />
                  </div>
                )}
              </div>

              <div className="p-5">
                <p className="text-xs font-bold text-slate-500">
                  {formatDate(relatedPost.published_at)}
                </p>

                <h3 className="mt-3 text-lg font-black leading-6 text-[#092e63]">
                  {relatedPost.title}
                </h3>

                <Link
                  href={`/actualites/${relatedPost.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4]"
                >
                  Lire
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )}
</main>

);
}
