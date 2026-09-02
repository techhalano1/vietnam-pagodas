"use client";

import Link from "next/link";
import type { Pagoda } from "@/lib/types";
import { getDict, type Locale } from "@/lib/i18n";
import { useSavedList, type SavedListKey } from "@/lib/useSavedList";

function SavedSection({
  heading,
  storageKey,
  pagodas,
  locale,
}: {
  heading: string;
  storageKey: SavedListKey;
  pagodas: Pagoda[];
  locale: Locale;
}) {
  const t = getDict(locale);
  const { slugs, toggle, ready } = useSavedList(storageKey);
  const saved = slugs
    .map((s) => pagodas.find((p) => p.slug === s))
    .filter((p): p is Pagoda => p !== undefined);

  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold dark:border-stone-700">
        {heading} {ready && <span className="text-sm font-normal text-stone-400">({saved.length})</span>}
      </h2>
      {ready && saved.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">{t.favoritesEmpty}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => (
            <div
              key={p.slug}
              className="group relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-800"
            >
              <Link href={`/${locale}/chua/${p.slug}`} className="block">
                <div className="h-32 overflow-hidden">
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-3xl dark:bg-stone-700">🏯</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">{p.name}</div>
                  <div className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{p.province}</div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => toggle(p.slug)}
                aria-label="Remove"
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-sm text-stone-500 shadow transition-colors hover:text-rose-600 dark:bg-stone-900/80 dark:text-stone-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function SavedLists({ pagodas, locale }: { pagodas: Pagoda[]; locale: Locale }) {
  const t = getDict(locale);
  return (
    <>
      <SavedSection heading={`♥ ${t.favoritesHeading}`} storageKey="vp-favorites" pagodas={pagodas} locale={locale} />
      <SavedSection heading={`✓ ${t.visitedHeading}`} storageKey="vp-visited" pagodas={pagodas} locale={locale} />
    </>
  );
}
