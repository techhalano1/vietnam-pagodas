import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pilgrimageRoutes } from "@/lib/routes";
import { distanceKm, getPagodaBySlug } from "@/lib/data";
import { getDict, isLocale, locales } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  const path = `/${params.locale}/hanh-trinh`;
  return {
    title: t.routesTitle,
    description: t.routesIntro,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/hanh-trinh`])),
    },
  };
}

export default function RoutesPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">🧭 {t.routesTitle}</h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">{t.routesIntro}</p>

      <div className="mt-8 space-y-6">
        {pilgrimageRoutes.map((r) => {
          const stops = r.stops
            .map((s) => getPagodaBySlug(s))
            .filter((p): p is NonNullable<typeof p> => p !== undefined);
          return (
            <Reveal key={r.id}>
              <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-700 dark:bg-stone-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold">
                    {locale === "en" ? r.titleEn : r.titleVi}
                  </h2>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {t.routeStops(stops.length)}
                  </span>
                </div>
                <p className="mt-2 leading-relaxed text-stone-700 dark:text-stone-300">
                  {locale === "en" ? r.descEn : r.descVi}
                </p>
                <ol className="mt-4 space-y-2">
                  {stops.map((p, i) => {
                    const prev = i > 0 ? stops[i - 1] : null;
                    const dist =
                      prev &&
                      prev.lat !== null &&
                      prev.lng !== null &&
                      p.lat !== null &&
                      p.lng !== null
                        ? distanceKm(prev.lat, prev.lng, p.lat, p.lng)
                        : null;
                    return (
                      <li key={p.slug} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-white">
                          {i + 1}
                        </span>
                        <Link
                          href={`/${locale}/chua/${p.slug}`}
                          className="font-medium text-stone-800 hover:text-amber-700 dark:text-stone-200 dark:hover:text-amber-400"
                        >
                          {p.name}
                        </Link>
                        <span className="text-sm text-stone-400">{p.province}</span>
                        {dist !== null && (
                          <span className="ml-auto text-xs text-stone-400">
                            ↔ {t.kmAway(dist)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
