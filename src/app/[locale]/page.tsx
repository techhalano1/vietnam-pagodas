import { notFound } from "next/navigation";
import Explorer from "@/components/Explorer";
import { pagodas, provinces } from "@/lib/data";
import { getDict, isLocale } from "@/lib/i18n";

export default function Home({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound();
  const t = getDict(params.locale);

  return (
    <div>
      <section className="border-b border-amber-900/10 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 px-4 py-4 text-amber-50">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-semibold sm:text-2xl">{t.heroTitle}</h1>
          <p className="mt-1 text-sm text-amber-200/90">
            {t.heroSubtitle(pagodas.length, provinces.length)}
          </p>
        </div>
      </section>
      <Explorer pagodas={pagodas} provinces={provinces} locale={params.locale} />
    </div>
  );
}
