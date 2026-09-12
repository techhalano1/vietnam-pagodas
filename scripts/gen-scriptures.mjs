// Composes the bilingual scripture / prayer catalogue (src/data/scriptures.json)
// from a curated spec below, using the OpenAI API for the text body.
//
// Content rules (see plan §4.3):
// - Sutras/mantras: Hán-Việt transliteration (public domain) + an ORIGINAL
//   Vietnamese meaning rendering + an ORIGINAL English rendering. No verbatim
//   copying of copyrighted modern translations.
// - Folk prayers (văn khấn): traditional public-domain formulas, re-edited into
//   the standard structure (nguyện hương → kính lạy → tín chủ → lễ vật → lời cầu
//   → hồi hướng) with {{name}}, {{address}}, {{lunarDate}}, {{wish}} placeholders.
// Progress is cached in .scriptures-cache.json so the run can be resumed.
//
// Usage: OPENAI_API_KEY=... node scripts/gen-scriptures.mjs [--model gpt-4.1] [--only slug]
import fs from "node:fs";
import { CHU_DAI_BI, CHU_VANG_SANH, SAM_HOI, TAM_KINH, THAP_CHU } from "./scriptures-canonical.mjs";

const MODEL = process.argv.includes("--model")
  ? process.argv[process.argv.indexOf("--model") + 1]
  : "gpt-4.1";
const ONLY = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;
const CACHE = ".scriptures-cache.json";
const OUT = "src/data/scriptures.json";
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) throw new Error("OPENAI_API_KEY is required");

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const saveCache = () => fs.writeFileSync(CACHE, JSON.stringify(cache));

const SRC_HANVIET = {
  name: "Âm Hán-Việt theo Đại Chính Tân Tu Đại Tạng Kinh (Taishō); dịch nghĩa & bản Anh do Vietnam Pagodas biên soạn",
  license: "Hán-Việt: công hữu (public domain) · Dịch nghĩa/EN: CC BY-SA 4.0 (Vietnam Pagodas)",
};
const SRC_MEANING = {
  name: "Dịch nghĩa (trích) từ Hán tạng — Đại Chính Tân Tu Đại Tạng Kinh (Taishō) — do Vietnam Pagodas biên soạn bằng lời văn riêng",
  license: "Nguyên bản Hán tạng: công hữu (public domain) · Bản dịch nghĩa/EN: CC BY-SA 4.0 (Vietnam Pagodas)",
  note: "Bản dịch nghĩa dễ đọc, không phải âm Hán-Việt; nên đối chiếu với bản kinh tại chùa khi tụng chính thức.",
};
const SRC_PALI = {
  name: "Nguyên bản Pāli (Khuddakapāṭha / Sutta Nipāta), dịch nghĩa & bản Anh do Vietnam Pagodas biên soạn",
  license: "Pāli: công hữu · Dịch nghĩa/EN: CC BY-SA 4.0 (Vietnam Pagodas)",
};
const SRC_FOLK = {
  name: "Văn khấn cổ truyền Việt Nam (truyền thống dân gian), biên tập lại theo cấu trúc chuẩn bởi Vietnam Pagodas",
  license: "Văn bản truyền thống công hữu · Bản biên tập: CC BY-SA 4.0 (Vietnam Pagodas)",
};
const SRC_RITUAL = {
  name: "Nghi thức tụng niệm phổ thông (Bắc tông Việt Nam), rút gọn và chú giải bởi Vietnam Pagodas",
  license: "Nghi thức truyền thống công hữu · Bản rút gọn: CC BY-SA 4.0 (Vietnam Pagodas)",
};

// kind: sutra | mantra | prayer | ritual
// mode: "hanviet" (verses have hanViet + vi + en), "pali" (hanViet field holds Pāli), "vi" (vi + en only)
const SPEC = [
  // ---------- Kinh / chú (14) ----------
  { slug: "chu-dai-bi", kind: "mantra", mode: "hanviet", title: "Chú Đại Bi", titleEn: "Great Compassion Mantra", subtitle: "Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni", categories: ["daily", "shrine", "wish"], shrines: ["quan-am", "tam-bao"], repeats: [3, 7, 21, 108], source: SRC_HANVIET,
    fixedHanViet: CHU_DAI_BI,
    brief: "The 84-line Great Compassion Dhāraṇī. Use EXACTLY the 84 hanViet lines given below, in order, one per verse. For each line give a brief traditional meaning gloss in `vi` and `en` (e.g. 'Nam mô hắc ra đát na đa ra dạ da' = 'Quy y Tam Bảo' / 'Homage to the Three Jewels'; 'Ta bà ha' = 'Thành tựu viên mãn' / 'So be it, may it be accomplished'). Intro: origin in the Thousand-Hand Avalokiteśvara sūtra, benefits, when it is chanted (daily, 3/7/21/108 repetitions, Quan Âm days 19/2, 19/6, 19/9 lunar)." },
  { slug: "bat-nha-tam-kinh", kind: "sutra", mode: "hanviet", title: "Bát Nhã Tâm Kinh", titleEn: "Heart Sūtra", subtitle: "Ma Ha Bát Nhã Ba La Mật Đa Tâm Kinh", categories: ["daily", "shrine"], shrines: ["tam-bao"], repeats: [1, 3, 7], source: SRC_HANVIET,
    fixedHanViet: TAM_KINH,
    brief: "Complete Hán-Việt Heart Sūtra (Xuanzang version). Use EXACTLY the 16 hanViet lines given below. `vi` = your own clear Vietnamese meaning; `en` = your own English rendering." },
  { slug: "kinh-a-di-da", kind: "sutra", mode: "vi", title: "Kinh A Di Đà", titleEn: "Amitābha Sūtra", subtitle: "Phật Thuyết A Di Đà Kinh", categories: ["daily", "memorial", "home"], occasions: ["ram", "mung-1"], shrines: ["tam-bao"], repeats: [1, 3], source: SRC_MEANING,
    brief: "Hán-Việt text of the shorter Sukhāvatīvyūha (Kumārajīva) split into ~28 verses by paragraph/sentence group: opening at Xá Vệ quốc with the assembly, description of Cực Lạc (seven-jewel ponds, lotus flowers, birds, music), the meaning of Amitābha's name, exhortation to recite the name for 1–7 days, testimonies of Buddhas of the six directions (may condense the six-direction passages), closing. Write `vi` as your OWN faithful, readable Vietnamese meaning rendering (not Hán-Việt, not a copyrighted translation) and `en` as your own English rendering; hanViet null." },
  { slug: "kinh-pho-mon", kind: "sutra", mode: "vi", title: "Kinh Phổ Môn", titleEn: "Universal Gate Chapter (Lotus Sūtra ch. 25)", subtitle: "Quán Thế Âm Bồ Tát Phổ Môn Phẩm", categories: ["daily", "shrine", "wish"], shrines: ["quan-am"], occasions: ["ram", "mung-1"], repeats: [1, 3], source: SRC_MEANING,
    brief: "Universal Gate chapter as a faithful Vietnamese meaning rendering (hanViet null): prose part condensed to ~14 verses (Vô Tận Ý's question, the seven perils, the 33 manifestations summarized, the offering of the necklace) plus the verse section (gāthā) as ~20 four-line stanzas rendered in Vietnamese meaning. `vi`/`en` your own renderings." },
  { slug: "kinh-duoc-su", kind: "sutra", mode: "vi", title: "Kinh Dược Sư (12 đại nguyện)", titleEn: "Medicine Buddha Sūtra (Twelve Great Vows)", subtitle: "Dược Sư Lưu Ly Quang Như Lai Bản Nguyện Công Đức Kinh — trích", categories: ["wish", "shrine", "home"], shrines: ["tam-bao"], occasions: ["ram"], repeats: [1, 3, 7], source: SRC_MEANING,
    brief: "Excerpt as Vietnamese meaning rendering (hanViet null except the final mantra verse, whose hanViet is the mantra): short opening (Phật bảo Mạn Thù Thất Lợi...) then the twelve great vows of Medicine Buddha, one verse each (12 verses), then the Medicine Buddha mantra 'Nam mô bạc già phạt đế, bệ sát xã, lũ rô thích lưu ly...' as final verse. Intro explains healing/longevity practice and Dược Sư day 30/9 lunar." },
  { slug: "kinh-dia-tang", kind: "sutra", mode: "vi", title: "Kinh Địa Tạng (trích)", titleEn: "Kṣitigarbha Sūtra (excerpt)", subtitle: "Địa Tạng Bồ Tát Bản Nguyện Kinh — Phẩm 1 & hồi hướng", categories: ["memorial", "home"], occasions: ["vu-lan"], shrines: ["tam-bao"], repeats: [1], source: SRC_MEANING,
    brief: "Excerpt as a faithful Vietnamese meaning rendering (hanViet null except the mantra verse): ~10 verses from Chapter 1 (assembly at Đao Lợi, Buddha praises Địa Tạng, the Brahmin girl story condensed), 4 verses on the vow to save all beings in hell, the Địa Tạng mantra 'Án ha ha ha vĩ sa ma da sa bà ha', and 2 dedication verses. Intro: filial piety, prayers for deceased, Vu Lan and 30/7 lunar (Địa Tạng day)." },
  { slug: "kinh-vu-lan-bon", kind: "sutra", mode: "vi", title: "Kinh Vu Lan Bồn", titleEn: "Ullambana Sūtra", subtitle: "Phật Thuyết Vu Lan Bồn Kinh", categories: ["memorial", "occasion"], occasions: ["vu-lan"], shrines: ["tam-bao", "gia-tien"], repeats: [1, 3], source: SRC_MEANING,
    brief: "Complete Ullambana Sūtra as a faithful Vietnamese meaning rendering (hanViet null), ~14 verses: Mục Kiền Liên sees his mother among hungry ghosts, food turns to fire, the Buddha's instruction on offering to the Saṅgha on 15/7, the vow of filial children. `vi`/`en` your own renderings. Intro on Vu Lan festival." },
  { slug: "kinh-bao-an-cha-me", kind: "sutra", mode: "vi", title: "Kinh Báo Ân Cha Mẹ", titleEn: "Sūtra on the Profound Kindness of Parents", subtitle: "Phật Thuyết Phụ Mẫu Ân Trọng Nan Báo Kinh — trích", categories: ["memorial", "home", "occasion"], occasions: ["vu-lan"], shrines: ["gia-tien"], repeats: [1], source: SRC_MEANING,
    brief: "Excerpt ~16 verses as a faithful Vietnamese meaning rendering (hanViet null): the Buddha bows to a heap of bones, the ten kindnesses of the mother (thập ân) one verse each, the difficulty of repaying, how to repay through the Dharma. `vi`/`en` your own renderings." },
  { slug: "kinh-tu-bi", kind: "sutra", mode: "pali", title: "Kinh Từ Bi", titleEn: "Metta Sutta (Discourse on Loving-kindness)", subtitle: "Karaṇīya Mettā Sutta — Sn 1.8", categories: ["daily", "home"], shrines: ["tam-bao"], repeats: [1, 3], source: SRC_PALI,
    brief: "The ten Pāli stanzas of the Karaṇīya Mettā Sutta ('Karaṇīyam atthakusalena...'), one stanza per verse in the hanViet field (romanised Pāli with diacritics), `vi` your own Vietnamese verse rendering, `en` your own English rendering." },
  { slug: "kinh-phuoc-duc", kind: "sutra", mode: "pali", title: "Kinh Phước Đức", titleEn: "Maṅgala Sutta (Discourse on Blessings)", subtitle: "Maṅgala Sutta — Sn 2.4", categories: ["daily", "home", "wish"], occasions: ["tet"], shrines: ["tam-bao"], repeats: [1, 3], source: SRC_PALI,
    brief: "The twelve Pāli stanzas of the Maṅgala Sutta (deva's question and the Buddha's answer listing the 38 blessings), one stanza per verse (Pāli in hanViet field, `vi` Vietnamese meaning, `en` English)." },
  { slug: "sam-hoi-hong-danh", kind: "ritual", mode: "hanviet", title: "Sám Hối Hồng Danh (rút gọn)", titleEn: "Repentance to the Buddhas' Names (abridged)", subtitle: "Hồng Danh Bửu Sám — bản rút gọn", categories: ["daily", "occasion"], occasions: ["mung-1", "ram"], shrines: ["tam-bao"], repeats: [1], source: SRC_RITUAL,
    fixedHanViet: SAM_HOI.map((m) => m[1]), fixedNotes: SAM_HOI.map((m) => m[0]),
    brief: "Abridged repentance rite. Use EXACTLY the hanViet lines given below (one per verse, notes as given); `vi`/`en` give the meaning of each line (for Buddha names: 'Kính lễ Đức Phật ...' / 'Homage to ... Buddha'). Original brief for context: opening verse 'Đại từ đại bi mẫn chúng sinh...', 'Nam mô Phổ Quang Phật...' etc. — a representative list of 20 Buddha names (one per verse, each 'Nam mô ... Phật'), the confession passage 'Như thị đẳng nhất thiết thế giới chư Phật Thế Tôn... đệ tử chúng đẳng ... chí tâm sám hối', and the closing dedication. ~30 verses total. Intro: practiced on 14th and 30th/29th lunar nights." },
  { slug: "luc-tu-dai-minh", kind: "mantra", mode: "hanviet", title: "Thần chú Lục Tự Đại Minh", titleEn: "Six-Syllable Mantra (Oṁ Maṇi Padme Hūṁ)", subtitle: "Án Ma Ni Bát Mê Hồng", categories: ["daily", "wish"], shrines: ["quan-am"], repeats: [21, 108, 1080], source: SRC_HANVIET,
    brief: "Very short: verse 1 the mantra in Hán-Việt 'Án ma ni bát mê hồng' with Sanskrit in note ('Oṁ maṇi padme hūṁ'); verses 2–7 explain each syllable's traditional meaning (six realms / six perfections) in `vi` and `en`, with the syllable in hanViet. Intro on Avalokiteśvara and mala recitation." },
  { slug: "chu-vang-sanh", kind: "mantra", mode: "hanviet", title: "Chú Vãng Sanh", titleEn: "Rebirth in Pure Land Dhāraṇī", subtitle: "Bạt Nhất Thiết Nghiệp Chướng Căn Bản Đắc Sanh Tịnh Độ Đà La Ni", categories: ["memorial", "daily"], shrines: ["tam-bao"], repeats: [3, 7, 21, 108], source: SRC_HANVIET,
    fixedHanViet: CHU_VANG_SANH,
    brief: "The Rebirth dhāraṇī. Use EXACTLY the 9 hanViet lines given below, with a brief gloss in `vi`/`en` for each. Intro on use in funerals, memorials and daily Pure Land practice." },
  { slug: "thap-chu", kind: "mantra", mode: "hanviet", title: "Thập Chú", titleEn: "The Ten Short Mantras", subtitle: "Mười bài chú trong công phu khuya", categories: ["daily"], shrines: ["tam-bao"], repeats: [1, 3], source: SRC_HANVIET,
    fixedHanViet: THAP_CHU.map((m) => m[1]), fixedNotes: THAP_CHU.map((m) => m[0]),
    brief: "The ten short mantras of the morning service, one mantra per verse (10 verses). Use EXACTLY the hanViet lines given below in order, and set each verse's `note` to the mantra name given. `vi`/`en` give a brief gloss of the mantra's purpose and traditional benefit (1–2 sentences)." },

  // ---------- Nghi thức (3) ----------
  { slug: "cong-phu-sang", kind: "ritual", mode: "hanviet", title: "Công phu sáng (rút gọn)", titleEn: "Morning Service (abridged, ~15 min)", subtitle: "Nghi thức tụng niệm buổi sáng", categories: ["daily", "home"], shrines: ["tam-bao"], repeats: [1], source: SRC_RITUAL,
    brief: "An abridged morning liturgy as ~24 verses in order, each verse's `note` naming the step: Nguyện hương (Hán-Việt incense verse 'Nguyện thử diệu hương vân...'), Tán Phật ('Pháp vương vô thượng tôn...'), Quán tưởng, Đảnh lễ Tam Bảo (3 verses 'Nhất tâm đảnh lễ...'), Tán lư hương, Khai kinh kệ ('Vô thượng thậm thâm vi diệu pháp...'), reference lines 'Tụng Chú Đại Bi (3 biến)' and 'Tụng Bát Nhã Tâm Kinh' as instruction verses (do not repeat full texts), Niệm Phật (Nam mô A Di Đà Phật... Quán Thế Âm... Đại Thế Chí... Địa Tạng... Thanh Tịnh Đại Hải Chúng), Sám hối ngắn, Tam quy y ('Tự quy y Phật...' 3 verses), Hồi hướng ('Nguyện đem công đức này...'). Use `vi` for meaning of Hán-Việt lines; instruction verses use vi only." },
  { slug: "cong-phu-toi", kind: "ritual", mode: "hanviet", title: "Công phu tối — Tịnh độ (rút gọn)", titleEn: "Evening Pure Land Service (abridged, ~20 min)", subtitle: "Nghi thức tụng niệm buổi tối", categories: ["daily", "home", "memorial"], shrines: ["tam-bao"], repeats: [1], source: SRC_RITUAL,
    brief: "Abridged evening Pure Land liturgy ~26 verses with `note` step names: Nguyện hương, Tán Phật, Đảnh lễ, Khai kinh kệ, instruction 'Tụng Kinh A Di Đà (hoặc 48 nguyện)', Chú Vãng Sanh (3 biến — instruction), Tán Phật A Di Đà ('A Di Đà Phật thân kim sắc...' 4 verses Hán-Việt), Niệm Phật (Nam mô Tây Phương Cực Lạc Thế Giới Đại Từ Đại Bi A Di Đà Phật; Nam mô A Di Đà Phật (108 lần)...), Sám hối ('Đệ tử chúng đẳng... tùng thân ngữ ý chi sở sinh...'), Phát nguyện ('Nguyện sinh Tây Phương Tịnh Độ trung...'), Tam tự quy, Hồi hướng." },
  { slug: "nghi-thuc-cau-an", kind: "ritual", mode: "vi", title: "Nghi thức cầu an tại gia", titleEn: "Home Blessing Ceremony", subtitle: "Cầu bình an cho gia đình", categories: ["home", "wish", "occasion"], occasions: ["tet", "mung-1", "ram"], shrines: ["tam-bao", "gia-tien"], placeholders: ["name", "address", "lunarDate"], repeats: [1], source: SRC_RITUAL,
    brief: "A simple Vietnamese-language home blessing ceremony ~18 verses with `note` step names: chuẩn bị bàn thờ, thắp hương, nguyện hương (Vietnamese), lễ Phật, tụng (instruction: Chú Đại Bi 3 biến / Kinh Phổ Môn), niệm danh hiệu Quan Âm, lời cầu an with {{name}} {{address}} {{lunarDate}} placeholders, tụng Tâm Kinh (instruction), hồi hướng, tam tự quy. `en` for every verse. `preparation` lists offerings (hương, hoa, đèn, nước, trái cây) and etiquette." },

  // ---------- Văn khấn (17) ----------
  { slug: "khan-tam-bao", kind: "prayer", mode: "vi", title: "Văn khấn Tam Bảo khi đi chùa", titleEn: "Prayer to the Three Jewels at the Pagoda", subtitle: "Ban Tam Bảo — chính điện", categories: ["shrine", "wish"], shrines: ["tam-bao"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua"] },
  { slug: "khan-duc-ong", kind: "prayer", mode: "vi", title: "Văn khấn ban Đức Ông", titleEn: "Prayer at the Đức Ông (Anāthapiṇḍika) Altar", subtitle: "Đức Chúa Ông Cấp Cô Độc", categories: ["shrine", "wish"], shrines: ["duc-ong"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua"] },
  { slug: "khan-duc-thanh-hien", kind: "prayer", mode: "vi", title: "Văn khấn ban Đức Thánh Hiền", titleEn: "Prayer at the Đức Thánh Hiền (Ānanda) Altar", subtitle: "Tôn giả A Nan Đà", categories: ["shrine", "wish"], shrines: ["thanh-hien"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua"] },
  { slug: "khan-quan-am", kind: "prayer", mode: "vi", title: "Văn khấn ban Quan Âm", titleEn: "Prayer to Avalokiteśvara (Quan Âm)", subtitle: "Quán Thế Âm Bồ Tát", categories: ["shrine", "wish"], shrines: ["quan-am"], occasions: ["ram", "mung-1"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua"] },
  { slug: "khan-ban-mau", kind: "prayer", mode: "vi", title: "Văn khấn ban Mẫu / Tứ phủ", titleEn: "Prayer to the Mother Goddesses (Tứ Phủ)", subtitle: "Đền, phủ thờ Mẫu", categories: ["shrine", "wish"], shrines: ["mau"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["den", "phu"] },
  { slug: "khan-thanh-hoang", kind: "prayer", mode: "vi", title: "Văn khấn Thành Hoàng tại đình", titleEn: "Prayer to the Village Tutelary Deity (Đình)", subtitle: "Đình làng", categories: ["shrine", "wish"], shrines: ["thanh-hoang"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["dinh"] },
  { slug: "khan-mieu-tho-than", kind: "prayer", mode: "vi", title: "Văn khấn tại miếu / Thổ thần", titleEn: "Prayer at a Shrine to Local Spirits", subtitle: "Miếu, am thờ thần linh bản xứ", categories: ["shrine", "wish"], shrines: ["tho-cong"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["mieu", "am"] },
  { slug: "khan-mung-1-ram-than-linh", kind: "prayer", mode: "vi", title: "Văn khấn mùng 1 & rằm — Thần linh tại gia", titleEn: "New-moon & Full-moon Prayer to Household Deities", subtitle: "Thổ Công, Thần linh, Táo Quân", categories: ["home", "occasion"], occasions: ["mung-1", "ram"], shrines: ["tho-cong"], placeholders: ["name", "address", "lunarDate"], source: SRC_FOLK },
  { slug: "khan-mung-1-ram-gia-tien", kind: "prayer", mode: "vi", title: "Văn khấn mùng 1 & rằm — Gia tiên", titleEn: "New-moon & Full-moon Prayer to Ancestors", subtitle: "Bàn thờ gia tiên", categories: ["home", "occasion"], occasions: ["mung-1", "ram"], shrines: ["gia-tien"], placeholders: ["name", "address", "lunarDate"], source: SRC_FOLK },
  { slug: "khan-tho-cong-tao-quan", kind: "prayer", mode: "vi", title: "Văn khấn Thổ Công – Táo Quân", titleEn: "Prayer to the Earth God and Kitchen Gods", subtitle: "Ngày thường & lễ tiết", categories: ["home"], shrines: ["tho-cong"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK },
  { slug: "khan-ong-tao-23-thang-chap", kind: "prayer", mode: "vi", title: "Văn khấn Ông Táo 23 tháng Chạp", titleEn: "Kitchen Gods' Farewell Prayer (23rd of the 12th lunar month)", subtitle: "Tiễn Táo Quân chầu trời", categories: ["home", "occasion"], occasions: ["ong-tao"], shrines: ["tho-cong"], placeholders: ["name", "address"], source: SRC_FOLK },
  { slug: "khan-giao-thua", kind: "prayer", mode: "vi", title: "Văn khấn Giao thừa (ngoài trời & trong nhà)", titleEn: "New Year's Eve Prayer (outdoors & indoors)", subtitle: "Đón Hành khiển năm mới, lễ gia tiên", categories: ["home", "occasion"], occasions: ["giao-thua", "tet"], shrines: ["tho-cong", "gia-tien"], placeholders: ["name", "address"], source: SRC_FOLK,
    brief: "Two parts, each marked in `note`: Phần 1 — ngoài trời (tiễn Hành khiển cũ, đón Hành khiển mới, cầu quốc thái dân an) and Phần 2 — trong nhà (Thổ Công, gia tiên)." },
  { slug: "khan-ram-thang-gieng", kind: "prayer", mode: "vi", title: "Văn khấn Rằm tháng Giêng (Tết Nguyên Tiêu)", titleEn: "First Full Moon Prayer (Tết Nguyên Tiêu)", subtitle: "Lễ Phật, Thần linh & gia tiên", categories: ["home", "shrine", "occasion"], occasions: ["ram-thang-gieng"], shrines: ["tam-bao", "gia-tien"], placeholders: ["name", "address", "wish"], source: SRC_FOLK },
  { slug: "khan-vu-lan", kind: "prayer", mode: "vi", title: "Văn khấn Vu Lan – Rằm tháng Bảy", titleEn: "Vu Lan / Ghost Festival Prayer (15th of the 7th month)", subtitle: "Gia tiên & cúng chúng sinh", categories: ["home", "memorial", "occasion"], occasions: ["vu-lan"], shrines: ["gia-tien"], placeholders: ["name", "address"], source: SRC_FOLK,
    brief: "Two parts marked in `note`: Phần 1 — Gia tiên (in the house) and Phần 2 — Cúng chúng sinh / cô hồn (outdoors, cháo, gạo muối, bỏng)." },
  { slug: "khan-cau-an-cau-sieu", kind: "prayer", mode: "vi", title: "Văn khấn cầu an – cầu siêu", titleEn: "Prayer for Peace of the Living and Liberation of the Departed", subtitle: "Tại chùa hoặc tại gia", categories: ["shrine", "home", "memorial", "wish"], shrines: ["tam-bao"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua"] },
  { slug: "khan-cau-duyen", kind: "prayer", mode: "vi", title: "Văn khấn cầu duyên", titleEn: "Prayer for Love and Marriage", subtitle: "Thường khấn tại chùa Hà, đền Mẫu, ban Quan Âm", categories: ["shrine", "wish"], shrines: ["mau", "quan-am"], placeholders: ["name", "address", "lunarDate"], source: SRC_FOLK, siteTypes: ["chua", "den"] },
  { slug: "khan-cau-cong-danh-thi-cu", kind: "prayer", mode: "vi", title: "Văn khấn cầu công danh, thi cử", titleEn: "Prayer for Career and Examination Success", subtitle: "Văn Miếu, ban Đức Thánh Hiền, ban Tam Bảo", categories: ["shrine", "wish"], shrines: ["thanh-hien", "tam-bao"], placeholders: ["name", "address", "lunarDate", "wish"], source: SRC_FOLK, siteTypes: ["chua", "van-mieu"] },
  { slug: "khan-ta-le-cuoi-nam", kind: "prayer", mode: "vi", title: "Văn khấn tạ lễ cuối năm", titleEn: "Year-end Thanksgiving Prayer", subtitle: "Tạ ơn Phật, Thánh, Thần linh sau một năm", categories: ["shrine", "home", "occasion"], occasions: ["tet"], shrines: ["tam-bao", "tho-cong", "gia-tien"], placeholders: ["name", "address", "lunarDate"], source: SRC_FOLK, siteTypes: ["chua", "den", "dinh"] },
];

const SYSTEM = `You are a careful editor of Vietnamese Buddhist liturgy and Vietnamese folk-religion prayers, fluent in Hán-Việt, Vietnamese and English.
Rules:
- Hán-Việt (Sino-Vietnamese) transliterations of sūtras/mantras must follow the standard Vietnamese liturgical text (as chanted in Vietnamese Mahāyāna temples), with correct diacritics.
- Never copy a modern copyrighted Vietnamese or English translation. Write your OWN clear, respectful, plain-language meaning rendering in Vietnamese ("vi") and English ("en").
- Folk prayers (văn khấn) are traditional public-domain formulas: follow the classic structure — "Nam mô A Di Đà Phật! (3 lần)" → "Con lạy chín phương Trời, mười phương Chư Phật..." / kính lạy the relevant deities → "Tín chủ con là {{name}}, ngụ tại {{address}}" → "Hôm nay là ngày {{lunarDate}}" → lễ vật → lời cầu (use {{wish}} where the spec has that placeholder) → hồi hướng / "Nam mô A Di Đà Phật! (3 lần)". Use ONLY the placeholders listed in the spec, exactly as {{name}}, {{address}}, {{lunarDate}}, {{wish}} (keep the same tokens inside the English text too).
- One verse = one sentence/line/stanza the reader will chant; keep verses short enough to fit on a phone screen (max ~300 characters each).
- Output strict JSON: {"intro": string (Vietnamese, 2–4 sentences: meaning, when/where to recite), "introEn": string, "preparation": string|null (Vietnamese; offerings & etiquette, 1–3 sentences, null if not applicable), "preparationEn": string|null, "verses": [{"id": "v1", "hanViet": string|null, "vi": string, "en": string, "note": string|null}, ...]}.
- For mode "hanviet": every verse has hanViet (the chanted text), vi (meaning), en (meaning). For mode "pali": hanViet holds romanised Pāli. For mode "vi": hanViet is null and vi is the chanted Vietnamese text.
- Keep the whole text faithful and complete for short texts; for excerpts follow the brief. No commentary outside JSON.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chat(user) {
  for (let i = 0; i < 6; i++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (i + 1));
      continue;
    }
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    try {
      return JSON.parse(json.choices[0].message.content);
    } catch {
      await sleep(2000);
    }
  }
  throw new Error("chat failed");
}

function prompt(s) {
  const defaultBrief =
    s.kind === "prayer"
      ? `A complete traditional Vietnamese folk prayer (văn khấn) for: ${s.title} (${s.subtitle}). 12–22 verses following the classic structure. Include the appropriate deities/Buddhas to address for this altar/occasion. Mention typical offerings in "preparation".`
      : "";
  return `Compose the following item.
slug: ${s.slug}
kind: ${s.kind}
mode: ${s.mode}
title (vi): ${s.title}
title (en): ${s.titleEn}
subtitle: ${s.subtitle ?? ""}
occasions: ${(s.occasions ?? []).join(", ") || "-"}
shrines/altars: ${(s.shrines ?? []).join(", ") || "-"}
placeholders allowed: ${(s.placeholders ?? []).join(", ") || "none"}
brief: ${s.brief ?? defaultBrief}${
    s.fixedHanViet
      ? `\n\nhanViet lines (${s.fixedHanViet.length}, copy verbatim, one per verse):\n${s.fixedHanViet
          .map((l, i) => `${i + 1}. ${l}${s.fixedNotes && s.fixedNotes[i] ? ` [note: ${s.fixedNotes[i]}]` : ""}`)
          .join("\n")}`
      : ""
  }`;
}

function validate(s, r) {
  if (!r || !Array.isArray(r.verses) || r.verses.length < 3) throw new Error(`${s.slug}: too few verses`);
  if (s.fixedHanViet) {
    if (r.verses.length !== s.fixedHanViet.length)
      throw new Error(`${s.slug}: expected ${s.fixedHanViet.length} verses, got ${r.verses.length}`);
    r.verses.forEach((v, i) => {
      v.hanViet = s.fixedHanViet[i];
      if (s.fixedNotes && s.fixedNotes[i]) v.note = s.fixedNotes[i];
    });
  }
  const allowed = new Set(s.placeholders ?? []);
  const re = /\{\{(\w+)\}\}/g;
  for (const v of r.verses) {
    if (typeof v.vi !== "string" || !v.vi.trim()) throw new Error(`${s.slug}: verse without vi`);
    if (typeof v.en !== "string" || !v.en.trim()) throw new Error(`${s.slug}: verse without en`);
    if (s.mode !== "vi" && s.kind !== "ritual" && (typeof v.hanViet !== "string" || !v.hanViet.trim()))
      throw new Error(`${s.slug}: verse without hanViet`);
    for (const text of [v.vi, v.en, v.hanViet ?? ""]) {
      for (const m of text.matchAll(re)) {
        if (!allowed.has(m[1])) throw new Error(`${s.slug}: unexpected placeholder ${m[0]}`);
      }
    }
  }
}

async function run() {
  const items = ONLY ? SPEC.filter((s) => s.slug === ONLY) : SPEC;
  let n = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (n < items.length) {
        const s = items[n++];
        if (cache[s.slug] && !ONLY) continue;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const r = await chat(prompt(s));
            validate(s, r);
            cache[s.slug] = r;
            saveCache();
            console.log(`ok ${s.slug} (${r.verses.length} verses)`);
            break;
          } catch (e) {
            console.warn(`retry ${s.slug}: ${e.message}`);
            if (attempt === 2) throw e;
          }
        }
      }
    }),
  );

  const today = new Date().toISOString().slice(0, 10);
  const out = SPEC.map((s, i) => {
    const r = cache[s.slug];
    if (!r) throw new Error(`missing ${s.slug}`);
    return {
      slug: s.slug,
      order: i + 1,
      kind: s.kind,
      title: s.title,
      titleEn: s.titleEn,
      subtitle: s.subtitle ?? null,
      categories: s.categories,
      occasions: s.occasions ?? [],
      shrines: s.shrines ?? [],
      siteTypes: s.siteTypes ?? [],
      intro: r.intro,
      introEn: r.introEn,
      preparation: r.preparation ?? null,
      preparationEn: r.preparationEn ?? null,
      verses: r.verses.map((v, j) => ({
        id: `v${j + 1}`,
        hanViet: typeof v.hanViet === "string" && v.hanViet.trim() ? v.hanViet : null,
        vi: v.vi,
        en: v.en,
        note: v.note ?? null,
      })),
      placeholders: s.placeholders ?? [],
      recommendedRepeats: s.repeats ?? [1],
      source: s.source,
      updatedAt: today,
    };
  });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  const chars = out.reduce((a, s) => a + s.verses.reduce((b, v) => b + v.vi.length + (v.hanViet?.length ?? 0), 0), 0);
  console.log(`wrote ${out.length} scriptures, ${chars.toLocaleString()} chars → ${OUT}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
