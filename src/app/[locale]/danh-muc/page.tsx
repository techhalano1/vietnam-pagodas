import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { pagodas, provinces } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";

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
      <p className="mt-1 text-stone-500">
        {t.directorySubtitle(pagodas.length, provinces.length)}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/${locale}/danh-muc`}
          className={`rounded-full border px-3 py-1 text-sm ${!selected ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white hover:border-amber-600"}`}
        >
          {t.all}
        </Link>
        {provinces.map((pr) => (
          <Link
            key={pr.name}
            href={`/${locale}/danh-muc?tinh=${encodeURIComponent(pr.name)}`}
            className={`rounded-full border px-3 py-1 text-sm ${selected === pr.name ? "border-amber-700 bg-amber-700 text-white" : "border-stone-300 bg-white hover:border-amber-600"}`}
          >
            {pr.name} ({pr.count})
          </Link>
        ))}
      </div>

      {shown.map((pr) => (
        <section key={pr.name} className="mt-8">
          <h2 className="mb-3 border-b border-stone-200 pb-1 text-xl font-semibold">
            {pr.name} <span className="text-sm font-normal text-stone-400">({pr.count})</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pagodas
              .filter((p) => p.province === pr.name)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/chua/${p.slug}`}
                  className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {p.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail} alt={p.name} className="h-32 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-stone-100 text-3xl">🏯</div>
                  )}
                  <div className="p-3">
                    <div className="font-medium group-hover:text-amber-700">{p.name}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-stone-500">{p.description}</div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
