// Enrich pagodas-raw.json with coordinates/images from Wikidata (P625, P18).
import fs from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(url) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0" } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 10) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

const list = JSON.parse(fs.readFileSync("pagodas-raw.json", "utf8"));
const byId = new Map(list.map((p) => [p.id, p]));
const need = list.filter((p) => p.lat == null || !p.image);
console.error(`Need enrichment: ${need.length}`);

// 1. map pageids -> wikidata ids
const qidByPageId = new Map();
for (let i = 0; i < need.length; i += 50) {
  const ids = need.slice(i, i + 50).map((p) => p.id).join("|");
  const d = await getJson(
    `https://vi.wikipedia.org/w/api.php?action=query&pageids=${ids}&prop=pageprops&ppprop=wikibase_item&format=json`
  );
  for (const page of Object.values(d.query.pages)) {
    const qid = page.pageprops?.wikibase_item;
    if (qid) qidByPageId.set(page.pageid, qid);
  }
  await sleep(1500);
}
console.error(`With QIDs: ${qidByPageId.size}`);

// 2. fetch wikidata claims
const entries = [...qidByPageId.entries()];
for (let i = 0; i < entries.length; i += 50) {
  const batch = entries.slice(i, i + 50);
  const d = await getJson(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${batch.map(([, q]) => q).join("|")}&props=claims&format=json`
  );
  for (const [pageid, qid] of batch) {
    const claims = d.entities?.[qid]?.claims;
    if (!claims) continue;
    const p = byId.get(pageid);
    const coord = claims.P625?.[0]?.mainsnak?.datavalue?.value;
    if (coord && p.lat == null) {
      p.lat = coord.latitude;
      p.lng = coord.longitude;
    }
    const img = claims.P18?.[0]?.mainsnak?.datavalue?.value;
    if (img && !p.image) {
      const file = encodeURIComponent(img.replace(/ /g, "_"));
      p.image = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1200`;
      p.thumbnail = `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=400`;
    }
  }
  await sleep(1500);
}

console.error(
  `After enrichment: with coords ${list.filter((p) => p.lat != null).length}, with image ${list.filter((p) => p.image).length}`
);
fs.writeFileSync("pagodas-raw.json", JSON.stringify(list, null, 2));
