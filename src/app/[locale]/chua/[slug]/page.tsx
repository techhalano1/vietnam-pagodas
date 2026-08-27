import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { getPagodaBySlug, pagodas } from "@/lib/data";
import { getDetailsBySlug, type Section } from "@/lib/details";
import { getDict, isLocale, locales } from "@/lib/i18n";

const PagodaMap = dynamic(() => import("@/components/PagodaMap"), { ssr: false });

export function generateStaticParams() {
  return locales.flatMap((locale) => pagodas.map((p) => ({ locale, slug: p.slug })));
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  const p = getPagodaBySlug(params.slug);
  if (!p || !isLocale(params.locale)) return {};
  const d = getDetailsBySlug(params.slug);
  const name = params.locale === "en" && d?.nameEn ? d.nameEn : p.name;
  const description = p.description.slice(0, 160);
  const path = `/${params.locale}/chua/${p.slug}`;
  return {
    title: `${name} — ${p.province}`,
    description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}/chua/${p.slug}`])),
    },
    openGraph: {
      title: `${name} — ${p.province}`,
      description,
      url: path,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${name} — ${p.province}`,
      description,
    },
  };
}

function Sections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <div key={i}>
          {s.heading && <h3 className="mb-2 text-lg font-semibold">{s.heading}</h3>}
          <div className="space-y-3 leading-relaxed text-stone-700">
            {s.text.split("\n").filter(Boolean).map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PagodaPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);
  const p = getPagodaBySlug(params.slug);
  if (!p) notFound();

  const d = getDetailsBySlug(params.slug);
  const useEnglish = locale === "en" && d && d.sectionsEn.length > 0;
  const sections: Section[] = useEnglish
    ? d.sectionsEn
    : d && d.sectionsVi.length > 0
      ? d.sectionsVi
      : p.description
        ? [{ heading: null, text: p.description }]
        : [];
  const name = locale === "en" && d?.nameEn ? d.nameEn : p.name;

  const related = pagodas.filter((x) => x.province === p.province && x.id !== p.id).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 text-sm text-stone-500">
        <Link href={`/${locale}`} className="hover:text-amber-700">{t.home}</Link>
        {" / "}
        <Link
          href={`/${locale}/danh-muc?tinh=${encodeURIComponent(p.province)}`}
          className="hover:text-amber-700"
        >
          {p.province}
        </Link>
        {" / "}
        <span className="text-stone-700">{name}</span>
      </nav>

      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
      <p className="mt-1 text-stone-500">
        {p.province}
        {locale === "en" && d?.nameEn && d.nameEn !== p.name && (
          <span className="ml-2 text-stone-400">({p.name})</span>
        )}
      </p>

      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt={name}
          className="mt-6 max-h-[480px] w-full rounded-2xl object-cover shadow"
        />
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">{t.historyHeading}</h2>
        {locale === "en" && !useEnglish && sections.length > 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.viOnlyNote}
          </p>
        )}
        {sections.length > 0 ? (
          <Sections sections={sections} />
        ) : (
          <p className="text-stone-500">{t.noDescription}</p>
        )}
      </section>

      {p.lat !== null && p.lng !== null && (
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">{t.location}</h2>
          <p className="mb-2 text-sm text-stone-500">
            {t.coordinates}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)} ·{" "}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 hover:underline"
            >
              {t.googleMaps}
            </a>
          </p>
          <div className="h-80 overflow-hidden rounded-2xl border border-stone-200 shadow-sm">
            <PagodaMap pagodas={[p]} center={[p.lat, p.lng]} zoom={14} locale={locale} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">{t.referencesHeading}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
          {p.wikipediaUrl && (
            <li>
              <a
                href={p.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:underline"
              >
                {t.wikipediaVi}
              </a>
            </li>
          )}
          {d?.wikipediaUrlEn && (
            <li>
              <a
                href={d.wikipediaUrlEn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:underline"
              >
                {t.wikipediaEn}
              </a>
            </li>
          )}
          {d?.references.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-amber-700 hover:underline"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">{t.relatedIn(p.province)}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/${locale}/chua/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {r.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.thumbnail} alt={r.name} className="h-32 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-stone-100 text-3xl">🏯</div>
                )}
                <div className="p-3">
                  <div className="font-medium group-hover:text-amber-700">{r.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-stone-500">{r.description}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
