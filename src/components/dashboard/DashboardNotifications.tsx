import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  UserPlus,
} from "lucide-react";

type DashboardNotification = {
  title: string;
  description: string;
  href: string;
  tone: "red" | "orange" | "green" | "blue";
  icon: typeof AlertTriangle;
};

const tones = {
  red: "bg-red-50 text-red-700 border-red-100",
  orange: "bg-amber-50 text-amber-700 border-amber-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue: "bg-blue-50 text-[#0a3d82] border-blue-100",
};

const notifications: DashboardNotification[] = [
  {
    title: "Nouveaux membres",
    description: "Personnes récemment inscrites à contacter.",
    href: "/admin/nouveaux-membres",
    tone: "blue",
    icon: UserPlus,
  },
  {
    title: "Demandes publiques",
    description: "Rendez-vous, prières et messages à traiter.",
    href: "/admin/demandes",
    tone: "red",
    icon: HeartHandshake,
  },
  {
    title: "Rapports en attente",
    description: "Départements ou activités à vérifier.",
    href: "/admin/rapports",
    tone: "orange",
    icon: AlertTriangle,
  },
  {
    title: "Activités à venir",
    description: "Programmes et événements planifiés.",
    href: "/admin/activites",
    tone: "green",
    icon: CalendarDays,
  },
];

export default function DashboardNotifications() {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => {
        const Icon = notification.icon;

        return (
          <Link
            key={notification.title}
            href={notification.href}
            className={`flex gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-950/5 ${
              tones[notification.tone]
            }`}
          >
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70">
              <Icon size={18} />
            </span>

            <span>
              <span className="block text-sm font-black">
                {notification.title}
              </span>
              <span className="mt-1 block text-xs leading-5 opacity-80">
                {notification.description}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}