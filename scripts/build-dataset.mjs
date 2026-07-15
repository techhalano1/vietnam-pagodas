// Transforms pagodas-raw.json (from fetch-data.mjs) into src/data/pagodas.json
// with URL-safe slugs and basic cleanup.
import fs from "node:fs";
import path from "node:path";

const rawPath = process.argv[2] ?? "pagodas-raw.json";
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slugCount = new Map();
const out = raw
  .filter((p) => p.name && !p.name.startsWith("Danh sách"))
  .map((p) => {
    let slug = slugify(p.name);
    const n = slugCount.get(slug) ?? 0;
    slugCount.set(slug, n + 1);
    if (n > 0) slug = `${slug}-${n + 1}`;
    return { ...p, slug };
  });

const dest = path.join(path.dirname(new URL(import.meta.url).pathname), "../src/data/pagodas.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`Wrote ${out.length} pagodas to ${dest}`);
