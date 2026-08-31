// Build validated new directory entries from OpenStreetMap discovery data.
//
// Inputs (generated locally, not committed):
//   osm-sites-raw.json        – from scripts/fetch-osm-sites.mjs (Overpass)
//   /tmp/gadm41_VNM_1.json    – GADM 4.1 level-1 boundaries (63 provinces),
//                               https://geodata.ucdavis.edu/gadm/gadm4.1/json/gadm41_VNM_1.json.zip
//
// Pipeline: filter Vietnamese pagoda/temple/communal-house names, exclude
// non-relevant religions, assign province by point-in-polygon against the
// pre-2025-merger boundaries, dedupe internally and against the existing
// dataset, then write candidates to osm-candidates.json.
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("osm-sites-raw.json", "utf8"));
const gadm = JSON.parse(fs.readFileSync("/tmp/gadm41_VNM_1.json", "utf8"));
const existing = JSON.parse(fs.readFileSync("src/data/pagodas.json", "utf8"));

// GADM NAME_1 (no spaces) -> dataset province label
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

const INCLUDE_PREFIX = /^(Chùa|Đền|Đình|Miếu|Thiền [Vv]iện|Tịnh [Xx]á|Tổ [Đđ]ình|Quán [Tt]hánh)\s+\S/u;
const EXCLUDE_RELIGION = new Set([
  "christian", "muslim", "hindu", "jewish", "shinto", "sikh", "bahai", "caodaism",
]);

const TYPE_LABEL = [
  [/^Chùa/u, ["ngôi chùa", "Buddhist pagoda"]],
  [/^(Thiền [Vv]iện)/u, ["thiền viện", "Zen monastery"]],
  [/^(Tịnh [Xx]á)/u, ["tịnh xá", "Buddhist vihara"]],
  [/^(Tổ [Đđ]ình)/u, ["tổ đình", "ancestral Buddhist temple"]],
  [/^Đền/u, ["ngôi đền", "temple"]],
  [/^(Đình|Quán)/u, ["đình làng", "communal house"]],
  [/^Miếu/u, ["ngôi miếu", "shrine"]],
];

function normalize(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

const slugify = (s) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// --- point-in-polygon (ray casting) against GADM multipolygons ---
function inRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
function inPolygon(pt, coords) {
  if (!inRing(pt, coords[0])) return false;
  for (let i = 1; i < coords.length; i++) if (inRing(pt, coords[i])) return false;
  return true;
}
const provincePolys = gadm.features.map((f) => {
  const label = GADM_TO_LABEL[f.properties.NAME_1];
  if (!label) throw new Error(`Unmapped GADM province: ${f.properties.NAME_1}`);
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
function provinceOf(lng, lat) {
  for (const p of provincePolys) {
    const { minx, miny, maxx, maxy } = p.bbox;
    if (lng < minx || lng > maxx || lat < miny || lat > maxy) continue;
    if (p.polys.some((poly) => inPolygon([lng, lat], poly))) return p.label;
  }
  return null;
}

const distKm = (a, b) => {
  const dLat = ((a.lat - b.lat) * Math.PI) / 180;
  const dLng = ((a.lng - b.lng) * Math.PI) / 180;
  const la = (a.lat * Math.PI) / 180, lb = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

// --- filter + normalize OSM elements ---
const stats = { total: raw.length, nameMatch: 0, excludedReligion: 0, noCoords: 0, noProvince: 0, dupInternal: 0, dupExisting: 0 };
const candidates = [];
for (const el of raw) {
  const tags = el.tags ?? {};
  const name = (tags.name ?? "").replace(/\s+/g, " ").trim();
  if (!INCLUDE_PREFIX.test(name)) continue;
  stats.nameMatch++;
  if (EXCLUDE_RELIGION.has(tags.religion)) {
    stats.excludedReligion++;
    continue;
  }
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) {
    stats.noCoords++;
    continue;
  }
  const province = provinceOf(lng, lat);
  if (!province) {
    stats.noProvince++;
    continue;
  }
  candidates.push({
    osm: `${el.type}/${el.id}`,
    name,
    norm: normalize(name),
    province,
    lat: Number(lat.toFixed(7)),
    lng: Number(lng.toFixed(7)),
    wikidata: tags.wikidata ?? null,
    wikipedia: tags.wikipedia ?? null,
    hasAddr: Boolean(tags["addr:city"] || tags["addr:district"] || tags["addr:province"]),
  });
}

// --- dedupe internally: same normalized name within 2 km keeps one entry ---
const byNorm = new Map();
for (const c of candidates) {
  const group = byNorm.get(c.norm) ?? [];
  const dup = group.find((g) => distKm(g, c) < 2);
  if (dup) {
    stats.dupInternal++;
    if (!dup.wikidata && c.wikidata) Object.assign(dup, c);
    continue;
  }
  group.push(c);
  byNorm.set(c.norm, group);
}
const deduped = [...byNorm.values()].flat();

// --- dedupe against the existing dataset ---
const existingByNorm = new Map();
for (const p of existing) {
  const key = normalize(p.name.replace(/\s*\(.*\)$/, ""));
  const group = existingByNorm.get(key) ?? [];
  group.push(p);
  existingByNorm.set(key, group);
}
const fresh = deduped.filter((c) => {
  const group = existingByNorm.get(c.norm) ?? [];
  const dup = group.some(
    (p) =>
      p.province === c.province ||
      (p.lat != null && distKm({ lat: p.lat, lng: p.lng }, c) < 5)
  );
  if (dup) stats.dupExisting++;
  return !dup;
});

function wikiUrl(tag) {
  if (!tag) return null;
  const m = tag.match(/^([a-z-]{2,8}):(.+)$/);
  const lang = m ? m[1] : "vi";
  const title = (m ? m[2] : tag).replace(/ /g, "_");
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`;
}

// --- build final records with unique slugs and stable ids ---
const usedSlugs = new Set(existing.map((p) => p.slug));
const provinceSlug = (prov) => slugify(prov.replace(/^TP\.\s*/, ""));
let nextId = 80000001;
const records = fresh
  .sort((a, b) => a.province.localeCompare(b.province, "vi") || a.name.localeCompare(b.name, "vi"))
  .map((c) => {
    let slug = slugify(c.name);
    if (usedSlugs.has(slug)) slug = `${slug}-${provinceSlug(c.province)}`;
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slugify(c.name)}-${provinceSlug(c.province)}-${n++}`;
    usedSlugs.add(slug);
    const [, [vi, en]] = TYPE_LABEL.find(([re]) => re.test(c.name)) ?? [null, ["di tích", "heritage site"]];
    return {
      id: nextId++,
      slug,
      name: c.name,
      province: c.province,
      lat: c.lat,
      lng: c.lng,
      description: `${c.name} là một ${vi} tại ${c.province}, Việt Nam. Vị trí được ghi nhận từ dữ liệu cộng đồng OpenStreetMap; thông tin chi tiết sẽ được bổ sung khi có nguồn tư liệu đáng tin cậy.`,
      image: null,
      thumbnail: null,
      wikipediaUrl: wikiUrl(c.wikipedia),
      _osm: c.osm,
      _typeEn: en,
    };
  });

console.error(stats);
console.error("new records:", records.length);
const byProv = {};
for (const r of records) byProv[r.province] = (byProv[r.province] ?? 0) + 1;
console.error(byProv);
fs.writeFileSync("osm-candidates.json", JSON.stringify(records, null, 2));
