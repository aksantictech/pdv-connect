"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
Archive,
CalendarDays,
CheckCircle2,
ImagePlus,
LoaderCircle,
Newspaper,
Pencil,
Plus,
Save,
Upload,
X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";
import type { NewsPost, NewsStatus } from "../../types/news";
import {
newsStatusLabels,
newsStatusStyles,
} from "../../types/news";

type NewsManagerProps = {
initialPosts: NewsPost[];
loadError: string | null;
};

type NewsForm = {
title: string;
slug: string;
category: string;
excerpt: string;
content: string;
status: NewsStatus;
isFeatured: boolean;
publishedAt: string;
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function createEmptyForm(): NewsForm {
return {
title: "",
slug: "",
category: "Actualité",
excerpt: "",
content: "",
status: "draft",
isFeatured: false,
publishedAt: "",
};
}

function slugify(value: string) {
return value
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.toLowerCase()
.trim()
.replace(/[^a-z0-9]+/g, "-")
.replace(/^-+|-+$/g, "");
}

function toDateTimeLocal(value: string | null) {
if (!value) return "";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return "";

return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
.toISOString()
.slice(0, 16);
}

function formatDate(value: string | null) {
if (!value) return "Non publiée";

return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "short",
year: "numeric",
}).format(new Date(value));
}

export default function NewsManager({
initialPosts,
loadError,
}: NewsManagerProps) {
const router = useRouter();
const supabase = createClient();

const [editorOpen, setEditorOpen] = useState(false);
const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);
const [form, setForm] = useState<NewsForm>(createEmptyForm);
const [coverFile, setCoverFile] = useState<File | null>(null);
const [coverPreview, setCoverPreview] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [actionId, setActionId] = useState<string | null>(null);
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");

const publishedCount = initialPosts.filter(
(post) => post.status === "published"
).length;

const draftCount = initialPosts.filter(
(post) => post.status === "draft"
).length;

function updateForm<K extends keyof NewsForm>(
field: K,
value: NewsForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function closeEditor() {
setEditorOpen(false);
setSelectedPost(null);
setForm(createEmptyForm());
setCoverFile(null);
setCoverPreview(null);
setErrorMessage("");
setSuccessMessage("");
}

function openCreate() {
setSelectedPost(null);
setForm(createEmptyForm());
setCoverFile(null);
setCoverPreview(null);
setErrorMessage("");
setSuccessMessage("");
setEditorOpen(true);
}

function openEdit(post: NewsPost) {
setSelectedPost(post);
setCoverFile(null);
setCoverPreview(post.cover_image_url);
setErrorMessage("");
setSuccessMessage("");

setForm({
  title: post.title,
  slug: post.slug,
  category: post.category,
  excerpt: post.excerpt ?? "",
  content: post.content ?? "",
  status: post.status,
  isFeatured: post.is_featured,
  publishedAt: toDateTimeLocal(post.published_at),
});

setEditorOpen(true);

}

function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
const file = event.target.files?.[0] ?? null;

if (!file) return;

if (!file.type.startsWith("image/")) {
  setErrorMessage("Veuillez sélectionner une image valide.");
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setErrorMessage("L’image ne doit pas dépasser 5 Mo.");
  return;
}

setCoverFile(file);
setCoverPreview(URL.createObjectURL(file));
setErrorMessage("");

}

async function uploadCoverImage(slug: string) {
if (!coverFile) {
return selectedPost?.cover_image_path ?? null;
}

const extension =
  coverFile.name.split(".").pop()?.toLowerCase() || "jpg";

const imagePath = `news/${slug}/${crypto.randomUUID()}.${extension}`;

const { error } = await supabase.storage
  .from("pdv-public")
  .upload(imagePath, coverFile, {
    cacheControl: "3600",
    contentType: coverFile.type,
    upsert: false,
  });

if (error) {
  throw new Error(error.message);
}

return imagePath;

}

async function savePost(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

setErrorMessage("");
setSuccessMessage("");

if (!form.title.trim()) {
  setErrorMessage("Le titre de l’actualité est obligatoire.");
  return;
}

const finalSlug = slugify(form.slug || form.title);

if (!finalSlug) {
  setErrorMessage("Impossible de générer le lien de publication.");
  return;
}

setSaving(true);

try {
  const coverImagePath = await uploadCoverImage(finalSlug);

  const { error } = await supabase.rpc("save_pdv_news_post", {
    p_payload: {
      id: selectedPost?.id ?? null,
      title: form.title.trim(),
      slug: finalSlug,
      category: form.category.trim() || "Actualité",
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_image_path: coverImagePath,
      status: form.status,
      is_featured: form.isFeatured,
      published_at: form.publishedAt
        ? new Date(form.publishedAt).toISOString()
        : null,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  setSuccessMessage(
    form.status === "published"
      ? "L’actualité est publiée."
      : "L’actualité a été enregistrée."
  );

  router.refresh();

  window.setTimeout(() => {
    closeEditor();
  }, 900);
} catch (error) {
  setErrorMessage(
    error instanceof Error
      ? error.message
      : "Impossible d’enregistrer cette actualité."
  );
} finally {
  setSaving(false);
}

}

async function archivePost(post: NewsPost) {
const confirmed = window.confirm(
`Archiver l’actualité « ${post.title} » ? Elle ne sera plus visible sur le site public.`
);

if (!confirmed) return;

setActionId(post.id);

try {
  const { error } = await supabase.rpc("archive_pdv_news_post", {
    p_post_id: post.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  router.refresh();
} catch (error) {
  window.alert(
    error instanceof Error
      ? error.message
      : "Impossible d’archiver cette actualité."
  );
} finally {
  setActionId(null);
}

}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Communication </p>

      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Actualités de l’église
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Créez, préparez et publiez les annonces, programmes, événements et
        informations importantes de CEF Parole de Vie.
      </p>
    </div>

    <button
      type="button"
      onClick={openCreate}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <Plus size={19} />
      Ajouter une actualité
    </button>
  </section>

  {loadError ? (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      {loadError}
    </div>
  ) : (
    <>
      <section className="mt-8 grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Newspaper className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialPosts.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Actualités enregistrées
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {publishedCount}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Publications visibles
          </p>
        </article>

        <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <Pencil className="text-amber-700" size={25} />
          <p className="mt-6 text-3xl font-black text-amber-900">
            {draftCount}
          </p>
          <p className="mt-2 font-bold text-amber-800">
            Brouillons à finaliser
          </p>
        </article>
      </section>

      {initialPosts.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center">
          <Newspaper className="mx-auto text-blue-200" size={42} />
          <p className="mt-4 font-black text-[#092e63]">
            Aucune actualité enregistrée
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Créez votre première publication pour l’afficher sur le site.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {initialPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
            >
              {post.cover_image_url ? (
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#061d45] to-[#1680c4]">
                  <ImagePlus className="text-white/70" size={42} />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[#0a56a4]">
                    {post.category}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                      newsStatusStyles[post.status]
                    }`}
                  >
                    {newsStatusLabels[post.status]}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-black text-[#092e63]">
                  {post.title}
                </h2>

                <p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">
                  {post.excerpt ||
                    post.content ||
                    "Aucun résumé n’a été renseigné."}
                </p>

                <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={15} />
                  {formatDate(post.published_at)}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(post)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 px-3 py-3 text-sm font-extrabold text-[#0a3d82] transition hover:bg-blue-50"
                  >
                    <Pencil size={16} />
                    Modifier
                  </button>

                  <button
                    type="button"
                    disabled={
                      post.status === "archived" || actionId === post.id
                    }
                    onClick={() => archivePost(post)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-extrabold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {actionId === post.id ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Archive size={16} />
                    )}
                    Archiver
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  )}

  {editorOpen && (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              Publication
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              {selectedPost
                ? "Modifier une actualité"
                : "Nouvelle actualité"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeEditor}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={savePost} className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} />
              {successMessage}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Titre de l’actualité *
              </span>

              <input
                value={form.title}
                onChange={(event) => {
                  const title = event.target.value;

                  updateForm("title", title);

                  if (!selectedPost) {
                    updateForm("slug", slugify(title));
                  }
                }}
                className={inputClassName}
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Catégorie
              </span>

              <input
                value={form.category}
                onChange={(event) =>
                  updateForm("category", event.target.value)
                }
                placeholder="Programme, Annonce, Événement..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Lien de publication
              </span>

              <input
                value={form.slug}
                onChange={(event) =>
                  updateForm("slug", slugify(event.target.value))
                }
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Résumé court
              </span>

              <textarea
                value={form.excerpt}
                onChange={(event) =>
                  updateForm("excerpt", event.target.value)
                }
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Texte affiché sous le titre de l’actualité."
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Contenu détaillé
              </span>

              <textarea
                value={form.content}
                onChange={(event) =>
                  updateForm("content", event.target.value)
                }
                className={`${inputClassName} min-h-48 resize-y`}
                placeholder="Détail complet de la publication."
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Image de couverture
              </span>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Prévisualisation"
                    className="mb-4 h-44 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-32 items-center justify-center rounded-2xl bg-white text-slate-400">
                    <ImagePlus size={34} />
                  </div>
                )}

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-extrabold text-[#0a56a4] transition hover:bg-blue-50">
                  <Upload size={17} />
                  Ajouter une image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-xs text-slate-500">
                  JPG, PNG ou WEBP — maximum 5 Mo.
                </p>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Statut
              </span>

              <select
                value={form.status}
                onChange={(event) =>
                  updateForm(
                    "status",
                    event.target.value as NewsStatus
                  )
                }
                className={inputClassName}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
                <option value="archived">Archivé</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Date de publication
              </span>

              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(event) =>
                  updateForm("publishedAt", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(event) =>
                  updateForm("isFeatured", event.target.checked)
                }
                className="h-4 w-4 accent-[#0a56a4]"
              />
              Mettre cette actualité en avant
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeEditor}
              className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-6 py-3 font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save size={18} />
                  {form.status === "published"
                    ? "Publier l’actualité"
                    : "Enregistrer"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}
