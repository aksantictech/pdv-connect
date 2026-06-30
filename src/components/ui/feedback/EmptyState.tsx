import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0a3d82]">
        <Icon size={28} />
      </div>

      <h3 className="mt-5 text-lg font-black text-[#092e63]">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}