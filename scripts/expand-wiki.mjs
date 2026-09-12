// Expands the dataset by walking the full Vietnamese Wikipedia category tree
// "Thể loại:Chùa Việt Nam" (recursively), which contains many pagoda articles
// missing from the per-province categories used by fetch-data.mjs.
// Province is inferred from the article intro text and written to
// new-wiki-raw.json for review/merging by merge-expanded.mjs.
import fs from "node:fs";

const API = "https://vi.wikipedia.org/w/api.php";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 0; i < 6; i++) {
    const res = await fetch(url, {
      headers: { "User-Agent": "VietnamPagodasBot/1.0 (github.com/techhalano1/vietnam-pagodas)" },
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error(`rate limited, backing off ${15 * (i + 1)}s`);
      await sleep(15000 * (i + 1));
    }
  }
  throw new Error("API kept failing");
}

const PROVINCES = ["An Giang","Bà Rịa – Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh","Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận","Cà Mau","Cần Thơ","Cao Bằng","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi","Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Huế","Tiền Giang","TP. Hồ Chí Minh","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái"];

const ALIASES = {
  "TP. Hồ Chí Minh": ["Thành phố Hồ Chí Minh", "TP.HCM", "TP Hồ Chí Minh", "Sài Gòn"],
  "Huế": ["Thừa Thiên Huế", "Thừa Thiên - Huế", "Thừa Thiên – Huế", "thành phố Huế"],
  "Bà Rịa – Vũng Tàu": ["Bà Rịa - Vũng Tàu", "Bà Rịa-Vũng Tàu"],
  "Đà Nẵng": ["thành phố Đà Nẵng"],
};

function detectProvince(text) {
  if (!text) return null;
  const hits = [];
  for (const prov of PROVINCES) {
    const names = [prov, ...(ALIASES[prov] ?? [])];
    let idx = -1;
    for (const n of names) {
      const i = text.indexOf(n);
      if (i !== -1 && (idx === -1 || i < idx)) idx = i;
    }
    if (idx !== -1) hits.push({ prov, idx });
  }
  if (hits.length === 0) return null;
  hits.sort((a, b) => a.idx - b.idx);
  // "Hà Nội" appears inside "phố Hà Nội" etc.; earliest mention wins —
  // the intro sentence almost always states the location first.
  return hits[0].prov;
}

async function categoryTree(root, maxDepth) {
  const seenCats = new Set();
  const pages = new Map();
  let frontier = [root];
  for (let depth = 0; depth <= maxDepth && frontier.length; depth++) {
    const next = [];
    for (const cat of frontier) {
      if (seenCats.has(cat)) continue;
      seenCats.add(cat);
      let cmcontinue;
      do {
        const d = await api({
          action: "query",
          list: "categorymembers",
          cmtitle: cat,
          cmlimit: "500",
          ...(cmcontinue ? { cmcontinue } : {}),
        });
        for (const m of d.query?.categorymembers ?? []) {
          if (m.ns === 14) next.push(m.title);
          else if (m.ns === 0) pages.set(m.pageid, m.title);
        }
        cmcontinue = d.continue?.cmcontinue;
        await sleep(1500);
      } while (cmcontinue);
      console.error(`${cat}: total pages so far ${pages.size}`);
    }
    frontier = next;
  }
  return pages;
}

const existing = JSON.parse(fs.readFileSync(new URL("../src/data/pagodas.json", import.meta.url), "utf8"));
const existingIds = new Set(existing.map((p) => p.id));

const pages = await categoryTree("Thể loại:Chùa Việt Nam", 3);
console.error(`Category tree yielded ${pages.size} articles`);

const candidates = [...pages.entries()]
  .filter(([id, title]) => !existingIds.has(id) && !title.startsWith("Danh sách") && !title.includes("định hướng"))
  .map(([id]) => id);
console.error(`${candidates.length} new candidates`);

const out = [];
for (let i = 0; i < candidates.length; i += 20) {
  const ids = candidates.slice(i, i + 20).join("|");
  const d = await api({
    action: "query",
    pageids: ids,
    prop: "coordinates|extracts|pageimages|info",
    exintro: "1",
    explaintext: "1",
    exlimit: "20",
    piprop: "original|thumbnail",
    pithumbsize: "400",
    inprop: "url",
  });
  for (const p of Object.values(d.query.pages)) {
    const desc = p.extract ?? "";
    const province = detectProvince(desc.slice(0, 600)) ?? detectProvince(desc);
    const coord = p.coordinates?.[0];
    out.push({
      id: p.pageid,
      name: p.title,
      province,
      lat: coord?.lat ?? null,
      lng: coord?.lon ?? null,
      description: desc,
      image: p.original?.source ?? null,
      thumbnail: p.thumbnail?.source ?? null,
      wikipediaUrl: p.fullurl,
    });
  }
  console.error(`fetched ${Math.min(i + 20, candidates.length)}/${candidates.length}`);
  await sleep(2000);
}

fs.writeFileSync("new-wiki-raw.json", JSON.stringify(out, null, 2));
const withProv = out.filter((p) => p.province);
console.log(`Wrote new-wiki-raw.json: ${out.length} articles, ${withProv.length} with detected province`);
const byProv = {};
for (const p of withProv) byProv[p.province] = (byProv[p.province] ?? 0) + 1;
console.log(JSON.stringify(byProv, null, 2));
