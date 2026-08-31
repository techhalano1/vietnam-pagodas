"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { Pagoda } from "@/lib/types";
import { normalize } from "@/lib/data";
import { getDict, type Locale } from "@/lib/i18n";

const PagodaMap = dynamic(() => import("./PagodaMap"), {
  ssr: false,
  loading: () => <div className="skeleton-shimmer h-full w-full" />,
});

export default function Explorer({
  pagodas,
  provinces,
  locale,
}: {
  pagodas: Pagoda[];
  provinces: { name: string; count: number }[];
  locale: Locale;
}) {
  const t = getDict(locale);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return pagodas.filter(
      (p) =>
        (!province || p.province === province) &&
        (!q || normalize(p.name).includes(q) || normalize(p.description).includes(q))
    );
  }, [pagodas, query, province]);

  const listKey = `${query}|${province}`;
  const PAGE = 100;
  const [shown, setShown] = useState(PAGE);
  useEffect(() => {
    setShown(PAGE);
  }, [listKey]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:flex-row">
      <aside className="flex w-full flex-col border-r border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 lg:w-[400px]">
        <div className="space-y-2 border-b border-stone-200 p-4 dark:border-stone-700">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition-shadow focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          />
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-amber-600 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          >
            <option value="">{t.allProvinces} ({pagodas.length})</option>
            {provinces.map((pr) => (
              <option key={pr.name} value={pr.name}>
                {pr.name} ({pr.count})
              </option>
            ))}
          </select>
          <p className="text-xs text-stone-500 dark:text-stone-400">{filtered.length} {t.results}</p>
        </div>
        <ul key={listKey} className="flex-1 divide-y divide-stone-100 overflow-y-auto dark:divide-stone-800">
          {filtered.slice(0, shown).map((p, i) => (
            <li
              key={p.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 15) * 35}ms` }}
              onMouseEnter={() => setHoveredId(String(p.id))}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="group relative flex items-center transition-all duration-200 hover:-translate-y-px hover:bg-amber-50 hover:shadow-md dark:hover:bg-stone-800">
                <Link
                  href={`/${locale}/chua/${p.slug}`}
                  className="flex min-w-0 flex-1 gap-3 px-4 py-3"
                >
                  {p.thumbnail ? (
                    <span className="h-14 w-14 flex-none overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.thumbnail}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    </span>
                  ) : (
                    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-lg bg-stone-100 text-xl dark:bg-stone-800">
                      🏯
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium dark:text-stone-100">{p.name}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">{p.province}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-stone-400 dark:text-stone-500">
                      {p.description}
                    </div>
                  </div>
                </Link>
                {p.lat !== null && p.lng !== null && (
                  <button
                    type="button"
                    onClick={() => setFocusId(String(p.id))}
                    aria-label={t.googleMaps}
                    title={t.location}
                    className="mr-3 hidden flex-none rounded-full border border-stone-200 p-1.5 text-sm text-stone-400 transition-colors hover:border-amber-600 hover:text-amber-700 group-hover:block dark:border-stone-600"
                  >
                    📍
                  </button>
                )}
              </div>
            </li>
          ))}
          {filtered.length > shown && (
            <li className="p-3 text-center">
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE)}
                className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-600 transition-colors hover:border-amber-600 hover:text-amber-700 dark:border-stone-600 dark:text-stone-300"
              >
                {t.showMore} ({filtered.length - shown})
              </button>
            </li>
          )}
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-stone-500 dark:text-stone-400">
              {t.noResults}
            </li>
          )}
        </ul>
      </aside>
      <div className="h-[50vh] flex-1 lg:h-auto">
        <PagodaMap pagodas={filtered} locale={locale} hoveredId={hoveredId} focusId={focusId} />
      </div>
    </div>
  );
}
