"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
CheckCircle2,
ExternalLink,
Eye,
Globe2,
ImagePlus,
LoaderCircle,
Pencil,
Save,
Upload,
X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";
import type {
PublicBlock,
PublicBlockForm,
} from "../../types/public-cms";
import {
createPublicBlockForm,
publicBlockDescriptions,
} from "../../types/public-cms";

type PublicBlocksManagerProps = {
initialBlocks: PublicBlock[];
loadError: string | null;
};

const inputClassName =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100";

function getBlockIcon(blockKey: string) {
if (blockKey === "hero") return "🏠";
if (blockKey === "pastor") return "🙏";
if (blockKey === "practical_info") return "📍";
if (blockKey === "news") return "📰";
return "✦";
}

function formatDate(value: string) {
return new Intl.DateTimeFormat("fr-FR", {
day: "2-digit",
month: "short",
year: "numeric",
hour: "2-digit",
minute: "2-digit",
}).format(new Date(value));
}

export default function PublicBlocksManager({
initialBlocks,
loadError,
}: PublicBlocksManagerProps) {
const router = useRouter();
const supabase = createClient();

const [selectedBlock, setSelectedBlock] = useState<PublicBlock | null>(null);
const [form, setForm] = useState<PublicBlockForm>(() =>
createPublicBlockForm()
);
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [message, setMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");

function updateForm<K extends keyof PublicBlockForm>(
field: K,
value: PublicBlockForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));
}

function openEditor(block: PublicBlock) {
setSelectedBlock(block);
setForm(createPublicBlockForm(block));
setImageFile(null);
setImagePreview(block.image_url);
setMessage("");
setErrorMessage("");
}

function closeEditor() {
setSelectedBlock(null);
setForm(createPublicBlockForm());
setImageFile(null);
setImagePreview(null);
setMessage("");
setErrorMessage("");
}

function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
const file = event.target.files?.[0] ?? null;

if (!file) {
  return;
}

if (!file.type.startsWith("image/")) {
  setErrorMessage("Veuillez sélectionner une image valide.");
  return;
}

if (file.size > 5 * 1024 * 1024) {
  setErrorMessage("L’image ne doit pas dépasser 5 Mo.");
  return;
}

setImageFile(file);
setImagePreview(URL.createObjectURL(file));
setErrorMessage("");

}

async function uploadImage(blockKey: string) {
if (!imageFile) {
return selectedBlock?.image_path ?? null;
}

const extension =
  imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

const fileName = `${blockKey}/${crypto.randomUUID()}.${extension}`;

const { error } = await supabase.storage
  .from("pdv-public")
  .upload(fileName, imageFile, {
    cacheControl: "3600",
    contentType: imageFile.type,
    upsert: false,
  });

if (error) {
  throw new Error(error.message);
}

return fileName;

}

async function saveBlock(event: FormEvent<HTMLFormElement>) {
event.preventDefault();

if (!selectedBlock) {
  return;
}

setSaving(true);
setMessage("");
setErrorMessage("");

try {
  const imagePath = await uploadImage(selectedBlock.block_key);

  const { error } = await supabase.rpc("save_pdv_public_block", {
    p_payload: {
      block_key: selectedBlock.block_key,
      label: form.label.trim() || selectedBlock.label,
      title: form.title.trim() || null,
      subtitle: form.subtitle.trim() || null,
      content: form.content.trim() || null,
      primary_label: form.primaryLabel.trim() || null,
      primary_href: form.primaryHref.trim() || null,
      secondary_label: form.secondaryLabel.trim() || null,
      secondary_href: form.secondaryHref.trim() || null,
      image_path: imagePath,
      is_active: form.isActive,
      sort_order: Number(form.sortOrder || "0"),
      data: selectedBlock.data ?? {},
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  setMessage("Le bloc a été mis à jour avec succès.");
  router.refresh();

  window.setTimeout(() => {
    closeEditor();
  }, 900);
} catch (error) {
  setErrorMessage(
    error instanceof Error
      ? error.message
      : "Impossible d’enregistrer les modifications."
  );
} finally {
  setSaving(false);
}

}

return ( <div className="mx-auto max-w-7xl"> <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"> <div> <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
Mini CMS </p>

      <h1 className="mt-3 text-3xl font-black text-[#092e63] sm:text-4xl">
        Gestion du site public
      </h1>

      <p className="mt-3 max-w-3xl leading-7 text-slate-600">
        Modifiez les contenus visibles sur le site : bannière d’accueil,
        présentation pastorale, informations pratiques et bloc Actualités.
      </p>
    </div>

    <a
      href="/"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
    >
      <ExternalLink size={18} />
      Voir le site public
    </a>
  </section>

  {loadError ? (
    <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
      {loadError}
    </div>
  ) : (
    <>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Globe2 className="text-[#0a56a4]" size={25} />
          <p className="mt-6 text-3xl font-black text-[#092e63]">
            {initialBlocks.length}
          </p>
          <p className="mt-2 font-bold text-slate-700">
            Blocs configurés
          </p>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
          <CheckCircle2 className="text-emerald-700" size={25} />
          <p className="mt-6 text-3xl font-black text-emerald-900">
            {initialBlocks.filter((block) => block.is_active).length}
          </p>
          <p className="mt-2 font-bold text-emerald-800">
            Blocs visibles
          </p>
        </article>

        <article className="rounded-3xl border border-violet-100 bg-violet-50 p-6">
          <ImagePlus className="text-violet-700" size={25} />
          <p className="mt-6 text-3xl font-black text-violet-900">
            {initialBlocks.filter((block) => block.image_path).length}
          </p>
          <p className="mt-2 font-bold text-violet-800">
            Images personnalisées
          </p>
        </article>

        <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6">
          <Eye className="text-amber-700" size={25} />
          <p className="mt-6 text-3xl font-black text-amber-900">
            Public
          </p>
          <p className="mt-2 font-bold text-amber-800">
            Mise à jour immédiate
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        {initialBlocks.map((block) => (
          <article
            key={block.id}
            className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                  {getBlockIcon(block.block_key)}
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#1680c4]">
                    {block.block_key}
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#092e63]">
                    {block.label}
                  </h2>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  block.is_active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {block.is_active ? "Visible" : "Masqué"}
              </span>
            </div>

            {block.image_url ? (
              <img
                src={block.image_url}
                alt={block.label}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-24 items-center px-6 text-sm text-slate-400">
                Aucune image personnalisée pour ce bloc.
              </div>
            )}

            <div className="p-6">
              <p className="font-extrabold text-slate-800">
                {block.title || "Titre non renseigné"}
              </p>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {block.subtitle ||
                  block.content ||
                  publicBlockDescriptions[block.block_key] ||
                  "Aucun contenu renseigné."}
              </p>

              <p className="mt-4 text-xs text-slate-400">
                Dernière mise à jour : {formatDate(block.updated_at)}
              </p>

              <button
                type="button"
                onClick={() => openEditor(block)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
              >
                <Pencil size={16} />
                Modifier ce bloc
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  )}

  {selectedBlock && (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="mx-auto my-4 w-full max-w-4xl rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
              Contenu public
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#092e63]">
              Modifier : {selectedBlock.label}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {publicBlockDescriptions[selectedBlock.block_key]}
            </p>
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

        <form onSubmit={saveBlock} className="p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} />
              {message}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Nom administratif du bloc
              </span>

              <input
                value={form.label}
                onChange={(event) => updateForm("label", event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Titre principal
              </span>

              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Sous-titre
              </span>

              <input
                value={form.subtitle}
                onChange={(event) =>
                  updateForm("subtitle", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Texte descriptif
              </span>

              <textarea
                value={form.content}
                onChange={(event) =>
                  updateForm("content", event.target.value)
                }
                className={`${inputClassName} min-h-32 resize-y`}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Libellé du bouton principal
              </span>

              <input
                value={form.primaryLabel}
                onChange={(event) =>
                  updateForm("primaryLabel", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Lien du bouton principal
              </span>

              <input
                value={form.primaryHref}
                onChange={(event) =>
                  updateForm("primaryHref", event.target.value)
                }
                placeholder="/vision ou https://..."
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Libellé du second bouton
              </span>

              <input
                value={form.secondaryLabel}
                onChange={(event) =>
                  updateForm("secondaryLabel", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Lien du second bouton
              </span>

              <input
                value={form.secondaryHref}
                onChange={(event) =>
                  updateForm("secondaryHref", event.target.value)
                }
                placeholder="/rejoindre ou https://..."
                className={inputClassName}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Image personnalisée
              </span>

              <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Prévisualisation"
                    className="mb-4 h-44 w-full rounded-2xl object-cover"
                  />
                ) : null}

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-extrabold text-[#0a56a4] transition hover:bg-blue-50">
                  <Upload size={17} />
                  Choisir une image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-xs text-slate-500">
                  JPG, PNG ou WEBP. Taille maximale : 5 Mo.
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateForm("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-[#0a56a4]"
              />
              Afficher ce bloc sur le site public
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Ordre d’affichage
              </span>

              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  updateForm("sortOrder", event.target.value)
                }
                className={inputClassName}
              />
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
                  Enregistrer les modifications
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
