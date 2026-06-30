import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({
  label,
  error,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </span>
      )}

      <input
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
        } ${className}`}
        {...props}
      />

      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}