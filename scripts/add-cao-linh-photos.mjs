// Adds Wikimedia Commons photos (CC BY-SA 3.0) to the Chùa Cao Linh entry:
// hero image + thumbnail on the pagoda record and a photo gallery in details.
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const pagodasPath = path.join(dir, "../src/data/pagodas.json");
const detailsPath = path.join(dir, "../src/data/details.json");

const COMMONS = "https://upload.wikimedia.org/wikipedia/commons";
const FILEPAGE = "https://commons.wikimedia.org/wiki";

const HERO = `${COMMONS}/thumb/0/09/Ch%C3%B9a_cao_linh.jpeg/1280px-Ch%C3%B9a_cao_linh.jpeg`;
const THUMB = `${COMMONS}/thumb/0/09/Ch%C3%B9a_cao_linh.jpeg/330px-Ch%C3%B9a_cao_linh.jpeg`;

const GALLERY = [
  {
    src: `${COMMONS}/thumb/7/7a/M%E1%BB%99t_g%C3%B3c_ch%C3%B9a_Cao_Linh_-_panoramio.jpg/1280px-M%E1%BB%99t_g%C3%B3c_ch%C3%B9a_Cao_Linh_-_panoramio.jpg`,
    creditUrl: `${FILEPAGE}/File:M%E1%BB%99t_g%C3%B3c_ch%C3%B9a_Cao_Linh_-_panoramio.jpg`,
  },
  {
    src: `${COMMONS}/thumb/e/e9/Cao_Linh_t%E1%BB%B1_-_panoramio.jpg/1280px-Cao_Linh_t%E1%BB%B1_-_panoramio.jpg`,
    creditUrl: `${FILEPAGE}/File:Cao_Linh_t%E1%BB%B1_-_panoramio.jpg`,
  },
  {
    src: `${COMMONS}/thumb/c/c1/Ch%C3%B9a_Cao_Linh_-_panoramio.jpg/1280px-Ch%C3%B9a_Cao_Linh_-_panoramio.jpg`,
    creditUrl: `${FILEPAGE}/File:Ch%C3%B9a_Cao_Linh_-_panoramio.jpg`,
  },
  {
    src: `${COMMONS}/9/9d/Ch%C3%B9a_Cao_Linh._-_panoramio.jpg`,
    creditUrl: `${FILEPAGE}/File:Ch%C3%B9a_Cao_Linh._-_panoramio.jpg`,
  },
];

const pagodas = JSON.parse(fs.readFileSync(pagodasPath, "utf8"));
const details = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

const p = pagodas.find((x) => x.slug === "chua-cao-linh");
if (!p) throw new Error("chua-cao-linh not found");
p.image = HERO;
p.thumbnail = THUMB;

const d = details["chua-cao-linh"];
if (!d) throw new Error("chua-cao-linh details not found");
d.gallery = GALLERY;

fs.writeFileSync(pagodasPath, JSON.stringify(pagodas, null, 2));
fs.writeFileSync(detailsPath, JSON.stringify(details));
console.log("Added Cao Linh photos: hero + thumbnail + gallery of", GALLERY.length);
