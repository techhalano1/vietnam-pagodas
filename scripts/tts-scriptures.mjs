// Renders one MP3 per scripture in src/data/scriptures.json with OpenAI TTS
// and writes verse cues (start/end seconds) to src/data/scripture-audio.json.
//
// - Each verse is synthesised separately (cached in .tts-cache/) so cues are
//   exact and re-runs only pay for changed text.
// - Spoken text: Hán-Việt when the verse has it (that is what is chanted),
//   otherwise the Vietnamese rendering; Pāli items are read in Vietnamese.
// - {{placeholders}} become 1.2 s of silence (the devotee speaks their name).
// - ffmpeg joins verses with 0.7 s gaps, normalises loudness and encodes
//   48 kbps mono MP3 into public/audio/kinh/<slug>.mp3 (served by Vercel CDN).
//
// Usage: OPENAI_API_KEY=... node scripts/tts-scriptures.mjs [--voice ash] [--only slug] [--force]
// Requires ffmpeg + ffprobe on PATH.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const arg = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : dflt;
};
const VOICE = arg("--voice", "ash");
const ONLY = arg("--only", null);
const FORCE = process.argv.includes("--force");
const MODEL = "gpt-4o-mini-tts";
const INSTRUCTIONS =
  "Giọng tiếng Việt chuẩn, đọc chậm rãi, trang nghiêm, đều và ấm như một người đang tụng kinh trong chùa. Ngắt nghỉ rõ ở dấu phẩy và dấu chấm. Đọc đúng từng âm Hán-Việt, không dịch, không thêm lời.";
const GAP_VERSE = 0.7;
const GAP_PLACEHOLDER = 1.2;
const SAMPLE_RATE = 24000;
const BITRATE = "48k";

const CACHE_DIR = ".tts-cache";
const OUT_DIR = "public/audio/kinh";
const OUT_JSON = "src/data/scripture-audio.json";
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) throw new Error("OPENAI_API_KEY is required");
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const scriptures = JSON.parse(fs.readFileSync("src/data/scriptures.json", "utf8"));
const manifest = fs.existsSync(OUT_JSON) ? JSON.parse(fs.readFileSync(OUT_JSON, "utf8")) : {};

// Items whose hanViet field holds Pāli (read the Vietnamese rendering instead).
const PALI = new Set(["kinh-tu-bi", "kinh-phuoc-duc"]);
// Verse-level overrides: return "han" | "vi".
const TRACK_OVERRIDE = {
  "luc-tu-dai-minh": (v) => (v.id === "v1" ? "han" : "vi"),
};

function spokenText(s, v) {
  const pick = TRACK_OVERRIDE[s.slug]?.(v) ?? (PALI.has(s.slug) || !v.hanViet ? "vi" : "han");
  return (pick === "han" ? v.hanViet : v.vi).replace(/\s+/g, " ").trim();
}

const sh = (cmd, args) => execFileSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }).toString();
const duration = (file) => parseFloat(sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]));

async function tts(text) {
  const key = crypto.createHash("sha1").update(`${MODEL}|${VOICE}|${INSTRUCTIONS}|${text}`).digest("hex");
  const mp3 = path.join(CACHE_DIR, `${key}.mp3`);
  const wav = path.join(CACHE_DIR, `${key}.wav`);
  if (!fs.existsSync(mp3)) {
    for (let attempt = 1; ; attempt++) {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, voice: VOICE, input: text, instructions: INSTRUCTIONS, response_format: "mp3" }),
      });
      if (res.ok) {
        fs.writeFileSync(mp3, Buffer.from(await res.arrayBuffer()));
        break;
      }
      const body = await res.text();
      if (attempt >= 5) throw new Error(`TTS failed ${res.status}: ${body.slice(0, 200)}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  if (!fs.existsSync(wav)) {
    // Trim leading/trailing silence so gaps are controlled by us, not the model.
    sh("ffmpeg", ["-v", "error", "-y", "-i", mp3, "-af",
      `silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse`,
      "-ar", String(SAMPLE_RATE), "-ac", "1", wav]);
  }
  return wav;
}

const silence = (sec) => {
  const f = path.join(CACHE_DIR, `silence-${sec}.wav`);
  if (!fs.existsSync(f)) {
    sh("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `anullsrc=r=${SAMPLE_RATE}:cl=mono`, "-t", String(sec), f]);
  }
  return f;
};

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }));
  return out;
}

async function render(s) {
  // Each verse becomes a token list: spoken chunks and pauses (placeholders).
  const plan = s.verses.map((v) => {
    const tokens = [];
    for (const part of spokenText(s, v).split(/(\{\{\w+\}\})/)) {
      if (/^\{\{\w+\}\}$/.test(part)) {
        if (tokens.at(-1) !== null) tokens.push(null);
      } else {
        const text = part.replace(/^[\s,.;:]+|[\s,]+$/g, "");
        if (text) tokens.push(text);
      }
    }
    return { id: v.id, tokens };
  });
  const texts = [...new Set(plan.flatMap((p) => p.tokens.filter(Boolean)))];
  const wavs = new Map();
  await mapLimit(texts, 4, async (t) => wavs.set(t, await tts(t)));

  // Concat list + cues.
  const list = [];
  const cues = [];
  let t = 0;
  const push = (file) => {
    list.push(file);
    t += duration(file);
  };
  plan.forEach((p, i) => {
    if (i > 0) push(silence(GAP_VERSE));
    const start = t;
    for (const tok of p.tokens) push(tok === null ? silence(GAP_PLACEHOLDER) : wavs.get(tok));
    cues.push({ id: p.id, start: round(start), end: round(t) });
  });

  const listFile = path.join(CACHE_DIR, `${s.slug}.txt`);
  fs.writeFileSync(listFile, list.map((f) => `file '${path.resolve(f)}'`).join("\n"));
  const out = path.join(OUT_DIR, `${s.slug}.mp3`);
  sh("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", String(SAMPLE_RATE), "-ac", "1",
    "-codec:a", "libmp3lame", "-b:a", BITRATE, "-write_xing", "1",
    "-metadata", `title=${s.title}`, "-metadata", "artist=Vietnam Pagodas", "-metadata", `album=Kinh & Văn khấn`, out]);
  const durationSec = round(duration(out));
  return {
    file: `kinh/${s.slug}.mp3`,
    durationSec,
    bytes: fs.statSync(out).size,
    voice: VOICE,
    model: MODEL,
    cues,
    generatedAt: new Date().toISOString().slice(0, 10),
  };
}

const round = (n) => Math.round(n * 100) / 100;

const todo = scriptures.filter((s) => !ONLY || s.slug === ONLY);
let totalSec = 0;
let totalBytes = 0;
for (const s of todo) {
  const prev = manifest[s.slug];
  const fp = crypto.createHash("sha1").update(JSON.stringify(s.verses.map((v) => spokenText(s, v))) + VOICE + INSTRUCTIONS).digest("hex");
  if (!FORCE && prev && prev.fingerprint === fp && fs.existsSync(path.join("public/audio", prev.file))) {
    console.log(`= ${s.slug} (up to date)`);
  } else {
    process.stdout.write(`> ${s.slug} (${s.verses.length} verses)… `);
    const t0 = Date.now();
    manifest[s.slug] = { ...(await render(s)), fingerprint: fp };
    console.log(`${manifest[s.slug].durationSec}s, ${(manifest[s.slug].bytes / 1e6).toFixed(2)} MB in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 2) + "\n");
  }
  totalSec += manifest[s.slug].durationSec;
  totalBytes += manifest[s.slug].bytes;
}
fs.writeFileSync(OUT_JSON, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Total: ${(totalSec / 60).toFixed(1)} min, ${(totalBytes / 1e6).toFixed(1)} MB`);
