"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Banknote,
  Building2,
  CalendarDays,
  GraduationCap,
  Images,
  Newspaper,
  Plus,
  UserRound,
  UserPlus,
  Users,
} from "lucide-react";

const quickActions = [
  { label: "Ajouter un membre", href: "/admin/membres", icon: Users },
  { label: "Nouveau membre", href: "/admin/nouveaux-membres", icon: UserPlus },
  { label: "Ajouter une assemblée", href: "/admin/assemblees", icon: Building2 },
  { label: "Ajouter une activité", href: "/admin/activites", icon: CalendarDays },
  { label: "Ajouter un élève", href: "/admin/ecole/eleves", icon: GraduationCap },
  { label: "Ajouter un enseignant", href: "/admin/ecole/enseignants", icon: UserRound },
  { label: "Créer une actualité", href: "/admin/site-public/actualites", icon: Newspaper },
  { label: "Ajouter une photo", href: "/admin/site-public/galerie", icon: Images },
  { label: "Nouvelle dépense", href: "/admin/finances/depenses", icon: Banknote },
  { label: "Ajouter un bien", href: "/admin/patrimoine/inventaire", icon: Building2 },
];

export default function HeaderQuickActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#0a3d82] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#072d61]"
      >
        <Plus size={17} />
        Nouveau
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-950/10">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-sm font-black text-[#092e63]">
              Actions rapides
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Accéder rapidement aux créations principales.
            </p>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0a3d82]">
                    <Icon size={18} />
                  </span>
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}