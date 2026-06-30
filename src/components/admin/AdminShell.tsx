"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import HeaderSearch from "./header/HeaderSearch";
import Link from "next/link";
import HeaderQuickActions from "./header/HeaderQuickActions";
import { usePathname } from "next/navigation";

import {
  Banknote,
  Building2,
  CalendarDays,
  ChevronDown,
  Church,
  ClipboardCheck,
  FileText,
  Globe2,
  GraduationCap,
  Images,
  Inbox,
  LayoutDashboard,
  Menu,
  Newspaper,
  Settings,
  UserPlus,
  UserRound,
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

type SidebarNavGroupProps = {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
};

const publicSiteItems: NavItem[] = [
  { label: "Site public", href: "/admin/site-public", icon: Globe2 },
  { label: "Actualités", href: "/admin/site-public/actualites", icon: Newspaper },
  { label: "Galerie", href: "/admin/site-public/galerie", icon: Images },
  { label: "Demandes publiques", href: "/admin/demandes", icon: Inbox },
];

const organizationItems: NavItem[] = [
  { label: "Membres", href: "/admin/membres", icon: Users },
  { label: "Nouveaux membres", href: "/admin/nouveaux-membres", icon: UserPlus },
  { label: "Départements", href: "/admin/departements", icon: Church },
  { label: "Assemblées", href: "/admin/assemblees", icon: Building2 },
  { label: "Pasteurs", href: "/admin/pasteurs", icon: UserRound },
];

const churchLifeItems: NavItem[] = [
  { label: "Activités", href: "/admin/activites", icon: CalendarDays },
  { label: "Rapports", href: "/admin/rapports", icon: FileText },
];

const schoolNavItems: NavItem[] = [
  { label: "Dashboard école", href: "/admin/ecole", icon: LayoutDashboard },
  { label: "Classes", href: "/admin/ecole/classes", icon: Building2 },
  { label: "Élèves", href: "/admin/ecole/eleves", icon: Users },
  { label: "Enseignants", href: "/admin/ecole/enseignants", icon: UserPlus },
  { label: "Matières & évaluations", href: "/admin/ecole/evaluations", icon: ClipboardCheck },
  { label: "Présences", href: "/admin/ecole/presences", icon: CalendarDays },
  { label: "Frais & paramètres", href: "/admin/ecole/parametres", icon: Settings },
];

const financeItems: NavItem[] = [
  { label: "Dashboard finances", href: "/admin/finances", icon: LayoutDashboard },
  { label: "Dons & Offrandes", href: "/admin/dons", icon: Banknote },
  { label: "Dîmes", href: "/admin/finances/dimes", icon: Banknote },
  { label: "Dépenses", href: "/admin/finances/depenses", icon: FileText },
  { label: "Budgets", href: "/admin/finances/budgets", icon: ClipboardCheck },
  { label: "Rapports financiers", href: "/admin/finances/rapports", icon: FileText },
];

const assetItems: NavItem[] = [
  { label: "Dashboard patrimoine", href: "/admin/patrimoine", icon: LayoutDashboard },
  { label: "Inventaire", href: "/admin/patrimoine/inventaire", icon: ClipboardCheck },
  { label: "Immobilier", href: "/admin/patrimoine/immobilier", icon: Building2 },
  { label: "Équipements", href: "/admin/patrimoine/equipements", icon: Settings },
  { label: "Maintenance", href: "/admin/patrimoine/maintenance", icon: CalendarDays },
];

const adminItems: NavItem[] = [
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
];

const quickActions: NavItem[] = [
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

function isPathActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavGroup({
  label,
  icon: GroupIcon,
  items,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
}: SidebarNavGroupProps) {
  const groupActive = items.some((item) => isPathActive(pathname, item.href));

  return (
    <div className="pt-1">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
          groupActive
            ? "bg-white text-[#0a3d82] shadow-lg"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <GroupIcon size={18} />
          {label}
        </span>

        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="ml-5 mt-2 space-y-1 border-l border-white/20 pl-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
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
  );
}

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

  const [publicSiteOpen, setPublicSiteOpen] = useState(
    pathname.startsWith("/admin/site-public") || pathname.startsWith("/admin/demandes")
  );

  const [organizationOpen, setOrganizationOpen] = useState(
    pathname.startsWith("/admin/membres") ||
      pathname.startsWith("/admin/nouveaux-membres") ||
      pathname.startsWith("/admin/departements") ||
      pathname.startsWith("/admin/assemblees") ||
      pathname.startsWith("/admin/pasteurs")
  );

  const [churchLifeOpen, setChurchLifeOpen] = useState(
    pathname.startsWith("/admin/activites") || pathname.startsWith("/admin/rapports")
  );

  const [schoolMenuOpen, setSchoolMenuOpen] = useState(
    pathname.startsWith("/admin/ecole")
  );

  const [financeOpen, setFinanceOpen] = useState(
    pathname.startsWith("/admin/finances") || pathname.startsWith("/admin/dons")
  );

  const [assetOpen, setAssetOpen] = useState(
    pathname.startsWith("/admin/patrimoine")
  );

  const [adminOpen, setAdminOpen] = useState(
    pathname.startsWith("/admin/parametres")
  );

  useEffect(() => {
    if (
      pathname.startsWith("/admin/site-public") ||
      pathname.startsWith("/admin/demandes")
    ) {
      setPublicSiteOpen(true);
    }

    if (
      pathname.startsWith("/admin/membres") ||
      pathname.startsWith("/admin/nouveaux-membres") ||
      pathname.startsWith("/admin/departements") ||
      pathname.startsWith("/admin/assemblees") ||
      pathname.startsWith("/admin/pasteurs")
    ) {
      setOrganizationOpen(true);
    }

    if (
      pathname.startsWith("/admin/activites") ||
      pathname.startsWith("/admin/rapports")
    ) {
      setChurchLifeOpen(true);
    }

    if (pathname.startsWith("/admin/ecole")) {
      setSchoolMenuOpen(true);
    }

    if (
      pathname.startsWith("/admin/finances") ||
      pathname.startsWith("/admin/dons")
    ) {
      setFinanceOpen(true);
    }

    if (pathname.startsWith("/admin/patrimoine")) {
      setAssetOpen(true);
    }

    if (pathname.startsWith("/admin/parametres")) {
      setAdminOpen(true);
    }
  }, [pathname]);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {mobileMenuOpen && (
        <button
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
                className="animate-pdv-logo-breath object-contain p-1"
                priority
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
          <Link
            href="/admin"
            onClick={closeMenu}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              pathname === "/admin"
                ? "bg-white text-[#0a3d82] shadow-lg"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            Tableau de bord
          </Link>

          <SidebarNavGroup
            label="Site public"
            icon={Globe2}
            items={publicSiteItems}
            pathname={pathname}
            isOpen={publicSiteOpen}
            onToggle={() => setPublicSiteOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="Organisation"
            icon={Users}
            items={organizationItems}
            pathname={pathname}
            isOpen={organizationOpen}
            onToggle={() => setOrganizationOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="Vie de l’Église"
            icon={CalendarDays}
            items={churchLifeItems}
            pathname={pathname}
            isOpen={churchLifeOpen}
            onToggle={() => setChurchLifeOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="École"
            icon={GraduationCap}
            items={schoolNavItems}
            pathname={pathname}
            isOpen={schoolMenuOpen}
            onToggle={() => setSchoolMenuOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="Finances"
            icon={Banknote}
            items={financeItems}
            pathname={pathname}
            isOpen={financeOpen}
            onToggle={() => setFinanceOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="Patrimoine"
            icon={Building2}
            items={assetItems}
            pathname={pathname}
            isOpen={assetOpen}
            onToggle={() => setAssetOpen((current) => !current)}
            onNavigate={closeMenu}
          />

          <SidebarNavGroup
            label="Administration"
            icon={Settings}
            items={adminItems}
            pathname={pathname}
            isOpen={adminOpen}
            onToggle={() => setAdminOpen((current) => !current)}
            onNavigate={closeMenu}
          />
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
<header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7">
  <div className="flex min-w-0 items-center gap-4">
    <button
      type="button"
      onClick={() => setMobileMenuOpen(true)}
      className="rounded-xl border border-blue-100 p-2 text-[#0a3d82] lg:hidden"
      aria-label="Ouvrir le menu"
    >
      <Menu size={22} />
    </button>

    <div className="hidden sm:block">
      <p className="text-sm font-black text-[#092e63]">
        Bienvenue, {fullName}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {roleLabels[role] ?? role} · PDV Connect
      </p>
    </div>
  </div>

  <HeaderSearch />

  <div className="flex items-center gap-2">
    
  <HeaderQuickActions />

<AdminUserTools
  profileId={profileId}
  fullName={fullName}
  jobTitle={jobTitle}
  email={email}
  avatarUrl={avatarUrl}
  initialNotifications={notifications}
/>
  </div>
</header>

        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}