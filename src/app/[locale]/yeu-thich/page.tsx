import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pagodas } from "@/lib/data";
import { getDict, isLocale, locales } from "@/lib/i18n";
import SavedLists from "@/components/SavedLists";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const path = `/${params.locale}/yeu-thich`;
  return {
    title: t.favoritesTitle,
    robots: { index: false },
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/yeu-thich`])),
    },
  };
}

export default function FavoritesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t.favoritesTitle}</h1>
      <SavedLists pagodas={pagodas} locale={locale} />
    </div>
  );
}
