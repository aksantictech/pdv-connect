"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  ImageIcon,
  LoaderCircle,
  Plus,
  Search,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { createClient } from "../../lib/supabase/client";

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_path: string;
  image_url: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type GalleryForm = {
  id: string;
  title: string;
  description: string;
  category: string;
  imagePath: string;
  imageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: string;
};

const categories = [
  "Culte",
  "Louange",
  "Évangélisation",
  "Jeunesse",
  "École",
  "Communauté",
  "Événement",
];

function emptyForm(): GalleryForm {
  return {
    id: "",
    title: "",
    description: "",
    category: "Culte",
    imagePath: "",
    imageUrl: "",
    isPublished: false,
    isFeatured: false,
    sortOrder: "0",
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function GalleryManager({
  initialItems,
  loadError,
}: {
  initialItems: GalleryItem[];
  loadError: string | null;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState<GalleryForm>(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      const searchableText = [
        item.title,
        item.description,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!keyword || searchableText.includes(keyword));
    });
  }, [items, search, categoryFilter]);

  const publishedCount = items.filter((item) => item.is_published).length;
  const featuredCount = items.filter((item) => item.is_featured).length;

  function openCreateDialog() {
    setForm(emptyForm());
    setFormError("");
    setSuccessMessage("");
    setDialogOpen(true);
  }

  function openEditDialog(item: GalleryItem) {
    setForm({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      category: item.category,
      imagePath: item.image_path,
      imageUrl: item.image_url,
      isPublished: item.is_published,
      isFeatured: item.is_featured,
      sortOrder: String(item.sort_order),
    });

    setFormError("");
    setSuccessMessage("");
    setDialogOpen(true);
  }

  function closeDialog() {
    if (saving || uploading) return;

    setDialogOpen(false);
    setFormError("");
  }

  function updateForm<K extends keyof GalleryForm>(
    key: K,
    value: GalleryForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFormError("");
    setSuccessMessage("");

    if (!file.type.startsWith("image/")) {
      setFormError("Veuillez sélectionner une image valide.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFormError("L’image ne doit pas dépasser 8 Mo.");
      return;
    }

    setUploading(true);

    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() ||
      file.type.split("/").pop() ||
      "jpg";

    const imagePath = `gallery/${crypto.randomUUID()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("pdv-public")
      .upload(imagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    setUploading(false);

    if (uploadError) {
      setFormError(
        uploadError.message ||
          "Impossible de téléverser cette image. Veuillez réessayer."
      );
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("pdv-public")
      .getPublicUrl(imagePath);

    setForm((current) => ({
      ...current,
      imagePath,
      imageUrl: publicUrlData.publicUrl,
    }));

    event.target.value = "";
  }

  async function saveGalleryItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setFormError("Le titre de la photo est obligatoire.");
      return;
    }

    if (!form.imagePath) {
      setFormError("Veuillez téléverser une image.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.rpc("save_pdv_gallery_item", {
      p_payload: {
        id: form.id || null,
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        image_path: form.imagePath,
        is_published: form.isPublished,
        is_featured: form.isFeatured,
        sort_order: Number(form.sortOrder) || 0,
      },
    });

    setSaving(false);

    if (error) {
      setFormError(
        error.message ||
          "Impossible d’enregistrer cette photo. Veuillez réessayer."
      );
      return;
    }

    setSuccessMessage("Photo enregistrée avec succès.");
    setDialogOpen(false);
    router.refresh();
  }

  async function deleteGalleryItem(item: GalleryItem) {
    const confirmed = window.confirm(
      `Supprimer définitivement la photo « ${item.title} » ?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);

    const { error } = await supabase.rpc("delete_pdv_gallery_item", {
      p_id: item.id,
    });

    if (!error) {
      await supabase.storage.from("pdv-public").remove([item.image_path]);

      setItems((current) =>
        current.filter((galleryItem) => galleryItem.id !== item.id)
      );
    }

    setDeletingId(null);

    if (error) {
      setFormError(
        error.message ||
          "Impossible de supprimer cette photo. Veuillez réessayer."
      );
    }
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1680c4]">
            Site public
          </p>

          <h1 className="mt-2 text-3xl font-black text-[#092e63]">
            Galerie photos
          </h1>

          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Téléversez, organisez et publiez les moments importants de CEF
            Parole de Vie.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
        >
          <Plus size={19} />
          Ajouter une photo
        </button>
      </section>

      {loadError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          Impossible de charger la galerie : {loadError}
        </div>
      )}

      {formError && !dialogOpen && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {formError}
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-3">
        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <ImageIcon className="text-[#0a56a4]" size={27} />
          <p className="mt-5 text-3xl font-black text-[#092e63]">
            {items.length}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Photos enregistrées
          </p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Eye className="text-emerald-600" size={27} />
          <p className="mt-5 text-3xl font-black text-[#092e63]">
            {publishedCount}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Photos publiées
          </p>
        </article>

        <article className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <Star className="text-amber-500" size={27} />
          <p className="mt-5 text-3xl font-black text-[#092e63]">
            {featuredCount}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Photos mises en avant
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={19}
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une photo, une catégorie ou une activité..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0a56a4]"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="mx-auto text-blue-200" size={42} />
            <p className="mt-4 font-black text-[#092e63]">
              Aucune photo disponible
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ajoutez une première photo pour alimenter la galerie publique.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-blue-100 bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[#092e63] backdrop-blur">
                      {item.category}
                    </span>

                    {item.is_featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950">
                        <Star size={13} fill="currentColor" />
                        À la une
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                      item.is_published
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-900/80 text-white"
                    }`}
                  >
                    {item.is_published ? (
                      <>
                        <Eye size={13} />
                        Publiée
                      </>
                    ) : (
                      <>
                        <EyeOff size={13} />
                        Brouillon
                      </>
                    )}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold text-slate-400">
                    Ajoutée le {formatDate(item.created_at)}
                  </p>

                  <h2 className="mt-2 text-lg font-black text-[#092e63]">
                    {item.title}
                  </h2>

                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEditDialog(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-extrabold text-[#0a56a4] transition hover:bg-blue-50"
                    >
                      <Edit3 size={16} />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteGalleryItem(item)}
                      disabled={deletingId === item.id}
                      className="inline-flex items-center justify-center rounded-xl border border-red-100 px-3 py-2.5 text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                      aria-label={`Supprimer ${item.title}`}
                    >
                      {deletingId === item.id ? (
                        <LoaderCircle className="animate-spin" size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {dialogOpen && (
        <div className="fixed inset-0 z-[120] flex items-end bg-slate-950/55 p-0 sm:items-center sm:justify-center sm:p-5">
          <form
            onSubmit={saveGalleryItem}
            className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"
          >
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#1680c4]">
                  Galerie publique
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#092e63]">
                  {form.id ? "Modifier une photo" : "Ajouter une photo"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={saving || uploading}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Titre de la photo *
                </span>

                <input
                  value={form.title}
                  onChange={(event) =>
                    updateForm("title", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                  placeholder="Ex. Culte de célébration du dimanche"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Catégorie
                </span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Ordre d’affichage
                </span>

                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(event) =>
                    updateForm("sortOrder", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4]"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Description
                </span>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  className="min-h-28 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                  placeholder="Décrivez brièvement ce moment."
                />
              </label>

              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-bold text-slate-700">
                  Photo *
                </p>

                {form.imageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-slate-50">
                    <img
                      src={form.imageUrl}
                      alt="Aperçu de la galerie"
                      className="h-64 w-full object-cover"
                    />

                    <label className="absolute bottom-4 right-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-[#0a3d82] shadow-lg">
                      <UploadCloud size={17} />
                      Remplacer
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 px-6 text-center transition hover:border-[#0a56a4] hover:bg-blue-100">
                    {uploading ? (
                      <LoaderCircle
                        className="animate-spin text-[#0a56a4]"
                        size={34}
                      />
                    ) : (
                      <UploadCloud className="text-[#0a56a4]" size={34} />
                    )}

                    <p className="mt-4 font-extrabold text-[#092e63]">
                      {uploading
                        ? "Téléversement en cours…"
                        : "Cliquez pour sélectionner une image"}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      JPG, PNG ou WEBP — maximum 8 Mo
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    updateForm("isPublished", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#0a56a4]"
                />

                <span>
                  <span className="block text-sm font-extrabold text-[#092e63]">
                    Publier immédiatement
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    La photo sera visible sur la galerie publique.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 p-4">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateForm("isFeatured", event.target.checked)
                  }
                  className="h-4 w-4 accent-[#0a56a4]"
                />

                <span>
                  <span className="block text-sm font-extrabold text-[#092e63]">
                    Mettre à la une
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    La photo sera prioritaire dans la page publique.
                  </span>
                </span>
              </label>
            </div>

            {formError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {formError}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={closeDialog}
                disabled={saving || uploading}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <LoaderCircle className="animate-spin" size={17} />
                    Enregistrement…
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Enregistrer la photo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}