import { LoaderCircle } from "lucide-react";

type LoadingProps = {
  label?: string;
};

export default function Loading({ label = "Chargement…" }: LoadingProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-3xl border border-blue-100 bg-white p-8 text-sm font-bold text-slate-500 shadow-sm">
      <LoaderCircle size={18} className="animate-spin text-[#0a3d82]" />
      {label}
    </div>
  );
}