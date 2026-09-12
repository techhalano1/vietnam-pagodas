export interface Pagoda {
  id: number;
  slug: string;
  name: string;
  province: string;
  /** Pre-2025-merger province, when different from `province`. */
  oldProvince?: string;
  lat: number | null;
  lng: number | null;
  description: string;
  /** English summary; falls back to `description` when absent. */
  descriptionEn?: string;
  image: string | null;
  thumbnail: string | null;
  wikipediaUrl: string | null;
}

export interface Section {
  heading: string | null;
  text: string;
}

export interface GalleryImage {
  src: string;
  creditUrl: string;
}

export interface PagodaDetails {
  nameEn: string | null;
  wikipediaUrlEn: string | null;
  sectionsVi: Section[];
  sectionsEn: Section[];
  references: string[];
  gallery?: GalleryImage[];
  worshipVi?: string;
  worshipEn?: string;
  prayForVi?: string;
  prayForEn?: string;
}

export interface Festival {
  slug: string;
  nameVi: string;
  nameEn: string;
  lunarMonth: number;
  dateVi: string;
  dateEn: string;
  descVi: string;
  descEn: string;
}

export interface PilgrimageRoute {
  id: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  stops: string[];
}

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
