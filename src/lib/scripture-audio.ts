import audioJson from "@/data/scripture-audio.json";

export interface AudioCue {
  id: string;
  start: number;
  end: number;
}

export interface ScriptureAudio {
  file: string;
  durationSec: number;
  bytes: number;
  voice: string;
  model: string;
  cues: AudioCue[];
  generatedAt: string;
}

const audio = audioJson as Record<string, ScriptureAudio>;

export function getScriptureAudio(slug: string): ScriptureAudio | undefined {
  return audio[slug];
}

export function scriptureAudioUrl(a: ScriptureAudio): string {
  return `/audio/${a.file}`;
}

export function cueIndexAt(cues: AudioCue[], time: number): number {
  if (!cues.length) return 0;
  let lo = 0;
  let hi = cues.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cues[mid].start <= time) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const ss = s % 60;
  return h > 0
    ? `${h}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${mm}:${String(ss).padStart(2, "0")}`;
}
