import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { festivals } from "@/lib/festivals";
import { getPagodaBySlug } from "@/lib/data";
import { getDict, isLocale, locales } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const path = `/${params.locale}/le-hoi`;
  return {
    title: t.festivalsTitle,
    description: t.festivalsIntro,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/le-hoi`])),
    },
  };
}

export default function FestivalsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);

  const months = Array.from(new Set(festivals.map((f) => f.lunarMonth))).sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">🏮 {t.festivalsTitle}</h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">{t.festivalsIntro}</p>

      {months.map((m) => (
        <Reveal key={m} className="mt-8">
          <section>
            <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold dark:border-stone-700">
              {t.lunarMonth(m)}
            </h2>
            <div className="space-y-4">
              {festivals
                .filter((f) => f.lunarMonth === m)
                .map((f) => {
                  const p = getPagodaBySlug(f.slug);
                  return (
                    <div
                      key={f.slug}
                      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-700 dark:bg-stone-800"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold">
                          {locale === "en" ? f.nameEn : f.nameVi}
                        </h3>
                        <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                          {locale === "en" ? f.dateEn : f.dateVi}
                        </span>
                      </div>
                      {p && (
                        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                          {p.name} — {p.province}
                        </p>
                      )}
                      <p className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">
                        {locale === "en" ? f.descEn : f.descVi}
                      </p>
                      <Link
                        href={`/${locale}/chua/${f.slug}`}
                        className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                      >
                        {t.viewDetail}
                      </Link>
                    </div>
                  );
                })}
            </div>
          </section>
        </Reveal>
      ))}
    </div>
  );
}
