"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[1100] border-b border-amber-900/10 bg-amber-950 text-amber-50 transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-amber-950/40" : "shadow"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="relative" aria-hidden>
            <span className="lantern-sway">🏮</span>
            <span className="pointer-events-none absolute -top-1 left-1/2 select-none">
              <span className="smoke absolute text-[8px] text-amber-200/60">●</span>
              <span className="smoke absolute text-[6px] text-amber-200/40">●</span>
              <span className="smoke absolute text-[7px] text-amber-200/50">●</span>
            </span>
          </span>
          <span>
            {t.siteName}
            <span className="ml-2 hidden text-xs font-normal text-amber-200/80 sm:inline">
              {t.tagline}
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href={`/${locale}`} className="transition-colors hover:text-amber-300">
            {t.navMap}
          </Link>
          <Link href={`/${locale}/danh-muc`} className="transition-colors hover:text-amber-300">
            {t.navDirectory}
          </Link>
          <Link href={`/${locale}/le-hoi`} className="hidden transition-colors hover:text-amber-300 sm:inline">
            {t.navFestivals}
          </Link>
          <Link href={`/${locale}/hanh-trinh`} className="hidden transition-colors hover:text-amber-300 sm:inline">
            {t.navRoutes}
          </Link>
          <Link href={`/${locale}/yeu-thich`} className="hidden transition-colors hover:text-amber-300 sm:inline">
            {t.navFavorites}
          </Link>
          <Link href={`/${locale}/gioi-thieu`} className="transition-colors hover:text-amber-300">
            {t.navAbout}
          </Link>
          <ThemeToggle />
          <LanguageSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}
