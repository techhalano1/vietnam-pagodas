export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

export interface Dict {
  siteName: string;
  tagline: string;
  navMap: string;
  navDirectory: string;
  navAbout: string;
  heroTitle: string;
  heroSubtitle: (n: number, p: number) => string;
  searchPlaceholder: string;
  allProvinces: string;
  results: string;
  noResults: string;
  loadingMap: string;
  viewDetail: string;
  home: string;
  historyHeading: string;
  noDescription: string;
  readOnWikipedia: string;
  location: string;
  coordinates: string;
  googleMaps: string;
  relatedIn: (province: string) => string;
  referencesHeading: string;
  wikipediaVi: string;
  wikipediaEn: string;
  viOnlyNote: string;
  directoryTitle: string;
  directorySubtitle: (n: number, p: number) => string;
  all: string;
  footer: string;
  metaTitle: string;
  metaDescription: string;
}

const dict: Record<Locale, Dict> = {
  vi: {
    siteName: "Chùa Việt Nam",
    tagline: "Từ điển chùa & đền Việt Nam",
    navMap: "Bản đồ",
    navDirectory: "Danh mục",
    navAbout: "Giới thiệu",
    heroTitle: "Từ điển chùa & đền Việt Nam",
    heroSubtitle: (n: number, p: number) =>
      `Khám phá ${n} ngôi chùa, đền, tự viện trên khắp ${p} tỉnh thành — bản đồ tương tác, lịch sử và hình ảnh chi tiết.`,
    searchPlaceholder: "Tìm kiếm chùa, đền… (ví dụ: Thiên Mụ)",
    allProvinces: "Tất cả tỉnh thành",
    results: "kết quả",
    noResults: "Không tìm thấy kết quả phù hợp.",
    loadingMap: "Đang tải bản đồ…",
    viewDetail: "Xem chi tiết →",
    home: "Trang chủ",
    historyHeading: "Giới thiệu & lịch sử",
    noDescription: "Chưa có mô tả chi tiết.",
    readOnWikipedia: "Đọc thêm trên Wikipedia →",
    location: "Vị trí",
    coordinates: "Toạ độ",
    googleMaps: "Chỉ đường trên Google Maps",
    relatedIn: (province: string) => `Chùa khác tại ${province}`,
    referencesHeading: "Nguồn tham khảo",
    wikipediaVi: "Wikipedia tiếng Việt",
    wikipediaEn: "Wikipedia tiếng Anh",
    viOnlyNote:
      "Bài viết này hiện chỉ có nội dung tiếng Việt.",
    directoryTitle: "Danh mục chùa theo tỉnh thành",
    directorySubtitle: (n: number, p: number) => `${n} chùa, đền, tự viện tại ${p} tỉnh thành.`,
    all: "Tất cả",
    footer: "Chùa Việt Nam — dữ liệu tổng hợp từ Wikipedia (tiếng Việt & tiếng Anh), Wikidata, Wikimedia Commons, OpenStreetMap và các nguồn công khai.",
    metaTitle: "Chùa Việt Nam — Từ điển chùa, đền, tự viện Việt Nam",
    metaDescription:
      "Từ điển trực tuyến về các ngôi chùa, đền và tự viện trên khắp Việt Nam: bản đồ tương tác, lịch sử, hình ảnh và thông tin chi tiết theo từng tỉnh thành.",
  },
  en: {
    siteName: "Vietnam Pagodas",
    tagline: "Dictionary of Vietnamese pagodas & temples",
    navMap: "Map",
    navDirectory: "Directory",
    navAbout: "About",
    heroTitle: "Dictionary of Vietnamese pagodas & temples",
    heroSubtitle: (n: number, p: number) =>
      `Explore ${n} pagodas, temples and monasteries across ${p} provinces — interactive map, history and detailed photos.`,
    searchPlaceholder: "Search pagodas, temples… (e.g. Thien Mu)",
    allProvinces: "All provinces",
    results: "results",
    noResults: "No matching results found.",
    loadingMap: "Loading map…",
    viewDetail: "View details →",
    home: "Home",
    historyHeading: "Overview & history",
    noDescription: "No detailed description yet.",
    readOnWikipedia: "Read more on Wikipedia →",
    location: "Location",
    coordinates: "Coordinates",
    googleMaps: "Directions on Google Maps",
    relatedIn: (province: string) => `Other pagodas in ${province}`,
    referencesHeading: "References",
    wikipediaVi: "Vietnamese Wikipedia",
    wikipediaEn: "English Wikipedia",
    viOnlyNote:
      "A full English article is not available for this pagoda yet; the content below is in Vietnamese.",
    directoryTitle: "Pagoda directory by province",
    directorySubtitle: (n: number, p: number) =>
      `${n} pagodas, temples and monasteries in ${p} provinces.`,
    all: "All",
    footer:
      "Vietnam Pagodas — data aggregated from Wikipedia (Vietnamese & English), Wikidata, Wikimedia Commons, OpenStreetMap and other public sources.",
    metaTitle: "Vietnam Pagodas — Dictionary of Vietnamese pagodas & temples",
    metaDescription:
      "An online dictionary of pagodas, temples and monasteries across Vietnam: interactive map, history, photos and detailed information by province.",
  },
};

export function getDict(locale: Locale): Dict {
  return dict[locale];
}
