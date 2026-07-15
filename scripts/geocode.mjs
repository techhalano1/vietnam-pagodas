// Geocode remaining pagodas without coordinates via Nominatim (OSM).
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = JSON.parse(fs.readFileSync("pagodas-raw.json", "utf8"));
const need = list.filter((p) => p.lat == null);
console.error(`Geocoding: ${need.length}`);

async function geocode(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0 (research)" } });
  if (!res.ok) return null;
  const d = await res.json();
  return d[0] ?? null;
}

let found = 0;
for (const p of need) {
  const name = p.name.replace(/\s*\(.*\)\s*/, " ").trim();
  let hit = await geocode(`${name}, ${p.province}`);
  await sleep(1100);
  if (!hit) {
    hit = await geocode(name);
    await sleep(1100);
  }
  if (hit) {
    p.lat = parseFloat(hit.lat);
    p.lng = parseFloat(hit.lon);
    found++;
  }
}
console.error(`Geocoded ${found}. Total with coords: ${list.filter((p) => p.lat != null).length}/${list.length}`);
fs.writeFileSync("pagodas-raw.json", JSON.stringify(list, null, 2));
