// Repair missing/misplaced coordinates in src/data/pagodas.json.
// Input: issues JSON from validate-coords.mjs (ids to repair).
//   node scripts/fix-coords.mjs issues.json
// Strategy per entry:
//   1. Wikidata P625 by article pageid (authoritative).
//   2. If it already has coords, reverse-geocode and keep them when the
//      address matches the entry's province (old or post-2025-merger name).
//   3. Otherwise forward-geocode "name, province" via Nominatim, accepting a
//      hit only when its display_name mentions the province; else drop coords.
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DATASET = "src/data/pagodas.json";
const issues = JSON.parse(fs.readFileSync(process.argv[2] ?? "issues.json", "utf8"));
const list = JSON.parse(fs.readFileSync(DATASET, "utf8"));
const byId = new Map(list.map((p) => [p.id, p]));

// Old province -> province it belongs to after the 2025 mergers.
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

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

function provinceMatches(displayName, province) {
  const d = norm(displayName);
  const names = [province, MERGED[province]].filter(Boolean);
  if (province === "TP. Hồ Chí Minh") names.push("Hồ Chí Minh");
  if (province === "Huế" || province === "Thừa Thiên Huế") names.push("Huế", "Thừa Thiên Huế");
  return names.some((n) => d.includes(norm(n)));
}

async function getJson(url, ua) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": ua } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 8) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}
const wiki = (url) => getJson(url, "VietnamPagodasBot/1.0");
const nominatim = async (url) => {
  const d = await getJson(url, "VietnamPagodasBot/1.0 (coord repair)");
  await sleep(1100);
  return d;
};

// --- 1. Wikidata P625 ---
const ids = issues.map((i) => i.id);
const qidByPageId = new Map();
for (let i = 0; i < ids.length; i += 50) {
  const d = await wiki(
    `https://vi.wikipedia.org/w/api.php?action=query&pageids=${ids.slice(i, i + 50).join("|")}&prop=pageprops&ppprop=wikibase_item&format=json`
  );
  for (const page of Object.values(d.query.pages)) {
    if (page.pageprops?.wikibase_item) qidByPageId.set(page.pageid, page.pageprops.wikibase_item);
  }
  await sleep(1000);
}
const coordByPageId = new Map();
const entries = [...qidByPageId.entries()];
for (let i = 0; i < entries.length; i += 50) {
  const batch = entries.slice(i, i + 50);
  const d = await wiki(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.map(([, q]) => q).join("|")}&props=claims&format=json`
  );
  for (const [pageid, qid] of batch) {
    const c = d.entities?.[qid]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
    if (c) coordByPageId.set(pageid, { lat: c.latitude, lng: c.longitude });
  }
  await sleep(1000);
}

let fromWikidata = 0, keptVerified = 0, geocoded = 0, dropped = 0;
for (const issue of issues) {
  const p = byId.get(issue.id);
  if (!p) continue;
  const wd = coordByPageId.get(p.id);
  if (wd) {
    p.lat = wd.lat;
    p.lng = wd.lng;
    fromWikidata++;
    continue;
  }
  if (issue.issue === "outside_province" && p.lat != null) {
    const rev = await nominatim(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.lat}&lon=${p.lng}&zoom=8`
    );
    if (rev?.display_name && provinceMatches(rev.display_name, p.province)) {
      keptVerified++;
      continue;
    }
  }
  const name = p.name.replace(/\s*\(.*\)\s*/, " ").trim();
  const hits = await nominatim(
    `https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=vn&q=${encodeURIComponent(`${name}, ${p.province}`)}`
  );
  const hit = (hits ?? []).find((h) => provinceMatches(h.display_name, p.province));
  if (hit) {
    p.lat = parseFloat(hit.lat);
    p.lng = parseFloat(hit.lon);
    geocoded++;
  } else if (issue.issue === "outside_province") {
    p.lat = null;
    p.lng = null;
    dropped++;
    console.error(`Dropped bad coords: ${p.name} (${p.province})`);
  } else {
    console.error(`Still missing: ${p.name} (${p.province})`);
  }
}

console.error(
  `Wikidata: ${fromWikidata}, kept (verified): ${keptVerified}, geocoded (verified): ${geocoded}, dropped: ${dropped}`
);
fs.writeFileSync(DATASET, JSON.stringify(list, null, 2));
console.error(`Wrote ${DATASET}. With coords: ${list.filter((p) => p.lat != null).length}/${list.length}`);
