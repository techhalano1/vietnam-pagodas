// Fetches full article content (vi + en) and external references for each pagoda
// in pagodas-raw.json. Writes details-raw.json keyed by pageid.
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  url.search = new URLSearchParams({ format: "json", ...params }).toString();
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0 (research)" } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 10) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

async function fullExtract(host, pageid) {
  const d = await api(host, {
    action: "query",
    pageids: String(pageid),
    prop: "extracts",
    explaintext: "1",
    exsectionformat: "wiki",
    redirects: "1",
  });
  return d.query.pages[pageid]?.extract ?? "";
}

async function extLinks(host, pageid) {
  const d = await api(host, {
    action: "query",
    pageids: String(pageid),
    prop: "extlinks",
    ellimit: "40",
  });
  return (d.query.pages[pageid]?.extlinks ?? []).map((l) => l["*"]);
}

const raw = JSON.parse(fs.readFileSync(process.argv[2] ?? "pagodas-raw.json", "utf8"));
const outPath = process.argv[3] ?? "details-raw.json";
const details = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : {};

// map vi pageids -> en titles via langlinks (batched)
const enTitleById = {};
for (let i = 0; i < raw.length; i += 50) {
  const ids = raw.slice(i, i + 50).map((p) => p.id).join("|");
  const d = await api("vi.wikipedia.org", {
    action: "query",
    pageids: ids,
    prop: "langlinks",
    lllang: "en",
    lllimit: "500",
  });
  for (const page of Object.values(d.query.pages)) {
    const en = page.langlinks?.[0]?.["*"];
    if (en) enTitleById[page.pageid] = en;
  }
  await sleep(1000);
}
console.error(`With en article: ${Object.keys(enTitleById).length}/${raw.length}`);

let n = 0;
for (const p of raw) {
  n++;
  if (details[p.id]?.content_vi) continue;
  const d = { content_vi: "", content_en: "", name_en: null, wikipediaUrlEn: null, references: [] };
  try {
    d.content_vi = await fullExtract("vi.wikipedia.org", p.id);
    await sleep(400);
    d.references = (await extLinks("vi.wikipedia.org", p.id)).filter((u) => u.startsWith("http"));
    await sleep(400);
    const enTitle = enTitleById[p.id];
    if (enTitle) {
      const ed = await api("en.wikipedia.org", {
        action: "query",
        titles: enTitle,
        prop: "extracts|info",
        explaintext: "1",
        exsectionformat: "wiki",
        inprop: "url",
        redirects: "1",
      });
      const page = Object.values(ed.query.pages)[0];
      if (page?.extract) {
        d.content_en = page.extract;
        d.name_en = page.title;
        d.wikipediaUrlEn = page.fullurl;
      }
      await sleep(400);
    }
  } catch (e) {
    console.error(`FAIL ${p.name}: ${e.message}`);
  }
  details[p.id] = d;
  if (n % 20 === 0) {
    fs.writeFileSync(outPath, JSON.stringify(details));
    console.error(`${n}/${raw.length}`);
  }
}
fs.writeFileSync(outPath, JSON.stringify(details));
console.error(`Done: ${Object.keys(details).length} details`);
