import { notFound } from "next/navigation";
import Explorer from "@/components/Explorer";
import CountUp from "@/components/CountUp";
import { pagodas, provinces } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";

export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-amber-900/10 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-4 text-amber-50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #fbbf24 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">{t.heroTitle}</h1>
            <p className="mt-1 text-sm text-amber-200/90">
              {t.heroSubtitle(pagodas.length, provinces.length)}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-xl border border-amber-200/20 bg-amber-900/40 px-4 py-2 text-center">
              <div className="text-xl font-bold text-amber-300">
                <CountUp end={pagodas.length} />
              </div>
              <div className="text-[11px] uppercase tracking-wide text-amber-200/70">🏯</div>
            </div>
            <div className="rounded-xl border border-amber-200/20 bg-amber-900/40 px-4 py-2 text-center">
              <div className="text-xl font-bold text-amber-300">
                <CountUp end={provinces.length} />
              </div>
              <div className="text-[11px] uppercase tracking-wide text-amber-200/70">
                {params.locale === "vi" ? "tỉnh thành" : "provinces"}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Explorer pagodas={pagodas} provinces={provinces} locale={params.locale} />
    </div>
  );
}
