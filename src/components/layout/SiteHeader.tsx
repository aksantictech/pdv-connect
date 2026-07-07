"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

const discoverNavigation = [
  { label: "Notre vision", href: "/vision" },
  { label: "Nos assemblées", href: "/assemblees" },
  { label: "Ministères", href: "/ministeres" },
  { label: "Notre histoire", href: "/historique" },
];

const churchLifeNavigation = [
{ label: "Programmes", href: "/programmes" },
{ label: "Actualités", href: "/actualites" },
{ label: "Galerie", href: "/galerie" },
{ label: "Témoignages", href: "/temoignages" },
];

export default function SiteHeader() {
const [menuOpen, setMenuOpen] = useState(false);
const [discoverOpen, setDiscoverOpen] = useState(false);
const [churchLifeOpen, setChurchLifeOpen] = useState(false);
const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
const [mobileChurchLifeOpen, setMobileChurchLifeOpen] = useState(false);

function closeAllMenus() {
setMenuOpen(false);
setDiscoverOpen(false);
setChurchLifeOpen(false);
setMobileDiscoverOpen(false);
setMobileChurchLifeOpen(false);
}

function toggleDiscoverMenu() {
setDiscoverOpen((current) => !current);
setChurchLifeOpen(false);
}

function toggleChurchLifeMenu() {
setChurchLifeOpen((current) => !current);
setDiscoverOpen(false);
}

return ( <header className="sticky top-0 z-[100] border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl"> <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 lg:px-8"> <Link
       href="/"
       onClick={closeAllMenus}
       className="group flex shrink-0 items-center gap-3"
     > <div className="brand-logo-wrapper relative h-14 w-14 overflow-hidden rounded-full border-2 border-blue-100 bg-white shadow-md"> <Image
           src="/images/logo-pdv.jpeg"
           alt="Logo CEF Parole de Vie"
           fill
           priority
           sizes="56px"
           className="brand-logo-image object-cover"
         /> </div>

      <div className="hidden sm:block">
        <p className="text-base font-extrabold leading-none text-[#0a2f6e] lg:text-lg">
          CEF Parole de Vie
        </p>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Grandir • Servir • Impacter
        </p>
      </div>
    </Link>

    <nav className="hidden items-center gap-2 whitespace-nowrap text-[13px] font-bold text-slate-600 xl:flex">
      <Link
        href="/"
        onClick={closeAllMenus}
        className="rounded-lg px-2 py-2 transition hover:bg-blue-50 hover:text-[#0a56a4]"
      >
        Accueil
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={toggleDiscoverMenu}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 transition hover:bg-blue-50 hover:text-[#0a56a4]"
          aria-expanded={discoverOpen}
        >
          Découvrir l’église
          <ChevronDown
            size={15}
            className={`transition ${discoverOpen ? "rotate-180" : ""}`}
          />
        </button>

        {discoverOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-blue-100 bg-white p-2 shadow-xl">
            {discoverNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeAllMenus}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a56a4]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={toggleChurchLifeMenu}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 transition hover:bg-blue-50 hover:text-[#0a56a4]"
          aria-expanded={churchLifeOpen}
        >
          Vie de l’église
          <ChevronDown
            size={15}
            className={`transition ${churchLifeOpen ? "rotate-180" : ""}`}
          />
        </button>

        {churchLifeOpen && (
          <div className="absolute left-0 top-full mt-2 w-52 rounded-2xl border border-blue-100 bg-white p-2 shadow-xl">
            {churchLifeNavigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeAllMenus}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a56a4]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/dons"
        onClick={closeAllMenus}
        className="rounded-lg px-2 py-2 transition hover:bg-blue-50 hover:text-[#0a56a4]"
      >
        Dons & Offrandes
      </Link>

      <Link
        href="/ecole"
        onClick={closeAllMenus}
        className="rounded-lg px-2 py-2 transition hover:bg-blue-50 hover:text-[#0a56a4]"
      >
        École
      </Link>
    </nav>

    <div className="hidden shrink-0 items-center gap-2 xl:flex">
      <Link
        href="/connexion"
        className="rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-bold text-[#0a3d82] transition hover:bg-blue-50"
      >
        Administration
      </Link>

      <Link
        href="/rejoindre"
        className="inline-flex items-center gap-2 rounded-xl bg-[#0a3d82] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#072d61]"
      >
        Je suis nouveau
        <ArrowRight size={16} />
      </Link>
    </div>

    <button
      type="button"
      onClick={() => setMenuOpen((current) => !current)}
      className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 text-[#0a3d82] transition hover:bg-blue-50 xl:hidden"
      aria-label="Ouvrir le menu"
    >
      {menuOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  </div>

  {menuOpen && (
    <div className="border-t border-blue-100 bg-white px-5 py-5 shadow-xl xl:hidden">
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          onClick={closeAllMenus}
          className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
        >
          Accueil
        </Link>

        <div className="rounded-xl border border-blue-100 bg-blue-50/40">
          <button
            type="button"
            onClick={() =>
              setMobileDiscoverOpen((current) => !current)
            }
            className="flex w-full items-center justify-between px-4 py-3 font-bold text-[#092e63]"
          >
            Découvrir l’église
            <ChevronDown
              size={18}
              className={`transition ${
                mobileDiscoverOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {mobileDiscoverOpen && (
            <div className="space-y-1 border-t border-blue-100 px-3 py-2">
              {discoverNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAllMenus}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-[#0a56a4]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/40">
          <button
            type="button"
            onClick={() =>
              setMobileChurchLifeOpen((current) => !current)
            }
            className="flex w-full items-center justify-between px-4 py-3 font-bold text-[#092e63]"
          >
            Vie de l’église
            <ChevronDown
              size={18}
              className={`transition ${
                mobileChurchLifeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {mobileChurchLifeOpen && (
            <div className="space-y-1 border-t border-blue-100 px-3 py-2">
              {churchLifeNavigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAllMenus}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-[#0a56a4]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/dons"
          onClick={closeAllMenus}
          className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
        >
          Dons & Offrandes
        </Link>

        <Link
          href="/ecole"
          onClick={closeAllMenus}
          className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
        >
          École
        </Link>

        <Link
          href="/connexion"
          onClick={closeAllMenus}
          className="mt-3 rounded-xl border border-blue-200 px-4 py-3 text-center font-bold text-[#0a3d82]"
        >
          Administration
        </Link>

        <Link
          href="/rejoindre"
          onClick={closeAllMenus}
          className="rounded-xl bg-[#0a3d82] px-4 py-3 text-center font-bold text-white"
        >
          Je suis nouveau
        </Link>
      </nav>
    </div>
  )}
</header>

);
}
