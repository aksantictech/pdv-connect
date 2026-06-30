import type { LucideIcon } from "lucide-react";
import Card from "./Card";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0a3d82]">
        <Icon size={26} />
      </div>

      <p className="mt-7 text-4xl font-black text-[#092e63]">{value}</p>

      <h2 className="mt-2 text-lg font-extrabold text-slate-900">
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}
    </Card>
  );
}