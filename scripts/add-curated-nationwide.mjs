// Adds curated pagodas/temples for the 13 provinces that previously had no
// entries, and fixes province labels for Sóc Trăng temples that were stored
// under the merged "Cần Thơ" label. Content researched from government,
// heritage and press sources listed in each entry's references. Entries
// without a verifiable coordinate keep lat/lng null.
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const pagodasPath = path.join(dir, "../src/data/pagodas.json");
const detailsPath = path.join(dir, "../src/data/details.json");

// Slugs whose true (pre-merger) province is Sóc Trăng but were labeled with
// the post-2025 merged province "Cần Thơ".
const RELABEL = {
  "chua-bon-mat": "Sóc Trăng",
  "chua-chroi-tum-chas": "Sóc Trăng",
  "chua-doi": "Sóc Trăng",
  "chua-dat-set": "Sóc Trăng",
  "chua-khleang": "Sóc Trăng",
  "chua-sa-lon": "Sóc Trăng",
  "chua-som-rong": "Sóc Trăng",
};

const CURATED = [
  // ---------------------------------------------------------------- Bắc Kạn
  {
    pagoda: {
      id: 90000007,
      slug: "chua-thach-long",
      name: "Chùa Thạch Long",
      province: "Bắc Kạn",
      lat: null,
      lng: null,
      description:
        "Chùa Thạch Long (chùa Rồng Đá) nằm trong hang núi đá tại xã Cao Kỳ, huyện Chợ Mới, tỉnh Bắc Kạn, được mệnh danh là \u201cchùa thiêng trong hang đá\u201d. Chùa hình thành từ khoảng thế kỷ XVII và được UBND tỉnh Bắc Kạn xếp hạng di tích lịch sử – văn hóa cấp tỉnh năm 2011.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Thach Long Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Thạch Long (chùa Rồng Đá) nằm trong hang núi đá thuộc xã Cao Kỳ, huyện Chợ Mới, tỉnh Bắc Kạn, ở độ cao gần 300 m so với mực nước biển, cách quốc lộ 3 khoảng 400 m. Đây được xem là ngôi chùa hang lớn và thoáng bậc nhất miền Bắc, có thể chứa hàng nghìn người vào lễ Phật.",
        },
        {
          heading: "Truyền thuyết và lịch sử",
          text: "Tương truyền, xưa kia người dân xã Vi Hương (Bạch Thông) rước tượng Phật Thích Ca bằng vàng ngược sông Cầu về thờ, nhưng đến vằng Bó Mi thuộc xã Cao Kỳ thì mảng cứ xoay tròn không đi được. Sáng hôm sau tượng Phật biến mất; theo làn khói nhang, người dân tìm thấy Đức Phật ngự trong một hang động rộng đẹp bên kia sông, từ đó lập chùa ngay tại hang. Tên Thạch Long xuất phát từ hình dáng cửa hang giống miệng rồng đang há.\nChùa được hình thành khoảng thế kỷ XVII. Trong kháng chiến chống Pháp, hang chùa từng được sử dụng làm nơi cất giấu vũ khí, phục vụ kháng chiến. Ngày 2 tháng 11 năm 2011, chùa được UBND tỉnh Bắc Kạn công nhận là di tích lịch sử – văn hóa cấp tỉnh.",
        },
        {
          heading: "Kiến trúc",
          text: "Chùa gồm hai khu vực chính: chùa Thượng nằm trên cao, lên bằng các bậc đá xếp từ chân núi dẫn thẳng tới cửa động, gian cao nhất thờ Đức Phật Thích Ca; và chùa Âm (chùa Mẫu) với lối vào hẹp hơn men theo sườn núi. Trong hang có nhiều ngách đá ăn sâu vào lòng núi, không gian rộng, sạch và thoáng hiếm thấy ở các chùa hang Việt Nam.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Thach Long Pagoda (\u201cStone Dragon\u201d) sits inside a limestone cave in Cao Ky commune, Cho Moi district, Bac Kan province, at nearly 300 m above sea level and about 400 m from National Route 3. It is regarded as one of the largest and airiest cave pagodas in northern Vietnam, able to hold thousands of worshippers.",
        },
        {
          heading: "Legend and history",
          text: "Legend has it that villagers of Vi Huong (Bach Thong) were ferrying a golden statue of Shakyamuni Buddha up the Cau river when their raft began spinning in circles at Bo Mi, in today's Cao Ky commune, and would go no further. The next morning the statue had vanished; following the smoke of an incense offering, the villagers found the Buddha enshrined in a vast, beautiful cave across the river and founded the pagoda on the spot. The name Thach Long comes from the cave mouth's resemblance to an open dragon's jaw.\nThe pagoda took shape around the 17th century. During the resistance war against the French the cave served as a hiding place for weapons. On 2 November 2011 it was recognized as a provincial-level historical and cultural relic.",
        },
        {
          heading: "Architecture",
          text: "The pagoda has two main areas: the Upper Pagoda, reached by stone steps leading from the foot of the mountain straight to the cave mouth, whose highest chamber enshrines Shakyamuni Buddha; and the Lower (Mother Goddess) Pagoda, entered by a narrower path around the hillside. The cave contains many deep recesses and an unusually spacious, clean and airy interior.",
        },
      ],
      references: [
        "https://nguoidulich.vn/chua-thach-long-o-dau-va-chua-thach-long-tho-ai-d48245.html",
        "https://travelviet.net/vn/relics/thai-nguyen/chua-thach-long",
      ],
    },
  },
  {
    pagoda: {
      id: 90000008,
      slug: "den-an-ma",
      name: "Đền An Mạ (An Mã)",
      province: "Bắc Kạn",
      lat: null,
      lng: null,
      description:
        "Đền An Mạ là ngôi đền cổ tọa lạc trên đảo An Mã giữa hồ Ba Bể, huyện Ba Bể, tỉnh Bắc Kạn, thờ Phật, Mẫu Thượng Ngàn, Chúa Sơn Trang và Đức Thánh Trần. Đền gắn liền với sự tích hồ Ba Bể và là nơi tổ chức lễ hội xuân Ba Bể hằng năm.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "An Ma Temple",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Đền An Mạ (còn gọi là đền An Mã) tọa lạc trên đảo An Mã — một hòn đảo đá vôi cao khoảng 30 m, phủ kín cây xanh, nằm giữa hồ Ba Bể thuộc xã Nam Mẫu, huyện Ba Bể, tỉnh Bắc Kạn. Đền thờ Phật, Mẫu Thượng Ngàn, Chúa Sơn Trang và Đức Thánh Trần.",
        },
        {
          heading: "Sự tích",
          text: "Đền gắn liền với sự tích hồ Ba Bể: xưa kia cả vùng là thung lũng trù phú, nhưng vì dân làng đắc tội với thần Giao Long nên đất sụt thành hồ, chỉ hai mẹ con bà góa tốt bụng thoát nạn và cứu giúp dân làng. Một truyền thuyết khác kể rằng đền là nơi thờ các tướng sĩ nhà Mạc thua trận đã tuẫn tiết tại động Puông; để tránh nhà Lê truy xét, dân địa phương đổi tên thành đền An Mạ (nghĩa là \u201cmồ yên\u201d).",
        },
        {
          heading: "Lễ hội",
          text: "Đền là trung tâm của lễ hội xuân Ba Bể tổ chức vào mùng 10 tháng Giêng với hội Lồng tồng truyền thống của đồng bào Tày, và lễ hội đền An Mạ vào mùng 6 tháng 2 âm lịch. Du khách đi thuyền trên hồ Ba Bể thường ghé đảo dâng hương, vãn cảnh.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "An Ma Temple stands on An Ma island — a limestone islet about 30 m high covered in greenery — in the middle of Ba Be lake, Nam Mau commune, Ba Be district, Bac Kan province. It is dedicated to the Buddha, the Forest Mother Goddess (Mau Thuong Ngan), the Mountain Princess and Saint Tran Hung Dao.",
        },
        {
          heading: "Legends",
          text: "The temple is tied to the legend of Ba Be lake: the region was once a fertile valley, but when villagers offended the serpent god Giao Long the land collapsed into a lake, sparing only a kind widow and her son who then rescued the survivors. Another tradition holds that the temple honors Mac-dynasty officers who took their own lives at Puong cave after a defeat; to avoid reprisals from the Le dynasty, locals renamed it An Ma — \u201cpeaceful grave\u201d.",
        },
        {
          heading: "Festivals",
          text: "The temple is the heart of the Ba Be spring festival held on the 10th day of the first lunar month, featuring the Tay people's traditional Long tong (going-to-the-fields) festival, and of the An Ma temple festival on the 6th day of the second lunar month. Boat tours on Ba Be lake customarily stop at the island for incense offerings.",
        },
      ],
      references: [
        "https://vietnam-destinations.com/destination/den-an-ma-bac-kan/",
        "https://triphunter.vn/places/bac-kan/items/den-an-ma",
      ],
    },
  },
  // --------------------------------------------------------------- Cao Bằng
  {
    pagoda: {
      id: 90000009,
      slug: "chua-phat-tich-truc-lam-ban-gioc",
      name: "Chùa Phật tích Trúc Lâm Bản Giốc",
      province: "Cao Bằng",
      lat: null,
      lng: null,
      description:
        "Chùa Phật tích Trúc Lâm Bản Giốc tọa lạc bên sườn núi Phja Nhằm, xã Đàm Thủy, huyện Trùng Khánh, tỉnh Cao Bằng, nhìn ra thác Bản Giốc. Khởi công năm 2013 và khánh thành ngày 15/12/2014, đây là ngôi chùa đầu tiên được xây dựng nơi biên cương phía Bắc của Tổ quốc.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Truc Lam Ban Gioc Buddha Trace Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Phật tích Trúc Lâm Bản Giốc được xây dựng bên sườn núi Phja Nhằm ở Bản Giốc, xã Đàm Thủy, huyện Trùng Khánh, tỉnh Cao Bằng, trên tổng diện tích khoảng 3 ha, hướng nhìn ra thác Bản Giốc hùng vĩ. Đây là ngôi chùa đầu tiên được xây dựng trên mảnh đất biên cương phía Bắc của Tổ quốc, được xem như một dấu mốc tâm linh vùng biên viễn.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được khởi công ngày 15 tháng 6 năm 2013 và khánh thành ngày 15 tháng 12 năm 2014, theo thiết kế mang đậm nét kiến trúc truyền thống Việt Nam. Chùa thuộc thiền phái Trúc Lâm — dòng thiền do Phật hoàng Trần Nhân Tông khai mở.",
        },
        {
          heading: "Kiến trúc",
          text: "Quần thể chùa gồm cổng tam quan, lầu chuông, lầu trống, bia đá, lầu tượng Quan Thế Âm Bồ Tát, nhà Tam bảo, nhà thờ Tổ, nhà thờ Mẫu, đền thờ anh hùng Nùng Trí Cao — thủ lĩnh các dân tộc Cao Bằng thế kỷ XI, cùng nhà thờ Chủ tịch Hồ Chí Minh và Đại tướng Võ Nguyên Giáp. Điểm nhấn là lầu Đại hồng chung Thiên Bảo với quả chuông đồng nặng 1,5 tấn. Từ sân chùa, du khách có thể ngắm trọn vẹn thác Bản Giốc và cảnh đồng ruộng, núi non vùng biên.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Truc Lam Ban Gioc Pagoda is built on the slope of Phja Nham mountain at Ban Gioc, Dam Thuy commune, Trung Khanh district, Cao Bang province, on about 3 ha of land overlooking the majestic Ban Gioc waterfall. It is the first pagoda ever built on Vietnam's northern border and is regarded as a spiritual landmark of the frontier.",
        },
        {
          heading: "History",
          text: "Construction began on 15 June 2013 and the pagoda was inaugurated on 15 December 2014, designed in traditional Vietnamese architectural style. It belongs to the Truc Lam Zen school founded by the Buddhist king Tran Nhan Tong.",
        },
        {
          heading: "Architecture",
          text: "The complex comprises a three-entrance gate, bell and drum towers, stone steles, a tower of Avalokitesvara Bodhisattva, the main Tam Bao hall, patriarch and Mother Goddess halls, and a shrine to the 11th-century hero Nung Tri Cao — leader of Cao Bang's ethnic communities — as well as altars honoring President Ho Chi Minh and General Vo Nguyen Giap. Its highlight is the Thien Bao bell tower with a 1.5-tonne bronze bell. From the courtyard visitors enjoy a full view of Ban Gioc waterfall and the borderland scenery.",
        },
      ],
      references: [
        "https://nongnghiepmoitruong.vn/chua-phat-tich-truc-lam-ban-gioc--dau-moc-tam-linh-vung-bien-vien-i351984.html",
        "https://www.dichoithoi.com/diem-den/chua-phat-tich-truc-lam-ban-gioc",
      ],
    },
  },
  {
    pagoda: {
      id: 90000010,
      slug: "chua-da-quan",
      name: "Chùa Đà Quận (Viên Minh tự)",
      province: "Cao Bằng",
      lat: null,
      lng: null,
      description:
        "Chùa Đà Quận, tên chữ là Viên Minh tự, thuộc xã Hưng Đạo, thành phố Cao Bằng, là một trong ba ngôi chùa cổ nhất Cao Bằng, tương truyền có từ thời Lý. Chùa nổi tiếng với đôi chuông đúc năm 1611 thời nhà Mạc, được công nhận Bảo vật quốc gia năm 2016.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Da Quan Pagoda (Vien Minh Temple)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Đà Quận, tên chữ là Viên Minh tự, nằm trong khu di tích chùa Đà Quận – đền Quan Triều thuộc xã Hưng Đạo, thành phố Cao Bằng. Theo sử sách, đây là một trong ba ngôi chùa cổ nhất của Cao Bằng.",
        },
        {
          heading: "Lịch sử",
          text: "Tương truyền chùa được xây dựng từ thời nhà Lý. Cuối thế kỷ XVI, khi nhà Mạc rút lên Cao Bằng đóng đô, chùa được trùng tu, xây dựng lại; đến thời Hậu Lê tiếp tục được tu bổ, mở rộng tiền đường và sửa sang Phật điện. Năm 2008, chùa Viên Minh và đền Quan Triều được xếp hạng di tích lịch sử văn hóa cấp tỉnh.",
        },
        {
          heading: "Đôi chuông Bảo vật quốc gia",
          text: "Chùa lưu giữ đôi chuông cổ đúc năm Tân Hợi 1611, niên hiệu Càn Thống thứ 19 thời nhà Mạc. Chuông chùa Viên Minh cao 1,60 m, đường kính miệng 0,95 m; chuông đền Quan Triều cao 1,78 m, đường kính miệng 1,06 m. Ngày 22 tháng 12 năm 2016, Thủ tướng Chính phủ công nhận đôi chuông là Bảo vật quốc gia (Quyết định 2496/QĐ-TTg). Hằng năm, hội chùa Đà Quận mở vào ngày mồng 9 tháng Giêng.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Da Quan Pagoda, formally Vien Minh Temple, lies within the Da Quan Pagoda – Quan Trieu Temple relic complex in Hung Dao commune, Cao Bang city. Historical records count it among the three oldest pagodas of Cao Bang.",
        },
        {
          heading: "History",
          text: "Tradition holds that the pagoda dates from the Ly dynasty. In the late 16th century, when the Mac dynasty withdrew to Cao Bang and made it their seat, the pagoda was rebuilt; under the Later Le dynasty it was further restored, its front hall enlarged and its Buddha hall refurbished. In 2008 Vien Minh Pagoda and Quan Trieu Temple were ranked as provincial historical-cultural relics.",
        },
        {
          heading: "National-treasure bells",
          text: "The pagoda preserves a pair of ancient bronze bells cast in 1611 (19th year of the Can Thong era under the Mac dynasty). The Vien Minh bell is 1.60 m tall with a 0.95 m mouth; the Quan Trieu bell is 1.78 m tall with a 1.06 m mouth. On 22 December 2016 the Prime Minister recognized the pair as National Treasures (Decision 2496/QD-TTg). The Da Quan pagoda festival opens annually on the 9th day of the first lunar month.",
        },
      ],
      references: [
        "https://ma.ussh.vnu.edu.vn/vi/nghien-cuu/chuong-dong/doi-chuong-chua-da-quan-khu-di-tich-chua-da-quan-tinh-cao-bang-93.html",
        "https://dulieuphapluat.vn/cong-cu/bao-vat-quoc-gia/doi-chuong-chua-da-quan-con-goi-la-chua-vien-minh.html",
      ],
    },
  },
  // -------------------------------------------------------------- Điện Biên
  {
    pagoda: {
      id: 90000011,
      slug: "thanh-ban-phu-den-hoang-cong-chat",
      name: "Thành Bản Phủ – Đền Hoàng Công Chất",
      province: "Điện Biên",
      lat: null,
      lng: null,
      description:
        "Di tích Thành Bản Phủ, người dân quen gọi là Đền Hoàng Công Chất, thuộc xã Noong Hẹt, huyện Điện Biên, cách trung tâm thành phố Điện Biên Phủ 8 km. Tòa thành do thủ lĩnh nông dân Hoàng Công Chất xây dựng năm 1758–1762 và được xếp hạng di tích quốc gia năm 1981.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Ban Phu Citadel – Hoang Cong Chat Temple",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Di tích Thành Bản Phủ (Đền Hoàng Công Chất) thuộc xã Noong Hẹt, huyện Điện Biên, tỉnh Điện Biên, cách trung tâm thành phố Điện Biên Phủ 8 km về phía nam, giữa cánh đồng Mường Thanh — vựa lúa lớn của vùng Tây Bắc.",
        },
        {
          heading: "Lịch sử",
          text: "Thế kỷ XVIII, sau khi lãnh đạo khởi nghĩa nông dân chống triều đình Lê – Trịnh ở vùng Thái Bình, tướng quân Hoàng Công Chất đưa nghĩa quân lên Tây Bắc, phối hợp với hai tướng địa phương là tướng Ngải và tướng Khanh đánh bại giặc Phẻ, giải phóng hoàn toàn đất Mường Thanh. Từ năm 1758 đến 1762, ông cùng nhân dân các dân tộc xây dựng thành Chiềng Lề (Thành Bản Phủ) làm căn cứ lâu dài. Thành rộng khoảng 80 mẫu, hình ngũ giác, tường đất cao 5 m, chân rộng 10 m, chia làm thành nội và thành ngoại. Năm 1981, di tích được xếp hạng di tích lịch sử văn hóa cấp quốc gia.",
        },
        {
          heading: "Đền thờ và lễ hội",
          text: "Trong khu thành nội, nhân dân lập đền thờ Hoàng Công Chất để tưởng nhớ công lao đánh đuổi giặc Phẻ, bảo vệ bản mường. Lễ hội đền Hoàng Công Chất được tổ chức vào ngày 24–25 tháng 2 âm lịch hằng năm, là lễ hội lớn của đồng bào các dân tộc lòng chảo Điện Biên.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "The Ban Phu Citadel relic, popularly known as Hoang Cong Chat Temple, lies in Noong Het commune, Dien Bien district, 8 km south of Dien Bien Phu city, amid the Muong Thanh valley — the great rice basket of the Northwest.",
        },
        {
          heading: "History",
          text: "In the 18th century, after leading a peasant uprising against the Le–Trinh court in the Thai Binh region, general Hoang Cong Chat brought his troops to the Northwest, joined forces with the local commanders Ngai and Khanh, defeated the invading Phe forces and fully liberated Muong Thanh. From 1758 to 1762 he and the local ethnic communities built the Chieng Le citadel (Ban Phu Citadel) as a lasting base. The pentagon-shaped citadel covered some 80 mau, with earthen walls 5 m high and 10 m thick at the base, divided into inner and outer precincts. In 1981 it was ranked as a national historical-cultural relic.",
        },
        {
          heading: "Temple and festival",
          text: "Within the inner citadel the people erected a temple to Hoang Cong Chat in gratitude for driving out the Phe invaders and protecting the region. The temple festival is held on the 24th–25th days of the second lunar month each year and is a major festival of the ethnic communities of the Dien Bien basin.",
        },
      ],
      references: [
        "http://huyendienbien.gov.vn/vanhoa/Tintuc/View/Gioi-thieu-Di-tich-lich-su-van-hoa-Thanh-Ban-Phu-xa-Noong-Het-huyen-Dien-Bien",
        "http://svhttdl.dienbien.gov.vn/portal/pages/2019-6-4/Thanh-Ban-Phu--Den-tho-Hoang-Cong-Chatpjfdwft82efu.aspx",
      ],
    },
  },
  {
    pagoda: {
      id: 90000012,
      slug: "den-tho-liet-si-dien-bien-phu",
      name: "Đền thờ Liệt sĩ tại Chiến trường Điện Biên Phủ",
      province: "Điện Biên",
      lat: null,
      lng: null,
      description:
        "Đền thờ Liệt sĩ tại Chiến trường Điện Biên Phủ tọa lạc trên di tích đồi F, phường Mường Thanh, thành phố Điện Biên Phủ, khánh thành ngày 18/5/2022. Công trình tri ân các liệt sĩ và đồng bào đã hy sinh tại chiến trường Điện Biên Phủ năm 1954.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Martyrs' Temple at the Dien Bien Phu Battlefield",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Đền thờ Liệt sĩ tại Chiến trường Điện Biên Phủ được xây dựng trên di tích đồi F, phường Mường Thanh, thành phố Điện Biên Phủ — một trong 45 điểm di tích thành phần thuộc quần thể Di tích quốc gia đặc biệt Chiến trường Điện Biên Phủ.",
        },
        {
          heading: "Lịch sử",
          text: "Đồi F là ngọn đồi từng chứng kiến những trận đánh ác liệt nhất của Quân đội nhân dân Việt Nam trong chiến dịch Điện Biên Phủ năm 1954. Công trình đền thờ được khánh thành ngày 18 tháng 5 năm 2022 với tổng vốn xây dựng 105 tỷ đồng, nhằm tri ân các anh hùng liệt sĩ và đồng bào cả nước đã hy sinh tại chiến trường Điện Biên Phủ.",
        },
        {
          heading: "Kiến trúc",
          text: "Tổng thể đền rộng gần 5 ha, kế thừa bố cục kiến trúc truyền thống với ba lớp không gian chính: không gian dẫn nhập, không gian tưởng niệm với sân tĩnh tâm và hồ tưởng niệm, và không gian tâm linh — đền thờ chính bằng kết cấu gỗ truyền thống. Du khách lên dâng hương qua 199 bậc đá; hai bên đường vòng là những bức phù điêu tạo hình từ các lỗ đạn, gợi nhớ sự khốc liệt của chiến tranh.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "The Martyrs' Temple at the Dien Bien Phu Battlefield stands on the Hill F relic in Muong Thanh ward, Dien Bien Phu city — one of the 45 component sites of the Dien Bien Phu Battlefield special national relic complex.",
        },
        {
          heading: "History",
          text: "Hill F witnessed some of the fiercest fighting of the Vietnam People's Army during the 1954 Dien Bien Phu campaign. The temple was inaugurated on 18 May 2022 at a construction cost of 105 billion VND, honoring the fallen soldiers and civilians of the Dien Bien Phu battlefield.",
        },
        {
          heading: "Architecture",
          text: "The nearly 5-hectare complex follows traditional layered temple planning with three main spaces: an introductory space, a commemorative space with a contemplation courtyard and memorial lake, and the spiritual space — the main shrine built with a traditional timber structure. Visitors ascend 199 stone steps to offer incense; flanking relief walls patterned with bullet holes evoke the ferocity of the battle.",
        },
      ],
      references: [
        "https://www.vietnamplus.vn/den-tho-liet-sy-dien-bien-phu-tri-an-nhung-anh-hung-nga-xuong-vi-doc-lap-post942014.vnp",
        "http://svhttdl.dienbien.gov.vn/portal/pages/2022-5-18/Khanh-thanh-Den-tho-Liet-sy-tai-Chien-truong-Dien-emvrfkv0zp5i.aspx",
      ],
    },
  },
  // --------------------------------------------------------------- Hà Giang
  {
    pagoda: {
      id: 90000013,
      slug: "chua-sung-khanh",
      name: "Chùa Sùng Khánh",
      province: "Hà Giang",
      lat: null,
      lng: null,
      description:
        "Chùa Sùng Khánh thuộc thôn Làng Nùng, xã Đạo Đức, huyện Vị Xuyên, tỉnh Hà Giang, cách thành phố Hà Giang 9 km. Chùa được dựng năm 1356 thời Trần; tấm bia đá năm 1367 của chùa được công nhận Bảo vật quốc gia năm 2013.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Sung Khanh Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Sùng Khánh thuộc thôn Làng Nùng, xã Đạo Đức, huyện Vị Xuyên, tỉnh Hà Giang, nằm gần quốc lộ 2, cách thành phố Hà Giang 9 km. Chùa được khởi dựng từ tháng Giêng năm Bính Thân niên hiệu Thiệu Phong (1356) thời Trần và hoàn thành vào rằm tháng Tư cùng năm.",
        },
        {
          heading: "Bảo vật quốc gia",
          text: "Trải qua biến cố, kiến trúc thời Trần và lần trùng tu thời Lê của chùa đã đổ nát; hiện chùa còn lưu giữ hai tấm bia đá và một quả chuông cổ. Đáng chú ý nhất là tấm bia dựng năm 1367 dưới triều vua Trần Dụ Tông, tạc bằng đá xanh nguyên khối đặt trên lưng rùa đá, trán bia khắc hình Phật A Di Đà ngự tòa sen cùng đôi rồng chầu — tổ hợp trang trí chưa từng thấy trên bia thời Trần nào khác; văn bia còn có chữ Nôm. Tấm bia được công nhận Bảo vật quốc gia năm 2013. Quả chuông đồng đúc năm 1704 (thời Lê Hy Tông), cao 0,90 m, đường kính miệng 0,67 m, với các phù điêu hình người đắp nổi trấn tám hướng, cũng được công nhận Bảo vật quốc gia.",
        },
        {
          heading: "Giá trị",
          text: "Bia đá chùa Sùng Khánh là nguồn sử liệu quý về địa danh, lịch sử và chữ viết thời Trần, minh chứng cho ảnh hưởng của Phật giáo và sự quản lý chặt chẽ vùng biên viễn của chính quyền trung ương đương thời. Chùa được xếp hạng di tích quốc gia năm 1993.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Sung Khanh Pagoda is located in Lang Nung hamlet, Dao Duc commune, Vi Xuyen district, Ha Giang province, near National Route 2 and 9 km from Ha Giang city. It was founded in the first lunar month of 1356 (Thieu Phong era, Tran dynasty) and completed by the full moon of the fourth month that year.",
        },
        {
          heading: "National treasures",
          text: "The Tran-era structure and its Le-dynasty restoration have long crumbled; the pagoda now preserves two stone steles and an ancient bell. Most notable is the 1367 stele erected under King Tran Du Tong, carved from a single block of blue stone on a stone turtle. Its tympanum depicts Amitabha Buddha on a lotus throne flanked by paired dragons — a decorative scheme found on no other known Tran stele — and its inscription contains early Nom script. It was recognized as a National Treasure in 2013. The bronze bell cast in 1704 under King Le Hy Tong, 0.90 m tall with a 0.67 m mouth and guarded by embossed human figures at the eight directions, is also a recognized National Treasure.",
        },
        {
          heading: "Significance",
          text: "The Sung Khanh stele is a precious source on Tran-dynasty toponymy, history and writing, attesting to the reach of Buddhism and the central government's firm administration of the frontier. The pagoda was ranked a national relic in 1993.",
        },
      ],
      references: [
        "http://tuyengiao.hagiang.gov.vn/thong-tin-chuyen-de/du-lich/di-tich-chuong-va-bia-chua-sung-khanh6.html",
        "https://www.tapchinghiencuuphathoc.vn/hai-bao-vat-quoc-gia-o-chua-sung-khanh-va-chua-binh-lam-huyen-vi-xuyen-tinh-ha-giang.html",
      ],
    },
  },
  {
    pagoda: {
      id: 90000014,
      slug: "chua-binh-lam",
      name: "Chùa Bình Lâm",
      province: "Hà Giang",
      lat: null,
      lng: null,
      description:
        "Chùa Bình Lâm thuộc thôn Mường Nam, xã Phú Linh, huyện Vị Xuyên, tỉnh Hà Giang, nổi tiếng với quả chuông đồng đúc năm 1295 thời vua Trần Anh Tông — một trong những quả chuông có niên đại sớm nhất Việt Nam, được công nhận Bảo vật quốc gia năm 2013.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Binh Lam Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Bình Lâm thuộc thôn Mường Nam, xã Phú Linh, huyện Vị Xuyên, tỉnh Hà Giang. Theo minh văn trên chuông, chùa có từ thời Trần, thuộc châu Bà Đồng Thượng, giáp giới phía Bắc trường Phú Linh của nước Đại Việt.",
        },
        {
          heading: "Chuông Bảo vật quốc gia",
          text: "Chuông chùa Bình Lâm được đúc vào giờ Ngọ, ngày rằm tháng 3 năm Ất Mùi (1295) đời vua Trần Anh Tông, do thủ lĩnh địa phương Nguyễn Anh cùng vợ là Nguyễn Thị Ninh và thiện nam tín nữ góp của đúc thành. Chuông cao 101 cm, đường kính miệng 59 cm, nặng 193 kg; quai chuông đúc nổi đôi rồng đấu thân phủ vẩy cá chép, đỉnh quai trang trí búp sen; thân chuông khắc ba chữ Hán lớn \u201cPhụng Tam bảo\u201d. Ngày 30 tháng 12 năm 2013, chuông được Thủ tướng Chính phủ công nhận Bảo vật quốc gia (Quyết định 2599/QĐ-TTg).",
        },
        {
          heading: "Giá trị",
          text: "Bài minh trên chuông là văn bản văn chương gốc thời Trần, phản ánh sự dung hợp Tam giáo Nho – Phật – Đạo và vai trò của Phật giáo trong việc củng cố khối đoàn kết dân tộc nơi biên viễn dưới triều Trần. Đây là một trong những quả chuông có niên đại sớm nhất được biết ở Việt Nam.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Binh Lam Pagoda is located in Muong Nam hamlet, Phu Linh commune, Vi Xuyen district, Ha Giang province. According to the bell's inscription, the pagoda dates to the Tran dynasty, in the upper Ba Dong district on the northern edge of Phu Linh of Dai Viet.",
        },
        {
          heading: "National-treasure bell",
          text: "The Binh Lam bell was cast at noon on the full moon of the third month of the At Mui year (1295), under King Tran Anh Tong, funded by the local chief Nguyen Anh, his wife Nguyen Thi Ninh and lay devotees. It is 101 cm tall with a 59 cm mouth and weighs 193 kg; its handle is formed by two intertwined carp-scaled dragons crowned with a lotus bud, and the body bears three large Chinese characters meaning \u201cIn service of the Three Jewels\u201d. On 30 December 2013 the Prime Minister recognized it as a National Treasure (Decision 2599/QD-TTg).",
        },
        {
          heading: "Significance",
          text: "The bell's inscription is an original piece of Tran-dynasty literature reflecting the era's blend of Confucianism, Buddhism and Taoism and the role of Buddhism in binding frontier communities to the Tran court. It is among the earliest dated bells known in Vietnam.",
        },
      ],
      references: [
        "https://ma.ussh.vnu.edu.vn/vi/nghien-cuu/chuong-dong/chuong-chua-binh-lam-81.html",
        "http://dsvh.gov.vn/chuong-chua-binh-lam-3058",
      ],
    },
  },
  // -------------------------------------------------------------- Hậu Giang
  {
    pagoda: {
      id: 90000015,
      slug: "thien-vien-truc-lam-hau-giang",
      name: "Thiền viện Trúc Lâm Hậu Giang",
      province: "Hậu Giang",
      lat: null,
      lng: null,
      description:
        "Thiền viện Trúc Lâm Hậu Giang tọa lạc tại ngã ba Vĩnh Tường, phường Vĩnh Tường, thị xã Long Mỹ, tỉnh Hậu Giang, khánh thành năm 2018. Quần thể 16 hạng mục trên hơn 4 ha mang phong cách mỹ thuật Phật giáo thời Lý – Trần, thuộc thiền phái Trúc Lâm Yên Tử.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Truc Lam Hau Giang Zen Monastery",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Thiền viện Trúc Lâm Hậu Giang tọa lạc tại ngã ba Vĩnh Tường, phường Vĩnh Tường, thị xã Long Mỹ, tỉnh Hậu Giang. Đây là nơi tu tập theo thiền phái Trúc Lâm Yên Tử — dòng thiền do vua Trần Nhân Tông khai mở, mang đậm bản sắc văn hóa dân tộc Việt Nam.",
        },
        {
          heading: "Lịch sử",
          text: "Thiền viện được khánh thành năm 2018 sau hơn ba năm thi công, với 16 hạng mục xây dựng trên diện tích hơn 4 ha, tổng mức đầu tư khoảng 300 tỷ đồng. Đây là nơi tu hành, sinh hoạt tôn giáo của hơn 250 chức sắc, tăng, ni trong vùng.",
        },
        {
          heading: "Kiến trúc",
          text: "Quần thể được xây dựng theo phong cách mỹ thuật Phật giáo thời Lý – Trần, gồm cổng tam quan, chánh điện, nhà Tổ, tôn tượng Quan Âm lộ thiên, miếu thờ Mẹ Âu Cơ, lầu chuông, lầu trống, giảng đường, trai đường, thư viện cùng tăng xá, ni xá. Mái lợp ngói đỏ, khung cột bằng gỗ lim, vách tường và lối đi lát gạch tàu — tạo thành điểm nhấn du lịch văn hóa tâm linh của tỉnh Hậu Giang.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Truc Lam Hau Giang Zen Monastery stands at the Vinh Tuong junction in Vinh Tuong ward, Long My town, Hau Giang province. It follows the Truc Lam Yen Tu Zen school founded by King Tran Nhan Tong, a tradition deeply rooted in Vietnamese culture.",
        },
        {
          heading: "History",
          text: "The monastery was inaugurated in 2018 after more than three years of construction, with 16 building complexes on over 4 hectares and an investment of about 300 billion VND. It serves as the place of practice for more than 250 clergy, monks and nuns of the region.",
        },
        {
          heading: "Architecture",
          text: "The complex follows the Buddhist artistic style of the Ly and Tran dynasties, comprising a three-entrance gate, main hall, patriarch house, an open-air Avalokitesvara statue, a shrine to Mother Au Co, bell and drum towers, lecture and dining halls, a library and monastic quarters. Red-tiled roofs, ironwood columns and brick-paved paths make it a spiritual-tourism landmark of Hau Giang province.",
        },
      ],
      references: [
        "https://phatgiao.org.vn/kham-pha-kien-truc-doc-dao-cung-nhung-gia-tri-truyen-thong-tai-thien-vien-truc-lam-hau-giang-d79594.html",
        "https://triphunter.vn/places/hau-giang/items/thien-vien-truc-lam-hau-giang",
      ],
    },
  },
  {
    pagoda: {
      id: 90000016,
      slug: "gia-lam-co-tu",
      name: "Già Lam Cổ Tự",
      province: "Hậu Giang",
      lat: null,
      lng: null,
      description:
        "Già Lam Cổ Tự tọa lạc tại ấp Xẻo Vong C, xã Hiệp Lợi, thành phố Ngã Bảy, tỉnh Hậu Giang, xây dựng năm 1940. Với khoảng 145 pho tượng Phật, La Hán trong khuôn viên, đây được xem là ngôi chùa có nhiều tượng nhất miền Tây, mang kiến trúc kiểu Ấn Độ độc đáo.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Gia Lam Ancient Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Già Lam Cổ Tự tọa lạc tại ấp Xẻo Vong C, xã Hiệp Lợi, thành phố Ngã Bảy, tỉnh Hậu Giang, trên khuôn viên rộng khoảng 2.376 m². Chùa theo hệ phái Bắc tông, mang quần thể kiến trúc kiểu Ấn Độ độc đáo hiếm thấy ở miền Tây Nam Bộ.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được Hòa thượng Thích Huệ Đức sáng lập năm 1940, ban đầu mang tên Quan Thánh Đế, đến năm 1970 đổi thành Già Lam Cổ Tự. Từ năm 1988, chùa do Hòa thượng Thích Huệ Sanh trụ trì. Ngoài thờ Đức Phật Thích Ca Mâu Ni, chùa còn thờ Quan Thánh Đế (Quan Công) — dấu ấn của tên gọi ban đầu. Tương truyền năm 1964, một Phật tử đã cúng dường khoản tiền lớn để đúc tượng ngựa Xích Thố đặt trước sân chùa.",
        },
        {
          heading: "Kiến trúc và tượng",
          text: "Khuôn viên chùa trưng bày khoảng 145 pho tượng Phật, Bồ Tát, La Hán lớn nhỏ — nhiều nhất miền Tây — trong đó nổi bật là tượng Phật Thích Ca nhập niết bàn dài 14 m, tượng Quan Âm cao 12 m, quang cảnh vườn Lâm Tỳ Ni và vườn Lộc Uyển. Trong chánh điện có tượng Quan Công, thập bát La Hán và thập điện Minh Vương, mỗi bức là một tuyệt tác nghệ thuật gắn với điển tích nhà Phật.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Gia Lam Ancient Pagoda is located in Xeo Vong C hamlet, Hiep Loi commune, Nga Bay city, Hau Giang province, on grounds of about 2,376 m². A Northern-school (Mahayana) temple, it features a distinctive Indian-influenced architectural ensemble rare in the Mekong Delta.",
        },
        {
          heading: "History",
          text: "The pagoda was founded in 1940 by Venerable Thich Hue Duc, initially named Quan Thanh De; in 1970 it was renamed Gia Lam Co Tu. Since 1988 it has been led by Venerable Thich Hue Sanh. Besides Shakyamuni Buddha, it venerates Quan Thanh De (Guan Yu) — a legacy of its original name. Tradition holds that in 1964 a devotee donated a large sum to cast the statue of the red steed Xich Tho that stands before the courtyard.",
        },
        {
          heading: "Architecture and statuary",
          text: "The grounds display about 145 statues of Buddhas, bodhisattvas and arhats — the most of any pagoda in the Mekong Delta — including a 14 m reclining Buddha, a 12 m Avalokitesvara, and tableaux of the Lumbini and Deer Park gardens. The main hall houses statues of Guan Yu, the eighteen arhats and the ten Kings of Hell, each considered an artistic masterpiece tied to Buddhist lore.",
        },
      ],
      references: [
        "https://sgtt.thesaigontimes.vn/ngoi-chua-mang-kien-truc-an-do-co-hang-tram-pho-tuong-o-hau-giang/",
        "https://phatgiao.org.vn/gia-lam-co-tu-ngoi-chua-co-hang-tram-pho-tuong-chi-motthay-tru-tritrong-nom-d34563.html",
      ],
    },
  },
  // ---------------------------------------------------------------- Kon Tum
  {
    pagoda: {
      id: 90000017,
      slug: "to-dinh-bac-ai",
      name: "Tổ đình Bác Ái",
      province: "Kon Tum",
      lat: null,
      lng: null,
      description:
        "Tổ đình Bác Ái tọa lạc tại trung tâm thành phố Kon Tum, xây dựng năm 1932–1933, là ngôi chùa đầu tiên của Kon Tum và cả Tây Nguyên. Chùa mang phong cách kiến trúc cung đình Huế, được triều đình Bảo Đại sắc tứ, còn lưu giữ Đại hồng chung đúc năm 1826.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Bac Ai Patriarch Temple",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Tổ đình Bác Ái tọa lạc ngay trung tâm thành phố Kon Tum, là công trình kiến trúc Phật giáo có mặt sớm nhất ở Kon Tum nói riêng và Tây Nguyên nói chung.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được khởi dựng năm 1932 (năm Bảo Đại thứ 8) dưới sự chủ trì của quan quản đạo Võ Chuẩn và hoàn thành năm 1933, với tên \u201cSắc tứ Bác Ái tự\u201d do triều đình Huế ân ban. Năm 1935, triều đình khâm ban \u201cBảo Quốc Huân Chương\u201d cho ngài Từ Vân — vị trụ trì đầu tiên. Năm 1955, chùa đổi tên thành Tổ đình Bác Ái. Đây là ngôi chùa cổ nhất tỉnh Kon Tum và của cao nguyên Trung phần thời bấy giờ.",
        },
        {
          heading: "Kiến trúc và cổ vật",
          text: "Chùa được xây theo hướng Bắc – Nam, kiểu chữ Môn, gồm chánh điện, Đông lang, Tây lang và cổng tam quan, mô phỏng kiến trúc cung đình Huế đầu thế kỷ XX. Chùa thờ Tam giáo đồng nguyên — Phật giáo, Đạo giáo và tín ngưỡng dân gian. Chùa còn lưu giữ nhiều di vật, cổ vật thời Nguyễn, tiêu biểu là Đại hồng chung đúc năm 1826, gần 200 năm tuổi, đang được lập hồ sơ đề nghị công nhận Bảo vật quốc gia.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Bac Ai Patriarch Temple stands in the heart of Kon Tum city and is the earliest Buddhist architectural work in Kon Tum and the Central Highlands as a whole.",
        },
        {
          heading: "History",
          text: "The temple was begun in 1932 (8th year of Bao Dai) under the direction of the provincial administrator Vo Chuan and completed in 1933, receiving the royally conferred name \u201cSac tu Bac Ai tu\u201d from the Hue court. In 1935 the court bestowed the \u201cBao Quoc Huan Chuong\u201d (National Protection Medal) on Tu Van, its first abbot. In 1955 it was renamed To dinh (Patriarch Temple) Bac Ai. It is the oldest pagoda of Kon Tum province and of the Central Highlands of its era.",
        },
        {
          heading: "Architecture and antiquities",
          text: "Built on a north–south axis in the \u201cMon\u201d character plan — main hall flanked by east and west wings with a three-entrance gate — the temple emulates early-20th-century Hue court architecture. It venerates the Three Teachings: Buddhism, Taoism and folk belief. Among its many Nguyen-dynasty relics, the most notable is the great bell cast in 1826, nearly 200 years old, currently being nominated for National Treasure status.",
        },
      ],
      references: [
        "https://tienphong.vn/chiem-nguong-net-co-kinh-cua-ngoi-chua-dau-tien-tai-tay-nguyen-post1714741.tpo",
        "http://lienvietkontum.quangngai.edu.vn/Uploads/files/BAC%20AI%20TU.pdf",
      ],
    },
  },
  {
    pagoda: {
      id: 90000018,
      slug: "chua-khanh-lam",
      name: "Chùa Khánh Lâm",
      province: "Kon Tum",
      lat: null,
      lng: null,
      description:
        "Chùa Khánh Lâm nằm trên đồi nguyên sinh cao hơn 1.200 m trong khu du lịch sinh thái Măng Đen, xã Đắk Long, huyện Kon Plông, tỉnh Kon Tum. Khởi công năm 2012, chùa là điểm du lịch tâm linh nổi bật giữa rừng thông Măng Đen — nơi được ví như \u201cĐà Lạt thứ hai\u201d.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Khanh Lam Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Khánh Lâm tọa lạc trên một ngọn đồi nguyên sinh cao hơn 1.200 m so với mực nước biển, trong khu du lịch sinh thái Măng Đen, xã Đắk Long, huyện Kon Plông, tỉnh Kon Tum, cách thành phố Kon Tum khoảng 55–60 km về phía Đông Bắc.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được khởi công xây dựng ngày 7 tháng 3 năm 2012 theo tâm nguyện của Đại đức Thích Nhuận Bảo, với sự đóng góp của Phật tử và doanh nghiệp trong, ngoài tỉnh. Tên \u201cKhánh Lâm\u201d được ghép từ Tổ đình Trung Khánh — nơi thầy xuất thân — và chùa Phước Lâm — nơi thầy từng trụ trì.",
        },
        {
          heading: "Cảnh quan",
          text: "Nhìn từ xa, chùa hiện lên uy nghi giữa rừng thông xanh thẳm với mái ngói đỏ ba tầng ẩn hiện trong sương. Khí hậu Măng Đen mát mẻ quanh năm (18–22°C) khiến vùng đất này được ví như \u201cĐà Lạt thứ hai\u201d của Tây Nguyên. Kiến trúc chùa hài hòa giữa tinh hoa Phật giáo và bản sắc văn hóa các dân tộc Tây Nguyên, là điểm dừng chân quen thuộc của du khách khi đến Măng Đen.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Khanh Lam Pagoda sits on a primeval hill more than 1,200 m above sea level in the Mang Den eco-tourism area, Dak Long commune, Kon Plong district, Kon Tum province, about 55–60 km northeast of Kon Tum city.",
        },
        {
          heading: "History",
          text: "Construction began on 7 March 2012 at the initiative of Venerable Thich Nhuan Bao, with contributions from devotees and businesses inside and outside the province. The name \u201cKhanh Lam\u201d combines To dinh Trung Khanh — where the monk trained — and Phuoc Lam Pagoda — where he once served as abbot.",
        },
        {
          heading: "Setting",
          text: "Seen from afar, the pagoda rises imposingly among deep-green pine forests, its three-tiered red-tiled roofs drifting in and out of the mist. Mang Den's cool year-round climate (18–22°C) has earned it the nickname \u201cthe second Da Lat\u201d of the Central Highlands. The architecture blends Buddhist tradition with the cultural identity of the Highlands peoples, making the pagoda a favorite stop for visitors to Mang Den.",
        },
      ],
      references: [
        "https://namthientravel.com.vn/chua-khanh-lam-mang-den/",
        "https://mangdenlife.com/chua-khanh-lam",
      ],
    },
  },
  // --------------------------------------------------------------- Lai Châu
  {
    pagoda: {
      id: 90000019,
      slug: "den-tho-vua-le-thai-to-lai-chau",
      name: "Đền thờ vua Lê Thái Tổ và bia Lê Lợi",
      province: "Lai Châu",
      lat: null,
      lng: null,
      description:
        "Quần thể di tích quốc gia Đền thờ vua Lê Thái Tổ và bia Lê Lợi thuộc xã Lê Lợi và Pú Đao, huyện Nậm Nhùn, tỉnh Lai Châu, bên bờ sông Đà. Bia khắc bút tích vua Lê Lợi năm 1431 được công nhận Bảo vật quốc gia năm 2016.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "King Le Thai To Temple and the Le Loi Stele",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Quần thể đền thờ vua Lê Thái Tổ và bia vua Lê Thái Tổ (bia Lê Lợi) nằm cách trung tâm thành phố Lai Châu 110 km về phía Tây Nam, thuộc địa phận xã Lê Lợi và xã Pú Đao, huyện Nậm Nhùn, tỉnh Lai Châu, bên hồ thủy điện trên sông Đà.",
        },
        {
          heading: "Lịch sử",
          text: "Năm 1431, sau khi thân chinh dẹp cuộc nổi loạn của tù trưởng Đèo Cát Hãn và bình định vùng Tây Bắc, vua Lê Lợi cho tạc bút tích vào vách đá Pú Huổi Chỏ bên bờ Bắc sông Đà để lưu lại sự kiện — sử cũ gọi là \u201cBia Cổ hoài lai\u201d. Bia được công nhận di tích cấp quốc gia năm 1981. Khi xây dựng nhà máy thủy điện Sơn La, phần bút tích được khoan cắt khỏi vách đá thành khối đá nặng trên 15 tấn và năm 2012 di dời về khuôn viên đền thờ vua Lê Thái Tổ, cách vị trí cũ 500 m.",
        },
        {
          heading: "Bảo vật quốc gia",
          text: "Bia Lê Lợi là hiện vật gốc độc bản gắn với sự nghiệp của anh hùng dân tộc Lê Lợi, được Thủ tướng Chính phủ công nhận Bảo vật quốc gia đợt 5 theo Quyết định 2496/QĐ-TTg ngày 22 tháng 12 năm 2016. Đền thờ tọa lạc trên ngọn núi cao bên hồ, là điểm đến tâm linh tiêu biểu của tỉnh Lai Châu.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "The national relic complex of the King Le Thai To temple and the Le Loi stele lies 110 km southwest of Lai Chau city, in Le Loi and Pu Dao communes, Nam Nhun district, on the banks of the Da river reservoir.",
        },
        {
          heading: "History",
          text: "In 1431, after personally leading campaigns to quell the revolt of the chieftain Deo Cat Han and pacify the Northwest, King Le Loi had an inscription carved into the Pu Huoi Cho cliff on the northern bank of the Da river to record the event — known in old chronicles as the \u201cBia Co hoai lai\u201d. The stele was recognized as a national relic in 1981. During construction of the Son La hydropower plant, the inscribed section was cut from the cliff as a block weighing over 15 tonnes and in 2012 relocated to the grounds of the Le Thai To temple, 500 m from its original site.",
        },
        {
          heading: "National treasure",
          text: "The Le Loi stele, a unique original artifact tied to the career of the national hero Le Loi, was recognized as a National Treasure in the fifth round by Prime Ministerial Decision 2496/QD-TTg of 22 December 2016. The temple, set on a high hill beside the reservoir, is a leading spiritual destination of Lai Chau province.",
        },
      ],
      references: [
        "https://namnhun.laichau.gov.vn/den-tho-le-thai-to",
        "https://laichau.gov.vn/du-khach/bao-vat-quoc-gia-bia-vua-le-thai-to.html",
      ],
    },
  },
  // ---------------------------------------------------------------- Lào Cai
  {
    pagoda: {
      id: 90000020,
      slug: "den-bao-ha",
      name: "Đền Bảo Hà",
      province: "Lào Cai",
      lat: 22.170505,
      lng: 104.352523,
      description:
        "Đền Bảo Hà, còn gọi là đền Ông Hoàng Bảy, nằm dưới chân đồi Cấm bên sông Hồng thuộc xã Bảo Hà, huyện Bảo Yên, tỉnh Lào Cai. Đền thờ danh tướng Nguyễn Hoàng Bảy — vị thần vệ quốc trấn giữ biên cương, được công nhận di tích lịch sử cấp quốc gia năm 1997.",
      image: null,
      thumbnail: null,
      wikipediaUrl: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%81n_B%E1%BA%A3o_H%C3%A0",
    },
    details: {
      nameEn: "Bao Ha Temple",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Đền Bảo Hà, còn gọi là đền Ông Hoàng Bảy, tọa lạc dưới chân đồi Cấm, bên bờ sông Hồng, thuộc xã Bảo Hà, huyện Bảo Yên, tỉnh Lào Cai. Đây là một trong những ngôi đền linh thiêng và nổi tiếng nhất vùng Tây Bắc, gắn với tín ngưỡng thờ Mẫu Tứ phủ của người Việt.",
        },
        {
          heading: "Lịch sử",
          text: "Theo truyền tích, vào cuối thời Lê, danh tướng Nguyễn Hoàng Bảy được triều đình cử lên trấn giữ vùng biên ải Bảo Hà – Khau Bàn, đánh đuổi giặc phương Bắc, chiêu dụ các thổ ty, tù trưởng và nhân dân khai khẩn đất đai, lập làng bản. Ông hy sinh trong một trận chiến không cân sức; thi thể trôi theo sông Hồng dạt vào bờ Bảo Hà, được nhân dân an táng và lập đền thờ. Các triều vua Nguyễn sau này sắc phong ông danh hiệu \u201cTrấn an hiển liệt\u201d thần vệ quốc. Trong hệ thống Tứ phủ, ông là Ông Hoàng Bảy — một trong những vị thánh hoàng được thờ phụng rộng rãi nhất.",
        },
        {
          heading: "Di tích và lễ hội",
          text: "Đền Bảo Hà được công nhận di tích lịch sử – văn hóa cấp quốc gia năm 1997. Lễ hội chính của đền diễn ra vào ngày 17 tháng 7 âm lịch — ngày giỗ Ông Hoàng Bảy — thu hút hàng vạn du khách thập phương về dâng hương, đặc biệt đông vào dịp đầu xuân.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Bao Ha Temple, also known as the Temple of Lord Hoang Bay, stands at the foot of Cam hill on the bank of the Red River in Bao Ha commune, Bao Yen district, Lao Cai province. It is one of the most venerated temples of the Northwest, central to the Vietnamese Four Palaces (Tu phu) Mother Goddess tradition.",
        },
        {
          heading: "History",
          text: "According to tradition, in the late Le dynasty the general Nguyen Hoang Bay was dispatched to defend the Bao Ha – Khau Ban frontier, repelling northern invaders and rallying local chieftains and settlers to open the land and found villages. He fell in an unequal battle; his body drifted down the Red River and came ashore at Bao Ha, where the people buried him and raised a temple. Later Nguyen kings conferred on him the title of nation-guarding deity. In the Four Palaces pantheon he is Ong Hoang Bay, one of the most widely worshipped princely spirits.",
        },
        {
          heading: "Relic and festival",
          text: "Bao Ha Temple was recognized as a national historical-cultural relic in 1997. Its main festival falls on the 17th day of the seventh lunar month — the death anniversary of Ong Hoang Bay — drawing tens of thousands of pilgrims, with especially large crowds in early spring.",
        },
      ],
      references: [
        "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%81n_B%E1%BA%A3o_H%C3%A0",
        "https://laocai.gov.vn",
      ],
    },
  },
  {
    pagoda: {
      id: 90000021,
      slug: "kim-son-bao-thang-tu",
      name: "Kim Sơn Bảo Thắng Tự",
      province: "Lào Cai",
      lat: null,
      lng: null,
      description:
        "Kim Sơn Bảo Thắng Tự tọa lạc gần đỉnh Fansipan ở độ cao 3.091 m, thị xã Sa Pa, tỉnh Lào Cai. Chùa được thiết kế theo kiến trúc thời Trần với nhà Tam bảo, nhà Tổ và hai dãy hành lang, là quần thể tâm linh cao nhất Việt Nam trên \u201cnóc nhà Đông Dương\u201d.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Kim Son Bao Thang Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Kim Sơn Bảo Thắng Tự tọa lạc ở độ cao 3.091 m, gần đỉnh Fansipan — \u201cnóc nhà Đông Dương\u201d — thuộc thị xã Sa Pa, tỉnh Lào Cai, trong quần thể du lịch Sun World Fansipan Legend.",
        },
        {
          heading: "Kiến trúc",
          text: "Chùa được thiết kế theo lối kiến trúc chùa Việt thời Trần, gồm nhà Tam bảo năm gian, nhà Tổ và hai dãy hành lang, xây dựng men theo địa thế núi đá của đỉnh Fansipan. Vật liệu chủ đạo là gỗ và ngói đất nung tráng men; bố cục \u201ctiền Phật hậu Thánh\u201d với khu trung tâm đặt nhiều pho tượng Phật theo nghi quỹ Bắc tông.",
        },
        {
          heading: "Cảnh quan",
          text: "Nằm giữa biển mây và không gian hùng vĩ của dãy Hoàng Liên Sơn, chùa mang vẻ đẹp bồng lai, là điểm chiêm bái của du khách sau hành trình cáp treo và leo bậc đá lên đỉnh Fansipan. Từ sân chùa có thể phóng tầm mắt bao quát toàn cảnh thung lũng Mường Hoa và núi rừng Tây Bắc.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Kim Son Bao Thang Pagoda sits at 3,091 m near the summit of Fansipan — the \u201croof of Indochina\u201d — in Sa Pa town, Lao Cai province, within the Sun World Fansipan Legend complex.",
        },
        {
          heading: "Architecture",
          text: "The pagoda follows Tran-dynasty Vietnamese temple architecture, with a five-bay Tam Bao hall, a patriarch house and two corridor wings, built to hug the rocky terrain of the Fansipan summit. Its main materials are timber and glazed terracotta tiles; the layout places the Buddha in front and the Saints behind, with the central space housing numerous Buddha statues arranged by Northern-school convention.",
        },
        {
          heading: "Setting",
          text: "Rising amid seas of clouds in the majestic Hoang Lien Son range, the pagoda has an otherworldly beauty and is a place of worship for visitors after the cable-car ride and stone-step climb to the summit. From its courtyard one can survey the Muong Hoa valley and the forests of the Northwest.",
        },
      ],
      references: [
        "https://sunworld.vn/vi/fansipan/check-in/kim-son-bao-thang-tu",
        "https://captreofansipan.com/kim-son-bao-thang-tu/",
      ],
    },
  },
  // ------------------------------------------------------------- Ninh Thuận
  {
    pagoda: {
      id: 90000022,
      slug: "thien-vien-truc-lam-vien-ngo",
      name: "Thiền viện Trúc Lâm Viên Ngộ",
      province: "Ninh Thuận",
      lat: null,
      lng: null,
      description:
        "Thiền viện Trúc Lâm Viên Ngộ tọa lạc lưng chừng núi Đá Chồng, thị trấn Khánh Hải, huyện Ninh Hải, tỉnh Ninh Thuận, cách Phan Rang – Tháp Chàm 5 km. Đặt đá xây dựng năm 2008, đây là thiền viện lớn nhất tỉnh Ninh Thuận, lưng tựa núi, mặt hướng biển Ninh Chữ.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Truc Lam Vien Ngo Zen Monastery",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Thiền viện Trúc Lâm Viên Ngộ tọa lạc lưng chừng núi Đá Chồng (tên chữ Phụng Sơn), thị trấn Khánh Hải, huyện Ninh Hải, tỉnh Ninh Thuận, cách thành phố Phan Rang – Tháp Chàm khoảng 5 km về hướng Đông Bắc. Đây là thiền viện lớn nhất tỉnh Ninh Thuận.",
        },
        {
          heading: "Lịch sử",
          text: "Thiền viện làm lễ đặt đá xây dựng ngày 6 tháng 12 năm 2008, thuộc thiền phái Trúc Lâm. Điện Phật tôn trí tượng Đức Phật Thích Ca cùng Bồ Tát Văn Thù và Bồ Tát Phổ Hiền. Cùng chùa Trùng Sơn và chùa Trùng Khánh, thiền viện tạo nên quần thể tâm linh gắn liền với biển Ninh Chữ – Bình Sơn.",
        },
        {
          heading: "Kiến trúc",
          text: "Thiền viện được xây dựng chủ yếu bằng đá và gỗ, chia hai khu Tăng viện và Ni viện riêng biệt, các mái chùa lưng tựa vào núi, mặt hướng ra biển. Tượng Phật và các khu thờ tự trải từ lưng chừng núi lên đến đỉnh, hài hòa với cảnh quan non nước, làng mạc, đồng ruộng và đầm phá của vùng đất nắng gió Ninh Thuận.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Truc Lam Vien Ngo Zen Monastery clings to the mid-slope of Da Chong mountain (Phung Son), in Khanh Hai town, Ninh Hai district, Ninh Thuan province, about 5 km northeast of Phan Rang – Thap Cham city. It is the largest Zen monastery in Ninh Thuan.",
        },
        {
          heading: "History",
          text: "The foundation stone was laid on 6 December 2008; the monastery belongs to the Truc Lam Zen school. Its Buddha hall enshrines Shakyamuni Buddha flanked by the bodhisattvas Manjushri and Samantabhadra. Together with Trung Son and Trung Khanh pagodas, it forms a spiritual ensemble linked to Ninh Chu – Binh Son beach.",
        },
        {
          heading: "Architecture",
          text: "Built mainly of stone and timber, the monastery is divided into separate monks' and nuns' quarters, its roofs backed against the mountain and facing the sea. Buddha statues and shrines climb from mid-slope to the summit, blending with the mountains, villages, rice fields and lagoons of sun-scorched Ninh Thuan.",
        },
      ],
      references: [
        "https://vnexpress.net/thien-vien-truc-lam-vien-ngo-tren-nui-da-chong-3163800.html",
        "https://phatgiao.vn/bai-viet/thien-vien-truc-lam-vien-ngo.html",
      ],
    },
  },
  // ---------------------------------------------------------------- Phú Thọ
  {
    pagoda: {
      id: 90000023,
      slug: "den-hung",
      name: "Đền Hùng",
      province: "Phú Thọ",
      lat: 21.3682242,
      lng: 105.3214424,
      description:
        "Đền Hùng là quần thể đền chùa thờ phụng các Vua Hùng trên núi Nghĩa Lĩnh, thành phố Việt Trì, tỉnh Phú Thọ — Di tích quốc gia đặc biệt, trung tâm thực hành Tín ngưỡng thờ cúng Hùng Vương được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại.",
      image: null,
      thumbnail: null,
      wikipediaUrl: "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%81n_H%C3%B9ng",
    },
    details: {
      nameEn: "Hung Kings Temple",
      wikipediaUrlEn: "https://en.wikipedia.org/wiki/H%C3%B9ng_Temple",
      sectionsVi: [
        {
          heading: null,
          text: "Đền Hùng (tên chữ: Hùng Vương miếu) là quần thể đền chùa thờ phụng các Vua Hùng và tôn thất trên núi Nghĩa Lĩnh, thuộc thành phố Việt Trì, tỉnh Phú Thọ — vùng đất cội nguồn của dân tộc Việt Nam.",
        },
        {
          heading: "Quần thể di tích",
          text: "Khu di tích gồm đền Hạ, chùa Thiên Quang, đền Trung, đền Thượng, lăng Hùng Vương, đền Giếng và đền Mẫu Âu Cơ, trải từ chân lên đỉnh núi Nghĩa Lĩnh cao 175 m. Tương truyền đền Trung là nơi các Vua Hùng cùng Lạc hầu, Lạc tướng bàn việc nước; đền Thượng là nơi thực hành các nghi lễ tế trời đất, thờ thần lúa. Khu di tích được xếp hạng Di tích quốc gia đặc biệt năm 2009.",
        },
        {
          heading: "Giỗ Tổ Hùng Vương",
          text: "Lễ Giỗ Tổ Hùng Vương diễn ra vào ngày 10 tháng 3 âm lịch hằng năm, là quốc lễ của Việt Nam, thu hút hàng triệu người hành hương về đất Tổ. Năm 2012, \u201cTín ngưỡng thờ cúng Hùng Vương ở Phú Thọ\u201d được UNESCO ghi danh là Di sản văn hóa phi vật thể đại diện của nhân loại.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "The Hung Kings Temple (Hung Vuong mieu) is a complex of temples and a pagoda venerating the legendary Hung Kings and their kin on Nghia Linh mountain in Viet Tri city, Phu Tho province — regarded as the ancestral land of the Vietnamese people.",
        },
        {
          heading: "The relic complex",
          text: "The complex comprises the Lower Temple, Thien Quang Pagoda, Middle Temple, Upper Temple, the Hung King mausoleum, the Well Temple and the Au Co Mother Temple, ranged from the foot to the 175 m summit of Nghia Linh mountain. Tradition holds that the Middle Temple was where the Hung Kings deliberated affairs of state with their lords, while the Upper Temple hosted rites to heaven, earth and the rice deity. The site was ranked a Special National Relic in 2009.",
        },
        {
          heading: "Hung Kings Commemoration",
          text: "The Hung Kings' death anniversary festival on the 10th day of the third lunar month is a national holiday of Vietnam, drawing millions of pilgrims to the ancestral land. In 2012 UNESCO inscribed the \u201cWorship of the Hung Kings in Phu Tho\u201d on the Representative List of the Intangible Cultural Heritage of Humanity.",
        },
      ],
      references: [
        "https://vi.wikipedia.org/wiki/%C4%90%E1%BB%81n_H%C3%B9ng",
        "https://ich.unesco.org/en/RL/worship-of-hung-kings-in-phu-tho-00735",
      ],
    },
  },
  {
    pagoda: {
      id: 90000024,
      slug: "chua-pho-quang-phu-tho",
      name: "Chùa Phổ Quang (Xuân Lũng)",
      province: "Phú Thọ",
      lat: null,
      lng: null,
      description:
        "Chùa Phổ Quang (chùa Xuân Lũng) tọa lạc tại xã Xuân Lũng, huyện Lâm Thao, tỉnh Phú Thọ, được dựng từ thời Trần, khoảng 800 năm tuổi. Chùa lưu giữ bàn thờ Phật bằng đá hoàn công năm 1387 — Bảo vật quốc gia được công nhận năm 2021.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Pho Quang Pagoda (Xuan Lung)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Phổ Quang, còn gọi là chùa Xuân Lũng, nằm trên gò đất thuộc xóm Chùa, xã Xuân Lũng, huyện Lâm Thao, tỉnh Phú Thọ, quay mặt về hướng Tây. Chùa được xây dựng vào thời Trần, đến nay khoảng 800 năm tuổi.",
        },
        {
          heading: "Kiến trúc",
          text: "Quần thể chùa gồm tam quan – gác chuông, nhà bia và tòa Tam bảo kiểu chữ Công với bái đường, thiêu hương và chính điện. Chùa được xếp hạng di tích cấp quốc gia; tòa Tam bảo và nhà bia được trùng tu, tôn tạo năm 2021.",
        },
        {
          heading: "Bàn thờ Phật bằng đá — Bảo vật quốc gia",
          text: "Trong chính điện đặt bàn thờ Phật bằng đá (bệ đá hoa sen hình hộp chữ nhật) cao hơn 1 m, rộng 1,25 m, dài 3,3 m, ghép từ các phiến đá xanh, nâng đỡ bộ tượng Tam thế. Bệ do Tiểu chi hầu Nguyễn Chiêu và vợ là bà Nguyễn Thị Sử cung tiến, hoàn công đầu năm 1387 thời Trần. Ngày 25 tháng 12 năm 2021, bàn thờ được Thủ tướng Chính phủ công nhận Bảo vật quốc gia (Quyết định 2198/QĐ-TTg) — một trong năm bảo vật quốc gia của tỉnh Phú Thọ.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Pho Quang Pagoda, also called Xuan Lung Pagoda, stands on a mound in Chua hamlet, Xuan Lung commune, Lam Thao district, Phu Tho province, facing west. Built in the Tran dynasty, it is about 800 years old.",
        },
        {
          heading: "Architecture",
          text: "The complex comprises a gate-cum-bell-tower, a stele house and a Tam Bao hall in the \u201cCong\u201d character plan with a worship hall, incense chamber and main sanctuary. The pagoda is a ranked national relic; its Tam Bao hall and stele house were restored in 2021.",
        },
        {
          heading: "The stone Buddha altar — National Treasure",
          text: "The sanctuary houses a stone Buddha altar — a rectangular lotus pedestal over 1 m high, 1.25 m wide and 3.3 m long, assembled from blue-stone slabs and supporting the Three Ages Buddha triad. It was donated by the noble Nguyen Chieu and his wife Nguyen Thi Su and completed in early 1387 under the Tran dynasty. On 25 December 2021 the Prime Minister recognized the altar as a National Treasure (Decision 2198/QD-TTg) — one of five national treasures of Phu Tho province.",
        },
      ],
      references: [
        "https://vnexpress.net/chua-800-tuoi-pho-quang-noi-luu-giu-bao-vat-quoc-gia-4807639.html",
        "https://dulieuphapluat.vn/index.php/cong-cu/bao-vat-quoc-gia/ban-tho-phat-bang-da-chua-xuan-lung.html",
      ],
    },
  },
  // ----------------------------------------------------------------- Sơn La
  {
    pagoda: {
      id: 90000025,
      slug: "chua-chien-vien",
      name: "Chùa Chiền Viện (Vặt Hồng)",
      province: "Sơn La",
      lat: null,
      lng: null,
      description:
        "Chùa Chiền Viện, còn gọi là chùa Vặt Hồng, thuộc bản Vặt, xã Mường Sang, huyện Mộc Châu, tỉnh Sơn La — được xem là ngôi chùa cổ kính nhất vùng Tây Bắc, do đồng bào Thái xây dựng, có thể từ thế kỷ XIII, từng được ghi trong Đại Nam nhất thống chí.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Chien Vien Pagoda (Vat Hong)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Chiền Viện, còn gọi là chùa Vặt Hồng (Vát Hồng), thuộc bản Vặt, xã Mường Sang, huyện Mộc Châu, tỉnh Sơn La. Đây được xem là ngôi chùa cổ kính nhất vùng Tây Bắc, một dạng chùa Phật giáo hiếm thấy của đồng bào Thái.",
        },
        {
          heading: "Lịch sử",
          text: "Theo nhà Thái học Cầm Trọng, chùa có thể được tạo lập từ thế kỷ XIII do đồng bào Thái Mộc Châu xây dựng; địa danh \u201cbản Vặt\u201d được cho là âm chệch của chữ \u201cPhật\u201d. Sách Đại Nam nhất thống chí (giữa thế kỷ XIX) ghi nhận đây là kiến trúc Phật giáo lớn ở miền núi Tây Bắc với 1 pho tượng lớn, 8 pho vừa và 56 pho nhỏ đều bằng đồng, 2 pho bằng thiếc, 1 pho nhỏ bằng ngà. Chùa được xây dựng lại năm 1908–1909 thời Duy Tân, nhưng bị đổ nát từ năm 1947.",
        },
        {
          heading: "Di tích hiện còn",
          text: "Hiện di tích còn nền chùa khoảng 100 m², vài trụ cột, mảng tường đá với những vòm cửa, hai bệ thờ và một tấm bia đá khắc song ngữ: một nửa chữ Thái trắng, một nửa chữ Hán, ghi việc dựng chùa cùng danh sách người công đức. Người Thái bản Vặt vẫn duy trì hội lễ Phật \u201cChách Vặt, Chách Và\u201d vào tháng 5 âm lịch và đã quyên góp dựng mái thờ tạm để tiếp tục thờ Phật.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Chien Vien Pagoda, also called Vat Hong Pagoda, is in Vat hamlet, Muong Sang commune, Moc Chau district, Son La province. It is regarded as the oldest pagoda of the Northwest and a rare form of Buddhist temple built by the Thai people.",
        },
        {
          heading: "History",
          text: "According to the Thai-studies scholar Cam Trong, the pagoda may date from the 13th century, built by the Thai community of Moc Chau; the hamlet name \u201cVat\u201d is thought to be a corruption of \u201cPhat\u201d (Buddha). The mid-19th-century geography Dai Nam nhat thong chi records it as a major Buddhist structure of the mountainous Northwest, housing one large, eight medium and 56 small bronze statues, two of tin and one small ivory figure. Rebuilt in 1908–1909 under Emperor Duy Tan, the pagoda fell into ruin from 1947.",
        },
        {
          heading: "Surviving remains",
          text: "Today about 100 m² of foundations remain, with several columns, stretches of stone wall with arched doorways, two altars and a bilingual stone stele — half in White Thai script, half in Chinese characters — recording the temple's construction and its donors. The Thai of Vat hamlet still hold the \u201cChach Vat, Chach Va\u201d Buddha festival in the fifth lunar month and have raised a temporary roofed shrine to continue worship.",
        },
      ],
      references: [
        "http://khaocohoc.gov.vn/gioi-thieu-chua-chien-vien-huyen-moc-chau-tinh-son-la",
        "https://www.triphunter.vn/places/moc-chau/items/chua-chien-vien",
      ],
    },
  },
  {
    pagoda: {
      id: 90000026,
      slug: "den-tho-vua-le-thai-tong",
      name: "Đền thờ vua Lê Thái Tông (Quế Lâm Linh Từ)",
      province: "Sơn La",
      lat: null,
      lng: null,
      description:
        "Đền thờ vua Lê Thái Tông, tên chữ Quế Lâm Linh Từ, tọa lạc tại phường Chiềng Lề, thành phố Sơn La, khánh thành năm 2003, gắn với di tích quốc gia Văn bia Quế Lâm Ngự Chế — bút tích vua Lê Thái Tông khắc trên vách đá năm 1440.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "King Le Thai Tong Temple (Que Lam Linh Tu)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Đền thờ vua Lê Thái Tông, tên chữ \u201cQuế Lâm Linh Từ\u201d (Đền thiêng Quế Lâm), tọa lạc tại phường Chiềng Lề, thành phố Sơn La, tỉnh Sơn La, trong quần thể di tích lịch sử – văn hóa Văn bia Quế Lâm Ngự Chế.",
        },
        {
          heading: "Lịch sử",
          text: "Vua Lê Thái Tông (húy Nguyên Long), con thứ của vua Lê Thái Tổ, trong 9 năm trị vì đã hai lần thân chinh chỉ huy quân sĩ lên miền Tây Bắc dẹp phản loạn, giữ yên bờ cõi. Tháng 3 năm Canh Thân (1440), sau khi thắng trận, nhà vua để lại bài thơ \u201cQuế Lâm Ngự Chế\u201d khắc trên vách đá hang Thẳm Báo Ké. Văn bia được Bộ Văn hóa – Thông tin xếp hạng di tích cấp quốc gia ngày 5 tháng 2 năm 1994.",
        },
        {
          heading: "Kiến trúc",
          text: "Đền được xây dựng và khánh thành ngày 22 tháng 1 năm 2003 trên diện tích 800 m², theo lối kiến trúc đền cổ Việt Nam với thế phong thủy \u201ctiền giang hậu chẩm\u201d — lưng tựa núi Cằm, mặt hướng dòng suối Nậm La. Đền gồm cổng tam quan, sân đá xanh, nhà tả hữu mạc, tòa đại bái sơn son thếp vàng và hậu cung đặt tượng đồng nhà vua, là điểm tựa văn hóa tâm linh của đồng bào các dân tộc Sơn La.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "The King Le Thai Tong Temple, formally \u201cQue Lam Linh Tu\u201d (Sacred Temple of Que Lam), stands in Chieng Le ward, Son La city, within the relic complex of the Que Lam Ngu Che rock inscription.",
        },
        {
          heading: "History",
          text: "King Le Thai Tong (born Nguyen Long), second son of King Le Thai To, twice personally led campaigns to the Northwest during his nine-year reign to quell revolts and secure the frontier. In the third month of 1440, after his victory, the king left the poem \u201cQue Lam Ngu Che\u201d carved on the cliff of Tham Bao Ke cave. The inscription was ranked a national relic by the Ministry of Culture and Information on 5 February 1994.",
        },
        {
          heading: "Architecture",
          text: "The temple was built and inaugurated on 22 January 2003 on 800 m² in classical Vietnamese temple style, following the geomantic principle of \u201criver in front, mountain behind\u201d — backed by Cam mountain and facing the Nam La stream. It comprises a three-entrance gate, blue-stone courtyard, side halls, a lacquered-and-gilded great worship hall and a rear sanctum with a bronze statue of the king, serving as a spiritual anchor for Son La's ethnic communities.",
        },
      ],
      references: [
        "https://sonlacity.vietnaminfo.net/vi/place/details/di-tich-lich-su-van-hoa-van-bia-que-lam-ngu-che-va-den-tho-vua-le-thai-tong-55",
        "https://www.travelviet.net/vn/relics/son-la/den-tho-vua-le-thai-tong-que-lam-linh-tu",
      ],
    },
  },
  // ------------------------------------------------------------ Tuyên Quang
  {
    pagoda: {
      id: 90000027,
      slug: "chua-an-vinh",
      name: "Chùa An Vinh",
      province: "Tuyên Quang",
      lat: null,
      lng: null,
      description:
        "Chùa An Vinh (An Vinh Thiền Tự) là ngôi chùa lớn nhất thành phố Tuyên Quang, tọa lạc trên đồi thuộc xã Hưng Thành, được dựng từ thế kỷ XVIII. Chùa lưu giữ 12 pho tượng gỗ cổ, hai tấm bia thời Lê (1720, 1727) và chuông đồng đúc năm 1734.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "An Vinh Pagoda",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa An Vinh, tên chữ \u201cAn Vinh Thiền Tự\u201d, là ngôi chùa lớn nhất thành phố Tuyên Quang, tọa lạc trên một quả đồi thuộc tổ 7, xã Hưng Thành, cách trung tâm thành phố khoảng 4,5 km. Chùa được dựng từ thế kỷ XVIII trong khuôn viên khoảng 1.000 m².",
        },
        {
          heading: "Kiến trúc",
          text: "Trải qua nhiều lần trùng tu, chùa hiện có kiến trúc kiểu chữ Đinh gồm tòa thiêu hương và thượng điện, phía trước là tòa tiền đường. Trước cổng chùa còn lưu bút tích câu đối cổ.",
        },
        {
          heading: "Di vật",
          text: "Chùa lưu giữ nhiều di vật quý: 12 pho tượng gỗ ở thượng điện gồm bộ Tam thế, bộ Bồ Tát, bộ Ngọc Hoàng và bộ Cửu Long; hai tấm bia cổ thời Lê — \u201cTạo tác hưng công bi ký\u201d (1720) và \u201cTrùng tu Bảo Phúc tự bi ký\u201d (1727) — ghi tên những người công đức xây dựng, tu sửa chùa; quả chuông đồng đúc năm Giáp Dần (1734), khánh đồng đúc năm Cảnh Thịnh thứ 3 (1797) cùng nhiều hoành phi, câu đối có giá trị lịch sử, nghệ thuật.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "An Vinh Pagoda, formally \u201cAn Vinh Zen Temple\u201d, is the largest pagoda in Tuyen Quang city, set on a hill in Hung Thanh commune about 4.5 km from the city center. It was founded in the 18th century on grounds of about 1,000 m².",
        },
        {
          heading: "Architecture",
          text: "After many restorations, the pagoda now follows the \u201cDinh\u201d character plan with an incense hall and upper sanctuary, fronted by a forecourt hall. Ancient parallel-sentence inscriptions survive at the gate.",
        },
        {
          heading: "Relics",
          text: "The pagoda preserves many valuable artifacts: twelve wooden statues in the sanctuary — the Three Ages Buddhas, Bodhisattvas, Jade Emperor and Nine Dragons sets; two Le-dynasty steles — the 1720 \u201cTao tac hung cong bi ky\u201d and the 1727 \u201cTrung tu Bao Phuc tu bi ky\u201d — listing donors who built and restored the temple; a bronze bell cast in 1734, a bronze gong chime from 1797 (3rd year of Canh Thinh), and numerous lacquered boards and couplets of historical and artistic value.",
        },
      ],
      references: [
        "https://www.phattuvietnam.net/chua-an-vinh-tuyen-quang/",
        "https://chonthieng.com/dia-diem/chua-an-vinh-an-vinh-thien-tu-tuyen-quang/",
      ],
    },
  },
  {
    pagoda: {
      id: 90000028,
      slug: "chua-huong-nghiem-tuyen-quang",
      name: "Chùa Hương Nghiêm (Chùa Hang)",
      province: "Tuyên Quang",
      lat: null,
      lng: null,
      description:
        "Chùa Hương Nghiêm, dân gian gọi là chùa Hang, nằm trong hang đá tự nhiên dưới chân núi Hương Nghiêm, xã An Khang, thành phố Tuyên Quang. Chùa được dựng năm 1537 thời Mạc Thái Tông, còn lưu giữ văn bia cổ tạc năm Đại Chính thứ 8.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Huong Nghiem Pagoda (Cave Pagoda)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Hương Nghiêm, tên chữ Hương Nghiêm tự hay Hương Nham tự, dân gian quen gọi là chùa Hang vì nằm trong lòng hang đá tự nhiên dưới chân núi Hương Nghiêm, thôn Phúc Lộc, xã An Khang, thành phố Tuyên Quang — khu vực có nhiều di tích như Thành nhà Bầu và bến Bình Ca.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được xây dựng năm 1537, niên hiệu Đại Chính thứ 8 thời Mạc Thái Tông (Mạc Đăng Doanh), theo sáng kiến của hai vị quan hiến sát Ngô Thọ Khê và Vũ Trạch Xuyên. Văn bia chùa tạc ngày 27 tháng 2 cùng năm, do Tiến sĩ Ngô Hoằng Trinh soạn, ghi lại việc dựng chùa — nguồn sử liệu quý về vùng đất Tuyên Quang thế kỷ XVI.",
        },
        {
          heading: "Cảnh quan",
          text: "Chùa nằm trong hang đá có hai mái vòm và nhiều nhũ đá rủ xuống đủ hình thù, có nhũ đá hình cây cổ thụ tạo vẻ đẹp kỳ thú. Trong hang từng có giếng sâu 8–9 m và dòng suối ngầm chảy ra sông Lô; ngoài cửa hang, dãy núi uốn lượn được ví như thân rồng mà núi Hương Nghiêm là đầu rồng.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Huong Nghiem Pagoda, popularly the Cave Pagoda (Chua Hang), lies inside a natural cave at the foot of Huong Nghiem mountain in Phuc Loc hamlet, An Khang commune, Tuyen Quang city — an area rich in relics such as the Bau family citadel and Binh Ca wharf.",
        },
        {
          heading: "History",
          text: "The pagoda was built in 1537, the 8th year of the Dai Chinh era under Mac Thai Tong (Mac Dang Doanh), at the initiative of the two surveillance officials Ngo Tho Khe and Vu Trach Xuyen. Its stele, carved on the 27th day of the second month that year and composed by the doctoral laureate Ngo Hoang Trinh, records the founding — a precious source on 16th-century Tuyen Quang.",
        },
        {
          heading: "Setting",
          text: "The cave has twin vaulted ceilings hung with stalactites of many shapes, including one resembling an ancient tree. It once held a well 8–9 m deep and an underground stream flowing to the Lo river; outside, the undulating mountain ridge is likened to a dragon's body with Huong Nghiem mountain as its head.",
        },
      ],
      references: [
        "https://sovhttdltuyenquang.vn/chua-hang-tuyen-quang/",
        "https://tapchinghiencuuphathoc.vn/chua-huong-nghiem-van-bia-chua.html",
      ],
    },
  },
  // ---------------------------------------------------------------- Yên Bái
  {
    pagoda: {
      id: 90000029,
      slug: "den-dong-cuong",
      name: "Đền Đông Cuông",
      province: "Yên Bái",
      lat: null,
      lng: null,
      description:
        "Đền Đông Cuông (đền Vệ Quốc) nằm bên bờ sông Hồng thuộc thôn Bến Đền, xã Đông Cuông, huyện Văn Yên, tỉnh Yên Bái, thờ Mẫu Đệ nhị Thượng Ngàn — một trong những cái nôi của tín ngưỡng thờ Mẫu Việt Nam, được xếp hạng di tích cấp quốc gia năm 2009.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Dong Cuong Temple",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Đền Đông Cuông, còn gọi là đền Vệ Quốc, nằm bên bờ hữu sông Hồng thuộc thôn Bến Đền, xã Đông Cuông, huyện Văn Yên, tỉnh Yên Bái, cách thành phố Yên Bái 55 km. Đền thờ chính Mẫu Đệ nhị Thượng Ngàn trong tục thờ Mẫu Tam phủ của người Việt.",
        },
        {
          heading: "Lịch sử",
          text: "Đền thờ Mẫu Thượng Ngàn cùng các vị anh hùng người dân tộc thiểu số trong cuộc kháng chiến chống quân Nguyên – Mông thế kỷ XIII, nên còn được gọi là đền Vệ Quốc theo Đại Nam nhất thống chí; nhà bác học Lê Quý Đôn thế kỷ XVIII từng xếp đền vào hàng \u201clinh tích\u201d. Bị hủy hoại qua chiến tranh, đền được xây dựng lại từ năm 1995 trên nền móng cũ và được xếp hạng di tích cấp quốc gia tháng 1 năm 2009.",
        },
        {
          heading: "Kiến trúc và lễ hội",
          text: "Cụm di tích gồm đền chính và ba miếu thờ Cô, thờ Cậu và Đức Ông, kiến trúc hình chữ Đinh mang phong cách thời Lý – Trần với mái cong lưỡng long chầu nhật, cột gỗ tứ thiết sơn son thếp vàng. Đền là nơi lưu giữ giá trị văn hóa tâm linh của người Tày Khao, với các lễ hội lớn đầu năm thu hút đông đảo du khách hành hương về nguồn cội tín ngưỡng thờ Mẫu.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Dong Cuong Temple, also called the Ve Quoc (Nation-Guarding) Temple, stands on the right bank of the Red River in Ben Den hamlet, Dong Cuong commune, Van Yen district, Yen Bai province, 55 km from Yen Bai city. It is the principal seat of the Second Mother Goddess of the Forests (Mau De nhi Thuong Ngan) in the Vietnamese Three Palaces tradition.",
        },
        {
          heading: "History",
          text: "The temple honors the Forest Mother Goddess together with ethnic-minority heroes of the 13th-century resistance against the Mongol invasions, hence its \u201cVe Quoc\u201d name recorded in the geography Dai Nam nhat thong chi; the 18th-century scholar Le Quy Don listed it among the \u201csacred vestiges\u201d. Destroyed in wartime, it was rebuilt from 1995 on the old foundations and ranked a national relic in January 2009.",
        },
        {
          heading: "Architecture and festivals",
          text: "The complex comprises the main temple and three shrines to the Lady, the Boy and the Duke, built in the \u201cDinh\u201d plan in Ly–Tran style with curved twin-dragon roofs and ironwood columns lacquered in red and gold. A repository of the Tay Khao people's spiritual culture, the temple hosts major early-year festivals drawing throngs of pilgrims to this cradle of Mother Goddess worship.",
        },
      ],
      references: [
        "http://dulichyenbai.gov.vn/tai-nguyen/di-tich-lich-su/?UserKey=Den-Dong-Cuong",
        "https://baophapluat.vn/coi-nguon-tin-nguong-tho-mau-tai-yen-bai-post14599.html",
      ],
    },
  },
  {
    pagoda: {
      id: 90000030,
      slug: "chua-ngoc-am",
      name: "Chùa Ngọc Am (Tùng Lâm Tự)",
      province: "Yên Bái",
      lat: null,
      lng: null,
      description:
        "Chùa Ngọc Am, pháp danh Tùng Lâm Tự, tọa lạc bên bờ sông Hồng thuộc phường Hồng Hà, thành phố Yên Bái, khởi dựng cuối thế kỷ XIX – đầu thế kỷ XX. Được xem là trung tâm Phật giáo của tỉnh Yên Bái, chùa được công nhận di tích cấp tỉnh năm 2007.",
      image: null,
      thumbnail: null,
      wikipediaUrl: null,
    },
    details: {
      nameEn: "Ngoc Am Pagoda (Tung Lam Temple)",
      wikipediaUrlEn: null,
      sectionsVi: [
        {
          heading: null,
          text: "Chùa Ngọc Am, pháp danh Tùng Lâm Tự, dân gian quen gọi là chùa Am, tọa lạc bên bờ tả sông Thao (sông Hồng), nay thuộc phường Hồng Hà, thành phố Yên Bái. Chùa theo hệ phái Bắc tông – Đại thừa và được xem là trung tâm Phật giáo của tỉnh Yên Bái.",
        },
        {
          heading: "Lịch sử",
          text: "Chùa được khởi dựng khoảng cuối thế kỷ XIX – đầu thế kỷ XX do các nhà buôn và chủ thuyền vận tải đường sông người Việt và Hoa kiều thường xuyên qua lại bến Tuần Quán góp tiền dựng \u201cAm\u201d cầu bình an trên sông nước. Tháng 4 năm 1900, khi tỉnh Yên Bái thành lập, Am được mở rộng thành chùa có sư trụ trì, lấy pháp danh Tùng Lâm. Tên \u201cchùa Am\u201d kỷ niệm lễ chuyển chân nhang từ Am Âm Hồn phố Cao Su về chùa; ngày nay chùa mang tên kép Ngọc Am – Tùng Lâm Tự.",
        },
        {
          heading: "Di tích",
          text: "Chùa được công nhận di tích lịch sử kiến trúc nghệ thuật tôn giáo cấp tỉnh theo Quyết định 177/QĐ-UBND ngày 6 tháng 2 năm 2007. Đây là một trong những cơ sở tín ngưỡng linh thiêng bậc nhất vùng cửa ngõ Tây Bắc, điểm sinh hoạt văn hóa tâm linh quan trọng của nhân dân thành phố Yên Bái.",
        },
      ],
      sectionsEn: [
        {
          heading: null,
          text: "Ngoc Am Pagoda, formally Tung Lam Temple and popularly \u201cChua Am\u201d, stands on the left bank of the Thao (Red) River in today's Hong Ha ward, Yen Bai city. A Northern-school Mahayana temple, it is considered the Buddhist center of Yen Bai province.",
        },
        {
          heading: "History",
          text: "The pagoda originated in the late 19th – early 20th century, when Vietnamese and ethnic-Chinese merchants and riverboat owners plying the Tuan Quan wharf pooled funds to build a small hermitage (\u201cAm\u201d) to pray for safe passage. In April 1900, when Yen Bai province was founded, the hermitage was expanded into a full pagoda with a resident abbot under the name Tung Lam. The name \u201cChua Am\u201d commemorates the transfer of incense ashes from the Am Hon shrine on Cao Su street; today the temple bears the twin names Ngoc Am and Tung Lam Tu.",
        },
        {
          heading: "Relic status",
          text: "The pagoda was recognized as a provincial historical, architectural and religious-art relic by Decision 177/QD-UBND of 6 February 2007. It ranks among the most sacred religious sites at the gateway to the Northwest and is a key center of spiritual life for the people of Yen Bai city.",
        },
      ],
      references: [
        "http://ubndtpyenbai.yenbai.vnptweb.vn/thang-canh-du-lich/chua-ngoc-am-288496",
        "http://dulichyenbai.gov.vn/tin-tuc/tin-noi-bat/?UserKey=Chua-Tung-Lam---Ngoc-Am-ngoi-chua-linh-thieng-giua-long-pho-nui",
      ],
    },
  },
];

const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

let relabeled = 0;
for (const p of pagodas) {
  const prov = RELABEL[p.slug];
  if (prov && p.province !== prov) {
    p.province = prov;
    relabeled++;
  }
}

const existingSlugs = new Set(pagodas.map((p) => p.slug));
let added = 0;
for (const { pagoda, details: d } of CURATED) {
  if (existingSlugs.has(pagoda.slug)) {
    console.error(`Skip (exists): ${pagoda.slug}`);
    continue;
  }
  let idx = -1;
  for (let i = 0; i < pagodas.length; i++) {
    if (pagodas[i].province === pagoda.province) idx = i;
  }
  if (idx === -1) idx = pagodas.length - 1;
  pagodas.splice(idx + 1, 0, pagoda);
  details[pagoda.slug] = d;
  added++;
}

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2));
fs.writeFileSync(detailsPath, JSON.stringify(details));
console.log(
  `Relabeled ${relabeled} entries to Sóc Trăng; added ${added} curated entries. Total: ${pagodas.length}`,
);
