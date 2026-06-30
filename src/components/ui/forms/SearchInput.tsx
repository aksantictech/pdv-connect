import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  wrapperClassName?: string;
};

export default function SearchInput({
  className = "",
  wrapperClassName = "",
  placeholder = "Rechercher...",
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <input
        type="search"
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-blue-100 bg-slate-50 px-4 py-2.5 pl-10 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1680c4] focus:bg-white focus:ring-4 focus:ring-blue-100 ${className}`}
        {...props}
      />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Search size={17} />
      </span>
    </div>
  );
}