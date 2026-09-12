// Fetch boundary polygons for the 63 (pre-2025-merger) provinces from
// Nominatim and save them to province-polygons.json for local
// point-in-polygon province assignment.
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROVINCES = JSON.parse(fs.readFileSync("src/data/pagodas.json", "utf8"))
  .map((p) => p.province);
const UNIQUE = [...new Set(PROVINCES)].sort();

const CITIES = new Set(["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế"]);

async function search(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=vn&polygon_geojson=1&q=${encodeURIComponent(q)}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0 (province polygons)" } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 6) {
      await sleep(3000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

const out = {};
for (const prov of UNIQUE) {
  const base = prov === "TP. Hồ Chí Minh" ? "Hồ Chí Minh" : prov;
  const queries = CITIES.has(prov)
    ? [`Thành phố ${base}`, base]
    : [`Tỉnh ${base}`, base];
  let poly = null;
  for (const q of queries) {
    const results = await search(q + ", Việt Nam");
    await sleep(1100);
    const hit = results.find(
      (r) =>
        r.osm_type === "relation" &&
        r.class === "boundary" &&
        (r.geojson?.type === "Polygon" || r.geojson?.type === "MultiPolygon")
    );
    if (hit) {
      poly = { geojson: hit.geojson, displayName: hit.display_name };
      break;
    }
  }
  if (!poly) {
    console.error(`NO POLYGON: ${prov}`);
    continue;
  }
  out[prov] = poly;
  console.error(`ok: ${prov} (${poly.displayName})`);
}
fs.writeFileSync("province-polygons.json", JSON.stringify(out));
console.log("saved", Object.keys(out).length, "province polygons");
