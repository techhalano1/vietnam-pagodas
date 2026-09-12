import pagodasJson from "../../../src/data/pagodas.json";
import detailsJson from "../../../src/data/details.json";
import festivalsJson from "../../../src/data/festivals.json";
import routesJson from "../../../src/data/routes.json";
import type { Festival, Pagoda, PagodaDetails, PilgrimageRoute } from "./types";
import type { Locale } from "./i18n";

export const SITE_URL = "https://www.vietnam-pagodas.com";

export const pagodas: Pagoda[] = pagodasJson as Pagoda[];
const details = detailsJson as Record<string, PagodaDetails>;
export const festivals = festivalsJson as Festival[];
export const pilgrimageRoutes = routesJson as PilgrimageRoute[];

export const provinces: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  for (const p of pagodas) map.set(p.province, (map.get(p.province) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
})();

const bySlug = new Map(pagodas.map((p) => [p.slug, p]));

export function getPagodaBySlug(slug: string): Pagoda | undefined {
  return bySlug.get(slug);
}

export function getDetailsBySlug(slug: string): PagodaDetails | undefined {
  return details[slug];
}

export function hasDetails(slug: string): boolean {
  return slug in details;
}

export function displayName(p: Pagoda, locale: Locale): string {
  if (locale === "en") {
    const en = details[p.slug]?.nameEn;
    if (en && en !== p.name) return `${en} · ${p.name}`;
  }
  return p.name;
}

export function describe(p: Pagoda, locale: Locale): string {
  return locale === "en" && p.descriptionEn ? p.descriptionEn : p.description;
}

/** Resolve site-relative image paths (e.g. `/images/x.jpg`) to absolute URLs. */
export function imageUrl(src: string | null): string | null {
  if (!src) return null;
  return src.startsWith("/") ? `${SITE_URL}${src}` : src;
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export type SiteType = "chua" | "den" | "dinh" | "mieu" | "thien-vien" | "khac";
export const siteTypes: SiteType[] = ["chua", "den", "dinh", "mieu", "thien-vien", "khac"];

export function siteType(name: string): SiteType {
  const n = normalize(name);
  if (n.startsWith("thien vien")) return "thien-vien";
  if (n.startsWith("chua") || n.startsWith("tinh xa") || n.startsWith("to dinh")) return "chua";
  if (n.startsWith("den")) return "den";
  if (n.startsWith("dinh") || n.startsWith("quan ")) return "dinh";
  if (n.startsWith("mieu")) return "mieu";
  return "khac";
}

export function provinceSlug(name: string): string {
  return normalize(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProvinceBySlug(slug: string): { name: string; count: number } | undefined {
  return provinces.find((pr) => provinceSlug(pr.name) === slug);
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

export function siteUrl(p: Pagoda, locale: Locale): string {
  return `${SITE_URL}/${locale}/chua/${p.slug}`;
}

export function directionsUrl(p: Pagoda): string | null {
  if (p.lat === null || p.lng === null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
}

export function relatedLinks(p: Pagoda, locale: Locale) {
  const area = `${p.name} ${p.oldProvince ?? p.province}`;
  return {
    experiences:
      locale === "en"
        ? `https://www.google.com/search?q=${encodeURIComponent(`${area} travel guide tips`)}`
        : `https://www.google.com/search?q=${encodeURIComponent(`kinh nghiệm đi ${area}`)}`,
    reviews: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area)}`,
    videos: `https://www.youtube.com/results?search_query=${encodeURIComponent(area)}`,
    articles: `https://www.google.com/search?q=${encodeURIComponent(area)}&tbm=nws`,
  };
}

export function contributePhotosUrl(p: Pagoda): string {
  const title = encodeURIComponent(`[Ảnh] ${p.name}`);
  const body = encodeURIComponent(
    `Slug: ${p.slug}\n\n(Kéo thả ảnh vào đây / Drag and drop photos here. Vui lòng chỉ gửi ảnh do bạn chụp hoặc có quyền chia sẻ.)`,
  );
  return `https://github.com/techhalano1/vietnam-pagodas/issues/new?title=${title}&body=${body}`;
}
