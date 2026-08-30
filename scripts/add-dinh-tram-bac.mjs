// Adds Đình Làng Trạm Bạc (Lê Lợi, An Dương, Hải Phòng) to
// src/data/pagodas.json and src/data/details.json.
// Content researched from the Hải Phòng Party history portal
// (lichsudangbo.haiphong.gov.vn). Coordinates verified against Google Maps.
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const pagodasPath = path.join(dir, "../src/data/pagodas.json");
const detailsPath = path.join(dir, "../src/data/details.json");

const entry = {
  pagoda: {
    id: 90000031,
    slug: "dinh-tram-bac",
    name: "Đình Làng Trạm Bạc",
    province: "Hải Phòng",
    lat: 20.8540335,
    lng: 106.5738043,
    description:
      "Đình Trạm Bạc thuộc thôn Trạm Bạc, xã Lê Lợi, huyện An Dương, thành phố Hải Phòng, cách trung tâm huyện khoảng 4 km. Đình do quan tuần phủ Nguyễn Khoa Dục dựng năm Tự Đức 2 (1849), thờ bốn vị Thành hoàng; trong khuôn viên còn có lăng mộ ngài tị Tổ dòng họ Nguyễn Đình, Nguyễn Khoa. Di tích được công nhận Di tích lịch sử cấp thành phố năm 2014.",
    image: "/images/dinh-tram-bac.jpg",
    thumbnail: "/images/dinh-tram-bac-thumb.jpg",
    wikipediaUrl: null,
  },
  details: {
    nameEn: "Tram Bac Communal House",
    wikipediaUrlEn: null,
    sectionsVi: [
      {
        heading: null,
        text: "Đình Trạm Bạc và lăng mộ ngài tị Tổ dòng họ Nguyễn Đình, Nguyễn Khoa thuộc thôn Trạm Bạc, xã Lê Lợi, huyện An Dương, thành phố Hải Phòng, nằm cách trung tâm huyện khoảng 4 km. Đây là công trình kiến trúc văn hóa tâm linh, tín ngưỡng cổ truyền của nhân dân làng Trạm Bạc.",
      },
      {
        heading: "Lịch sử",
        text: "Đình do quan tuần phủ Nguyễn Khoa Dục dựng vào năm Tự Đức 2 (1849), thờ bốn vị Thành hoàng: Đông Hải Đại Vương, Nam Hải Đại Vương, Trung Nhạc Đại Vương và ngài Nguyễn Khoa Dục — những người có công xây dựng đình, miếu, chiêu dân lập ấp và đánh giặc biển, sau đều tử trận ngày 1 tháng 4 và được dân làng thờ phụng.\nNăm 1970, đình bị dỡ lấy vật liệu xây dựng các công trình công cộng như trường học, nhà kho; phần lớn đồ thờ bị thất lạc, một phần được dân làng cất giữ. Theo nguyện vọng của dân làng, năm 2002 đình được dựng lại phần hậu cung, đến năm 2009 nhân dân tiếp tục phục dựng tòa tiền tế. Ngày 17 tháng 01 năm 2014, Ủy ban nhân dân thành phố Hải Phòng ra quyết định số 236-QĐ/UBND công nhận đình Trạm Bạc và lăng mộ ngài tị Tổ dòng họ Nguyễn Đình, Nguyễn Khoa là Di tích lịch sử cấp thành phố.",
      },
      {
        heading: "Kiến trúc",
        text: "Đình Trạm Bạc xưa được dựng trên gò đất cao, hướng Đông Nam, bố cục mặt bằng hình chữ đinh gồm 3 gian tiền tế và 1 gian hậu cung, kiểu tường hồi bít đốc, đấu trụ hồi văn, tay ngai trụ biểu; bộ khung chịu lực bằng gỗ lim, mái lợp ngói mũi, nền lát gạch bát. Hiện nay đình có khuôn viên rộng 1.047,2 m², bố cục hình chữ đinh gồm 3 gian tiền tế, 1 gian ống muống và 2 gian hậu cung, hướng Nam như xưa. Trước sân đình là hai cây đa cổ thụ trên 100 năm tuổi; bên phải là lầu bia đặt tấm bia đá niên đại Tự Đức 6 (1853) ghi lại quá trình khai khẩn, lập làng, dựng đình, dựng miếu làng Trạm Bạc.\nĐặc biệt, trong khuôn viên đình còn có lăng mộ ngài tị Tổ dòng họ Nguyễn Đình, Nguyễn Khoa, được di chuyển từ khu công nghiệp Tràng Duệ về và xây dựng trên thửa đất rộng 1.200 m²; trong khu lăng mộ bảo tồn phần mộ đá do cụ Nguyễn Khoa Dục trùng tạo năm Tự Đức 5 (1852).",
      },
      {
        heading: "Lễ hội",
        text: "Sinh hoạt văn hóa và lễ hội truyền thống tại đình diễn ra vào các ngày 15 tháng 2 và 1 tháng 4 âm lịch hàng năm, ngoài ra còn có tế thượng điền, hạ điền. Phần hội có các trò chơi dân gian: đi cầu thùm, cờ tướng, tổ tôm, kéo co, hát chèo… — nét văn hóa đặc sắc của nhân dân làng Trạm Bạc và vùng đồng bằng Bắc Bộ.",
      },
    ],
    sectionsEn: [
      {
        heading: null,
        text: "Tram Bac Communal House (Đình Trạm Bạc), together with the tomb of the progenitor of the Nguyen Dinh and Nguyen Khoa lineages, stands in Tram Bac hamlet, Le Loi commune, An Duong district, Hai Phong, about 4 km from the district center. It is a traditional spiritual and cultural architectural work of the people of Tram Bac village.",
      },
      {
        heading: "History",
        text: "The communal house was built in 1849 (second year of the Tu Duc era) by provincial governor Nguyen Khoa Duc. It venerates four tutelary deities — Dong Hai Dai Vuong, Nam Hai Dai Vuong, Trung Nhac Dai Vuong and Nguyen Khoa Duc himself — credited with founding the village, building its communal house and shrine, and fighting sea raiders; all fell in battle on the first day of the fourth lunar month and have been worshipped by villagers since.\nIn 1970 the building was dismantled for materials to construct public works such as a school and warehouses, and most of its ritual objects were lost or dispersed among villagers. At the villagers' request the sanctuary was rebuilt in 2002, and in 2009 the front ceremonial hall was reconstructed. On 17 January 2014, the Hai Phong People's Committee issued Decision 236-QD/UBND recognizing Tram Bac Communal House and the ancestral tomb as a city-level historical relic.",
      },
      {
        heading: "Architecture",
        text: "The original house stood on a raised mound facing southeast, laid out in the traditional Dinh (T-shaped) plan with a three-bay front hall and one-bay sanctuary, built with gabled end walls, ironwood framing, tiled roofs and brick floors. Today the complex covers 1,047.2 m² and follows the same Dinh-shaped plan with a three-bay front hall, a connecting bay and a two-bay sanctuary, facing south as before. Two banyan trees over a century old stand before the courtyard, and a stele pavilion houses a stone stele dated 1853 (Tu Duc 6) recording the founding of Tram Bac village and the construction of its communal house and shrine.\nWithin the grounds lies the tomb of the progenitor of the Nguyen Dinh and Nguyen Khoa lineages, relocated from the Trang Due industrial zone and rebuilt on a 1,200 m² plot; it preserves the stone tomb restored by Nguyen Khoa Duc in 1852.",
      },
      {
        heading: "Festivals",
        text: "Traditional festivals are held annually on the 15th day of the second lunar month and the 1st day of the fourth lunar month, along with field-opening and harvest rites. Festivities include folk games such as balance-bridge crossing, Chinese chess, to tom card games, tug of war and cheo singing — a distinctive cultural tradition of Tram Bac village and the northern delta region.",
      },
    ],
    references: [
      "https://lichsudangbo.haiphong.gov.vn/di-tich-ls-vh-phuong-an-duong/dinh-tram-bac-va-lang-mo-ngai-ti-to-dong-ho-nguyen-dinh-nguyen-khoa-2953",
    ],
  },
};

const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

if (pagodas.some((p) => p.slug === entry.pagoda.slug)) {
  console.error(`Skip (exists): ${entry.pagoda.slug}`);
  process.exit(0);
}
let idx = -1;
for (let i = 0; i < pagodas.length; i++) {
  if (pagodas[i].province === entry.pagoda.province) idx = i;
}
pagodas.splice(idx + 1, 0, entry.pagoda);
details[entry.pagoda.slug] = entry.details;

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2));
fs.writeFileSync(detailsPath, JSON.stringify(details));
console.log(`Added ${entry.pagoda.slug}. Total: ${pagodas.length}`);
