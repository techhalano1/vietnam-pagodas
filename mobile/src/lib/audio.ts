import audioJson from "../../../src/data/scripture-audio.json";
import { SITE_URL } from "./data";

export interface AudioCue {
  id: string;
  start: number;
  end: number;
}

/** A real chanted recording (no per-verse cues). */
export interface ChantTrack {
  file: string;
  durationSec: number;
  bytes: number;
  /** Monk / reciter credited for the recording. */
  performer: string;
  /** Original track title at the source. */
  title: string;
  source: string;
  sourceUrl: string;
  /** Direct link to the original file at the source. */
  originalUrl?: string;
  license: string;
}

export interface ScriptureAudio {
  /** AI read-along track (matches the verses, has cues). */
  file: string;
  durationSec: number;
  bytes: number;
  voice: string;
  model: string;
  cues: AudioCue[];
  generatedAt: string;
  chant?: ChantTrack;
}

/** Which rendition to play: a real chant when available, or the AI read-along voice. */
export type Voice = "chant" | "ai";

export interface Track {
  file: string;
  durationSec: number;
  bytes: number;
}

const audio = audioJson as Record<string, ScriptureAudio>;

/**
 * Static MP3s live next to the website (`public/audio/kinh/<slug>.mp3`) and are
 * served by its CDN. Override for local development or a future object store.
 */
export const AUDIO_BASE_URL = (process.env.EXPO_PUBLIC_AUDIO_BASE_URL ?? `${SITE_URL}/audio`).replace(
  /\/$/,
  "",
);

export function getAudio(slug: string): ScriptureAudio | undefined {
  return audio[slug];
}

export function hasAudio(slug: string): boolean {
  return slug in audio;
}

export function audioUrl(t: Track): string {
  return `${AUDIO_BASE_URL}/${t.file}`;
}

/** Resolve the preferred voice for a scripture (falls back to AI when no chant exists). */
export function resolveVoice(a: ScriptureAudio, pref: Voice): Voice {
  return pref === "chant" && a.chant ? "chant" : "ai";
}

export function trackOf(a: ScriptureAudio, voice: Voice): Track {
  return voice === "chant" && a.chant ? a.chant : a;
}

/** Storage key for offline downloads; AI tracks keep the bare slug for backwards compatibility. */
export function downloadKey(slug: string, voice: Voice): string {
  return voice === "chant" ? `${slug}#chant` : slug;
}

/** Index of the verse being spoken at `time` (or the one just spoken during a gap). */
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

export function formatBytes(bytes: number): string {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1e3)} KB`;
}

export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export type Speed = (typeof SPEEDS)[number];
export const REPEAT_OPTIONS = [1, 3, 7, 21, 108] as const;
/** Sleep timer choices in minutes (0 = off). */
export const SLEEP_OPTIONS = [0, 10, 20, 30, 60] as const;
