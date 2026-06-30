import Link from "next/link";
import {
  Banknote,
  Building2,
  CalendarDays,
  GraduationCap,
  Images,
  Newspaper,
  UserPlus,
  Users,
} from "lucide-react";

const actions = [
  { label: "Ajouter un membre", href: "/admin/membres", icon: Users },
  { label: "Nouveau membre", href: "/admin/nouveaux-membres", icon: UserPlus },
  { label: "Ajouter un élève", href: "/admin/ecole/eleves", icon: GraduationCap },
  { label: "Ajouter une assemblée", href: "/admin/assemblees", icon: Building2 },
  { label: "Créer une activité", href: "/admin/activites", icon: CalendarDays },
  { label: "Nouvelle dépense", href: "/admin/finances/depenses", icon: Banknote },
  { label: "Créer une actualité", href: "/admin/site-public/actualites", icon: Newspaper },
  { label: "Ajouter une photo", href: "/admin/site-public/galerie", icon: Images },
];

export default function DashboardQuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm font-extrabold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:text-[#0a3d82] hover:shadow-lg hover:shadow-blue-950/5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0a3d82] shadow-sm">
              <Icon size={18} />
            </span>
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}