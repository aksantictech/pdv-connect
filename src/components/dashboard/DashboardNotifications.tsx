import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  HeartHandshake,
  UserPlus,
} from "lucide-react";

import type { DashboardAlert } from "@/services/dashboard";

type DashboardNotificationsProps = {
  alerts: DashboardAlert[];
};

const tones: Record<DashboardAlert["tone"], string> = {
  red: "bg-red-50 text-red-700 border-red-100",
  orange: "bg-amber-50 text-amber-700 border-amber-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue: "bg-blue-50 text-[#0a3d82] border-blue-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
};

const icons: LucideIcon[] = [
  UserPlus,
  HeartHandshake,
  CalendarDays,
  AlertTriangle,
];

export default function DashboardNotifications({
  alerts,
}: DashboardNotificationsProps) {
  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-5 text-sm font-bold text-slate-500">
        Aucune notification intelligente pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const Icon = icons[index % icons.length];

        return (
          <Link
            key={alert.id}
            href={alert.href}
            className={`flex gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-950/5 ${
              tones[alert.tone]
            }`}
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
              <Icon size={18} />
            </span>

            <span>
              <span className="block text-sm font-black">{alert.title}</span>
              <span className="mt-1 block text-xs leading-5 opacity-80">
                {alert.description}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}