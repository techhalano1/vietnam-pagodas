import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvinceBySlug, pagodas, provinces, provinceSlug, siteType } from "@/lib/data";
import { getDict, isLocale, locales } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

const PagodaMap = dynamic(() => import("@/components/PagodaMap"), { ssr: false });

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    provinces.map((pr) => ({ locale, slug: provinceSlug(pr.name) }))
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  if (!isLocale(params.locale)) return {};
  const pr = getProvinceBySlug(params.slug);
  if (!pr) return {};
  const t = getDict(params.locale);
  const path = `/${params.locale}/tinh/${params.slug}`;
  return {
    title: t.provinceTitle(pr.name),
    description: t.provinceIntro(pr.count, pr.name),
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/tinh/${params.slug}`])),
    },
    openGraph: {
      title: t.provinceTitle(pr.name),
      description: t.provinceIntro(pr.count, pr.name),
      url: path,
    },
  };
}

export default function ProvincePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);
  const pr = getProvinceBySlug(params.slug);
  if (!pr) notFound();

  const sites = pagodas.filter((p) => p.province === pr.name);
  const located = sites.filter((p) => p.lat !== null && p.lng !== null);
  const typeCounts = new Map<string, number>();
  for (const p of sites) {
    const ty = siteType(p.name);
    typeCounts.set(ty, (typeCounts.get(ty) ?? 0) + 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-stone-500">
        <Link href={`/${locale}`} className="hover:text-amber-700">{t.home}</Link>
        {" / "}
        <span className="text-stone-700 dark:text-stone-300">{pr.name}</span>
      </nav>
      <h1 className="text-3xl font-semibold tracking-tight">{t.provinceTitle(pr.name)}</h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">{t.provinceIntro(pr.count, pr.name)}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from(typeCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([ty, count]) => (
            <span
              key={ty}
              className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-600 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300"
            >
              {t.typeLabels[ty]} ({count})
            </span>
          ))}
      </div>

      {located.length > 0 && (
        <div className="mt-6 h-96 overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-700">
          <PagodaMap pagodas={located} locale={locale} />
        </div>
      )}

      <Reveal className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sites.map((p) => (
            <Link
              key={p.id}
              href={`/${locale}/chua/${p.slug}`}
              className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-800"
            >
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
                <div className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">{p.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
