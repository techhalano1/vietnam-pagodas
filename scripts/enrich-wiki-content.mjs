// Enriches the dataset from Wikipedia:
// 1. Entries with a wikipediaUrl but no image -> fetch the article's lead image.
// 2. Entries with a wikipediaUrl but no details.json entry -> fetch the full
//    article text and build bilingual-capable detail sections with references.
// 3. OSM-imported entries without a wikipediaUrl whose exact name matches a
//    Vietnamese Wikipedia article are linked only when the article intro
//    mentions the entry's (old or new) province AND, when both have
//    coordinates, they lie within 20 km of each other.
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
  "Tham khảo", "Chú thích", "Liên kết ngoài", "Xem thêm", "Ghi chú",
  "Thư viện ảnh", "Hình ảnh", "Thư viện", "Đọc thêm", "Nguồn",
  "References", "Notes", "External links", "See also", "Gallery",
  "Further reading", "Bibliography", "Sources", "Footnotes",
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
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

function titleFromUrl(url) {
  const m = url.match(/\/wiki\/([^#?]+)/);
  return m ? decodeURIComponent(m[1]).replace(/_/g, " ") : null;
}

async function fetchArticle(host, title) {
  const d = await api(host, {
    action: "query",
    titles: title,
    redirects: "1",
    prop: "extracts|pageimages|coordinates|info",
    explaintext: "1",
    piprop: "original|thumbnail",
    pithumbsize: "400",
    inprop: "url",
  });
  const page = Object.values(d.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined || page.ns !== 0) return null;
  return page;
}

function distKm(a, b, c, d2) {
  const r = Math.PI / 180;
  const x =
    Math.sin(((c - a) * r) / 2) ** 2 +
    Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d2 - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}

const PROV_ALIASES = {
  "TP. Hồ Chí Minh": ["Thành phố Hồ Chí Minh", "TP.HCM", "TP Hồ Chí Minh", "Sài Gòn"],
  "Huế": ["Thừa Thiên Huế", "Thừa Thiên - Huế", "Thừa Thiên – Huế"],
  "Bà Rịa – Vũng Tàu": ["Bà Rịa - Vũng Tàu", "Bà Rịa-Vũng Tàu"],
};

function mentionsProvince(text, p) {
  const names = [p.province, p.oldProvince].filter(Boolean)
    .flatMap((n) => [n, ...(PROV_ALIASES[n] ?? [])]);
  return names.some((n) => text.includes(n));
}

const pagodasPath = new URL("../src/data/pagodas.json", import.meta.url);
const detailsPath = new URL("../src/data/details.json", import.meta.url);
const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

let imagesAdded = 0, detailsAdded = 0, linked = 0;

// Steps 1 + 2: entries that already have a Wikipedia URL.
for (const p of pagodas) {
  if (!p.wikipediaUrl) continue;
  const needsImage = !p.image;
  const needsDetails = !details[p.slug];
  if (!needsImage && !needsDetails) continue;
  const title = titleFromUrl(p.wikipediaUrl);
  if (!title || title.includes(":")) continue; // skip drafts/user pages
  const host = p.wikipediaUrl.includes("//en.wikipedia.org") ? "en.wikipedia.org" : "vi.wikipedia.org";
  const page = await fetchArticle(host, title);
  await sleep(1200);
  if (!page) continue;
  if (needsImage && page.original?.source) {
    p.image = page.original.source;
    p.thumbnail = page.thumbnail?.source ?? page.original.source;
    imagesAdded++;
  }
  if (needsDetails && page.extract && page.extract.length > 400) {
    const sections = parseSections(page.extract);
    if (sections.length > 0) {
      const isEn = host === "en.wikipedia.org";
      details[p.slug] = {
        nameEn: isEn ? page.title : null,
        wikipediaUrlEn: isEn ? p.wikipediaUrl : null,
        sectionsVi: isEn ? [] : sections,
        sectionsEn: isEn ? sections : [],
        references: [p.wikipediaUrl],
      };
      detailsAdded++;
    }
  }
  console.error(`wiki-linked: ${p.slug} img=${needsImage && !!page.original} det=${needsDetails}`);
}

// Step 3: OSM entries without a Wikipedia URL — exact-title match with checks.
const candidates = pagodas.filter(
  (p) => p.id >= 80000000 && !p.wikipediaUrl && p.name.split(/\s+/).length >= 2
);
console.error(`title-match candidates: ${candidates.length}`);
for (let i = 0; i < candidates.length; i += 50) {
  const batch = candidates.slice(i, i + 50);
  const d = await api("vi.wikipedia.org", {
    action: "query",
    titles: batch.map((p) => p.name).join("|"),
    redirects: "1",
    prop: "extracts|pageimages|coordinates|info",
    exintro: "1",
    explaintext: "1",
    exlimit: "max",
    piprop: "original|thumbnail",
    pithumbsize: "400",
    inprop: "url",
  });
  await sleep(1500);
  const pages = Object.values(d.query?.pages ?? {}).filter(
    (pg) => pg.missing === undefined && pg.ns === 0
  );
  const norm = (s) => s.normalize("NFC").toLowerCase();
  const redirectMap = new Map();
  for (const r of d.query?.redirects ?? []) redirectMap.set(norm(r.to), norm(r.from));
  for (const pg of pages) {
    const key = norm(pg.title);
    const matches = batch.filter((p) => {
      const n = norm(p.name);
      return n === key || redirectMap.get(key) === n;
    });
    if (matches.length !== 1) continue; // ambiguous
    const p = matches[0];
    const intro = pg.extract ?? "";
    if (intro.length < 200 || !mentionsProvince(intro, p)) continue;
    const coord = pg.coordinates?.[0];
    if (coord && p.lat !== null && p.lng !== null && distKm(coord.lat, coord.lon, p.lat, p.lng) > 20)
      continue;
    p.wikipediaUrl = pg.fullurl;
    if (!p.image && pg.original?.source) {
      p.image = pg.original.source;
      p.thumbnail = pg.thumbnail?.source ?? pg.original.source;
      imagesAdded++;
    }
    linked++;
    console.error(`title-matched: ${p.slug} -> ${pg.fullurl}`);
  }
  console.error(`batch ${i + batch.length}/${candidates.length}`);
}

// Fetch full articles for the newly linked entries too.
for (const p of pagodas) {
  if (!p.wikipediaUrl || details[p.slug] || !p.wikipediaUrl.includes("vi.wikipedia.org")) continue;
  const title = titleFromUrl(p.wikipediaUrl);
  if (!title || title.includes(":")) continue;
  const page = await fetchArticle("vi.wikipedia.org", title);
  await sleep(1200);
  if (!page || !page.extract || page.extract.length < 400) continue;
  const sections = parseSections(page.extract);
  if (sections.length === 0) continue;
  details[p.slug] = {
    nameEn: null,
    wikipediaUrlEn: null,
    sectionsVi: sections,
    sectionsEn: [],
    references: [p.wikipediaUrl],
  };
  detailsAdded++;
  console.error(`details: ${p.slug}`);
}

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2) + "\n");
fs.writeFileSync(detailsPath, JSON.stringify(details, null, 2) + "\n");
console.log(`Done. imagesAdded=${imagesAdded} detailsAdded=${detailsAdded} newWikiLinks=${linked}`);
