import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import { getDict, isLocale, locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Analytics } from "@vercel/analytics/react";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-be-vietnam",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  if (!isLocale(params.locale)) return {};
  const t = getDict(params.locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.metaTitle, template: `%s | ${t.siteName}` },
    description: t.metaDescription,
    alternates: {
      canonical: `/${params.locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: `/${params.locale}`,
      siteName: t.siteName,
      locale: params.locale === "vi" ? "vi_VN" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t.metaTitle,
      description: t.metaDescription,
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;
  const t = getDict(locale);

  return (
    <html lang={locale}>
      <body className={`${beVietnam.variable} font-sans antialiased bg-stone-50 text-stone-900`}>
        <header className="sticky top-0 z-[1100] border-b border-amber-900/10 bg-amber-950 text-amber-50 shadow">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span aria-hidden>🏯</span>
              <span>
                {t.siteName}
                <span className="ml-2 hidden text-xs font-normal text-amber-200/80 sm:inline">
                  {t.tagline}
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href={`/${locale}`} className="hover:text-amber-300">{t.navMap}</Link>
              <Link href={`/${locale}/danh-muc`} className="hover:text-amber-300">{t.navDirectory}</Link>
              <Link href={`/${locale}/gioi-thieu`} className="hover:text-amber-300">{t.navAbout}</Link>
              <LanguageSwitcher locale={locale} />
            </nav>
          </div>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
          <p>{t.footer}</p>
          <p className="mt-2 text-xs text-stone-400">
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-600"
            >
              {t.licenseWiki}
            </a>{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-600"
            >
              {t.licenseOsm}
            </a>
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
