// Merge validated OSM candidates (osm-candidates.json, from
// scripts/build-osm-candidates.mjs) into src/data/pagodas.json.
import fs from "node:fs";

const list = JSON.parse(fs.readFileSync("src/data/pagodas.json", "utf8"));
const candidates = JSON.parse(fs.readFileSync("osm-candidates.json", "utf8"));

const slugs = new Set(list.map((p) => p.slug));
const ids = new Set(list.map((p) => p.id));
let added = 0;
for (const c of candidates) {
  if (slugs.has(c.slug) || ids.has(c.id)) continue;
  const { _osm, _typeEn, ...record } = c;
  void _osm;
  void _typeEn;
  list.push(record);
  slugs.add(c.slug);
  ids.add(c.id);
  added++;
}
fs.writeFileSync("src/data/pagodas.json", JSON.stringify(list, null, 2) + "\n");
console.log(`added ${added} entries; total ${list.length}`);
