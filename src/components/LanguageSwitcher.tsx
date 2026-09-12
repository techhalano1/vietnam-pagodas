"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";

// Inline SVGs: emoji flags render as plain letters on Windows.
function FlagVN({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={className} aria-hidden="true">
      <rect width="30" height="20" fill="#da251d" />
      <polygon
        fill="#ffff00"
        points="15,3.5 16.9,8.5 22.2,8.5 17.9,11.6 19.5,16.7 15,13.5 10.5,16.7 12.1,11.6 7.8,8.5 13.1,8.5"
      />
    </svg>
  );
}

function FlagUK({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 30" className={className} aria-hidden="true">
      <clipPath id="uk-clip">
        <rect width="60" height="30" />
      </clipPath>
      <g clipPath="url(#uk-clip)">
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#c8102e" strokeWidth="4" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

const OPTIONS: { locale: Locale; label: string; Flag: typeof FlagVN }[] = [
  { locale: "vi", label: "Tiếng Việt", Flag: FlagVN },
  { locale: "en", label: "English", Flag: FlagUK },
];

function SwitcherInner({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rest = pathname.replace(/^\/(vi|en)/, "") || "";
  const qs = searchParams.toString();

  return (
    <div
      role="group"
      aria-label={locale === "en" ? "Language" : "Ngôn ngữ"}
      className="flex items-center overflow-hidden rounded-full border border-amber-200/40 text-xs font-medium"
    >
      {OPTIONS.map(({ locale: l, label, Flag }) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href={`/${l}${rest}${qs ? `?${qs}` : ""}`}
            aria-current={active ? "page" : undefined}
            title={label}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors ${
              active ? "bg-amber-200 text-stone-900" : "hover:bg-amber-900"
            }`}
          >
            <Flag className="h-3 w-[18px] rounded-[2px] shadow-sm" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden uppercase">{l}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <SwitcherInner locale={locale} />
    </Suspense>
  );
}
