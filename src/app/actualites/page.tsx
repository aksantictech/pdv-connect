import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
  PlayCircle,
} from "lucide-react";

import { createClient } from "../../lib/supabase/server";
import type { NewsPost } from "../../types/news";

export const dynamic = "force-dynamic";

type RawPublicPost = Omit<NewsPost, "cover_image_url">;

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ActualitesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("pdv_news_posts")
    .select(`
      id,
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
    .lte("published_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false });

  const rawPosts = (data as RawPublicPost[] | null) ?? [];

  const posts: NewsPost[] = rawPosts.map((post) => {
    let coverImageUrl: string | null = null;

    if (post.cover_image_path) {
      const { data: imageData } = supabase.storage
        .from("pdv-public")
        .getPublicUrl(post.cover_image_path);

      coverImageUrl = imageData.publicUrl;
    }

    return {
      ...post,
      cover_image_url: coverImageUrl,
    };
  });

  const featuredPost =
    posts.find((post) => post.is_featured) ?? posts[0] ?? null;

  const otherPosts = featuredPost
    ? posts.filter((post) => post.id !== featuredPost.id)
    : [];

  return (
    <main className="min-h-screen bg-[#f7faff]">
      <section className="bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-20 text-white lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">
            CEF Parole de Vie
          </p>

          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-5xl">
            Actualités de l’église
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Retrouvez les annonces, programmes, événements et informations
            importantes de CEF Parole de Vie.
          </p>

          <a
            href="https://www.youtube.com/@CEFLAPAROLEDEVIE"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
          >
            <PlayCircle size={18} />
            Suivre nos cultes en direct
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        {!featuredPost ? (
          <div className="rounded-[2rem] border border-dashed border-blue-200 bg-white p-12 text-center">
            <Newspaper className="mx-auto text-blue-200" size={48} />

            <h2 className="mt-5 text-2xl font-black text-[#092e63]">
              Aucune actualité publiée
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500">
              Les annonces et programmes publiés par l’administration
              apparaîtront prochainement dans cet espace.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
            >
              Retour à l’accueil
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <>
            <article className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-blue-950/10 lg:grid lg:grid-cols-2">
              <div className="relative min-h-[300px] bg-gradient-to-br from-[#061d45] to-[#1680c4] lg:min-h-[460px]">
                {featuredPost.cover_image_url ? (
                  <img
                    src={featuredPost.cover_image_url}
                    alt={featuredPost.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[300px] items-center justify-center lg:min-h-[460px]">
                    <Newspaper className="text-white/60" size={68} />
                  </div>
                )}

                <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0a56a4]">
                  À la une
                </span>
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="flex items-center gap-3 text-sm font-bold text-[#1680c4]">
                  <span>{featuredPost.category || "Actualité"}</span>
                  <span className="h-1 w-1 rounded-full bg-[#1680c4]" />
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={15} />
                    {formatDate(featuredPost.published_at)}
                  </span>
                </div>

                <h2 className="mt-5 text-3xl font-black leading-tight text-[#092e63] sm:text-4xl">
                  {featuredPost.title}
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-600">
                  {featuredPost.excerpt ||
                    featuredPost.content ||
                    "Découvrez cette information importante de CEF Parole de Vie."}
                </p>

                <Link
                  href={`/actualites/${featuredPost.slug}`}
                  className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
                >
                  Lire l’actualité
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>

            {otherPosts.length > 0 && (
              <>
                <div className="mt-16 flex items-end justify-between gap-5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
                      À découvrir
                    </p>

                    <h2 className="mt-3 text-3xl font-black text-[#092e63]">
                      Dernières publications
                    </h2>
                  </div>

                  <Link
                    href="/"
                    className="hidden items-center gap-2 text-sm font-extrabold text-[#0a56a4] sm:inline-flex"
                  >
                    Retour à l’accueil
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {otherPosts.map((post) => (
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
                          {post.category || "Actualité"}
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
                            "Découvrez cette publication de CEF Parole de Vie."}
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
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}