import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({
  label,
  error,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </span>
      )}

      <textarea
        id={inputId}
        className={`min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
        } ${className}`}
        {...props}
      />

      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}