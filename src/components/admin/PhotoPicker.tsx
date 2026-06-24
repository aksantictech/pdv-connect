"use client";

import { useEffect, useId, useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";

type PhotoPickerProps = {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  onError?: (message: string) => void;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

export default function PhotoPicker({
  label,
  file,
  onChange,
  onError,
}: PhotoPickerProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      onError?.("Formats autorisés : JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > maxFileSize) {
      onError?.("La photo ne peut pas dépasser 5 MB.");
      event.target.value = "";
      return;
    }

    onError?.("");
    onChange(selectedFile);
  }

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-slate-700">{label}</p>

      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-5 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Aperçu de la photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera size={30} className="text-[#0a56a4]" />
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0a3d82] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#072d61]"
          >
            <ImagePlus size={18} />
            {file ? "Changer la photo" : "Choisir une photo"}
          </label>

          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            JPG, PNG ou WEBP · Taille maximale : 5 MB.
          </p>

          {file && (
            <div className="mt-3 flex items-center gap-3">
              <p className="truncate text-sm font-semibold text-slate-700">
                {file.name}
              </p>

              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 text-sm font-bold text-red-600"
              >
                <Trash2 size={16} />
                Retirer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}