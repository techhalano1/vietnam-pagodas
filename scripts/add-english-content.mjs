// Adds English-language content so /en pages are not Vietnamese-only:
// 1. Every entry gets a `descriptionEn`:
//    - templated OSM descriptions are re-generated in English;
//    - entries with an English Wikipedia article use its lead paragraph;
//    - everything else gets a short factual English blurb (name, type, province).
// 2. Entries whose Vietnamese Wikipedia article has an English counterpart
//    (via langlinks) get `sectionsEn`, `nameEn`, `wikipediaUrlEn` in details.json.
import fs from "node:fs";

const UA = { "User-Agent": "VietnamPagodasBot/1.0 (github.com/techhalano1/vietnam-pagodas)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 0; i < 5; i++) {
    const res = await fetch(url, { headers: UA });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      await sleep(10000 * (i + 1));
    }
  }
  throw new Error(`API failed: ${url}`);
}

const SKIP_HEADINGS = new Set([
  "References", "Notes", "External links", "See also", "Gallery",
  "Further reading", "Bibliography", "Sources", "Footnotes", "Citations",
]);

function parseSections(extract) {
  const sections = [];
  let heading = null;
  let buf = [];
  const flush = () => {
    const text = buf.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    if (text && (!heading || !SKIP_HEADINGS.has(heading))) sections.push({ heading, text });
    buf = [];
  };
  for (const line of extract.split("\n")) {
    const m = line.match(/^==+\s*(.+?)\s*==+$/);
    if (m) {
      flush();
      heading = m[1];
    } else buf.push(line);
  }
  flush();
  return sections;
}

function titleFromUrl(url) {
  const m = url.match(/\/wiki\/([^#?]+)/);
  return m ? decodeURIComponent(m[1]).replace(/_/g, " ") : null;
}

const TYPE_EN = {
  "ngôi chùa": "Buddhist pagoda",
  "đình làng": "village communal house (đình)",
  "ngôi đền": "temple (đền)",
  "ngôi miếu": "shrine (miếu)",
  "tịnh xá": "Buddhist vihara (tịnh xá)",
  "thiền viện": "Zen monastery (thiền viện)",
  "tổ đình": "ancestral Buddhist temple (tổ đình)",
};

function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
}

function typeFromName(name) {
  const n = normalize(name);
  if (n.startsWith("thien vien")) return "Zen monastery (thiền viện)";
  if (n.startsWith("tinh xa")) return "Buddhist vihara (tịnh xá)";
  if (n.startsWith("to dinh")) return "ancestral Buddhist temple (tổ đình)";
  if (n.startsWith("chua")) return "Buddhist pagoda";
  if (n.startsWith("den")) return "temple (đền)";
  if (n.startsWith("dinh") || n.startsWith("quan ")) return "communal house (đình)";
  if (n.startsWith("mieu")) return "shrine (miếu)";
  if (n.startsWith("thap")) return "Buddhist tower (tháp)";
  return "religious heritage site";
}

const OSM_TEMPLATE =
  /^(.+?) là một (ngôi chùa|đình làng|ngôi đền|ngôi miếu|tịnh xá|thiền viện|tổ đình) tại (.+?)(?: \(khu vực (.+?) cũ\))?, Việt Nam\. Vị trí được ghi nhận từ dữ liệu cộng đồng OpenStreetMap/u;

function locationEn(p) {
  return `${p.province}${p.oldProvince ? ` (formerly ${p.oldProvince} province)` : ""}, Vietnam`;
}

function firstParagraph(extract) {
  const para = extract.split("\n").map((s) => s.trim()).find((s) => s.length > 60) ?? "";
  return para.length > 600 ? `${para.slice(0, 597).replace(/\s+\S*$/, "")}…` : para;
}

const pagodasPath = new URL("../src/data/pagodas.json", import.meta.url);
const detailsPath = new URL("../src/data/details.json", import.meta.url);
const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

let enArticles = 0;

// Step 2 first: find English articles for Vietnamese-Wikipedia-linked entries.
const viLinked = pagodas.filter(
  (p) =>
    p.wikipediaUrl?.includes("vi.wikipedia.org") &&
    !(details[p.slug]?.sectionsEn?.length > 0) &&
    titleFromUrl(p.wikipediaUrl) &&
    !titleFromUrl(p.wikipediaUrl).includes(":")
);
console.error(`checking langlinks for ${viLinked.length} entries`);
const enTitleBySlug = new Map();
for (let i = 0; i < viLinked.length; i += 50) {
  const batch = viLinked.slice(i, i + 50);
  const d = await api("vi.wikipedia.org", {
    action: "query",
    titles: batch.map((p) => titleFromUrl(p.wikipediaUrl)).join("|"),
    redirects: "1",
    prop: "langlinks",
    lllang: "en",
    lllimit: "max",
  });
  await sleep(1200);
  const norm = (s) => s.normalize("NFC");
  const redirect = new Map((d.query?.redirects ?? []).map((r) => [norm(r.from), norm(r.to)]));
  const enByTitle = new Map();
  for (const pg of Object.values(d.query?.pages ?? {})) {
    const en = pg.langlinks?.[0]?.["*"];
    if (en) enByTitle.set(norm(pg.title), en);
  }
  for (const p of batch) {
    const t = norm(titleFromUrl(p.wikipediaUrl));
    const en = enByTitle.get(redirect.get(t) ?? t);
    if (en) enTitleBySlug.set(p.slug, en);
  }
}
console.error(`found ${enTitleBySlug.size} English articles`);

for (const p of pagodas) {
  const enTitle = enTitleBySlug.get(p.slug);
  if (!enTitle) continue;
  const d = await api("en.wikipedia.org", {
    action: "query",
    titles: enTitle,
    redirects: "1",
    prop: "extracts|info",
    explaintext: "1",
    inprop: "url",
  });
  await sleep(1200);
  const page = Object.values(d.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined || !page.extract || page.extract.length < 300) continue;
  const sections = parseSections(page.extract);
  if (sections.length === 0) continue;
  const det = details[p.slug] ?? {
    nameEn: null,
    wikipediaUrlEn: null,
    sectionsVi: [],
    sectionsEn: [],
    references: [p.wikipediaUrl],
  };
  det.sectionsEn = sections;
  det.nameEn = page.title;
  det.wikipediaUrlEn = page.fullurl;
  if (!det.references.includes(page.fullurl)) det.references.push(page.fullurl);
  details[p.slug] = det;
  p.descriptionEn = firstParagraph(page.extract);
  enArticles++;
  console.error(`en article: ${p.slug} -> ${page.title}`);
}

// Step 1: descriptionEn for everyone.
let templated = 0, fromEn = 0, blurb = 0;
for (const p of pagodas) {
  if (p.descriptionEn) { fromEn++; continue; }
  const det = details[p.slug];
  if (det?.sectionsEn?.length > 0) {
    p.descriptionEn = firstParagraph(det.sectionsEn[0].text);
    fromEn++;
    continue;
  }
  const m = p.description.match(OSM_TEMPLATE);
  if (m) {
    p.descriptionEn = `${p.name} is a ${TYPE_EN[m[2]]} in ${locationEn(p)}. Its location comes from OpenStreetMap community data; further details will be added when reliable sources become available.`;
    templated++;
  } else {
    p.descriptionEn = `${p.name} is a ${typeFromName(p.name)} in ${locationEn(p)}. A full English article is not yet available; the Vietnamese description and cited references are shown below.`;
    blurb++;
  }
}

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2) + "\n");
fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2) + "\n");
console.log(`Done. newEnArticles=${enArticles} descriptionEn: fromEn=${fromEn} templated=${templated} blurb=${blurb}`);
