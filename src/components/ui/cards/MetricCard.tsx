import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import Card from "./Card";

type MetricTone = "blue" | "green" | "orange" | "red" | "violet";

type MetricCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  trendLabel?: string;
  href?: string;
  tone?: MetricTone;
};

const tones: Record<MetricTone, string> = {
  blue: "bg-blue-50 text-[#0a3d82]",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  violet: "bg-violet-50 text-violet-700",
};

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  href,
  tone = "blue",
}: MetricCardProps) {
  return (
    <Card className="transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/10">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={26} />
        </div>

        {trend && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            {trend}
          </span>
        )}
      </div>

      <p className="mt-7 text-4xl font-black text-[#092e63]">{value}</p>

      <h2 className="mt-2 text-lg font-extrabold text-slate-900">{title}</h2>

      {description && (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      {trendLabel && (
        <p className="mt-4 text-xs font-bold text-slate-400">{trendLabel}</p>
      )}

      {href && (
        <Link
          href={href}
          className="mt-5 inline-flex text-sm font-black text-[#0a56a4] hover:text-[#072d61]"
        >
          Voir les détails →
        </Link>
      )}
    </Card>
  );
}