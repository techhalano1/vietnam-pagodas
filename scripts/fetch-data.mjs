// Fetches pagoda/temple data from Vietnamese Wikipedia (per-province categories)
// and enriches with coordinates, intro text, and images.
import fs from "node:fs";

const API = "https://vi.wikipedia.org/w/api.php";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ format: "json", ...params }).toString();
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": "VietnamPagodasBot/1.0 (research; contact: none)" } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 10) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

async function categoryMembers(cmtitle) {
  let members = [];
  let cmcontinue;
  do {
    const d = await api({
      action: "query",
      list: "categorymembers",
      cmtitle,
      cmlimit: "500",
      cmnamespace: "0",
      ...(cmcontinue ? { cmcontinue } : {}),
    });
    members = members.concat(d.query.categorymembers);
    cmcontinue = d.continue?.cmcontinue;
  } while (cmcontinue);
  return members;
}

async function pageDetails(titles) {
  // batch up to 20 titles
  const d = await api({
    action: "query",
    titles: titles.join("|"),
    prop: "coordinates|extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    exlimit: "20",
    piprop: "thumbnail|original",
    pithumbsize: "800",
    inprop: "url",
    redirects: "1",
  });
  return Object.values(d.query.pages);
}

const provincesRes = await api({
  action: "query",
  list: "categorymembers",
  cmtitle: "Thể loại:Chùa Việt Nam theo tỉnh thành",
  cmlimit: "500",
});

const provinces = provincesRes.query.categorymembers.map((m) => ({
  cat: m.title,
  province: m.title.replace("Thể loại:Chùa tại ", "").replace("Thành phố Hồ Chí Minh", "TP. Hồ Chí Minh"),
}));

const out = [];
for (const { cat, province } of provinces) {
  const members = await categoryMembers(cat);
  console.error(`${province}: ${members.length} pages`);
  for (let i = 0; i < members.length; i += 20) {
    const batch = members.slice(i, i + 20).map((m) => m.title);
    const pages = await pageDetails(batch);
    for (const p of pages) {
      if (!p.pageid) continue;
      out.push({
        id: p.pageid,
        name: p.title,
        province,
        lat: p.coordinates?.[0]?.lat ?? null,
        lng: p.coordinates?.[0]?.lon ?? null,
        description: (p.extract || "").trim(),
        image: p.original?.source ?? null,
        thumbnail: p.thumbnail?.source ?? null,
        wikipediaUrl: p.fullurl,
      });
    }
    await sleep(2000);
  }
}

// dedupe by pageid (a page can be in multiple categories)
const seen = new Map();
for (const p of out) if (!seen.has(p.id)) seen.set(p.id, p);
const list = [...seen.values()].sort((a, b) => a.province.localeCompare(b.province, "vi") || a.name.localeCompare(b.name, "vi"));
console.error(`Total unique: ${list.length}, with coords: ${list.filter((p) => p.lat).length}, with image: ${list.filter((p) => p.image).length}`);
fs.writeFileSync("pagodas-raw.json", JSON.stringify(list, null, 2));
