import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { describe, getPagodaBySlug, pagodas, provinceSlug } from "@/lib/data";
import { getDetailsBySlug, type Section } from "@/lib/details";
import { getFestivalBySlug } from "@/lib/festivals";
import { getDict, isLocale, locales } from "@/lib/i18n";
import Reveal from "@/components/Reveal";
import ShareButtons from "@/components/ShareButtons";
import SaveButtons from "@/components/SaveButtons";

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
  const description = describe(p, params.locale).slice(0, 160);
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
          <div className="space-y-3 leading-relaxed text-stone-700 dark:text-stone-300">
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
  const viSections: Section[] =
    d && d.sectionsVi.length > 0
      ? d.sectionsVi
      : p.description
        ? [{ heading: null, text: p.description }]
        : [];
  const sections: Section[] = useEnglish ? d.sectionsEn : viSections;
  // On /en without an English article: lead with the English summary; skip the
  // Vietnamese text only when it is the auto-generated OSM placeholder.
  const enSummary =
    locale === "en" && !useEnglish && p.descriptionEn ? p.descriptionEn : null;
  const isOsmPlaceholder =
    (d === undefined || d.sectionsVi.length === 0) &&
    p.description.includes("dữ liệu cộng đồng OpenStreetMap");
  const showViFallback = !enSummary || !isOsmPlaceholder;
  const name = locale === "en" && d?.nameEn ? d.nameEn : p.name;

  const related = pagodas.filter((x) => x.province === p.province && x.id !== p.id).slice(0, 6);
  const festival = getFestivalBySlug(p.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 text-sm text-stone-500">
        <Link href={`/${locale}`} className="hover:text-amber-700">{t.home}</Link>
        {" / "}
        <Link
          href={`/${locale}/tinh/${provinceSlug(p.province)}`}
          className="hover:text-amber-700"
        >
          {p.province}
        </Link>
        {" / "}
        <span className="text-stone-700 dark:text-stone-300">{name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="animate-fade-in-up text-3xl font-semibold tracking-tight">{name}</h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">
            {p.province}
            {p.oldProvince && (
              <span className="ml-2 text-stone-400">({t.formerProvince(p.oldProvince)})</span>
            )}
            {locale === "en" && d?.nameEn && d.nameEn !== p.name && (
              <span className="ml-2 text-stone-400">({p.name})</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SaveButtons slug={p.slug} locale={locale} />
          <ShareButtons title={name} label={t.shareBtn} copiedLabel={t.shareCopied} />
        </div>
      </div>

      {p.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.image}
          alt={name}
          className="animate-fade-in-up mt-6 max-h-[480px] w-full rounded-2xl object-cover shadow"
        />
      )}

      <Reveal>
      <section className="mt-6">
        <h2 className="mb-2 text-xl font-semibold">{t.historyHeading}</h2>
        {enSummary && (
          <p className="mb-4 leading-relaxed text-stone-700 dark:text-stone-300">{enSummary}</p>
        )}
        {showViFallback && locale === "en" && !useEnglish && sections.length > 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {t.viOnlyNote}
          </p>
        )}
        {showViFallback && sections.length > 0 ? (
          <Sections sections={sections} />
        ) : (
          !enSummary && (
            <p className="text-stone-500 dark:text-stone-400">{t.noDescription}</p>
          )
        )}
      </section>
      </Reveal>

      {festival && (
        <Reveal>
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">🏮 {t.festivalHeading}</h2>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-stone-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-stone-300">
            <p className="font-semibold">
              {locale === "en" ? festival.nameEn : festival.nameVi}
            </p>
            <p className="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
              {locale === "en" ? festival.dateEn : festival.dateVi}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {locale === "en" ? festival.descEn : festival.descVi}
            </p>
            <Link
              href={`/${locale}/le-hoi`}
              className="mt-2 inline-block text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
            >
              {t.festivalsTitle} →
            </Link>
          </div>
        </section>
        </Reveal>
      )}

      {(d?.worshipVi || d?.prayForVi) && (
        <Reveal>
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">{t.worshipHeading}</h2>
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-stone-700 dark:border-amber-900 dark:bg-amber-950 dark:text-stone-300">
            {(locale === "en" ? d.worshipEn ?? d.worshipVi : d.worshipVi) && (
              <p>
                <span className="font-semibold">{t.worshipLabel}:</span>{" "}
                {locale === "en" ? d.worshipEn ?? d.worshipVi : d.worshipVi}
              </p>
            )}
            {(locale === "en" ? d.prayForEn ?? d.prayForVi : d.prayForVi) && (
              <p>
                <span className="font-semibold">{t.prayForLabel}:</span>{" "}
                {locale === "en" ? d.prayForEn ?? d.prayForVi : d.prayForVi}
              </p>
            )}
          </div>
        </section>
        </Reveal>
      )}

      <Reveal>
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{t.galleryHeading}</h2>
          <a
            href={`https://github.com/techhalano1/vietnam-pagodas/issues/new?title=${encodeURIComponent(`[Ảnh] ${p.name}`)}&body=${encodeURIComponent(`Slug: ${p.slug}\n\n(Kéo thả ảnh vào đây / Drag and drop photos here. Vui lòng chỉ gửi ảnh do bạn chụp hoặc có quyền chia sẻ.)`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-amber-600 hover:text-amber-700 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:text-amber-400"
          >
            📷 {t.contributePhotos}
          </a>
        </div>
        {d?.gallery && d.gallery.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {d.gallery.map((g) => (
              <figure key={g.src} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-700 dark:bg-stone-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.src}
                  alt={name}
                  loading="lazy"
                  className="h-64 w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <figcaption className="px-3 py-1.5 text-right text-xs text-stone-400">
                  <a
                    href={g.creditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-700 hover:underline"
                  >
                    © Wikimedia Commons (CC BY-SA)
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
      </Reveal>

      <Reveal>
      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">{t.visitTipsHeading}</h2>
        <ul className="list-disc space-y-1.5 pl-5 leading-relaxed text-stone-700 dark:text-stone-300">
          {t.visitTips.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </section>
      </Reveal>

      <Reveal>
      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">{t.readMoreHeading}</h2>
        <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">{t.readMoreIntro}</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            {
              label: `${t.linkExperiences} ${p.name}`,
              icon: "🧳",
              href:
                locale === "en"
                  ? `https://www.google.com/search?q=${encodeURIComponent(`${p.name} ${p.oldProvince ?? p.province} travel guide tips`)}`
                  : `https://www.google.com/search?q=${encodeURIComponent(`kinh nghiệm đi ${p.name} ${p.oldProvince ?? p.province}`)}`,
            },
            {
              label: t.linkReviews,
              icon: "⭐",
              href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.oldProvince ?? p.province}`)}`,
            },
            {
              label: t.linkVideos,
              icon: "🎬",
              href: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${p.name} ${p.oldProvince ?? p.province}`)}`,
            },
            {
              label: t.linkArticles,
              icon: "📰",
              href: `https://www.google.com/search?q=${encodeURIComponent(`${p.name} ${p.oldProvince ?? p.province}`)}&tbm=nws`,
            },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-amber-600 hover:text-amber-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:text-amber-400"
              >
                <span aria-hidden>{l.icon}</span>
                {l.label}
                <span className="ml-auto text-stone-400">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      </Reveal>

      {p.lat !== null && p.lng !== null && (
        <Reveal>
        <section className="mt-8">
          <h2 className="mb-2 text-xl font-semibold">{t.location}</h2>
          <p className="mb-2 text-sm text-stone-500 dark:text-stone-400">
            {t.coordinates}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
          </p>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-700"
          >
            🧭 {t.directionsBtn}
          </a>
          <div className="h-80 overflow-hidden rounded-2xl border border-stone-200 shadow-sm dark:border-stone-700">
            <PagodaMap pagodas={[p]} center={[p.lat, p.lng]} zoom={14} locale={locale} />
          </div>
        </section>
        </Reveal>
      )}

      <Reveal>
      <section className="mt-8">
        <h2 className="mb-2 text-xl font-semibold">{t.referencesHeading}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600 dark:text-stone-400">
          {p.wikipediaUrl && (
            <li>
              <a
                href={p.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:underline"
              >
                {p.wikipediaUrl.includes("//en.wikipedia.org") ? t.wikipediaEn : t.wikipediaVi}
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
      </Reveal>

      {related.length > 0 && (
        <Reveal>
        <section className="mt-10">
          <h2 className="mb-3 text-xl font-semibold">{t.relatedIn(p.province)}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/${locale}/chua/${r.slug}`}
                className="group overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-stone-700 dark:bg-stone-800"
              >
                <div className="h-32 overflow-hidden">
                  {r.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.thumbnail} alt={r.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-stone-100 text-3xl dark:bg-stone-700">🏯</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">{r.name}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-stone-500 dark:text-stone-400">{describe(r, locale)}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        </Reveal>
      )}
    </div>
  );
}
