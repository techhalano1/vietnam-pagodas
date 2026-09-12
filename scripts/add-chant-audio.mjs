#!/usr/bin/env node
/**
 * Attach real chanted recordings (Pháp Hạnh, ph.tinhtong.vn) to scriptures as a
 * second "chant" rendition next to the AI read-along track.
 *
 *   node scripts/add-chant-audio.mjs [--only slug,slug] [--force] [--cache DIR]
 *
 * For each entry in SOURCES: download the original MP3 (cached in --cache,
 * default ~/.chant-cache), re-encode to mono 24 kHz 32 kbps with loudness
 * normalisation into public/audio/kinh/<slug>-tung.mp3, and write
 * `chant` metadata into src/data/scripture-audio.json. Requires ffmpeg/ffprobe.
 *
 * Chants have no per-verse cues: they include bells, repetitions and pauses,
 * so the players show them without text highlighting.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "audio", "kinh");
const MANIFEST = path.join(ROOT, "src", "data", "scripture-audio.json");

const SOURCE = "Pháp Hạnh (ph.tinhtong.vn)";
const SOURCE_PAGE = "https://ph.tinhtong.vn/Home/MP3";
const BASE = "https://ph.tinhtong.vn/ftp/MP3/";
const LICENSE =
  "Ấn tống — phát hành miễn phí, phi thương mại; bản quyền thuộc Pháp Hạnh và người tụng. " +
  "Free Dharma distribution, non-commercial; © Pháp Hạnh and the reciter.";

/** slug → source path (relative to BASE, without .mp3) and reciter. */
const SOURCES = [
  ["chu-dai-bi", "- T Tri Thoat tung niem/Chú Đại Bi (5 biến)", "Thích Trí Thoát"],
  ["bat-nha-tam-kinh", "- T Tri Thoat tung niem/Bát Nhã Tâm Kinh (21 biến)", "Thích Trí Thoát"],
  ["kinh-a-di-da", "- T Tri Thoat tung niem/Kinh A Di Đà - Âm ~DPA 1482", "Thích Trí Thoát"],
  ["kinh-pho-mon", "- T Tri Thoat tung niem/Kinh Phổ Môn - Âm", "Thích Trí Thoát"],
  ["kinh-duoc-su", "- T Tri Thoat tung niem/Kinh Dược Sư", "Thích Trí Thoát"],
  ["kinh-vu-lan-bon", "- T Tri Thoat tung niem/Kinh Vu Lan", "Thích Trí Thoát"],
  ["sam-hoi-hong-danh", "- T Tri Thoat tung niem/Sám Hối Hồng Danh", "Thích Trí Thoát"],
  ["thap-chu", "- T Tri Thoat tung niem/Thập Chú ~update 29-07-2023", "Thích Trí Thoát"],
  ["chu-vang-sanh", "- T Hue Duyen tung niem/Chú Vãng Sanh (21 biến) - T Huệ Duyên", "Thích Huệ Duyên"],
];

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = opt("--only")?.split(",").filter(Boolean);
const force = args.includes("--force");
const cacheDir = opt("--cache") ?? path.join(homedir(), ".chant-cache");
mkdirSync(cacheDir, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const titleOf = (p) => p.split("/").pop().replace(/\s*~.*$/, "").replace(/\s*-\s*T Huệ Duyên$/, "").trim();

const sourceUrl = (p) => BASE + encodeURI(p).replace(/#/g, "%23") + ".mp3";

async function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 0) return;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

function encode(src, dest) {
  execFileSync(
    "ffmpeg",
    ["-nostdin", "-y", "-v", "error", "-i", src, "-vn", "-ac", "1", "-ar", "24000",
      "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:a", "libmp3lame", "-b:a", "32k", dest],
    { stdio: "inherit" },
  );
}

function durationOf(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file,
  ]);
  return Math.round(parseFloat(out.toString()) * 100) / 100;
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

for (const [slug, srcPath, performer] of SOURCES) {
  if (only && !only.includes(slug)) continue;
  if (!manifest[slug]) {
    console.warn(`skip ${slug}: no AI track in manifest`);
    continue;
  }
  const file = `kinh/${slug}-tung.mp3`;
  const outFile = path.join(OUT_DIR, `${slug}-tung.mp3`);
  const raw = path.join(cacheDir, `${slug}.mp3`);
  const url = sourceUrl(srcPath);
  if (force || !existsSync(outFile)) {
    console.log(`↓ ${slug}`);
    await download(url, raw);
    console.log(`♫ ${slug}`);
    encode(raw, outFile);
  }
  manifest[slug].chant = {
    file,
    durationSec: durationOf(outFile),
    bytes: statSync(outFile).size,
    performer,
    title: titleOf(srcPath),
    source: SOURCE,
    sourceUrl: SOURCE_PAGE,
    originalUrl: url,
    license: LICENSE,
  };
  console.log(`✓ ${slug} ${manifest[slug].chant.durationSec}s ${manifest[slug].chant.bytes}B`);
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log("manifest updated");
