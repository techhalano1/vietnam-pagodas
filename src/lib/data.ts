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

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
