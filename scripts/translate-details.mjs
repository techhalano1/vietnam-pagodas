// Translates Vietnamese-only detail articles into English with the OpenAI API
// so every /en detail page has a full English article.
// - details.json: entries with `sectionsVi` but no `sectionsEn` get a faithful
//   English translation (headings + text) and an English display name (`nameEn`).
// - pagodas.json: entries whose `description` is curated prose (not the OSM
//   placeholder) and whose `descriptionEn` is a generated blurb get a translation.
// Progress is cached in .translate-cache.json so the run can be resumed.
//
// Usage: OPENAI_API_KEY=... node scripts/translate-details.mjs [--model gpt-4.1]
import fs from "node:fs";

const MODEL = process.argv.includes("--model")
  ? process.argv[process.argv.indexOf("--model") + 1]
  : "gpt-4.1";
const CONCURRENCY = 6;
const CHUNK_CHARS = 9000;
const CACHE = ".translate-cache.json";
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) throw new Error("OPENAI_API_KEY is required");

const pagodas = JSON.parse(fs.readFileSync("src/data/pagodas.json", "utf8"));
const details = JSON.parse(fs.readFileSync("src/data/details.json", "utf8"));
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const saveCache = () => fs.writeFileSync(CACHE, JSON.stringify(cache));

const SYSTEM = `You are a professional Vietnamese-to-English translator specialising in Vietnamese Buddhist, folk-religion and heritage texts.
Translate faithfully and completely: preserve every fact, date, name, number and paragraph break; do not summarise, add, or omit anything.
Keep Vietnamese proper nouns (people, places, pagodas, dynasties) with their diacritics, e.g. "Chùa Bổ Đà" -> "Bổ Đà Pagoda", "Đền Ngọc Sơn" -> "Ngọc Sơn Temple", "Đình Trạm Bạc" -> "Trạm Bạc Communal House"; keep "đình", "miếu", "tịnh xá", "tổ đình" as loanwords with a short gloss on first use where helpful.
Use natural, readable British/International English. Return only JSON.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function chat(user) {
  for (let i = 0; i < 6; i++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.status === 429 || res.status >= 500) {
      await sleep(5000 * (i + 1));
      continue;
    }
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    try {
      return JSON.parse(json.choices[0].message.content);
    } catch {
      await sleep(2000);
    }
  }
  throw new Error("chat failed");
}

function chunkSections(sections) {
  const chunks = [];
  let cur = [];
  let size = 0;
  for (const s of sections) {
    const len = s.text.length + (s.heading ?? "").length;
    if (cur.length && size + len > CHUNK_CHARS) {
      chunks.push(cur);
      cur = [];
      size = 0;
    }
    if (len > CHUNK_CHARS) {
      // split one oversized section on paragraph boundaries
      const paras = s.text.split(/\n\n+/);
      let buf = [];
      let bl = 0;
      let first = true;
      for (const p of paras) {
        if (buf.length && bl + p.length > CHUNK_CHARS) {
          chunks.push([{ heading: first ? s.heading : null, text: buf.join("\n\n"), _cont: !first }]);
          first = false;
          buf = [];
          bl = 0;
        }
        buf.push(p);
        bl += p.length;
      }
      if (buf.length) chunks.push([{ heading: first ? s.heading : null, text: buf.join("\n\n"), _cont: !first }]);
      continue;
    }
    cur.push(s);
    size += len;
  }
  if (cur.length) chunks.push(cur);
  return chunks;
}

async function translateSections(name, sections) {
  const chunks = chunkSections(sections);
  const out = [];
  for (const chunk of chunks) {
    const payload = chunk.map(({ heading, text }) => ({ heading, text }));
    const prompt =
      `Site: ${name}\n\nTranslate the following Vietnamese article sections into English. ` +
      `Return JSON {"sections":[{"heading":string|null,"text":string}]} with exactly ${payload.length} items in the same order; translate headings too (null stays null).\n\n` +
      JSON.stringify(payload);
    const res = await chat(prompt);
    if (!Array.isArray(res.sections) || res.sections.length !== payload.length) {
      throw new Error(`bad section count for ${name}`);
    }
    res.sections.forEach((s, i) => {
      const text = String(s.text ?? "").trim();
      if (chunk[i]._cont && out.length) out[out.length - 1].text += "\n\n" + text;
      else out.push({ heading: s.heading ? String(s.heading) : null, text });
    });
  }
  return out;
}

async function translateNameAndDescription(name, description) {
  const res = await chat(
    `Return JSON {"nameEn":string,"descriptionEn":string}.\n` +
      `"nameEn": the English display name for the site "${name}" (e.g. "Cao Linh Pagoda", "Ngọc Sơn Temple", "Trạm Bạc Communal House"), keeping diacritics.\n` +
      `"descriptionEn": faithful English translation of this Vietnamese description:\n\n${description}`,
  );
  return { nameEn: String(res.nameEn ?? "").trim() || null, descriptionEn: String(res.descriptionEn ?? "").trim() };
}

const isOsmPlaceholder = (p) => p.description.includes("dữ liệu cộng đồng OpenStreetMap");
const isBlurb = (p) => !p.descriptionEn || p.descriptionEn.includes("A full English article is not yet available");

const jobs = [];
for (const p of pagodas) {
  const d = details[p.slug];
  const needSections = d && d.sectionsEn.length === 0 && d.sectionsVi.length > 0;
  const needDescription = !isOsmPlaceholder(p) && isBlurb(p);
  if (needSections || needDescription) jobs.push({ p, d, needSections, needDescription });
}
if (process.argv.includes("--limit")) jobs.length = Number(process.argv[process.argv.indexOf("--limit") + 1]);
console.log(`jobs: ${jobs.length} (sections=${jobs.filter((j) => j.needSections).length}, descriptions=${jobs.filter((j) => j.needDescription).length}) model=${MODEL}`);

let done = 0;
let failed = 0;
async function worker() {
  while (jobs.length) {
    const { p, d, needSections, needDescription } = jobs.shift();
    const c = (cache[p.slug] ??= {});
    try {
      if (needSections && !c.sections) {
        c.sections = await translateSections(p.name, d.sectionsVi);
        saveCache();
      }
      if ((needDescription || (needSections && !d.nameEn)) && !c.meta) {
        c.meta = await translateNameAndDescription(p.name, p.description);
        saveCache();
      }
      done++;
      if (done % 10 === 0) console.log(`  ${done} done, ${jobs.length} left`);
    } catch (e) {
      failed++;
      console.error(`FAIL ${p.slug}: ${e.message}`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

let secApplied = 0;
let descApplied = 0;
for (const p of pagodas) {
  const c = cache[p.slug];
  if (!c) continue;
  const d = details[p.slug];
  if (c.sections && d && d.sectionsEn.length === 0) {
    d.sectionsEn = c.sections;
    secApplied++;
  }
  if (c.meta) {
    if (d && !d.nameEn && c.meta.nameEn) d.nameEn = c.meta.nameEn;
    if (!isOsmPlaceholder(p) && isBlurb(p) && c.meta.descriptionEn) {
      p.descriptionEn = c.meta.descriptionEn;
      descApplied++;
    }
  }
}
fs.writeFileSync("src/data/pagodas.json", JSON.stringify(pagodas, null, 2) + "\n");
fs.writeFileSync("src/data/details.json", JSON.stringify(details, null, 2) + "\n");
console.log(`Done. sectionsEn added=${secApplied} descriptionEn translated=${descApplied} failed=${failed}`);
