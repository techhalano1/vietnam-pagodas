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
  navFestivals: string;
  navRoutes: string;
  navFavorites: string;
  heroTitle: string;
  heroSubtitle: (n: number, p: number) => string;
  searchPlaceholder: string;
  allProvinces: string;
  allTypes: string;
  typeLabels: Record<string, string>;
  nearMe: string;
  nearMeOn: string;
  nearMeOff: string;
  geoError: string;
  kmAway: (d: number) => string;
  results: string;
  noResults: string;
  showMore: string;
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
  formerProvince: (old: string) => string;
  provinceTitle: (name: string) => string;
  provinceIntro: (n: number, name: string) => string;
  festivalsTitle: string;
  festivalsIntro: string;
  lunarMonth: (m: number) => string;
  thisLunarMonth: string;
  festivalHeading: string;
  routesTitle: string;
  routesIntro: string;
  routeStops: (n: number) => string;
  favoritesTitle: string;
  favoritesHeading: string;
  visitedHeading: string;
  favoritesEmpty: string;
  favBtn: string;
  favBtnActive: string;
  visitedBtn: string;
  visitedBtnActive: string;
  referencesHeading: string;
  wikipediaVi: string;
  wikipediaEn: string;
  viOnlyNote: string;
  directoryTitle: string;
  directorySubtitle: (n: number, p: number) => string;
  all: string;
  footer: string;
  navScriptures: string;
  scripturesTitle: string;
  scripturesIntro: string;
  scriptureGroupKinh: string;
  scriptureGroupKhan: string;
  scriptureKind: Record<"sutra" | "mantra" | "prayer" | "ritual", string>;
  versesCount: (n: number) => string;
  hanVietLabel: string;
  englishLabel: string;
  readerAbout: string;
  readerText: string;
  preparationHeading: string;
  repeatsHint: (n: number[]) => string;
  sourceHeading: string;
  licenseLabel: string;
  placeholderNote: string;
  appPromo: string;
  moreScriptures: string;
  audio: {
    listen: string;
    play: string;
    pause: string;
    speed: string;
    repeat: string;
    repeatOnce: string;
    repeatUnit: string;
    round: string;
    seek: string;
    voiceNote: string;
    download: string;
    voice: string;
    voiceChant: string;
    voiceAi: string;
    chantBy: string;
    chantNote: (performer: string, title: string, source: string) => string;
    chantCredit: (performer: string, source: string) => string;
  };
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
    navFestivals: "Lễ hội",
    navRoutes: "Hành trình",
    navFavorites: "Yêu thích",
    heroTitle: "Từ điển chùa & đền Việt Nam",
    heroSubtitle: (n: number, p: number) =>
      `Khám phá ${n} ngôi chùa, đền, tự viện trên khắp ${p} tỉnh thành — bản đồ tương tác, lịch sử và hình ảnh chi tiết.`,
    searchPlaceholder: "Tìm kiếm chùa, đền… (ví dụ: Thiên Mụ)",
    allProvinces: "Tất cả tỉnh thành",
    allTypes: "Tất cả loại hình",
    typeLabels: {
      chua: "Chùa & tịnh xá",
      den: "Đền",
      dinh: "Đình làng",
      mieu: "Miếu",
      "thien-vien": "Thiền viện",
      khac: "Khác",
    },
    nearMe: "📍 Gần tôi",
    nearMeOn: "Đang sắp xếp theo khoảng cách từ vị trí của bạn",
    nearMeOff: "Bỏ sắp xếp",
    geoError: "Không lấy được vị trí của bạn.",
    kmAway: (d: number) => `${d < 10 ? d.toFixed(1) : Math.round(d)} km`,
    results: "kết quả",
    noResults: "Không tìm thấy kết quả phù hợp.",
    showMore: "Xem thêm",
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
    formerProvince: (old: string) => `khu vực ${old} cũ`,
    provinceTitle: (name: string) => `Chùa & đền tại ${name}`,
    provinceIntro: (n: number, name: string) =>
      `${n} ngôi chùa, đền, đình, miếu và tự viện tại ${name} — kèm bản đồ và trang chi tiết từng địa điểm.`,
    festivalsTitle: "Lịch lễ hội chùa & đền",
    festivalsIntro:
      "Các lễ hội lớn tại chùa, đền trên cả nước, sắp xếp theo tháng âm lịch.",
    lunarMonth: (m: number) => `Tháng ${m} âm lịch`,
    thisLunarMonth: "Đang diễn ra / sắp tới",
    festivalHeading: "Lễ hội",
    routesTitle: "Gợi ý hành trình hành hương",
    routesIntro:
      "Các tuyến tham quan 1 ngày theo cụm di tích gần nhau — bấm vào từng điểm để xem chi tiết.",
    routeStops: (n: number) => `${n} điểm dừng`,
    favoritesTitle: "Yêu thích & đã đi",
    favoritesHeading: "Danh sách yêu thích",
    visitedHeading: "Đã đi",
    favoritesEmpty: "Chưa có địa điểm nào — bấm ♡ hoặc ✓ trên trang chi tiết để lưu.",
    favBtn: "♡ Yêu thích",
    favBtnActive: "♥ Đã yêu thích",
    visitedBtn: "✓ Đánh dấu đã đi",
    visitedBtnActive: "✓ Đã đi",
    referencesHeading: "Nguồn tham khảo",
    wikipediaVi: "Wikipedia tiếng Việt",
    wikipediaEn: "Wikipedia tiếng Anh",
    viOnlyNote:
      "Bài viết này hiện chỉ có nội dung tiếng Việt.",
    directoryTitle: "Danh mục chùa theo tỉnh thành",
    directorySubtitle: (n: number, p: number) => `${n} chùa, đền, tự viện tại ${p} tỉnh thành.`,
    all: "Tất cả",
    footer: "Chùa Việt Nam — dữ liệu tổng hợp từ Wikipedia (tiếng Việt & tiếng Anh), Wikidata, Wikimedia Commons, OpenStreetMap và các nguồn công khai.",
    navScriptures: "Kinh & văn khấn",
    scripturesTitle: "Kinh, chú & văn khấn",
    scripturesIntro:
      "Các bài kinh, chú, nghi thức và văn khấn thông dụng khi đi chùa, đền, đình — kèm âm Hán-Việt, dịch nghĩa và bản tiếng Anh, ghi rõ nguồn.",
    scriptureGroupKinh: "Kinh, chú & nghi thức",
    scriptureGroupKhan: "Văn khấn",
    scriptureKind: { sutra: "Kinh", mantra: "Chú", prayer: "Văn khấn", ritual: "Nghi thức" },
    versesCount: (n: number) => `${n} câu`,
    hanVietLabel: "Hán-Việt",
    englishLabel: "Tiếng Anh",
    readerAbout: "Giới thiệu",
    readerText: "Nội dung",
    preparationHeading: "Chuẩn bị & lễ vật",
    repeatsHint: (n: number[]) => `Thường tụng ${n.join(" · ")} biến`,
    sourceHeading: "Nguồn & bản quyền",
    licenseLabel: "Giấy phép",
    placeholderNote:
      "Phần trong ngoặc vuông là chỗ tín chủ tự điền (họ tên, địa chỉ, ngày âm lịch, điều mong cầu). Ứng dụng di động sẽ tự điền giúp bạn.",
    appPromo: "Đọc chữ lớn, lưu vị trí đọc và tự điền tên tín chủ trong ứng dụng Vietnam Pagodas.",
    moreScriptures: "Các bài khác",
    audio: {
      listen: "Nghe",
      play: "Phát",
      pause: "Tạm dừng",
      speed: "Tốc độ",
      repeat: "Lặp",
      repeatOnce: "1 biến",
      repeatUnit: "biến",
      round: "Biến",
      seek: "Tua",
      voiceNote: "Giọng đọc được tạo bằng AI (OpenAI TTS); cách đọc Hán-Việt có thể chưa hoàn toàn chuẩn. Nhấn vào một câu để nghe từ câu đó.",
      download: "Tải MP3",
      voice: "Giọng đọc",
      voiceChant: "Bản tụng",
      voiceAi: "Đọc theo chữ (AI)",
      chantBy: "Thầy",
      chantNote: (p, title, source) =>
        `Bản tụng: Thầy ${p} — “${title}”, nguồn ${source} (ấn tống, phát miễn phí). Bản tụng không đồng bộ từng câu với chữ; chọn “Đọc theo chữ” để nổi bật câu đang đọc.`,
      chantCredit: (p, source) => `Âm thanh: bản tụng của Thầy ${p}, nguồn ${source}`,
    },
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
    navFestivals: "Festivals",
    navRoutes: "Routes",
    navFavorites: "Favorites",
    heroTitle: "Dictionary of Vietnamese pagodas & temples",
    heroSubtitle: (n: number, p: number) =>
      `Explore ${n} pagodas, temples and monasteries across ${p} provinces — interactive map, history and detailed photos.`,
    searchPlaceholder: "Search pagodas, temples… (e.g. Thien Mu)",
    allProvinces: "All provinces",
    allTypes: "All types",
    typeLabels: {
      chua: "Pagodas & viharas",
      den: "Temples",
      dinh: "Communal houses",
      mieu: "Shrines",
      "thien-vien": "Zen monasteries",
      khac: "Other",
    },
    nearMe: "📍 Near me",
    nearMeOn: "Sorted by distance from your location",
    nearMeOff: "Clear sorting",
    geoError: "Could not get your location.",
    kmAway: (d: number) => `${d < 10 ? d.toFixed(1) : Math.round(d)} km`,
    results: "results",
    noResults: "No matching results found.",
    showMore: "Show more",
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
    formerProvince: (old: string) => `formerly ${old}`,
    provinceTitle: (name: string) => `Pagodas & temples in ${name}`,
    provinceIntro: (n: number, name: string) =>
      `${n} pagodas, temples, communal houses, shrines and monasteries in ${name} — with a map and detail pages for each site.`,
    festivalsTitle: "Pagoda & temple festival calendar",
    festivalsIntro:
      "Major festivals at pagodas and temples nationwide, organized by lunar month.",
    lunarMonth: (m: number) => `Lunar month ${m}`,
    thisLunarMonth: "Happening / upcoming",
    festivalHeading: "Festival",
    routesTitle: "Suggested pilgrimage routes",
    routesIntro:
      "One-day itineraries through clusters of nearby heritage sites — click each stop for details.",
    routeStops: (n: number) => `${n} stops`,
    favoritesTitle: "Favorites & visited",
    favoritesHeading: "Favorites",
    visitedHeading: "Visited",
    favoritesEmpty: "Nothing saved yet — tap ♡ or ✓ on a detail page to save.",
    favBtn: "♡ Favorite",
    favBtnActive: "♥ Favorited",
    visitedBtn: "✓ Mark as visited",
    visitedBtnActive: "✓ Visited",
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
    navScriptures: "Scriptures",
    scripturesTitle: "Sutras, mantras & prayers",
    scripturesIntro:
      "Common sutras, mantras, rituals and prayers for visits to pagodas, temples and communal houses — with Hán-Việt, meaning and English rendering, sources cited.",
    scriptureGroupKinh: "Sutras, mantras & rituals",
    scriptureGroupKhan: "Prayers",
    scriptureKind: { sutra: "Sutra", mantra: "Mantra", prayer: "Prayer", ritual: "Ritual" },
    versesCount: (n: number) => `${n} verses`,
    hanVietLabel: "Hán-Việt",
    englishLabel: "English",
    readerAbout: "About this text",
    readerText: "Text",
    preparationHeading: "Preparation & offerings",
    repeatsHint: (n: number[]) => `Usually recited ${n.join(" · ")} times`,
    sourceHeading: "Source & license",
    licenseLabel: "License",
    placeholderNote:
      "Bracketed parts are for you to fill in (name, address, lunar date, wish). The mobile app fills them in automatically.",
    appPromo: "Large print, saved reading position and auto-filled prayers in the Vietnam Pagodas app.",
    moreScriptures: "More texts",
    audio: {
      listen: "Listen",
      play: "Play",
      pause: "Pause",
      speed: "Speed",
      repeat: "Repeat",
      repeatOnce: "Once",
      repeatUnit: "×",
      round: "Round",
      seek: "Seek",
      voiceNote: "AI-generated voice (OpenAI TTS); Sino-Vietnamese pronunciation may not be perfect. Click a verse to listen from there.",
      download: "Download MP3",
      voice: "Voice",
      voiceChant: "Chanted recording",
      voiceAi: "Read-along (AI)",
      chantBy: "Ven.",
      chantNote: (p, title, source) =>
        `Chanted by Ven. ${p} — “${title}”, from ${source} (free Dharma distribution). The chant is not synced to the text; choose “Read-along” to highlight the current verse.`,
      chantCredit: (p, source) => `Audio: chanted by Ven. ${p}, from ${source}`,
    },
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
