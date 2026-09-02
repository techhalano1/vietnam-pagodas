import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pagodas, provinces, provinceSlug } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";
import Reveal from "@/components/Reveal";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return {
    title: t.directoryTitle,
    description: t.directorySubtitle(pagodas.length, provinces.length),
  };
}

export default function DirectoryPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { tinh?: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);
  const selected = searchParams.tinh;
  const shown = selected ? provinces.filter((p) => p.name === selected) : provinces;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{t.directoryTitle}</h1>
      <p className="mt-1 text-stone-500 dark:text-stone-400">
        {t.directorySubtitle(pagodas.length, provinces.length)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/danh-muc`}
          className={`rounded-full border px-3 py-1 text-sm transition-colors ${!selected ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white hover:border-amber-600 dark:border-stone-600 dark:bg-stone-800"}`}
        >
          {t.all}
        </Link>
        {provinces.map((pr) => (
          <Link
            key={pr.name}
            href={`/${locale}/danh-muc?tinh=${encodeURIComponent(pr.name)}`}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${selected === pr.name ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white hover:border-amber-600 dark:border-stone-600 dark:bg-stone-800"}`}
          >
            {pr.name} ({pr.count})
          </Link>
        ))}
      </div>

      {shown.map((pr) => (
        <Reveal key={pr.name} className="mt-8">
          <section>
          <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold dark:border-stone-700">
            <Link href={`/${locale}/tinh/${provinceSlug(pr.name)}`} className="hover:text-amber-700 dark:hover:text-amber-400">
              {pr.name}
            </Link>{" "}
            <span className="text-sm font-normal text-stone-400">({pr.count})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pagodas
              .filter((p) => p.province === pr.name)
              .map((p) => (
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
          </section>
        </Reveal>
      ))}
    </div>
  );
}
