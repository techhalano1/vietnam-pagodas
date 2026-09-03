// Migrate the dataset from the 63 pre-2025 provinces to the 34 provinces in
// effect since 2025-07-01 (Resolution 202/2025/QH15). Sets `province` to the
// new province, keeps the former one in `oldProvince` (only when it changed),
// and rewrites the auto-generated OSM descriptions to use the new labels.
//
// Cross-check: when /tmp/gadm41_VNM_1.json (GADM 4.1 level-1, 63 provinces)
// is present, each record with coordinates is re-assigned by point-in-polygon
// and mismatches vs the stored label are reported.
import fs from "node:fs";

// old province -> merged (new) province; provinces not listed kept their name.
const MERGED = {
  "Hà Giang": "Tuyên Quang", "Yên Bái": "Lào Cai", "Bắc Kạn": "Thái Nguyên",
  "Vĩnh Phúc": "Phú Thọ", "Hòa Bình": "Phú Thọ", "Bắc Giang": "Bắc Ninh",
  "Thái Bình": "Hưng Yên", "Hải Dương": "Hải Phòng", "Hà Nam": "Ninh Bình",
  "Nam Định": "Ninh Bình", "Quảng Bình": "Quảng Trị", "Quảng Nam": "Đà Nẵng",
  "Kon Tum": "Quảng Ngãi", "Bình Định": "Gia Lai", "Ninh Thuận": "Khánh Hòa",
  "Đắk Nông": "Lâm Đồng", "Bình Thuận": "Lâm Đồng", "Phú Yên": "Đắk Lắk",
  "Bình Dương": "TP. Hồ Chí Minh", "Bà Rịa – Vũng Tàu": "TP. Hồ Chí Minh",
  "Bình Phước": "Đồng Nai", "Long An": "Tây Ninh", "Sóc Trăng": "Cần Thơ",
  "Hậu Giang": "Cần Thơ", "Bến Tre": "Vĩnh Long", "Trà Vinh": "Vĩnh Long",
  "Tiền Giang": "Đồng Tháp", "Bạc Liêu": "Cà Mau", "Kiên Giang": "An Giang",
};

const list = JSON.parse(fs.readFileSync("src/data/pagodas.json", "utf8"));

// --- optional coordinate cross-check against pre-merger boundaries ---
let provinceOf = null;
if (fs.existsSync("/tmp/gadm41_VNM_1.json")) {
  const gadm = JSON.parse(fs.readFileSync("/tmp/gadm41_VNM_1.json", "utf8"));
  const GADM_TO_LABEL = {
    AnGiang: "An Giang", "BàRịa-VũngTàu": "Bà Rịa – Vũng Tàu", BắcGiang: "Bắc Giang",
    BắcKạn: "Bắc Kạn", BạcLiêu: "Bạc Liêu", BắcNinh: "Bắc Ninh", BếnTre: "Bến Tre",
    BìnhĐịnh: "Bình Định", BìnhDương: "Bình Dương", BìnhPhước: "Bình Phước",
    BìnhThuận: "Bình Thuận", CàMau: "Cà Mau", CầnThơ: "Cần Thơ", CaoBằng: "Cao Bằng",
    ĐàNẵng: "Đà Nẵng", ĐắkLắk: "Đắk Lắk", ĐắkNông: "Đắk Nông", ĐiệnBiên: "Điện Biên",
    ĐồngNai: "Đồng Nai", ĐồngTháp: "Đồng Tháp", GiaLai: "Gia Lai", HàGiang: "Hà Giang",
    HàNam: "Hà Nam", HàNội: "Hà Nội", HàTĩnh: "Hà Tĩnh", HảiDương: "Hải Dương",
    HảiPhòng: "Hải Phòng", HậuGiang: "Hậu Giang", HồChíMinh: "TP. Hồ Chí Minh",
    HoàBình: "Hòa Bình", HưngYên: "Hưng Yên", KhánhHòa: "Khánh Hòa",
    KiênGiang: "Kiên Giang", KonTum: "Kon Tum", LaiChâu: "Lai Châu", LâmĐồng: "Lâm Đồng",
    LạngSơn: "Lạng Sơn", LàoCai: "Lào Cai", LongAn: "Long An", NamĐịnh: "Nam Định",
    NghệAn: "Nghệ An", NinhBình: "Ninh Bình", NinhThuận: "Ninh Thuận", PhúThọ: "Phú Thọ",
    PhúYên: "Phú Yên", QuảngBình: "Quảng Bình", QuảngNam: "Quảng Nam",
    QuảngNgãi: "Quảng Ngãi", QuảngNinh: "Quảng Ninh", QuảngTrị: "Quảng Trị",
    SócTrăng: "Sóc Trăng", SơnLa: "Sơn La", TâyNinh: "Tây Ninh", TháiBình: "Thái Bình",
    TháiNguyên: "Thái Nguyên", ThanhHóa: "Thanh Hóa", ThừaThiênHuế: "Huế",
    TiềnGiang: "Tiền Giang", TràVinh: "Trà Vinh", TuyênQuang: "Tuyên Quang",
    VĩnhLong: "Vĩnh Long", VĩnhPhúc: "Vĩnh Phúc", YênBái: "Yên Bái",
  };
  const inRing = (pt, ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  };
  const inPolygon = (pt, coords) => {
    if (!inRing(pt, coords[0])) return false;
    for (let i = 1; i < coords.length; i++) if (inRing(pt, coords[i])) return false;
    return true;
  };
  const provincePolys = gadm.features.map((f) => {
    const label = GADM_TO_LABEL[f.properties.NAME_1];
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
    const walk = (c) => {
      if (typeof c[0] === "number") {
        if (c[0] < minx) minx = c[0];
        if (c[0] > maxx) maxx = c[0];
        if (c[1] < miny) miny = c[1];
        if (c[1] > maxy) maxy = c[1];
      } else c.forEach(walk);
    };
    walk(polys);
    return { label, polys, bbox: { minx, miny, maxx, maxy } };
  });
  provinceOf = (lng, lat) => {
    for (const p of provincePolys) {
      const { minx, miny, maxx, maxy } = p.bbox;
      if (lng < minx || lng > maxx || lat < miny || lat > maxy) continue;
      if (p.polys.some((poly) => inPolygon([lng, lat], poly))) return p.label;
    }
    return null;
  };
} else {
  console.error("(/tmp/gadm41_VNM_1.json not found — skipping coordinate cross-check)");
}

let migrated = 0;
let unchanged = 0;
let descrRewrites = 0;
const mismatches = [];
const newOf = (old) => MERGED[old] ?? old;
for (const p of list) {
  let old = p.oldProvince ?? p.province;
  if (provinceOf && p.lat != null && p.lng != null) {
    const byCoords = provinceOf(p.lng, p.lat);
    if (byCoords && byCoords !== old) {
      // Same post-merger province: the coordinates pin down the former
      // province more precisely than the stored label, so adopt them.
      if (newOf(byCoords) === newOf(old)) {
        old = byCoords;
      } else {
        mismatches.push({ id: p.id, name: p.name, label: old, byCoords });
      }
    }
  }
  const merged = MERGED[old];
  if (merged) {
    p.province = merged;
    p.oldProvince = old;
    migrated++;
  } else {
    p.province = old;
    delete p.oldProvince;
    unchanged++;
  }
  // Rewrite the auto-generated OSM baseline descriptions.
  const auto = p.description.match(
    /^(.+ là một (?:ngôi chùa|thiền viện|tịnh xá|tổ đình|ngôi đền|đình làng|ngôi miếu|di tích) tại )(.+?)(, Việt Nam\. Vị trí được ghi nhận từ dữ liệu cộng đồng OpenStreetMap.*)$/
  );
  if (auto) {
    const region = merged ? `${merged} (khu vực ${old} cũ)` : p.province;
    const next = auto[1] + region + auto[3];
    if (next !== p.description) {
      p.description = next;
      descrRewrites++;
    }
  }
}

fs.writeFileSync("src/data/pagodas.json", JSON.stringify(list, null, 2) + "\n");
console.error(`migrated: ${migrated}, unchanged: ${unchanged}, description rewrites: ${descrRewrites}`);
console.error(`new provinces: ${new Set(list.map((p) => p.province)).size}`);
console.error(`coordinate mismatches vs old label: ${mismatches.length}`);
if (mismatches.length) console.error(JSON.stringify(mismatches.slice(0, 50), null, 1));
