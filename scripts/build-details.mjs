// Builds src/data/details.json from details-raw.json (fetch-details.mjs output)
// keyed by slug: { nameEn, wikipediaUrlEn, sectionsVi, sectionsEn, references }
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawPath = process.argv[2] ?? "details-raw.json";
const details = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const pagodas = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/data/pagodas.json"), "utf8")
);

const SKIP_VI = new Set([
  "tham khảo", "chú thích", "liên kết ngoài", "xem thêm", "thư viện ảnh",
  "hình ảnh", "thư mục", "ghi chú", "nguồn",
]);
const SKIP_EN = new Set([
  "references", "notes", "external links", "see also", "further reading",
  "bibliography", "gallery", "sources", "citations",
]);

function parseSections(extract, skip) {
  if (!extract) return [];
  const parts = extract.split(/^==+\s*(.+?)\s*==+\s*$/m);
  const sections = [];
  if (parts[0]?.trim()) sections.push({ heading: null, text: parts[0].trim() });
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i].trim();
    const text = (parts[i + 1] ?? "").trim();
    if (skip.has(heading.toLowerCase()) || !text) continue;
    sections.push({ heading, text });
  }
  return sections;
}

const out = {};
for (const p of pagodas) {
  const d = details[p.id];
  if (!d) continue;
  const refs = (d.references ?? [])
    .filter((u) => /^https?:\/\//.test(u) && !/wikipedia\.org|wikimedia|wikidata|wiktionary/.test(u))
    .slice(0, 15);
  out[p.slug] = {
    nameEn: d.name_en ?? null,
    wikipediaUrlEn: d.wikipediaUrlEn ?? null,
    sectionsVi: parseSections(d.content_vi, SKIP_VI),
    sectionsEn: parseSections(d.content_en, SKIP_EN),
    references: refs,
  };
}
const outPath = path.join(__dirname, "../src/data/details.json");
fs.writeFileSync(outPath, JSON.stringify(out));
const withEn = Object.values(out).filter((d) => d.sectionsEn.length > 0).length;
const multi = Object.values(out).filter((d) => d.sectionsVi.length > 1).length;
console.log(
  `Wrote ${Object.keys(out).length} details (${withEn} with English content, ${multi} with multiple sections) to ${outPath}`
);
