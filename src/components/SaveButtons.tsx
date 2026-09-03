"use client";

import { getDict, type Locale } from "@/lib/i18n";
import { useSavedList } from "@/lib/useSavedList";

export default function SaveButtons({ slug, locale }: { slug: string; locale: Locale }) {
  const t = getDict(locale);
  const fav = useSavedList("vp-favorites");
  const visited = useSavedList("vp-visited");
  const isFav = fav.slugs.includes(slug);
  const isVisited = visited.slugs.includes(slug);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => fav.toggle(slug)}
        aria-pressed={isFav}
        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
          isFav
            ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
            : "border-stone-300 text-stone-600 hover:border-rose-400 hover:text-rose-600 dark:border-stone-600 dark:text-stone-300"
        }`}
      >
        {isFav ? t.favBtnActive : t.favBtn}
      </button>
      <button
        type="button"
        onClick={() => visited.toggle(slug)}
        aria-pressed={isVisited}
        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
          isVisited
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
            : "border-stone-300 text-stone-600 hover:border-emerald-500 hover:text-emerald-700 dark:border-stone-600 dark:text-stone-300"
        }`}
      >
        {isVisited ? t.visitedBtnActive : t.visitedBtn}
      </button>
    </div>
  );
}
