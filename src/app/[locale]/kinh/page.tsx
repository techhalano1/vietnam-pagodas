import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { formatTime, getScriptureAudio, primaryDuration } from "@/lib/scripture-audio";
import {
  hasEnglish,
  hasHanViet,
  kindGroups,
  scriptureIntro,
  scriptures,
  scriptureTitle,
} from "@/lib/scriptures";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const path = `/${params.locale}/kinh`;
  return {
    title: t.scripturesTitle,
    description: t.scripturesIntro,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/kinh`])),
    },
  };
}

const kindBadge: Record<string, string> = {
  sutra: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  mantra:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  ritual: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  prayer: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

export default function ScripturesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        📖 {t.scripturesTitle}
      </h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">
        {t.scripturesIntro}
      </p>

      {kindGroups.map((g) => {
        const items = scriptures.filter((s) => g.kinds.includes(s.kind));
        return (
          <Reveal key={g.key} className="mt-8">
            <section>
              <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold dark:border-stone-700">
                {g.key === "kinh" ? t.scriptureGroupKinh : t.scriptureGroupKhan}{" "}
                <span className="text-sm font-normal text-stone-400">
                  ({items.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((s) => {
                  const audio = getScriptureAudio(s.slug);
                  return (
                    <Link
                      key={s.slug}
                      href={`/${locale}/kinh/${s.slug}`}
                      className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-600"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`rounded-full px-2 py-0.5 font-medium ${kindBadge[s.kind]}`}
                        >
                          {t.scriptureKind[s.kind]}
                        </span>
                        <span className="text-stone-400">
                          {t.versesCount(s.verses.length)}
                        </span>
                        {audio && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            {audio.chant ? "🎙️" : "🎧"} {formatTime(primaryDuration(audio))}
                          </span>
                        )}
                        {hasHanViet(s) && (
                          <span className="rounded border border-stone-300 px-1.5 py-0.5 text-[10px] text-stone-500 dark:border-stone-600 dark:text-stone-400">
                            {t.hanVietLabel}
                          </span>
                        )}
                        {hasEnglish(s) && (
                          <span className="rounded border border-stone-300 px-1.5 py-0.5 text-[10px] text-stone-500 dark:border-stone-600 dark:text-stone-400">
                            EN
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-300">
                        {scriptureTitle(s, locale)}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {locale === "en" ? s.title : (s.subtitle ?? s.titleEn)}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                        {scriptureIntro(s, locale)}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}
