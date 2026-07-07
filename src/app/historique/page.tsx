import Link from "next/link";
import {
ArrowRight,
BookOpen,
CalendarDays,
Camera,
Church,
Heart,
PlayCircle,
Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CmsBlock = {
block_key: string;
title: string | null;
subtitle: string | null;
content: string | null;
primary_label: string | null;
primary_href: string | null;
image_path: string | null;
};

type GalleryItem = {
id: string;
title: string | null;
description: string | null;
image_path: string;
};

const VIDEO_EXTENSIONS = new Set([
"mp4",
"webm",
"ogg",
"ogv",
"mov",
]);

const fallbackBlocks: Record<string, CmsBlock> = {
history_hero: {
block_key: "history_hero",
title: "Notre histoire",
subtitle: "CEF Parole de Vie",
content:
"Découvrez le parcours, les fondations, les temps forts et la vision qui ont façonné CEF Parole de Vie.",
primary_label: "Nous rejoindre",
primary_href: "/rejoindre",
image_path: null,
},
history_story: {
block_key: "history_story",
title: "Une vision portée par la foi",
subtitle: "Notre parcours",
content:
"L’histoire de CEF Parole de Vie est celle d’une vision portée par la foi, la prière, la Parole de Dieu et le désir de voir des vies transformées.",
primary_label: null,
primary_href: null,
image_path: null,
},
history_milestone_1: {
block_key: "history_milestone_1",
title: "Les débuts",
subtitle: "Une vision reçue et partagée",
content:
"Présentez ici les débuts de l’œuvre, les premières réunions et les personnes ayant porté la vision.",
primary_label: null,
primary_href: null,
image_path: null,
},
history_milestone_2: {
block_key: "history_milestone_2",
title: "La croissance",
subtitle: "Une communauté en expansion",
content:
"Présentez ici les temps de croissance, les ministères, les familles et les nouvelles implantations.",
primary_label: null,
primary_href: null,
image_path: null,
},
history_milestone_3: {
block_key: "history_milestone_3",
title: "Aujourd’hui et demain",
subtitle: "Grandir, servir et impacter",
content:
"Présentez ici la vision actuelle, les projets prioritaires et les perspectives de l’église.",
primary_label: null,
primary_href: null,
image_path: null,
},
history_video: {
block_key: "history_video",
title: "Revivez notre histoire en images",
subtitle: "Vidéo témoignage",
content:
"Ajoutez une vidéo retraçant un temps fort de l’église ou un message du leadership.",
primary_label: "Voir la vidéo",
primary_href: null,
image_path: null,
},
history_cta: {
block_key: "history_cta",
title: "Écrivez la suite de cette histoire avec nous",
subtitle: "Bienvenue dans la famille",
content:
"CEF Parole de Vie est une communauté ouverte à toutes celles et ceux qui désirent grandir dans la foi, servir Dieu et impacter leur génération.",
primary_label: "Je suis nouveau",
primary_href: "/rejoindre",
image_path: null,
},
};

function cleanText(value: string | null | undefined) {
return (value ?? "").replace(/^#\s*/gm, "").trim();
}

function getFileExtension(value: string | null | undefined) {
if (!value?.trim()) {
return "";
}

const fileName = value.split("?")[0].split("#")[0];
const parts = fileName.split(".");

return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? "" : "";
}

function isVideoFile(value: string | null | undefined) {
return VIDEO_EXTENSIONS.has(getFileExtension(value));
}

function getVideoMimeType(videoUrl: string) {
const extension = getFileExtension(videoUrl);

if (extension === "mp4") {
return "video/mp4";
}

if (extension === "webm") {
return "video/webm";
}

if (extension === "ogg" || extension === "ogv") {
return "video/ogg";
}

if (extension === "mov") {
return "video/quicktime";
}

return undefined;
}

function resolvePublicAssetUrl(
assetPath: string | null | undefined,
getPublicUrl: (path: string) => string,
fallback: string | null = null
) {
const path = assetPath?.trim();

if (!path) {
return fallback;
}

if (
path.startsWith("http://") ||
path.startsWith("https://") ||
path.startsWith("/")
) {
return path;
}

return getPublicUrl(path);
}

function getYoutubeEmbedUrl(videoUrl: string | null) {
if (!videoUrl?.trim()) {
return null;
}

try {
const url = new URL(videoUrl.trim());
const hostname = url.hostname.replace("[www](http://www).", "");
let videoId: string | null = null;

if (hostname === "youtu.be") {
  videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
}

if (hostname.includes("youtube.com")) {
  if (url.pathname === "/watch") {
    videoId = url.searchParams.get("v");
  }

  if (url.pathname.startsWith("/embed/")) {
    videoId = url.pathname.split("/")[2] ?? null;
  }

  if (url.pathname.startsWith("/shorts/")) {
    videoId = url.pathname.split("/")[2] ?? null;
  }
}

if (!videoId) {
  return null;
}

return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
  videoId
)}`;

} catch {
return null;
}
}

export default async function HistoriquePage() {
const supabase = await createClient();

const blockKeys = Object.keys(fallbackBlocks);

const [blocksResult, galleryResult] = await Promise.all([
supabase
.from("pdv_public_blocks")
.select(
"block_key, title, subtitle, content, primary_label, primary_href, image_path"
)
.in("block_key", blockKeys)
.eq("is_active", true),

supabase
  .from("pdv_gallery_items")
  .select("id, title, description, image_path")
  .eq("is_published", true)
  .ilike("category", "Historique")
  .order("sort_order", { ascending: true })
  .limit(12),

]);

const blocks = new Map(
((blocksResult.data ?? []) as CmsBlock[]).map((block) => [
block.block_key,
block,
])
);

function getBlock(key: string) {
return blocks.get(key) ?? fallbackBlocks[key];
}

const hero = getBlock("history_hero");
const story = getBlock("history_story");
const video = getBlock("history_video");
const cta = getBlock("history_cta");

const milestones = [
getBlock("history_milestone_1"),
getBlock("history_milestone_2"),
getBlock("history_milestone_3"),
];

const galleryItems = (galleryResult.data ?? []) as GalleryItem[];

const getPublicUrl = (path: string) =>
supabase.storage.from("pdv-public").getPublicUrl(path).data.publicUrl;

const heroImageUrl = resolvePublicAssetUrl(
hero.image_path,
getPublicUrl,
"/images/culte-assemblee.jpeg"
);

const storyImageUrl = resolvePublicAssetUrl(
story.image_path,
getPublicUrl,
"/images/louange-pdv.jpeg"
);

const directVideoPath = isVideoFile(video.image_path)
? video.image_path
: isVideoFile(video.primary_href)
? video.primary_href
: null;

const directVideoUrl = resolvePublicAssetUrl(
directVideoPath,
getPublicUrl
);

const youtubeEmbedUrl = directVideoUrl
? null
: getYoutubeEmbedUrl(video.primary_href);

const videoActionUrl =
video.primary_href?.trim() ||
directVideoUrl ||
null;

return ( <main className="min-h-screen overflow-hidden bg-[#f7faff]"> <section className="relative isolate overflow-hidden bg-[#031b42] px-6 py-24 text-white lg:px-10">
<img
src={heroImageUrl ?? "/images/culte-assemblee.jpeg"}
alt={cleanText(hero.title) || "Historique de CEF Parole de Vie"}
className="absolute inset-0 h-full w-full object-cover"
/>

    <div className="absolute inset-0 bg-gradient-to-r from-[#031b42]/95 via-[#06295e]/85 to-[#06295e]/30" />

    <div className="relative mx-auto max-w-7xl">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-cyan-100 backdrop-blur">
        <Church size={18} />
        {cleanText(hero.subtitle)}
      </div>

      <h1 className="mt-7 max-w-4xl font-serif text-5xl font-black leading-tight sm:text-6xl">
        {cleanText(hero.title)}
      </h1>

      <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100 sm:text-xl">
        {cleanText(hero.content)}
      </p>

      {hero.primary_label && hero.primary_href && (
        <Link
          href={hero.primary_href}
          className="mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-extrabold text-[#0a3d82] transition hover:-translate-y-0.5 hover:bg-blue-50"
        >
          {hero.primary_label}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  </section>

  <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
    <div className="grid items-center gap-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[400px_minmax(0,1fr)] lg:p-10">
      <div className="mx-auto w-full max-w-[400px]">
        <div className="relative h-[430px] overflow-hidden rounded-[1.75rem] bg-[#071f45] shadow-xl">
          <img
            src={storyImageUrl ?? "/images/louange-pdv.jpeg"}
            alt={cleanText(story.title) || "Histoire de CEF Parole de Vie"}
            className="h-full w-full object-contain object-center"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#031b42]/85 via-[#031b42]/30 to-transparent px-6 pb-6 pt-20">
            <p className="text-sm font-black uppercase tracking-[0.14em] text-cyan-200">
              CEF Parole de Vie
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          {cleanText(story.subtitle) || "Notre parcours"}
        </p>

        <h2 className="mt-4 max-w-3xl font-serif text-3xl font-black leading-tight text-[#092e63] sm:text-4xl">
          {cleanText(story.title) || "Notre histoire"}
        </h2>

        <div className="mt-7 max-w-3xl whitespace-pre-line text-[17px] leading-8 text-slate-600">
          {cleanText(story.content)}
        </div>

        <Link
          href="/rejoindre"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
        >
          Rejoindre l’église
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  </section>

  <section className="bg-white px-6 py-20 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <div className="max-w-3xl">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          Étapes clés
        </p>

        <h2 className="mt-4 font-serif text-4xl font-black text-[#092e63]">
          Les temps forts de notre parcours
        </h2>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {milestones.map((milestone, index) => {
          const Icon =
            index === 0
              ? BookOpen
              : index === 1
                ? Heart
                : Sparkles;

          const imageUrl = resolvePublicAssetUrl(
            milestone.image_path,
            getPublicUrl
          );

          return (
            <article
              key={milestone.block_key}
              className="overflow-hidden rounded-[2rem] border border-blue-100 bg-[#f7faff] shadow-sm"
            >
              {imageUrl && !isVideoFile(imageUrl) && (
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={cleanText(milestone.title) || "Étape historique"}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-[#0a56a4]">
                  <Icon size={24} />
                </div>

                <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[#1680c4]">
                  {cleanText(milestone.subtitle)}
                </p>

                <h3 className="mt-3 text-2xl font-black text-[#092e63]">
                  {cleanText(milestone.title)}
                </h3>

                <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
                  {cleanText(milestone.content)}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>

  <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
          Galerie historique
        </p>

        <h2 className="mt-4 font-serif text-4xl font-black text-[#092e63]">
          Nos souvenirs en images
        </h2>
      </div>

      <Link
        href="/galerie"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0a56a4]"
      >
        Voir toute la galerie
        <ArrowRight size={18} />
      </Link>
    </div>

    {galleryItems.length === 0 ? (
      <div className="mt-10 rounded-[2rem] border border-dashed border-blue-200 bg-white px-8 py-14 text-center">
        <Camera className="mx-auto text-blue-200" size={42} />

        <p className="mt-4 font-black text-[#092e63]">
          Les photos historiques seront bientôt disponibles.
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Ajoutez les photos depuis Administration → Site public → Galerie,
          avec la catégorie exacte : Historique.
        </p>
      </div>
    ) : (
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={getPublicUrl(item.image_path)}
                alt={item.title ?? "Photo historique CEF Parole de Vie"}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="p-5">
              <h3 className="text-lg font-black text-[#092e63]">
                {item.title || "Souvenir de CEF Parole de Vie"}
              </h3>

              {item.description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    )}
  </section>

  <section className="bg-[#061d45] px-6 py-20 text-white lg:px-10">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">
          {cleanText(video.subtitle)}
        </p>

        <h2 className="mt-4 font-serif text-4xl font-black">
          {cleanText(video.title)}
        </h2>

        <p className="mt-5 max-w-xl whitespace-pre-line text-lg leading-8 text-blue-100">
          {cleanText(video.content)}
        </p>

        {videoActionUrl && (
          <a
            href={videoActionUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-extrabold text-[#0a3d82]"
          >
            <PlayCircle size={20} />
            {video.primary_label || "Voir la vidéo"}
          </a>
        )}
      </div>

      <div className="overflow-hidden rounded-[2rem] bg-white/10 shadow-2xl">
        {directVideoUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full bg-black"
          >
            <source
              src={directVideoUrl}
              type={getVideoMimeType(directVideoUrl)}
            />
            Votre navigateur ne prend pas en charge la lecture de cette vidéo.
          </video>
        ) : youtubeEmbedUrl ? (
          <iframe
            src={youtubeEmbedUrl}
            title={cleanText(video.title) || "Vidéo historique"}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center px-8 text-center">
            <PlayCircle size={50} className="text-cyan-300" />

            <p className="mt-5 font-black">
              Ajoutez une vidéo depuis Site public.
            </p>

            <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
              Téléversez un fichier MP4, WebM, OGG, OGV ou MOV dans le bloc
              « Historique — Vidéo principale », ou collez un lien YouTube
              dans le champ « Lien principal ».
            </p>
          </div>
        )}
      </div>
    </div>
  </section>

  <section className="bg-white px-6 py-20 lg:px-10">
    <div className="mx-auto max-w-6xl rounded-[2rem] bg-[#eef7ff] px-8 py-12 text-center">
      <CalendarDays className="mx-auto text-[#0a56a4]" size={34} />

      <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
        {cleanText(cta.subtitle)}
      </p>

      <h2 className="mt-4 font-serif text-4xl font-black text-[#092e63]">
        {cleanText(cta.title)}
      </h2>

      <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-lg leading-8 text-slate-600">
        {cleanText(cta.content)}
      </p>

      {cta.primary_label && cta.primary_href && (
        <Link
          href={cta.primary_href}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#0a3d82] px-6 py-4 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
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
