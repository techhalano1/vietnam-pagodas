import type { MetadataRoute } from "next";
import { pagodas, provinces, provinceSlug } from "@/lib/data";
import { locales } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/danh-muc", "/gioi-thieu", "/le-hoi", "/hanh-trinh"];
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
          ),
        },
      });
    }
  }

  for (const pr of provinces) {
    const slug = provinceSlug(pr.name);
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}/tinh/${slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/tinh/${slug}`]),
          ),
        },
      });
    }
  }

  for (const p of pagodas) {
    for (const locale of locales) {
      entries.push({
        url: `${SITE_URL}/${locale}/chua/${p.slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/chua/${p.slug}`]),
          ),
        },
      });
    }
  }

  return entries;
}
