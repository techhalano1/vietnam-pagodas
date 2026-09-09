import scripturesJson from "@/data/scriptures.json";
import type { Locale } from "./i18n";

export type ScriptureKind = "sutra" | "mantra" | "prayer" | "ritual";
export type ScriptureCategory = "daily" | "occasion" | "shrine" | "home" | "memorial" | "wish";
export type ScripturePlaceholder = "name" | "address" | "lunarDate" | "wish";

export interface ScriptureVerse {
  id: string;
  vi: string;
  hanViet: string | null;
  en: string | null;
  note: string | null;
}

export interface ScriptureSource {
  name: string;
  url?: string;
  license: string;
  note?: string;
}

export interface Scripture {
  slug: string;
  order: number;
  kind: ScriptureKind;
  title: string;
  titleEn: string;
  subtitle?: string;
  categories: ScriptureCategory[];
  occasions?: string[];
  shrines?: string[];
  siteTypes?: string[];
  intro: string;
  introEn: string;
  preparation?: string;
  preparationEn?: string;
  verses: ScriptureVerse[];
  placeholders?: ScripturePlaceholder[];
  recommendedRepeats?: number[];
  source: ScriptureSource;
  updatedAt: string;
}

export const scriptures: Scripture[] = (scripturesJson as Scripture[])
  .slice()
  .sort((a, b) => a.order - b.order);

export function getScriptureBySlug(slug: string): Scripture | undefined {
  return scriptures.find((s) => s.slug === slug);
}

export function scriptureTitle(s: Scripture, locale: Locale): string {
  return locale === "en" ? s.titleEn : s.title;
}

export function scriptureIntro(s: Scripture, locale: Locale): string {
  return locale === "en" ? s.introEn || s.intro : s.intro;
}

export function scripturePreparation(s: Scripture, locale: Locale): string | undefined {
  return locale === "en" ? (s.preparationEn ?? s.preparation) : s.preparation;
}

export function hasHanViet(s: Scripture): boolean {
  return s.verses.some((v) => !!v.hanViet);
}

export function hasEnglish(s: Scripture): boolean {
  return s.verses.some((v) => !!v.en);
}

/** Replace {{name}} / {{address}} / {{lunarDate}} / {{wish}} with readable blanks. */
export function blankPlaceholders(text: string, locale: Locale): string {
  const vi: Record<string, string> = {
    name: "[họ tên tín chủ]",
    address: "[địa chỉ]",
    lunarDate: "[ngày … tháng … năm …]",
    wish: "[điều mong cầu]",
  };
  const en: Record<string, string> = {
    name: "[your full name]",
    address: "[your address]",
    lunarDate: "[lunar date]",
    wish: "[your wish]",
  };
  const map = locale === "en" ? en : vi;
  return text.replace(/\{\{(\w+)\}\}/g, (m, k: string) => map[k] ?? m);
}

export const kindGroups: { key: "kinh" | "khan"; kinds: ScriptureKind[] }[] = [
  { key: "kinh", kinds: ["sutra", "mantra", "ritual"] },
  { key: "khan", kinds: ["prayer"] },
];
