import type { SelectHTMLAttributes } from "react";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-sm font-bold text-slate-700">
          {label}
        </span>
      )}

      <select
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-300 focus:border-red-500 focus:ring-red-100" : ""
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
    </label>
  );
}