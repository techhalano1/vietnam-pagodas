import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { getDict, isLocale, locales } from "@/lib/i18n";
import {
  blankPlaceholders,
  getScriptureBySlug,
  hasEnglish,
  hasHanViet,
  scriptureIntro,
  scripturePreparation,
  scriptures,
  scriptureTitle,
} from "@/lib/scriptures";

export function generateStaticParams() {
  return locales.flatMap((locale) => scriptures.map((s) => ({ locale, slug: s.slug })));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const s = getScriptureBySlug(params.slug);
  if (!s) return {};
  const locale = params.locale;
  const title = scriptureTitle(s, locale);
  const path = `/${locale}/kinh/${s.slug}`;
  return {
    title,
    description: scriptureIntro(s, locale).slice(0, 160),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/kinh/${s.slug}`])),
    },
    openGraph: { title, description: scriptureIntro(s, locale).slice(0, 200), type: "article" },
  };
}

export default function ScripturePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);
  const s = getScriptureBySlug(params.slug);
  if (!s) notFound();

  const title = scriptureTitle(s, locale);
  const altTitle = locale === "en" ? s.title : s.titleEn;
  const han = hasHanViet(s);
  const en = hasEnglish(s);
  const preparation = scripturePreparation(s, locale);
  const hasPlaceholders = (s.placeholders?.length ?? 0) > 0;
  const related = scriptures.filter((x) => x.slug !== s.slug && x.kind === s.kind).slice(0, 6);
  const fill = (text: string) => blankPlaceholders(text, locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <nav className="text-sm text-stone-500 dark:text-stone-400">
        <Link href={`/${locale}/kinh`} className="hover:underline">
          ← {t.scripturesTitle}
        </Link>
      </nav>

      <header className="mt-4 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-800 p-6 text-white shadow-md">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white/20 px-2 py-0.5 font-medium">{t.scriptureKind[s.kind]}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5">{t.versesCount(s.verses.length)}</span>
          {han && <span className="rounded-full bg-white/20 px-2 py-0.5">{t.hanVietLabel}</span>}
          {en && <span className="rounded-full bg-white/20 px-2 py-0.5">EN</span>}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        {altTitle && altTitle !== title && <p className="mt-1 text-amber-100">{altTitle}</p>}
        {s.subtitle && s.subtitle !== altTitle && (
          <p className="mt-0.5 text-sm text-amber-100/80">{s.subtitle}</p>
        )}
        {s.recommendedRepeats?.length ? (
          <p className="mt-3 text-sm text-amber-100/90">{t.repeatsHint(s.recommendedRepeats)}</p>
        ) : null}
      </header>

      <Reveal className="mt-6">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {t.readerAbout}
          </h2>
          <p className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">{scriptureIntro(s, locale)}</p>
          {preparation && (
            <>
              <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">
                {t.preparationHeading}
              </h3>
              <p className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">{preparation}</p>
            </>
          )}
          {hasPlaceholders && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
              {t.placeholderNote}
            </p>
          )}
        </section>
      </Reveal>

      <section className="mt-8">
        <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold dark:border-stone-700">
          {t.readerText}
        </h2>
        <ol className="space-y-4">
          {s.verses.map((v, i) => (
            <li
              key={v.id}
              id={v.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-100 px-2 font-semibold text-stone-500 dark:bg-stone-700 dark:text-stone-300">
                  {i + 1}
                </span>
                {v.note && <span className="font-medium text-teal-700 dark:text-teal-400">{v.note}</span>}
              </div>
              {v.hanViet && (
                <p className="mt-2 text-lg font-semibold leading-relaxed text-amber-800 dark:text-amber-300">
                  {v.hanViet}
                </p>
              )}
              <p
                className={`leading-relaxed text-stone-800 dark:text-stone-100 ${
                  v.hanViet ? "mt-1 text-base" : "mt-2 text-lg font-medium"
                }`}
              >
                {fill(locale === "en" && v.en && !v.hanViet ? v.en : v.vi)}
              </p>
              {v.en && (locale === "en" ? !!v.hanViet : true) && (
                <p className="mt-1 text-sm italic leading-relaxed text-stone-500 dark:text-stone-400">
                  {fill(v.en)}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm dark:border-stone-700 dark:bg-stone-800/60">
        <h2 className="font-semibold">{t.sourceHeading}</h2>
        <p className="mt-2 text-stone-700 dark:text-stone-300">
          {s.source.url ? (
            <a href={s.source.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline dark:text-amber-400">
              {s.source.name}
            </a>
          ) : (
            s.source.name
          )}
        </p>
        <p className="mt-1 text-stone-500 dark:text-stone-400">
          <span className="font-medium">{t.licenseLabel}:</span> {s.source.license}
        </p>
        {s.source.note && <p className="mt-1 text-stone-500 dark:text-stone-400">{s.source.note}</p>}
        <p className="mt-3 text-stone-500 dark:text-stone-400">{t.appPromo}</p>
      </section>

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">{t.moreScriptures}</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/${locale}/kinh/${r.slug}`}
                  className="block rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm hover:border-amber-300 dark:border-stone-700 dark:bg-stone-800 dark:hover:border-amber-600"
                >
                  <span className="font-medium">{scriptureTitle(r, locale)}</span>
                  <span className="ml-2 text-stone-400">{t.versesCount(r.verses.length)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
