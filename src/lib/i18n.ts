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
  galleryHeading: string;
  noDescription: string;
  worshipHeading: string;
  worshipLabel: string;
  prayForLabel: string;
  visitTipsHeading: string;
  visitTips: string[];
  directionsBtn: string;
  shareBtn: string;
  shareCopied: string;
  contributePhotos: string;
  readMoreHeading: string;
  readMoreIntro: string;
  linkExperiences: string;
  linkReviews: string;
  linkVideos: string;
  linkArticles: string;
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
  sponsor: string;
  licenseWiki: string;
  licenseOsm: string;
  notFoundTitle: string;
  notFoundText: string;
  backHome: string;
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
    galleryHeading: "Hình ảnh",
    noDescription: "Chưa có mô tả chi tiết.",
    worshipHeading: "Thờ phụng & linh ứng",
    worshipLabel: "Thờ phụng",
    prayForLabel: "Thường cầu",
    visitTipsHeading: "Kinh nghiệm đi chùa",
    visitTips: [
      "Trang phục lịch sự, kín đáo; bỏ mũ nón và giữ yên lặng khi vào chánh điện.",
      "Hương, hoa và lễ vật thường được bán ngay trước cổng chùa; chỉ nên thắp số lẻ (1 hoặc 3 nén).",
      "Hầu hết các chùa mở cửa từ sáng sớm đến chiều tối và không thu vé (một số danh thắng lớn có vé thắng cảnh).",
      "Dịp rằm, mùng 1 và lễ Tết rất đông; nếu muốn vãn cảnh yên tĩnh nên đi ngày thường buổi sáng.",
      "Xin phép trước khi chụp ảnh trong điện thờ; không tự ý chạm vào tượng và đồ thờ.",
    ],
    directionsBtn: "Chỉ đường trên Google Maps",
    shareBtn: "Chia sẻ",
    shareCopied: "Đã sao chép liên kết!",
    contributePhotos: "Đóng góp ảnh",
    readMoreHeading: "Đọc thêm & tham khảo",
    readMoreIntro: "Các liên kết hữu ích để tìm hiểu thêm trước khi ghé thăm:",
    linkExperiences: "Kinh nghiệm đi",
    linkReviews: "Đánh giá trên Google Maps",
    linkVideos: "Video trên YouTube",
    linkArticles: "Bài viết & tin tức",
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
    sponsor: "Tài trợ bởi",
    licenseWiki: "Nội dung trích từ Wikipedia được phát hành theo giấy phép CC BY-SA 4.0.",
    licenseOsm: "Dữ liệu bản đồ © OpenStreetMap contributors (ODbL).",
    notFoundTitle: "Không tìm thấy trang",
    notFoundText: "Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.",
    backHome: "Về trang chủ",
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
    galleryHeading: "Photos",
    noDescription: "No detailed description yet.",
    worshipHeading: "Worship & blessings",
    worshipLabel: "Dedicated to",
    prayForLabel: "Commonly prayed for",
    visitTipsHeading: "Visiting tips",
    visitTips: [
      "Dress modestly; remove hats and keep quiet inside the main hall.",
      "Incense, flowers and offerings are usually sold right outside the gate; light an odd number of sticks (1 or 3).",
      "Most pagodas open from early morning to evening and are free to enter (some major sites charge a small scenic fee).",
      "Full-moon days, the 1st of the lunar month and Tet are very crowded; visit on weekday mornings for a quiet experience.",
      "Ask permission before photographing inside shrines; do not touch statues or altar objects.",
    ],
    directionsBtn: "Directions on Google Maps",
    shareBtn: "Share",
    shareCopied: "Link copied!",
    contributePhotos: "Contribute photos",
    readMoreHeading: "Read more & references",
    readMoreIntro: "Useful links to learn more before your visit:",
    linkExperiences: "Visiting tips for",
    linkReviews: "Reviews on Google Maps",
    linkVideos: "Videos on YouTube",
    linkArticles: "Articles & news",
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
    sponsor: "Sponsored by",
    licenseWiki: "Content adapted from Wikipedia is available under the CC BY-SA 4.0 license.",
    licenseOsm: "Map data © OpenStreetMap contributors (ODbL).",
    notFoundTitle: "Page not found",
    notFoundText: "The page you are looking for does not exist or has been moved.",
    backHome: "Back to home",
    metaTitle: "Vietnam Pagodas — Dictionary of Vietnamese pagodas & temples",
    metaDescription:
      "An online dictionary of pagodas, temples and monasteries across Vietnam: interactive map, history, photos and detailed information by province.",
  },
};

export function getDict(locale: Locale): Dict {
  return dict[locale];
}
