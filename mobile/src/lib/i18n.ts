export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

/** English UI/content is planned for a later release; the first release ships Vietnamese only. */
export const ENGLISH_ENABLED = false;

export function isLocale(x: string): x is Locale {
  return (locales as readonly string[]).includes(x);
}

export function isEnabledLocale(x: string): x is Locale {
  return isLocale(x) && (ENGLISH_ENABLED || x === "vi");
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
  contributePhotosText: string;
  back: string;
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
  sponsor: string;
  licenseWiki: string;
  licenseOsm: string;
  notFoundTitle: string;
  notFoundText: string;
  backHome: string;
  metaTitle: string;
  metaDescription: string;
  tabExplore: string;
  tabMap: string;
  tabSaved: string;
  tabMore: string;
  settingsLanguage: string;
  settingsTheme: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  openWebsite: string;
  mapTapHint: string;
  viewDetails: string;
  detailsNotAvailable: string;
  version: string;
  detailedArticle: string;
  // v2 tabs
  tabHome: string;
  tabPagodas: string;
  tabScriptures: string;
  tabCalendar: string;
  tabProfile: string;
  // home
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  homeSubtitle: string;
  lunarToday: string;
  lunarDate: (d: number, m: number, canChi: string) => string;
  solarDate: (date: Date) => string;
  daysUntil: (n: number, kind: "mung1" | "ram") => string;
  todayObservance: (kind: "mung1" | "ram") => string;
  quickActions: string;
  qaNearby: string;
  qaMap: string;
  qaScriptures: string;
  qaFestivals: string;
  qaRoutes: string;
  qaFavorites: string;
  qaCalendar: string;
  qaSearch: string;
  nearbyHeading: string;
  nearbyEnable: string;
  nearbyEnableText: string;
  nearbyLoading: string;
  featuredHeading: string;
  upcomingHeading: string;
  inDays: (n: number) => string;
  today: string;
  tomorrow: string;
  seeAll: string;
  comingSoonScriptures: string;
  comingSoonScripturesText: string;
  // pagodas tab
  listView: string;
  mapView: string;
  filters: string;
  filterProvince: string;
  filterType: string;
  clearFilters: string;
  apply: string;
  resultsCount: (n: number) => string;
  sortedByDistance: string;
  // scriptures / calendar placeholders
  scripturesTitle: string;
  scripturesIntro: string;
  scriptureCatSutra: string;
  scriptureCatPrayer: string;
  scriptureCatRitual: string;
  scriptureCatMala: string;
  scriptureComingSoon: string;
  comingSoon: string;
  calendarTitle: string;
  calendarUpcoming: string;
  calendarHolidayKind: Record<"buddhist" | "folk", string>;
  calendarFestivals: string;
  calendarRemindersSoon: string;
  // profile
  profileTitle: string;
  profileGuest: string;
  profileGuestText: string;
  statFavorites: string;
  statVisited: string;
  statProvinces: string;
  sectionCollections: string;
  sectionDiscover: string;
  sectionSettings: string;
  sectionAbout: string;
  aboutApp: string;
  sourceCode: string;
  rateApp: string;
  websiteSubtitle: string;
  languageVi: string;
  languageEn: string;
  madeWith: string;
  // scriptures (P2)
  scriptureSearch: string;
  scriptureGroupAll: string;
  scriptureGroupKinh: string;
  scriptureGroupKhan: string;
  scriptureKind: Record<"sutra" | "mantra" | "prayer" | "ritual", string>;
  occasionLabels: Record<string, string>;
  continueReading: string;
  readingProgress: (verse: number, total: number) => string;
  scriptureFavorites: string;
  scriptureCount: (n: number) => string;
  versesCount: (n: number) => string;
  minutesRead: (n: number) => string;
  hanVietBadge: string;
  englishBadge: string;
  readerTabRead: string;
  readerTabMeaning: string;
  readerTabRitual: string;
  toggleHanViet: string;
  toggleEnglish: string;
  fontSize: string;
  fontSizeSmall: string;
  fontSizeMedium: string;
  fontSizeLarge: string;
  repeatsHint: (n: number[]) => string;
  preparationHeading: string;
  /** About screen: consolidated sources for scriptures, prayers and audio. */
  scriptureSourcesHeading: string;
  scriptureSourcesText: string;
  chantSourcesText: (performers: string[], source: string) => string;
  personalizeHeading: string;
  personalizeText: string;
  profileName: string;
  profileAddress: string;
  profileWish: string;
  profileNamePlaceholder: string;
  profileAddressPlaceholder: string;
  profileWishPlaceholder: string;
  profileSave: string;
  profileSaved: string;
  profileClear: string;
  lunarDateAuto: (d: string) => string;
  prayersHereHeading: string;
  prayersHereText: string;
  todayScripture: string;
  todayScriptureText: (kind: "mung1" | "ram" | "normal") => string;
  scriptureNotFound: string;
  resumeReading: string;
  startOver: string;
  finishedReading: string;
  markFinished: string;
  favoritesEmptyScripture: string;
  noVerseTranslation: string;
  meaningIntro: string;
  readerSettings: string;
  keepAwakeHint: string;
  // audio (P3)
  audioBadge: string;
  listenBtn: string;
  listenResume: (time: string) => string;
  nowPlaying: string;
  playerPlay: string;
  playerPause: string;
  playerClose: string;
  prevVerse: string;
  nextVerse: string;
  playbackOptions: string;
  speedLabel: string;
  repeatLabel: string;
  repeatOnce: string;
  repeatTimes: (n: number) => string;
  repeatProgress: (done: number, total: number) => string;
  sleepLabel: string;
  sleepOff: string;
  sleepMinutes: (n: number) => string;
  sleepRemaining: (time: string) => string;
  downloadBtn: string;
  downloadedLabel: string;
  downloadingLabel: string;
  removeDownload: string;
  continueListening: string;
  audioVoiceNote: string;
  offlineAudio: string;
  offlineAudioCount: (n: number, size: string) => string;
  clearDownloads: string;
  audioError: string;
  seekLabel: string;
  voiceLabel: string;
  voiceChant: string;
  voiceAi: string;
  chantBy: (performer: string) => string;
  chantCredit: (performer: string, source: string) => string;
  skipBack: string;
  skipForward: string;
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
    nearMe: "Gần tôi",
    nearMeOn: "Gần tôi",
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
    contributePhotosText: "Chưa có ảnh cho địa điểm này. Bạn có ảnh? Hãy đóng góp để mọi người cùng chiêm ngưỡng.",
    back: "Quay lại",
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
    favBtn: "Yêu thích",
    favBtnActive: "Đã yêu thích",
    visitedBtn: "Đánh dấu đã đi",
    visitedBtnActive: "Đã đi",
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
    tabExplore: "Khám phá",
    tabMap: "Bản đồ",
    tabSaved: "Đã lưu",
    tabMore: "Thêm",
    settingsLanguage: "Ngôn ngữ",
    settingsTheme: "Giao diện",
    themeSystem: "Theo hệ thống",
    themeLight: "Sáng",
    themeDark: "Tối",
    openWebsite: "Mở trang web",
    mapTapHint: "Chạm vào điểm đánh dấu để xem chi tiết",
    viewDetails: "Xem chi tiết",
    detailsNotAvailable: "Chưa có bài viết chi tiết cho địa điểm này.",
    version: "Phiên bản",
    detailedArticle: "Bài chi tiết",
    tabHome: "Trang chủ",
    tabPagodas: "Chùa",
    tabScriptures: "Kinh",
    tabCalendar: "Lịch",
    tabProfile: "Cá nhân",
    greetingMorning: "Chào buổi sáng",
    greetingAfternoon: "Chào buổi chiều",
    greetingEvening: "Chào buổi tối",
    homeSubtitle: "An lạc trong tấm lòng hướng thiện",
    lunarToday: "Âm lịch hôm nay",
    lunarDate: (d, m, canChi) => `Ngày ${d} tháng ${m} · năm ${canChi}`,
    solarDate: (date) =>
      date.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    daysUntil: (n, kind) =>
      `Còn ${n} ngày đến ${kind === "mung1" ? "mùng 1" : "ngày rằm"}`,
    todayObservance: (kind) => (kind === "mung1" ? "Hôm nay là mùng 1" : "Hôm nay là ngày rằm"),
    quickActions: "Truy cập nhanh",
    qaNearby: "Gần tôi",
    qaMap: "Bản đồ",
    qaScriptures: "Kinh & khấn",
    qaFestivals: "Lễ hội",
    qaRoutes: "Hành hương",
    qaFavorites: "Yêu thích",
    qaCalendar: "Lịch âm",
    qaSearch: "Tìm chùa",
    nearbyHeading: "Chùa gần bạn",
    nearbyEnable: "Bật vị trí",
    nearbyEnableText: "Cho phép truy cập vị trí để xem chùa, đền gần bạn nhất.",
    nearbyLoading: "Đang xác định vị trí…",
    featuredHeading: "Danh thắng nổi bật",
    upcomingHeading: "Sắp tới",
    inDays: (n) => (n === 0 ? "Hôm nay" : n === 1 ? "Ngày mai" : `Còn ${n} ngày`),
    today: "Hôm nay",
    tomorrow: "Ngày mai",
    seeAll: "Xem tất cả",
    comingSoonScriptures: "Kinh & văn khấn",
    comingSoonScripturesText:
      "Chú Đại Bi, Tâm Kinh, văn khấn mùng 1 – rằm… đọc chữ lớn, Hán-Việt & tiếng Anh.",
    listView: "Danh sách",
    mapView: "Bản đồ",
    filters: "Bộ lọc",
    filterProvince: "Tỉnh thành",
    filterType: "Loại hình",
    clearFilters: "Xoá lọc",
    apply: "Áp dụng",
    resultsCount: (n) => `${n.toLocaleString("vi-VN")} địa điểm`,
    sortedByDistance: "Sắp theo khoảng cách",
    scripturesTitle: "Kinh & văn khấn",
    scripturesIntro: "Kinh, chú, nghi thức và văn khấn thông dụng — chữ lớn, dễ đọc.",
    scriptureCatSutra: "Kinh & chú",
    scriptureCatPrayer: "Văn khấn",
    scriptureCatRitual: "Nghi thức",
    scriptureCatMala: "Niệm Phật",
    scriptureComingSoon: "Sắp ra mắt trong bản cập nhật tới",
    comingSoon: "Sắp ra mắt",
    calendarTitle: "Lịch âm & ngày lễ",
    calendarUpcoming: "Ngày lễ sắp tới",
    calendarHolidayKind: { buddhist: "Phật giáo", folk: "Dân gian" },
    calendarFestivals: "Lễ hội chùa & đền",
    calendarRemindersSoon: "Nhắc mùng 1 – rằm sắp ra mắt",
    profileTitle: "Cá nhân",
    profileGuest: "Phật tử hữu duyên",
    profileGuestText: "Dữ liệu lưu trên máy của bạn, không cần tài khoản.",
    statFavorites: "Yêu thích",
    statVisited: "Đã đi",
    statProvinces: "Tỉnh thành",
    sectionCollections: "Bộ sưu tập",
    sectionDiscover: "Khám phá",
    sectionSettings: "Cài đặt",
    sectionAbout: "Thông tin",
    aboutApp: "Giới thiệu & nguồn dữ liệu",
    sourceCode: "Mã nguồn trên GitHub",
    rateApp: "Đánh giá ứng dụng",
    websiteSubtitle: "vietnam-pagodas.com",
    languageVi: "Tiếng Việt",
    languageEn: "English",
    madeWith: "Tài trợ bởi Cognition",
    scriptureSearch: "Tìm kinh, chú, văn khấn…",
    scriptureGroupAll: "Tất cả",
    scriptureGroupKinh: "Kinh & chú",
    scriptureGroupKhan: "Văn khấn",
    scriptureKind: { sutra: "Kinh", mantra: "Chú", prayer: "Văn khấn", ritual: "Nghi thức" },
    occasionLabels: {
      "mung-1": "Mùng 1",
      ram: "Ngày rằm",
      tet: "Tết",
      "ram-thang-gieng": "Rằm tháng Giêng",
      "vu-lan": "Vu Lan",
      "ong-tao": "Ông Táo 23/12",
      "giao-thua": "Giao thừa",
    },
    continueReading: "Đọc tiếp",
    readingProgress: (v, n) => `Câu ${v}/${n}`,
    scriptureFavorites: "Bài yêu thích",
    scriptureCount: (n) => `${n} bài`,
    versesCount: (n) => `${n} câu`,
    minutesRead: (n) => `~${n} phút`,
    hanVietBadge: "Hán-Việt",
    englishBadge: "EN",
    readerTabRead: "Đọc",
    readerTabMeaning: "Ý nghĩa",
    readerTabRitual: "Nghi thức",
    toggleHanViet: "Hiện âm Hán-Việt",
    toggleEnglish: "Hiện bản tiếng Anh",
    fontSize: "Cỡ chữ",
    fontSizeSmall: "Vừa",
    fontSizeMedium: "Lớn",
    fontSizeLarge: "Rất lớn",
    repeatsHint: (n) => `Thường tụng ${n.join(" · ")} biến`,
    preparationHeading: "Chuẩn bị & lễ vật",
    scriptureSourcesHeading: "Kinh, văn khấn & âm thanh",
    scriptureSourcesText:
      "Âm Hán-Việt và nguyên bản Pāli theo Đại Chính Tân Tu Đại Tạng Kinh (Taishō) và tam tạng Pāli (công hữu); nghi thức và văn khấn theo truyền thống Bắc tông và dân gian Việt Nam. Phần dịch nghĩa, rút gọn và biên tập do Vietnam Pagodas soạn, phát hành theo CC BY-SA 4.0.",
    chantSourcesText: (p, source) =>
      `Bản tụng: Thầy ${p.join(", Thầy ")} — nguồn ${source}, ấn tống phát miễn phí. Giọng “Đọc theo chữ” được tạo bằng AI.`,
    personalizeHeading: "Thông tin tín chủ",
    personalizeText:
      "Điền một lần, app sẽ tự chèn vào các bài văn khấn. Dữ liệu chỉ lưu trên máy bạn.",
    profileName: "Họ tên tín chủ",
    profileAddress: "Địa chỉ (ngụ tại)",
    profileWish: "Điều mong cầu",
    profileNamePlaceholder: "Ví dụ: Nguyễn Văn An",
    profileAddressPlaceholder: "Số nhà, phường/xã, tỉnh thành",
    profileWishPlaceholder: "Sức khoẻ, bình an, công việc hanh thông…",
    profileSave: "Lưu thông tin",
    profileSaved: "Đã lưu",
    profileClear: "Xoá",
    lunarDateAuto: (d) => `Ngày âm lịch tự điền: ${d}`,
    prayersHereHeading: "Văn khấn tại đây",
    prayersHereText: "Gợi ý theo loại hình và vị thờ của địa điểm này.",
    todayScripture: "Kinh hôm nay",
    todayScriptureText: (k) =>
      k === "mung1"
        ? "Hôm nay mùng 1 — nên tụng kinh, khấn thần linh & gia tiên."
        : k === "ram"
          ? "Hôm nay ngày rằm — nên tụng kinh, khấn thần linh & gia tiên."
          : "Mỗi ngày một bài kinh ngắn để tâm an.",
    scriptureNotFound: "Không tìm thấy bài này.",
    resumeReading: "Tiếp tục từ câu đã đọc",
    startOver: "Đọc lại từ đầu",
    finishedReading: "Đã đọc hết bài",
    markFinished: "Hoàn thành",
    favoritesEmptyScripture: "Chưa có bài yêu thích. Nhấn ♥ trong bài để lưu.",
    noVerseTranslation: "Chưa có bản dịch cho câu này.",
    meaningIntro: "Giới thiệu",
    readerSettings: "Tuỳ chỉnh đọc",
    keepAwakeHint: "Màn hình luôn sáng khi đọc",
    audioBadge: "Audio",
    listenBtn: "Nghe",
    listenResume: (time) => `Nghe tiếp từ ${time}`,
    nowPlaying: "Đang phát",
    playerPlay: "Phát",
    playerPause: "Tạm dừng",
    playerClose: "Đóng trình phát",
    prevVerse: "Câu trước",
    nextVerse: "Câu sau",
    playbackOptions: "Tuỳ chọn phát",
    speedLabel: "Tốc độ",
    repeatLabel: "Số biến",
    repeatOnce: "1 lần",
    repeatTimes: (n) => `${n} biến`,
    repeatProgress: (d, n) => `Biến ${d}/${n}`,
    sleepLabel: "Hẹn giờ tắt",
    sleepOff: "Tắt",
    sleepMinutes: (n) => `${n} phút`,
    sleepRemaining: (time) => `Tắt sau ${time}`,
    downloadBtn: "Tải để nghe offline",
    downloadedLabel: "Đã tải",
    downloadingLabel: "Đang tải…",
    removeDownload: "Xoá bản tải",
    continueListening: "Tiếp tục nghe",
    audioVoiceNote:
      "Giọng đọc được tạo bằng AI (OpenAI TTS); cách đọc Hán-Việt có thể chưa hoàn toàn chuẩn.",
    offlineAudio: "Âm thanh đã tải",
    offlineAudioCount: (n, size) => `${n} bài · ${size}`,
    clearDownloads: "Xoá tất cả",
    audioError: "Không phát được âm thanh. Hãy kiểm tra kết nối mạng.",
    seekLabel: "Thanh tiến trình",
    voiceLabel: "Giọng đọc",
    voiceChant: "Bản tụng",
    voiceAi: "Đọc theo chữ (AI)",
    chantBy: (p) => `Thầy ${p} tụng`,
    chantCredit: (p, source) =>
      `Thầy ${p} tụng — ${source}. Bản tụng không đồng bộ từng câu với chữ — chọn “Đọc theo chữ” để nổi bật câu đang đọc.`,
    skipBack: "Lùi 30 giây",
    skipForward: "Tiến 30 giây",
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
    nearMe: "Near me",
    nearMeOn: "Near me",
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
    contributePhotosText: "No photos yet for this site. Have some? Contribute them so everyone can enjoy.",
    back: "Back",
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
    favBtn: "Favorite",
    favBtnActive: "Favorited",
    visitedBtn: "Mark as visited",
    visitedBtnActive: "Visited",
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
    tabExplore: "Explore",
    tabMap: "Map",
    tabSaved: "Saved",
    tabMore: "More",
    settingsLanguage: "Language",
    settingsTheme: "Appearance",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    openWebsite: "Open website",
    mapTapHint: "Tap a marker to view details",
    viewDetails: "View details",
    detailsNotAvailable: "No detailed article for this site yet.",
    version: "Version",
    detailedArticle: "Full article",
    tabHome: "Home",
    tabPagodas: "Pagodas",
    tabScriptures: "Scriptures",
    tabCalendar: "Calendar",
    tabProfile: "Profile",
    greetingMorning: "Good morning",
    greetingAfternoon: "Good afternoon",
    greetingEvening: "Good evening",
    homeSubtitle: "Peace to every kind heart",
    lunarToday: "Lunar date today",
    lunarDate: (d, m, canChi) => `Day ${d}, month ${m} · year of ${canChi}`,
    solarDate: (date) =>
      date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    daysUntil: (n, kind) =>
      `${n} day${n === 1 ? "" : "s"} until the ${kind === "mung1" ? "new moon (1st)" : "full moon (15th)"}`,
    todayObservance: (kind) =>
      kind === "mung1" ? "Today is the 1st lunar day" : "Today is the full-moon day",
    quickActions: "Quick actions",
    qaNearby: "Near me",
    qaMap: "Map",
    qaScriptures: "Scriptures",
    qaFestivals: "Festivals",
    qaRoutes: "Pilgrimage",
    qaFavorites: "Favorites",
    qaCalendar: "Lunar calendar",
    qaSearch: "Search",
    nearbyHeading: "Near you",
    nearbyEnable: "Enable location",
    nearbyEnableText: "Allow location access to see the pagodas and temples closest to you.",
    nearbyLoading: "Finding your location…",
    featuredHeading: "Featured sites",
    upcomingHeading: "Coming up",
    inDays: (n) => (n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`),
    today: "Today",
    tomorrow: "Tomorrow",
    seeAll: "See all",
    comingSoonScriptures: "Scriptures & prayers",
    comingSoonScripturesText:
      "Great Compassion Mantra, Heart Sutra, new-moon and full-moon prayers… large print, Hán-Việt & English.",
    listView: "List",
    mapView: "Map",
    filters: "Filters",
    filterProvince: "Province",
    filterType: "Type",
    clearFilters: "Clear",
    apply: "Apply",
    resultsCount: (n) => `${n.toLocaleString("en-US")} sites`,
    sortedByDistance: "Sorted by distance",
    scripturesTitle: "Scriptures & prayers",
    scripturesIntro: "Common sutras, mantras, rituals and prayers — large, easy-to-read text.",
    scriptureCatSutra: "Sutras & mantras",
    scriptureCatPrayer: "Prayers",
    scriptureCatRitual: "Rituals",
    scriptureCatMala: "Recitation",
    scriptureComingSoon: "Coming in the next update",
    comingSoon: "Coming soon",
    calendarTitle: "Lunar calendar & holy days",
    calendarUpcoming: "Upcoming holy days",
    calendarHolidayKind: { buddhist: "Buddhist", folk: "Folk" },
    calendarFestivals: "Pagoda & temple festivals",
    calendarRemindersSoon: "New-moon / full-moon reminders coming soon",
    profileTitle: "Profile",
    profileGuest: "Fellow traveller",
    profileGuestText: "Your data stays on this device — no account needed.",
    statFavorites: "Favorites",
    statVisited: "Visited",
    statProvinces: "Provinces",
    sectionCollections: "Collections",
    sectionDiscover: "Discover",
    sectionSettings: "Settings",
    sectionAbout: "About",
    aboutApp: "About & data sources",
    sourceCode: "Source code on GitHub",
    rateApp: "Rate the app",
    websiteSubtitle: "vietnam-pagodas.com",
    languageVi: "Tiếng Việt",
    languageEn: "English",
    madeWith: "Sponsored by Cognition",
    scriptureSearch: "Search sutras, mantras, prayers…",
    scriptureGroupAll: "All",
    scriptureGroupKinh: "Sutras & mantras",
    scriptureGroupKhan: "Prayers",
    scriptureKind: { sutra: "Sutra", mantra: "Mantra", prayer: "Prayer", ritual: "Ritual" },
    occasionLabels: {
      "mung-1": "New moon (1st)",
      ram: "Full moon (15th)",
      tet: "Tết",
      "ram-thang-gieng": "First full moon",
      "vu-lan": "Vu Lan",
      "ong-tao": "Kitchen Gods",
      "giao-thua": "New Year's Eve",
    },
    continueReading: "Continue reading",
    readingProgress: (v, n) => `Verse ${v}/${n}`,
    scriptureFavorites: "Favorite texts",
    scriptureCount: (n) => `${n} texts`,
    versesCount: (n) => `${n} verses`,
    minutesRead: (n) => `~${n} min`,
    hanVietBadge: "Hán-Việt",
    englishBadge: "EN",
    readerTabRead: "Read",
    readerTabMeaning: "Meaning",
    readerTabRitual: "Ritual",
    toggleHanViet: "Show Hán-Việt",
    toggleEnglish: "Show English",
    fontSize: "Text size",
    fontSizeSmall: "Regular",
    fontSizeMedium: "Large",
    fontSizeLarge: "Extra large",
    repeatsHint: (n) => `Usually recited ${n.join(" · ")} times`,
    preparationHeading: "Preparation & offerings",
    scriptureSourcesHeading: "Scriptures, prayers & audio",
    scriptureSourcesText:
      "Sino-Vietnamese readings and Pāli originals follow the Taishō Tripiṭaka and the Pāli Canon (public domain); liturgies and prayers follow Vietnamese Mahayana and folk tradition. Translations, abridgements and editing by Vietnam Pagodas, released under CC BY-SA 4.0.",
    chantSourcesText: (p, source) =>
      `Chanted recordings: Ven. ${p.join(", Ven. ")} — from ${source}, free Dharma distribution. The “Read-along” voice is AI-generated.`,
    personalizeHeading: "Your details for prayers",
    personalizeText:
      "Fill in once and the app inserts them into every prayer. Stored only on this device.",
    profileName: "Full name",
    profileAddress: "Address",
    profileWish: "Your wish",
    profileNamePlaceholder: "e.g. Nguyễn Văn An",
    profileAddressPlaceholder: "Street, ward, province",
    profileWishPlaceholder: "Health, peace, success at work…",
    profileSave: "Save details",
    profileSaved: "Saved",
    profileClear: "Clear",
    lunarDateAuto: (d) => `Lunar date filled automatically: ${d}`,
    prayersHereHeading: "Prayers for this site",
    prayersHereText: "Suggested from the site type and the deities worshipped here.",
    todayScripture: "Today's reading",
    todayScriptureText: (k) =>
      k === "mung1"
        ? "New-moon day — a good day to chant and pray to the deities and ancestors."
        : k === "ram"
          ? "Full-moon day — a good day to chant and pray to the deities and ancestors."
          : "A short text each day for a calm mind.",
    scriptureNotFound: "This text could not be found.",
    resumeReading: "Resume where you left off",
    startOver: "Start from the beginning",
    finishedReading: "Finished",
    markFinished: "Mark as finished",
    favoritesEmptyScripture: "No favorite texts yet. Tap ♥ in a text to save it.",
    noVerseTranslation: "No translation for this verse yet.",
    meaningIntro: "About this text",
    readerSettings: "Reading options",
    keepAwakeHint: "Screen stays on while reading",
    audioBadge: "Audio",
    listenBtn: "Listen",
    listenResume: (time) => `Resume from ${time}`,
    nowPlaying: "Now playing",
    playerPlay: "Play",
    playerPause: "Pause",
    playerClose: "Close player",
    prevVerse: "Previous verse",
    nextVerse: "Next verse",
    playbackOptions: "Playback options",
    speedLabel: "Speed",
    repeatLabel: "Repeats",
    repeatOnce: "Once",
    repeatTimes: (n) => `${n} times`,
    repeatProgress: (d, n) => `Pass ${d}/${n}`,
    sleepLabel: "Sleep timer",
    sleepOff: "Off",
    sleepMinutes: (n) => `${n} min`,
    sleepRemaining: (time) => `Stops in ${time}`,
    downloadBtn: "Download for offline",
    downloadedLabel: "Downloaded",
    downloadingLabel: "Downloading…",
    removeDownload: "Remove download",
    continueListening: "Continue listening",
    audioVoiceNote:
      "AI-generated voice (OpenAI TTS); Sino-Vietnamese pronunciation may not be perfect.",
    offlineAudio: "Downloaded audio",
    offlineAudioCount: (n, size) => `${n} tracks · ${size}`,
    clearDownloads: "Remove all",
    audioError: "Could not play audio. Please check your connection.",
    seekLabel: "Progress bar",
    voiceLabel: "Voice",
    voiceChant: "Chanted recording",
    voiceAi: "Read-along (AI)",
    chantBy: (p) => `Chanted by Ven. ${p}`,
    chantCredit: (p, source) =>
      `Chanted by Ven. ${p} — ${source}. The chant is not synced to the text — choose “Read-along” to highlight the current verse.`,
    skipBack: "Back 30 seconds",
    skipForward: "Forward 30 seconds",
  },
};

export function getDict(locale: Locale): Dict {
  return dict[locale];
}
