"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
Banknote,
Building2,
CalendarDays,
ChevronDown,
Church,
ClipboardCheck,
FileText,
GraduationCap,
LayoutDashboard,
Menu,
UserRound,
Settings,
UserPlus,
Users,
X,
} from "lucide-react";

import AdminUserTools from "./AdminUserTools";
import SignOutButton from "./SignOutButton";
import type { AppNotification } from "../../types/notifications";

type NavItem = {
label: string;
href: string;
icon: LucideIcon;
};

type SchoolNavItem = {
label: string;
href: string;
icon: LucideIcon;
};

type AdminShellProps = {
children: ReactNode;
fullName: string;
role: string;
profileId: string;
email: string;
jobTitle: string | null;
avatarUrl: string | null;
notifications: AppNotification[];
};

const navItems: NavItem[] = [
{ label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
{ label: "Membres", href: "/admin/membres", icon: Users },
{ label: "Nouveaux membres", href: "/admin/nouveaux-membres", icon: UserPlus },
{ label: "Départements", href: "/admin/departements", icon: Church },
{ label: "Activités", href: "/admin/activites", icon: CalendarDays },
{ label: "Rapports", href: "/admin/rapports", icon: FileText },
{ label: "Assemblées", href: "/admin/assemblees", icon: Building2 },
{ label: "Pasteurs", href: "/admin/pasteurs", icon: UserRound },
{ label: "Dons & Offrandes", href: "/admin/dons", icon: Banknote },
{ label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

const schoolNavItems: SchoolNavItem[] = [
{
label: "Tableau de bord école",
href: "/admin/ecole",
icon: LayoutDashboard,
},

{
label: "Classes",
href: "/admin/ecole/classes",
icon: Building2,
},
{
label: "Élèves",
href: "/admin/ecole/eleves",
icon: Users,
},
{
label: "Enseignants",
href: "/admin/ecole/enseignants",
icon: UserPlus,
},
{
label: "Matières & évaluations",
href: "/admin/ecole/evaluations",
icon: ClipboardCheck,
},
{
label: "Présences",
href: "/admin/ecole/presences",
icon: CalendarDays,
},
{
  label: "Frais & paramètres",
  href: "/admin/ecole/parametres",
  icon: Settings,
},
];

const roleLabels: Record<string, string> = {
super_admin: "Super Administrateur",
pasteur_titulaire: "Pasteur titulaire",
administrateur_general: "Administrateur général",
pasteur_assemblee: "Pasteur d’assemblée",
responsable_departement: "Responsable département",
responsable_integration: "Responsable intégration",
secretaire_accueil: "Secrétaire accueil",
responsable_ecole: "Responsable école",
enseignant: "Enseignant",
lecteur: "Lecteur",
};

export default function AdminShell({
children,
fullName,
role,
profileId,
email,
jobTitle,
avatarUrl,
notifications,
}: AdminShellProps) {
const pathname = usePathname();

const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
const [schoolMenuOpen, setSchoolMenuOpen] = useState(
pathname.startsWith("/admin/ecole")
);

useEffect(() => {
if (pathname.startsWith("/admin/ecole")) {
setSchoolMenuOpen(true);
}
}, [pathname]);

function isActive(href: string) {
if (href === "/admin") {
return pathname === "/admin";
}

return pathname.startsWith(href);

}

function isSchoolItemActive(href: string) {
if (href === "/admin/ecole") {
return pathname === "/admin/ecole";
}


return pathname.startsWith(href);


}

function closeMenu() {
setMobileMenuOpen(false);
}

return ( <div className="min-h-screen bg-slate-50">
{mobileMenuOpen && ( <button
       type="button"
       aria-label="Fermer le menu"
       onClick={closeMenu}
       className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden"
     />
)}


  <aside
    className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#061d45] px-4 py-5 text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
      mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <div className="flex items-center justify-between border-b border-white/10 pb-5">
      <Link
        href="/admin"
        onClick={closeMenu}
        className="flex items-center gap-3"
      >
        <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/30 bg-white">
          <Image
            src="/images/logo-pdv.jpeg"
            alt="Logo CEF Parole de Vie"
            fill
            sizes="48px"
            className="object-contain p-1"
          />
        </div>

        <div>
          <p className="text-sm font-black">CEF Parole de Vie</p>
          <p className="mt-1 text-xs text-blue-200">PDV Connect</p>
        </div>
      </Link>

      <button
        type="button"
        onClick={closeMenu}
        className="rounded-lg p-2 text-blue-100 transition hover:bg-white/10 lg:hidden"
        aria-label="Fermer le menu"
      >
        <X size={20} />
      </button>
    </div>

    <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1">
      {navItems.slice(0, 8).map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              active
                ? "bg-white text-[#0a3d82] shadow-lg"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setSchoolMenuOpen((current) => !current)}
          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
            pathname.startsWith("/admin/ecole")
              ? "bg-white text-[#0a3d82] shadow-lg"
              : "text-blue-100 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-3">
            <GraduationCap size={18} />
            École
          </span>

          <ChevronDown
            size={18}
            className={`transition-transform ${
              schoolMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {schoolMenuOpen && (
          <div className="ml-5 mt-2 space-y-1 border-l border-white/20 pl-3">
            {schoolNavItems.map((item) => {
              const Icon = item.icon;
              const active = isSchoolItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                    active
                      ? "bg-blue-400/20 text-white"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {navItems.slice(8).map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              active
                ? "bg-white text-[#0a3d82] shadow-lg"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>

    <div className="mt-5 border-t border-white/10 pt-4">
      <div className="mb-3 rounded-xl bg-white/10 px-4 py-3">
        <p className="truncate text-sm font-bold">{fullName}</p>
        <p className="mt-1 text-xs text-blue-200">
          {roleLabels[role] ?? role}
        </p>
      </div>

      <SignOutButton />
    </div>
  </aside>

  <div className="min-h-screen lg:pl-72">
    <header className="sticky top-0 z-30 flex h-[73px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">
      <div>
        <p className="text-sm font-black text-[#092e63]">
          CEF Parole de Vie
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Gestion centralisée de l’œuvre
        </p>
      </div>

      <div className="flex items-center gap-3">
        <AdminUserTools
          profileId={profileId}
          fullName={fullName}
          jobTitle={jobTitle}
          email={email}
          avatarUrl={avatarUrl}
          initialNotifications={notifications}
        />

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-blue-100 p-2 text-[#0a3d82] lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>

    <main className="p-5 lg:p-8">{children}</main>
  </div>
</div>


);
}
