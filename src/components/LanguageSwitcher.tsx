"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/lib/i18n";

function SwitcherInner({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const other: Locale = locale === "vi" ? "en" : "vi";
  const rest = pathname.replace(/^\/(vi|en)/, "") || "";
  const qs = searchParams.toString();
  const href = `/${other}${rest}${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      className="rounded-full border border-amber-200/40 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide hover:bg-amber-900"
      aria-label={other === "en" ? "Switch to English" : "Chuyển sang tiếng Việt"}
    >
      {other === "en" ? "EN" : "VI"}
    </Link>
  );
}

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <SwitcherInner locale={locale} />
    </Suspense>
  );
}
