// Adds "worship & blessings" info (who is venerated and what visitors
// commonly pray for) to well-documented pagodas in details.json.
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const detailsPath = path.join(dir, "../src/data/details.json");

const WORSHIP = {
  "chua-cao-linh": {
    worshipVi: "Phật Thích Ca Mâu Ni cùng chư Phật, Bồ Tát theo truyền thống Phật giáo Bắc tông.",
    worshipEn: "Shakyamuni Buddha together with Buddhas and Bodhisattvas of the Mahayana tradition.",
    prayForVi: "Bình an, sức khoẻ cho gia đình và cầu siêu cho gia tiên.",
    prayForEn: "Peace and health for the family, and memorial prayers for ancestors.",
  },
  "dinh-tram-bac": {
    worshipVi: "Các vị Thành hoàng làng có công khai lập và bảo hộ làng Trạm Bạc.",
    worshipEn: "The village tutelary deities credited with founding and protecting Tram Bac village.",
    prayForVi: "Bình an cho dân làng, mưa thuận gió hoà, mùa màng tốt tươi.",
    prayForEn: "Peace for the villagers, favorable weather and bountiful harvests.",
  },
  "chua-thien-mu": {
    worshipVi: "Phật Thích Ca Mâu Ni và chư vị Bồ Tát; chùa thuộc thiền phái Bắc tông xứ Huế.",
    worshipEn: "Shakyamuni Buddha and Bodhisattvas; the pagoda follows the Mahayana tradition of Hue.",
    prayForVi: "Bình an, may mắn và hanh thông trong cuộc sống.",
    prayForEn: "Peace, good fortune and smooth progress in life.",
  },
  "chua-mot-cot": {
    worshipVi: "Quan Thế Âm Bồ Tát — theo truyền thuyết vua Lý Thái Tông dựng chùa sau giấc mơ được Quan Âm ban con.",
    worshipEn: "Avalokitesvara (Quan Am) Bodhisattva — legend holds King Ly Thai Tong built the pagoda after dreaming Quan Am granted him a son.",
    prayForVi: "Cầu con cái, sức khoẻ và phúc lành cho gia đình.",
    prayForEn: "Children, health and blessings for the family.",
  },
  "chua-huong": {
    worshipVi: "Quan Thế Âm Bồ Tát tại động Hương Tích, cùng chư Phật trong quần thể chùa.",
    worshipEn: "Avalokitesvara (Quan Am) Bodhisattva at Huong Tich grotto, along with Buddhas across the complex.",
    prayForVi: "Cầu con, cầu duyên, tài lộc và bình an — đặc biệt trong hội chùa Hương đầu xuân.",
    prayForEn: "Children, love, prosperity and peace — especially during the spring Huong Pagoda festival.",
  },
  "chua-bai-dinh": {
    worshipVi: "Phật Thích Ca, Quan Thế Âm Bồ Tát; khu chùa cổ còn thờ thần Cao Sơn và thánh Nguyễn Minh Không.",
    worshipEn: "Shakyamuni Buddha and Quan Am Bodhisattva; the ancient pagoda area also venerates the deity Cao Son and saint Nguyen Minh Khong.",
    prayForVi: "Bình an, tài lộc và may mắn đầu năm.",
    prayForEn: "Peace, prosperity and New Year good fortune.",
  },
  "chua-tran-quoc": {
    worshipVi: "Phật Thích Ca Mâu Ni và chư Phật, Bồ Tát; ngôi cổ tự lâu đời nhất Hà Nội bên Hồ Tây.",
    worshipEn: "Shakyamuni Buddha and Bodhisattvas; Hanoi's oldest pagoda on the shore of West Lake.",
    prayForVi: "Bình an, may mắn và trí tuệ sáng suốt.",
    prayForEn: "Peace, good fortune and clarity of mind.",
  },
};

const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));
let count = 0;
for (const [slug, info] of Object.entries(WORSHIP)) {
  const d = details[slug];
  if (!d) throw new Error(`${slug} not found in details.json`);
  Object.assign(d, info);
  count++;
}
fs.writeFileSync(detailsPath, JSON.stringify(details));
console.log("Added worship info for", count, "sites");
