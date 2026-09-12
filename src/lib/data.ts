import pagodasJson from "@/data/pagodas.json";
import type { Pagoda } from "./types";

export const pagodas: Pagoda[] = pagodasJson as Pagoda[];

export const provinces: { name: string; count: number }[] = (() => {
  const map = new Map<string, number>();
  for (const p of pagodas) map.set(p.province, (map.get(p.province) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
})();

export function getPagodaBySlug(slug: string): Pagoda | undefined {
  return pagodas.find((p) => p.slug === slug);
}

export function describe(p: Pagoda, locale: string): string {
  return locale === "en" && p.descriptionEn ? p.descriptionEn : p.description;
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export type SiteType = "chua" | "den" | "dinh" | "mieu" | "thien-vien" | "khac";

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
