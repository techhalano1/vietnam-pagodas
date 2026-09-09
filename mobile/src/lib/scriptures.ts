import scripturesJson from "../../../src/data/scriptures.json";
import { normalize, siteType, type SiteType } from "./data";
import type { Locale } from "./i18n";
import type { LunarDate } from "./lunar";
import type { Pagoda, PagodaDetails, Scripture, ScriptureKind } from "./types";

export const scriptures: Scripture[] = (scripturesJson as Scripture[])
  .slice()
  .sort((a, b) => a.order - b.order);

const bySlug = new Map(scriptures.map((s) => [s.slug, s]));

export function getScripture(slug: string): Scripture | undefined {
  return bySlug.get(slug);
}

export function scriptureTitle(s: Scripture, locale: Locale): string {
  return locale === "en" ? s.titleEn : s.title;
}

export function scriptureIntro(s: Scripture, locale: Locale): string {
  return locale === "en" ? s.introEn : s.intro;
}

export function scripturePreparation(s: Scripture, locale: Locale): string | undefined {
  return locale === "en" ? (s.preparationEn ?? s.preparation) : s.preparation;
}

/** Top-level grouping used by the Kinh tab segmented control. */
export type ScriptureGroup = "kinh" | "khan";

export function groupOf(kind: ScriptureKind): ScriptureGroup {
  return kind === "prayer" ? "khan" : "kinh";
}

export function hasHanViet(s: Scripture): boolean {
  return s.verses.some((v) => !!v.hanViet);
}

export function hasEnglish(s: Scripture): boolean {
  return s.verses.some((v) => !!v.en);
}

export function verseCount(s: Scripture): number {
  return s.verses.length;
}

/** Rough reading time in minutes based on Vietnamese text length. */
export function readingMinutes(s: Scripture): number {
  const chars = s.verses.reduce((n, v) => n + v.vi.length, 0);
  return Math.max(1, Math.round(chars / 900));
}

export const occasionFilters = [
  "mung-1",
  "ram",
  "tet",
  "ram-thang-gieng",
  "vu-lan",
  "ong-tao",
  "giao-thua",
] as const;
export type OccasionFilter = (typeof occasionFilters)[number];

export function searchScriptures(
  q: string,
  group: ScriptureGroup | "all",
  occasion: string | null,
  locale: Locale,
): Scripture[] {
  const nq = normalize(q.trim());
  return scriptures.filter((s) => {
    if (group !== "all" && groupOf(s.kind) !== group) return false;
    if (occasion && !(s.occasions ?? []).includes(occasion)) return false;
    if (!nq) return true;
    const hay = normalize(
      [s.title, s.titleEn, s.subtitle ?? "", locale === "en" ? s.introEn : s.intro].join(" "),
    );
    return hay.includes(nq);
  });
}

// ---------------------------------------------------------------------------
// Pagoda → suggested prayers

const shrineByType: Record<SiteType, string[]> = {
  chua: ["tam-bao", "duc-ong", "thanh-hien", "quan-am"],
  den: ["mau", "thanh-hoang"],
  dinh: ["thanh-hoang"],
  mieu: ["tho-cong", "thanh-hoang"],
  "thien-vien": ["tam-bao"],
  khac: ["tam-bao"],
};

const worshipHints: { re: RegExp; shrine: string }[] = [
  { re: /quan\s*(the\s*)?am|avalokit/i, shrine: "quan-am" },
  { re: /mau|tu phu|lieu hanh|thanh mau|mother goddess/i, shrine: "mau" },
  { re: /thanh hoang|tutelary|village guardian/i, shrine: "thanh-hoang" },
  { re: /tho (cong|dia|than)|earth god/i, shrine: "tho-cong" },
  { re: /duc ong|cap co doc|anathapindika/i, shrine: "duc-ong" },
  { re: /tam bao|thich ca|a di da|phat|buddha/i, shrine: "tam-bao" },
];

/** Prayers relevant to a site, ordered by shrine match, max `limit`. */
export function prayersForPagoda(p: Pagoda, d: PagodaDetails | undefined, limit = 4): Scripture[] {
  const type = siteType(p.name);
  const wanted: string[] = [];
  const text = normalize(`${d?.worshipVi ?? ""} ${d?.worshipEn ?? ""} ${p.name}`);
  for (const h of worshipHints) if (h.re.test(text)) wanted.push(h.shrine);
  for (const s of shrineByType[type]) if (!wanted.includes(s)) wanted.push(s);

  const out: Scripture[] = [];
  for (const shrine of wanted) {
    for (const s of scriptures) {
      if (s.kind !== "prayer" || out.includes(s)) continue;
      if ((s.shrines ?? []).includes(shrine) && (s.siteTypes ?? []).some((t) => t === type || t === "chua" && type === "thien-vien"))
        out.push(s);
    }
  }
  if (out.length < limit) {
    for (const s of scriptures) {
      if (s.kind !== "prayer" || out.includes(s)) continue;
      if ((s.siteTypes ?? []).includes(type)) out.push(s);
    }
  }
  return out.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Placeholder interpolation

export interface UserProfile {
  name: string;
  address: string;
  wish: string;
}

export const emptyProfile: UserProfile = { name: "", address: "", wish: "" };

const LUNAR_MONTH_VI = [
  "Giêng", "Hai", "Ba", "Tư", "Năm", "Sáu",
  "Bảy", "Tám", "Chín", "Mười", "Mười Một", "Chạp",
];

export function lunarDateText(l: LunarDate, canChiYear: string, locale: Locale): string {
  if (locale === "en")
    return `the ${l.day}${ordinal(l.day)} day of the ${l.month}${ordinal(l.month)}${l.leap ? " (leap)" : ""} lunar month, year ${canChiYear}`;
  return `${l.day} tháng ${LUNAR_MONTH_VI[l.month - 1]}${l.leap ? " (nhuận)" : ""} năm ${canChiYear}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}

const FALLBACK: Record<Locale, Record<keyof UserProfile, string>> = {
  vi: { name: "(họ tên tín chủ)", address: "(địa chỉ)", wish: "(điều mong cầu)" },
  en: { name: "(your full name)", address: "(your address)", wish: "(your wish)" },
};

export function fillPlaceholders(
  text: string,
  profile: UserProfile,
  lunar: string,
  locale: Locale,
): string {
  return text.replace(/\{\{(name|address|lunarDate|wish)\}\}/g, (_, key: string) => {
    if (key === "lunarDate") return lunar;
    const k = key as keyof UserProfile;
    const v = profile[k].trim();
    return v || FALLBACK[locale][k];
  });
}

/** Repeat counts worth surfacing (a bare [1] is just "read once"). */
export function repeatsToShow(s: Scripture): number[] | null {
  const r = s.recommendedRepeats?.filter((n) => n > 1) ?? [];
  return r.length ? r : null;
}

export function needsProfile(s: Scripture): boolean {
  return (s.placeholders ?? []).some((p) => p !== "lunarDate");
}

/**
 * Pick the "text of the day": on the 1st/15th of the lunar month prefer the
 * matching prayer, otherwise rotate through the short daily sutras/mantras.
 */
export function dailyScripture(lunar: LunarDate, now = new Date()): Scripture {
  const occasion = lunar.day === 1 ? "mung-1" : lunar.day === 15 ? "ram" : null;
  if (occasion) {
    const p = scriptures.find(
      (s) => s.kind === "prayer" && s.occasions?.includes(occasion) && s.categories.includes("home"),
    );
    if (p) return p;
  }
  const daily = scriptures.filter(
    (s) => (s.kind === "sutra" || s.kind === "mantra") && s.categories.includes("daily"),
  );
  const pool = daily.length ? daily : scriptures;
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  return pool[dayIndex % pool.length];
}
