"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Notre vision", href: "/vision" },
  { label: "Ministères", href: "/#departements" },
  { label: "École", href: "/ecole" },
  { label: "Intégration", href: "/rejoindre" },
  { label: "Programmes", href: "/#programmes" },
  { label: "Dons & Offrandes", href: "/dons" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3"
        >
          <div className="brand-logo-wrapper relative h-14 w-14 overflow-hidden rounded-full border-2 border-blue-100 bg-white shadow-md">
            <Image
              src="/images/logo-pdv.jpeg"
              alt="Logo CEF Parole de Vie"
              fill
              priority
               sizes="56px"
              className="brand-logo-image object-cover"
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-base font-extrabold leading-none text-[#0a2f6e] lg:text-lg">
              CEF Parole de Vie
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Grandir • Servir • Impacter
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 whitespace-nowrap text-[13px] font-bold text-slate-600 xl:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition hover:text-[#0a56a4]"
            >
              {item.label}
            </Link>
          ))}
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
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 text-[#0a3d82] transition hover:bg-blue-50 xl:hidden"
          aria-label="Ouvrir le menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-blue-100 bg-white px-5 py-5 shadow-xl xl:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#0a3d82]"
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/connexion"
              onClick={closeMenu}
              className="mt-3 rounded-xl border border-blue-200 px-4 py-3 text-center font-bold text-[#0a3d82]"
            >
              Administration
            </Link>

            <Link
              href="/rejoindre"
              onClick={closeMenu}
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