// Validate pagoda coordinates against their province boundary (Nominatim).
// Usage: node scripts/validate-coords.mjs [dataset.json]
// Prints entries with missing coordinates or coordinates outside their
// province's bounding box (with a tolerance margin), as JSON on stdout.
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const file = process.argv[2] ?? "src/data/pagodas.json";
const list = JSON.parse(fs.readFileSync(file, "utf8"));

const MARGIN = 0.15; // degrees of tolerance around the province bbox

// Old province -> province it belongs to after the 2025 mergers. A point is
// accepted if it falls in either bbox (OSM boundaries may reflect either era).
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

async function getJson(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0 (validation)" } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 8) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

// Equivalent names for a province: itself, the province it merged into, and
// any old provinces that merged into it.
const equivalents = (prov) => [
  prov,
  ...(MERGED[prov] ? [MERGED[prov]] : []),
  ...Object.keys(MERGED).filter((old) => MERGED[old] === prov),
];

const provinces = [...new Set(list.flatMap((p) => equivalents(p.province)))];
const bboxByProvince = new Map();
for (const prov of provinces) {
  const d = await getJson(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(prov + ", Việt Nam")}`
  );
  const hit = d[0];
  if (hit?.boundingbox) {
    const [s, n, w, e] = hit.boundingbox.map(Number);
    bboxByProvince.set(prov, { s, n, w, e });
  } else {
    console.error(`No bbox for province: ${prov}`);
  }
  await sleep(1100);
}

const issues = [];
for (const p of list) {
  if (p.lat == null || p.lng == null) {
    issues.push({ id: p.id, name: p.name, province: p.province, issue: "missing" });
    continue;
  }
  const boxes = equivalents(p.province)
    .map((name) => bboxByProvince.get(name))
    .filter(Boolean);
  if (boxes.length === 0) continue;
  const inside = boxes.some(
    (b) => p.lat >= b.s - MARGIN && p.lat <= b.n + MARGIN && p.lng >= b.w - MARGIN && p.lng <= b.e + MARGIN
  );
  if (!inside) {
    issues.push({ id: p.id, name: p.name, province: p.province, lat: p.lat, lng: p.lng, issue: "outside_province" });
  }
}
console.error(`Issues: ${issues.length} (missing: ${issues.filter((i) => i.issue === "missing").length}, outside: ${issues.filter((i) => i.issue === "outside_province").length})`);
console.log(JSON.stringify(issues, null, 2));
