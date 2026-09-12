// Vietnamese lunar calendar (Hồ Ngọc Đức's astronomical algorithm, UTC+7).

const TZ = 7;
const PI = Math.PI;

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

function jdToDate(jd: number): { day: number; month: number; year: number } {
  let a: number, b: number, c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL += (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - PI * 2 * Math.floor(L / (PI * 2));
  return L;
}

function getSunLongitude(dayNumber: number): number {
  return Math.floor((sunLongitude(dayNumber - 0.5 - TZ / 24) / PI) * 6);
}

function getNewMoonDay(k: number): number {
  return Math.floor(newMoon(k) + 0.5 + TZ / 24);
}

function getLunarMonth11(yy: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k);
  const sunLong = getSunLongitude(nm);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1);
  return nm;
}

function getLeapMonthOffset(a11: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i));
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k);
  let a11 = getLunarMonth11(yy);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) leap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  leap = false,
): { day: number; month: number; year: number } | null {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1);
    b11 = getLunarMonth11(lunarYear);
  } else {
    a11 = getLunarMonth11(lunarYear);
    b11 = getLunarMonth11(lunarYear + 1);
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (leap && lunarMonth !== leapMonth) return null;
    if (leap || off >= leapOff) off += 1;
  }
  const monthStart = getNewMoonDay(k + off);
  return jdToDate(monthStart + lunarDay - 1);
}

export function lunarToday(now = new Date()): LunarDate {
  return solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
}

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const CHI_ANIMAL_EN = [
  "Rat", "Ox", "Tiger", "Cat", "Dragon", "Snake",
  "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig",
];

export function yearCanChi(lunarYear: number): string {
  return `${CAN[(lunarYear + 6) % 10]} ${CHI[(lunarYear + 8) % 12]}`;
}

export function yearAnimalEn(lunarYear: number): string {
  return CHI_ANIMAL_EN[(lunarYear + 8) % 12];
}

export function dayCanChi(date: Date): string {
  const jd = jdFromDate(date.getDate(), date.getMonth() + 1, date.getFullYear());
  return `${CAN[(jd + 9) % 10]} ${CHI[(jd + 1) % 12]}`;
}

export function monthCanChi(lunarMonth: number, lunarYear: number): string {
  return `${CAN[(lunarYear * 12 + lunarMonth + 3) % 10]} ${CHI[(lunarMonth + 1) % 12]}`;
}

export interface LunarHoliday {
  day: number;
  month: number;
  vi: string;
  en: string;
  /** Buddhist observance vs. folk/national holiday */
  kind: "buddhist" | "folk";
}

export const LUNAR_HOLIDAYS: LunarHoliday[] = [
  { day: 1, month: 1, vi: "Tết Nguyên Đán", en: "Lunar New Year (Tết)", kind: "folk" },
  { day: 15, month: 1, vi: "Rằm tháng Giêng (Tết Thượng Nguyên)", en: "First full moon (Thượng Nguyên)", kind: "buddhist" },
  { day: 19, month: 2, vi: "Vía Quan Thế Âm Bồ Tát (đản sinh)", en: "Avalokiteśvara's birthday", kind: "buddhist" },
  { day: 3, month: 3, vi: "Tết Hàn Thực", en: "Cold Food Festival", kind: "folk" },
  { day: 10, month: 3, vi: "Giỗ Tổ Hùng Vương", en: "Hùng Kings' Commemoration", kind: "folk" },
  { day: 8, month: 4, vi: "Phật Đản (truyền thống)", en: "Buddha's Birthday (traditional)", kind: "buddhist" },
  { day: 15, month: 4, vi: "Đại lễ Phật Đản (Vesak)", en: "Vesak — Buddha's Birthday", kind: "buddhist" },
  { day: 5, month: 5, vi: "Tết Đoan Ngọ", en: "Đoan Ngọ Festival", kind: "folk" },
  { day: 19, month: 6, vi: "Vía Quan Thế Âm Bồ Tát (thành đạo)", en: "Avalokiteśvara's enlightenment", kind: "buddhist" },
  { day: 15, month: 7, vi: "Lễ Vu Lan (Rằm tháng Bảy)", en: "Vu Lan — Ghost Festival", kind: "buddhist" },
  { day: 30, month: 7, vi: "Vía Địa Tạng Vương Bồ Tát", en: "Kṣitigarbha's day", kind: "buddhist" },
  { day: 15, month: 8, vi: "Tết Trung Thu", en: "Mid-Autumn Festival", kind: "folk" },
  { day: 19, month: 9, vi: "Vía Quan Thế Âm Bồ Tát (xuất gia)", en: "Avalokiteśvara's renunciation", kind: "buddhist" },
  { day: 30, month: 9, vi: "Vía Dược Sư Lưu Ly Quang Phật", en: "Medicine Buddha's day", kind: "buddhist" },
  { day: 17, month: 11, vi: "Vía Phật A Di Đà", en: "Amitābha Buddha's day", kind: "buddhist" },
  { day: 8, month: 12, vi: "Phật Thành Đạo", en: "Bodhi Day (Buddha's enlightenment)", kind: "buddhist" },
  { day: 23, month: 12, vi: "Ông Công Ông Táo", en: "Kitchen Gods' day", kind: "folk" },
];

/** True when the (non-leap) lunar month has only 29 days. */
export function isShortLunarMonth(month: number, year: number): boolean {
  const s = lunarToSolar(30, month, year, false);
  return s !== null && solarToLunar(s.day, s.month, s.year).day === 1;
}

/** Observances on this lunar day; a 30th-day observance falls on the 29th in a 29-day month. */
export function holidaysOn(lunar: LunarDate): LunarHoliday[] {
  if (lunar.leap) return [];
  const days = [lunar.day];
  if (lunar.day === 29 && isShortLunarMonth(lunar.month, lunar.year)) days.push(30);
  return LUNAR_HOLIDAYS.filter((h) => days.includes(h.day) && h.month === lunar.month);
}

/** Days from `from` (inclusive) until the next 1st or 15th lunar day. */
export function daysUntilNextObservance(from = new Date()): {
  days: number;
  kind: "mung1" | "ram";
  date: Date;
} {
  for (let i = 0; i < 32; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const l = solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear());
    if (l.day === 1) return { days: i, kind: "mung1", date: d };
    if (l.day === 15) return { days: i, kind: "ram", date: d };
  }
  return { days: 0, kind: "mung1", date: from };
}

export interface UpcomingHoliday extends LunarHoliday {
  date: Date;
  daysAway: number;
}

export function upcomingHolidays(from = new Date(), limit = 5): UpcomingHoliday[] {
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const startJd = jdFromDate(start.getDate(), start.getMonth() + 1, start.getFullYear());
  const todayLunar = solarToLunar(start.getDate(), start.getMonth() + 1, start.getFullYear());
  const out: UpcomingHoliday[] = [];
  for (const y of [todayLunar.year, todayLunar.year + 1]) {
    for (const h of LUNAR_HOLIDAYS) {
      const s = lunarToSolar(h.day, h.month, y, false);
      if (!s) continue;
      let jd = jdFromDate(s.day, s.month, s.year);
      if (h.day === 30 && isShortLunarMonth(h.month, y)) jd -= 1;
      const daysAway = jd - startJd;
      if (daysAway < 0) continue;
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + daysAway);
      out.push({ ...h, date, daysAway });
    }
  }
  out.sort((a, b) => a.daysAway - b.daysAway);
  return out.slice(0, limit);
}
