import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Constants, { AppOwnership } from "expo-constants";
import { Directory, File, Paths } from "expo-file-system";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  audioUrl,
  cueIndexAt,
  downloadKey,
  getAudio,
  resolveVoice,
  SPEEDS,
  trackOf,
  type AudioCue,
  type ScriptureAudio,
  type Speed,
  type Track,
  type Voice,
} from "./audio";
import { getScripture, scriptureTitle } from "./scriptures";
import { useSettings } from "./settings";
import type { Scripture } from "./types";

export interface ListenEntry {
  slug: string;
  /** Last known playback position in seconds. */
  positionSec: number;
  at: number;
  /** How many full passes were completed. */
  completed: number;
  /** Rendition the position refers to (missing in entries saved before chants existed). */
  voice?: Voice;
}

export interface DownloadEntry {
  uri: string;
  bytes: number;
  at: number;
}

interface PlayerStatus {
  playing: boolean;
  currentTime: number;
  duration: number;
  isBuffering: boolean;
  isLoaded: boolean;
}

interface Player {
  track: Scripture | null;
  audio: ScriptureAudio | null;
  /** Rendition of the loaded track. */
  voice: Voice;
  /** Preferred rendition for new tracks (persisted). */
  voicePref: Voice;
  setVoice: (v: Voice) => void;
  /** The file actually playing (chant or AI). */
  current: Track | null;
  /** Verse cues for the loaded track; null while a chant plays (no verse alignment). */
  cues: AudioCue[] | null;
  status: PlayerStatus;
  /** Index of the verse currently being spoken (-1 when idle or without cues). */
  verseIndex: number;
  error: string | null;
  play: (slug: string, opts?: { verse?: number; resume?: boolean; voice?: Voice }) => void;
  toggle: () => void;
  stop: () => void;
  seekTo: (sec: number) => void;
  seekToVerse: (index: number) => void;
  skipVerse: (delta: number) => void;
  speed: Speed;
  setSpeed: (s: Speed) => void;
  repeat: number;
  repeatDone: number;
  setRepeat: (n: number) => void;
  sleepUntil: number | null;
  setSleepMinutes: (min: number) => void;
  history: ListenEntry[];
  /** Keyed by `downloadKey(slug, voice)`. */
  downloads: Record<string, DownloadEntry>;
  downloading: string[];
  download: (slug: string, voice?: Voice) => Promise<void>;
  removeDownload: (slug: string, voice?: Voice) => void;
  clearDownloads: () => void;
}

const HISTORY_KEY = "vp-listen-history";
const PREFS_KEY = "vp-player-prefs";
const DOWNLOADS_KEY = "vp-audio-downloads";
const HISTORY_MAX = 20;
const IDLE: PlayerStatus = { playing: false, currentTime: 0, duration: 0, isBuffering: false, isLoaded: false };
/** Expo Go lacks the expo-audio media service (config plugin not applied); lock-screen controls need a dev/EAS build. */
const LOCK_SCREEN_AVAILABLE = Constants.appOwnership !== AppOwnership.Expo;

const PlayerContext = createContext<Player | null>(null);

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function parseHistory(raw: string | null): ListenEntry[] {
  const v = parseJson(raw);
  if (!Array.isArray(v)) return [];
  const out: ListenEntry[] = [];
  for (const e of v) {
    if (
      isRecord(e) &&
      typeof e.slug === "string" &&
      typeof e.positionSec === "number" &&
      typeof e.at === "number" &&
      typeof e.completed === "number" &&
      getScripture(e.slug)
    ) {
      const entry: ListenEntry = { slug: e.slug, positionSec: e.positionSec, at: e.at, completed: e.completed };
      if (e.voice === "chant" || e.voice === "ai") entry.voice = e.voice;
      out.push(entry);
    }
  }
  return out;
}

function parseDownloads(raw: string | null): Record<string, DownloadEntry> {
  const v = parseJson(raw);
  if (!isRecord(v)) return {};
  const out: Record<string, DownloadEntry> = {};
  for (const [slug, e] of Object.entries(v)) {
    if (isRecord(e) && typeof e.uri === "string" && typeof e.bytes === "number" && typeof e.at === "number") {
      try {
        if (new File(e.uri).exists) out[slug] = { uri: e.uri, bytes: e.bytes, at: e.at };
      } catch {
        // unreadable entry: drop it
      }
    }
  }
  return out;
}

function parsePrefs(raw: string | null): { speed: Speed; repeat: number; voice: Voice } {
  const v = parseJson(raw);
  const speed = isRecord(v) && SPEEDS.includes(v.speed as Speed) ? (v.speed as Speed) : 1;
  const repeat = isRecord(v) && typeof v.repeat === "number" && v.repeat >= 1 ? v.repeat : 1;
  const voice: Voice = isRecord(v) && v.voice === "ai" ? "ai" : "chant";
  return { speed, repeat, voice };
}

const audioDir = () => new Directory(Paths.document, "audio");

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { locale, t: dict } = useSettings();
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const raw = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<Scripture | null>(null);
  const [voice, setVoiceState] = useState<Voice>("chant");
  const [voicePref, setVoicePref] = useState<Voice>("chant");
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeedState] = useState<Speed>(1);
  const [repeat, setRepeatState] = useState(1);
  const [repeatDone, setRepeatDone] = useState(0);
  const [sleepUntil, setSleepUntil] = useState<number | null>(null);
  const [history, setHistory] = useState<ListenEntry[]>([]);
  const [downloads, setDownloads] = useState<Record<string, DownloadEntry>>({});
  const [downloading, setDownloading] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const pendingSeek = useRef<number | null>(null);
  const pendingSeekIssued = useRef(0);
  const finishHandled = useRef(false);
  const lastPersist = useRef(0);
  const trackRef = useRef<Scripture | null>(null);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  const audio = useMemo(() => (track ? getAudio(track.slug) ?? null : null), [track]);
  const current = useMemo(() => (audio ? trackOf(audio, voice) : null), [audio, voice]);
  const cues = useMemo(() => (audio && voice === "ai" ? audio.cues : null), [audio, voice]);

  const status: PlayerStatus = useMemo(
    () =>
      track
        ? {
            playing: raw.playing,
            currentTime: Number.isFinite(raw.currentTime) ? raw.currentTime : 0,
            duration: Number.isFinite(raw.duration) && raw.duration > 0 ? raw.duration : current?.durationSec ?? 0,
            isBuffering: raw.isBuffering,
            isLoaded: raw.isLoaded,
          }
        : IDLE,
    [track, raw, current],
  );

  const verseIndex = useMemo(
    () => (cues ? cueIndexAt(cues, status.currentTime) : -1),
    [cues, status.currentTime],
  );

  // Load persisted prefs / history / downloads.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [h, p, d] = await AsyncStorage.multiGet([HISTORY_KEY, PREFS_KEY, DOWNLOADS_KEY]);
        if (cancelled) return;
        setHistory(parseHistory(h[1]));
        const prefs = parsePrefs(p[1]);
        setSpeedState(prefs.speed);
        setRepeatState(prefs.repeat);
        setVoicePref(prefs.voice);
        setDownloads(parseDownloads(d[1]));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ speed, repeat, voice: voicePref })).catch(() => undefined);
  }, [ready, speed, repeat, voicePref]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => undefined);
  }, [ready, history]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads)).catch(() => undefined);
  }, [ready, downloads]);

  const voiceRef = useRef<Voice>("chant");
  useEffect(() => {
    voiceRef.current = voice;
  }, [voice]);

  const recordHistory = useCallback((slug: string, positionSec: number, completedDelta = 0) => {
    setHistory((h) => {
      const prev = h.find((e) => e.slug === slug);
      const entry: ListenEntry = {
        slug,
        positionSec: Math.max(0, positionSec),
        at: Date.now(),
        completed: (prev?.completed ?? 0) + completedDelta,
        voice: voiceRef.current,
      };
      return [entry, ...h.filter((e) => e.slug !== slug)].slice(0, HISTORY_MAX);
    });
  }, []);

  // Apply a deferred seek once the new source is loaded. Runs on every status
  // event (not only on isLoaded transitions): local files load so fast that
  // isLoaded may never be observed as false in between. The seek is re-issued
  // until the reported position reflects it, in case an early seek was ignored.
  useEffect(() => {
    const sec = pendingSeek.current;
    if (sec === null || !raw.isLoaded) return;
    if (pendingSeekIssued.current > 0 && raw.currentTime >= sec - 1.5) {
      pendingSeek.current = null;
      return;
    }
    const now = Date.now();
    if (now - pendingSeekIssued.current < 600) return;
    pendingSeekIssued.current = now;
    player.seekTo(sec).catch(() => undefined);
  }, [raw, player]);

  // Surface native load/playback errors (e.g. offline stream) and stalled loads;
  // clear them once the source actually loads.
  useEffect(() => {
    if (!track) return;
    const id = setTimeout(
      () => setError(raw.isLoaded ? null : raw.error ?? "load-timeout"),
      raw.isLoaded || raw.error ? 0 : 15000,
    );
    return () => clearTimeout(id);
  }, [track, raw.error, raw.isLoaded]);

  // Repeat handling + periodic history persistence.
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    if (raw.didJustFinish) {
      if (finishHandled.current) return;
      finishHandled.current = true;
      const next = repeatDone + 1;
      setRepeatDone(next);
      if (next < repeat) {
        player.seekTo(0).then(() => player.play()).catch(() => undefined);
      } else {
        recordHistory(t.slug, 0, 1);
      }
      return;
    }
    if (raw.playing && raw.currentTime > 0.5) finishHandled.current = false;
    if (raw.playing && Date.now() - lastPersist.current > 5000) {
      lastPersist.current = Date.now();
      recordHistory(t.slug, raw.currentTime);
    }
  }, [raw.didJustFinish, raw.playing, raw.currentTime, repeat, repeatDone, player, recordHistory]);

  // Sleep timer.
  useEffect(() => {
    if (sleepUntil === null) return;
    const ms = sleepUntil - Date.now();
    const id = setTimeout(() => {
      player.pause();
      setSleepUntil(null);
    }, Math.max(0, ms));
    return () => clearTimeout(id);
  }, [sleepUntil, player]);

  const sourceFor = useCallback(
    (slug: string, t: Track, v: Voice) => downloads[downloadKey(slug, v)]?.uri ?? audioUrl(t),
    [downloads],
  );

  const play = useCallback<Player["play"]>(
    (slug, opts) => {
      const s = getScripture(slug);
      const a = getAudio(slug);
      if (!s || !a) return;
      setError(null);
      // Seeking to a verse needs cues, so it always targets the AI rendition.
      const v: Voice =
        typeof opts?.verse === "number" ? "ai" : resolveVoice(a, opts?.voice ?? voicePref);
      const t = trackOf(a, v);
      const sameTrack = trackRef.current?.slug === slug && voiceRef.current === v;
      let startSec = 0;
      if (typeof opts?.verse === "number") {
        startSec = a.cues[Math.min(opts.verse, a.cues.length - 1)]?.start ?? 0;
      } else if (opts?.resume) {
        const h = history.find((e) => e.slug === slug);
        if (h && (h.voice ?? "ai") === v && h.positionSec > 2 && h.positionSec < t.durationSec - 2) {
          startSec = h.positionSec;
        }
      }
      if (sameTrack && raw.isLoaded && !raw.error) {
        const atEnd = raw.duration > 0 && raw.currentTime >= raw.duration - 0.5;
        if (typeof opts?.verse === "number" || atEnd) {
          finishHandled.current = false;
          setRepeatDone(0);
          player.seekTo(startSec).catch(() => undefined);
        }
        player.play();
        return;
      }
      try {
        finishHandled.current = false;
        setRepeatDone(0);
        setTrack(s);
        setVoiceState(v);
        voiceRef.current = v;
        player.replace({ uri: sourceFor(slug, t, v) });
        player.setPlaybackRate(speed, "high");
        pendingSeek.current = startSec > 0 ? startSec : null;
        pendingSeekIssued.current = 0;
        if (startSec > 0) player.seekTo(startSec).catch(() => undefined);
        player.play();
        if (LOCK_SCREEN_AVAILABLE) {
          player.setActiveForLockScreen(true, {
            title: scriptureTitle(s, locale),
            artist: v === "chant" && a.chant ? a.chant.performer : dict.siteName,
            albumTitle: locale === "en" ? "Scriptures & prayers" : "Kinh & văn khấn",
          });
        }
        recordHistory(slug, startSec);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [history, raw.isLoaded, raw.error, raw.duration, raw.currentTime, player, sourceFor, speed, locale, dict, recordHistory, voicePref],
  );

  const setVoice = useCallback(
    (v: Voice) => {
      setVoicePref(v);
      const t = trackRef.current;
      if (!t || voiceRef.current === v) return;
      const a = getAudio(t.slug);
      if (!a || (v === "chant" && !a.chant)) return;
      const wasPlaying = raw.playing;
      play(t.slug, { voice: v });
      if (!wasPlaying) player.pause();
    },
    [play, player, raw.playing],
  );

  const toggle = useCallback(() => {
    const cur = trackRef.current;
    if (!cur) return;
    if (raw.playing) {
      player.pause();
      recordHistory(cur.slug, raw.currentTime);
    } else if (error || raw.error) {
      // A failed/stalled load (e.g. offline) needs a fresh source, not play().
      play(cur.slug, { resume: true, voice: voiceRef.current });
    } else {
      const atEnd = raw.duration > 0 && raw.currentTime >= raw.duration - 0.5;
      if (atEnd) {
        finishHandled.current = false;
        setRepeatDone(0);
        player.seekTo(0).catch(() => undefined);
      }
      player.play();
    }
  }, [raw.playing, raw.currentTime, raw.duration, raw.error, error, player, play, recordHistory]);

  const stop = useCallback(() => {
    const t = trackRef.current;
    if (t) recordHistory(t.slug, raw.currentTime);
    trackRef.current = null;
    finishHandled.current = true;
    pendingSeek.current = null;
    player.pause();
    if (LOCK_SCREEN_AVAILABLE) player.clearLockScreenControls();
    // Android rejects replace(null); keep the source loaded but idle.
    player.seekTo(0).catch(() => undefined);
    setTrack(null);
    setSleepUntil(null);
    setRepeatDone(0);
  }, [player, raw.currentTime, recordHistory]);

  const seekTo = useCallback(
    (sec: number) => {
      if (!trackRef.current) return;
      const max = status.duration || Infinity;
      const target = Math.max(0, Math.min(sec, max));
      if (raw.isLoaded) player.seekTo(target).catch(() => undefined);
      else {
        pendingSeek.current = target;
        pendingSeekIssued.current = 0;
      }
    },
    [player, raw.isLoaded, status.duration],
  );

  const seekToVerse = useCallback(
    (index: number) => {
      if (!cues) return;
      const cue = cues[Math.max(0, Math.min(index, cues.length - 1))];
      if (cue) seekTo(cue.start);
    },
    [cues, seekTo],
  );

  // Without cues (chant), skipping moves by 30 s instead of by verse.
  const skipVerse = useCallback(
    (delta: number) => {
      if (cues) seekToVerse(verseIndex + delta);
      else seekTo(status.currentTime + delta * 30);
    },
    [cues, seekToVerse, verseIndex, seekTo, status.currentTime],
  );

  const setSpeed = useCallback(
    (s: Speed) => {
      setSpeedState(s);
      if (trackRef.current) player.setPlaybackRate(s, "high");
    },
    [player],
  );

  const setRepeat = useCallback((n: number) => {
    setRepeatState(Math.max(1, Math.round(n)));
    setRepeatDone(0);
  }, []);

  const setSleepMinutes = useCallback((min: number) => {
    setSleepUntil(min > 0 ? Date.now() + min * 60_000 : null);
  }, []);

  const download = useCallback(
    async (slug: string, v?: Voice) => {
      const a = getAudio(slug);
      if (!a) return;
      const vv = resolveVoice(a, v ?? (trackRef.current?.slug === slug ? voiceRef.current : voicePref));
      const key = downloadKey(slug, vv);
      if (downloads[key] || downloading.includes(key)) return;
      setDownloading((d) => [...d, key]);
      try {
        const dir = audioDir();
        dir.create({ intermediates: true, idempotent: true });
        const target = new File(dir, vv === "chant" ? `${slug}-tung.mp3` : `${slug}.mp3`);
        if (target.exists) target.delete();
        const file = await File.downloadFileAsync(audioUrl(trackOf(a, vv)), target);
        setDownloads((d) => ({ ...d, [key]: { uri: file.uri, bytes: file.size, at: Date.now() } }));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setDownloading((d) => d.filter((x) => x !== key));
      }
    },
    [downloads, downloading, voicePref],
  );

  const removeDownload = useCallback((slug: string, v?: Voice) => {
    const key = downloadKey(slug, v ?? (trackRef.current?.slug === slug ? voiceRef.current : "ai"));
    setDownloads((d) => {
      const e = d[key];
      if (!e) return d;
      try {
        const f = new File(e.uri);
        if (f.exists) f.delete();
      } catch {
        // already gone
      }
      const { [key]: _removed, ...rest } = d;
      return rest;
    });
  }, []);

  const clearDownloads = useCallback(() => {
    setDownloads((d) => {
      for (const e of Object.values(d)) {
        try {
          const f = new File(e.uri);
          if (f.exists) f.delete();
        } catch {
          // already gone
        }
      }
      return {};
    });
  }, []);

  const value = useMemo<Player>(
    () => ({
      track,
      audio,
      voice,
      voicePref,
      setVoice,
      current,
      cues,
      status,
      verseIndex,
      error,
      play,
      toggle,
      stop,
      seekTo,
      seekToVerse,
      skipVerse,
      speed,
      setSpeed,
      repeat,
      repeatDone,
      setRepeat,
      sleepUntil,
      setSleepMinutes,
      history,
      downloads,
      downloading,
      download,
      removeDownload,
      clearDownloads,
    }),
    [
      track, audio, voice, voicePref, setVoice, current, cues, status, verseIndex, error, play, toggle, stop, seekTo, seekToVerse, skipVerse,
      speed, setSpeed, repeat, repeatDone, setRepeat, sleepUntil, setSleepMinutes, history,
      downloads, downloading, download, removeDownload, clearDownloads,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): Player {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
