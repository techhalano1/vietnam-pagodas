import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
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
import { audioUrl, cueIndexAt, getAudio, SPEEDS, type ScriptureAudio, type Speed } from "./audio";
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
  status: PlayerStatus;
  /** Index of the verse currently being spoken (0 when idle). */
  verseIndex: number;
  error: string | null;
  play: (slug: string, opts?: { verse?: number; resume?: boolean }) => void;
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
  downloads: Record<string, DownloadEntry>;
  downloading: string[];
  download: (slug: string) => Promise<void>;
  removeDownload: (slug: string) => void;
  clearDownloads: () => void;
}

const HISTORY_KEY = "vp-listen-history";
const PREFS_KEY = "vp-player-prefs";
const DOWNLOADS_KEY = "vp-audio-downloads";
const HISTORY_MAX = 20;
const IDLE: PlayerStatus = { playing: false, currentTime: 0, duration: 0, isBuffering: false, isLoaded: false };

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
      out.push({ slug: e.slug, positionSec: e.positionSec, at: e.at, completed: e.completed });
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

function parsePrefs(raw: string | null): { speed: Speed; repeat: number } {
  const v = parseJson(raw);
  const speed = isRecord(v) && SPEEDS.includes(v.speed as Speed) ? (v.speed as Speed) : 1;
  const repeat = isRecord(v) && typeof v.repeat === "number" && v.repeat >= 1 ? v.repeat : 1;
  return { speed, repeat };
}

const audioDir = () => new Directory(Paths.document, "audio");

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { locale } = useSettings();
  const player = useAudioPlayer(null, { updateInterval: 250 });
  const raw = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<Scripture | null>(null);
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
  const finishHandled = useRef(false);
  const lastPersist = useRef(0);
  const trackRef = useRef<Scripture | null>(null);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  const audio = useMemo(() => (track ? getAudio(track.slug) ?? null : null), [track]);

  const status: PlayerStatus = useMemo(
    () =>
      track
        ? {
            playing: raw.playing,
            currentTime: Number.isFinite(raw.currentTime) ? raw.currentTime : 0,
            duration: Number.isFinite(raw.duration) && raw.duration > 0 ? raw.duration : audio?.durationSec ?? 0,
            isBuffering: raw.isBuffering,
            isLoaded: raw.isLoaded,
          }
        : IDLE,
    [track, raw, audio],
  );

  const verseIndex = useMemo(
    () => (audio ? cueIndexAt(audio.cues, status.currentTime) : 0),
    [audio, status.currentTime],
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
    AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ speed, repeat })).catch(() => undefined);
  }, [ready, speed, repeat]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => undefined);
  }, [ready, history]);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads)).catch(() => undefined);
  }, [ready, downloads]);

  const recordHistory = useCallback((slug: string, positionSec: number, completedDelta = 0) => {
    setHistory((h) => {
      const prev = h.find((e) => e.slug === slug);
      const entry: ListenEntry = {
        slug,
        positionSec: Math.max(0, positionSec),
        at: Date.now(),
        completed: (prev?.completed ?? 0) + completedDelta,
      };
      return [entry, ...h.filter((e) => e.slug !== slug)].slice(0, HISTORY_MAX);
    });
  }, []);

  // Apply a deferred seek once the new source is loaded.
  useEffect(() => {
    if (raw.isLoaded && pendingSeek.current !== null) {
      const sec = pendingSeek.current;
      pendingSeek.current = null;
      player.seekTo(sec).catch(() => undefined);
    }
  }, [raw.isLoaded, player]);

  // Surface native load/playback errors (e.g. offline stream) and stalled loads.
  useEffect(() => {
    if (!track || raw.isLoaded) return;
    const id = setTimeout(() => setError(raw.error ?? "load-timeout"), raw.error ? 0 : 15000);
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
    (slug: string, a: ScriptureAudio) => downloads[slug]?.uri ?? audioUrl(a),
    [downloads],
  );

  const play = useCallback<Player["play"]>(
    (slug, opts) => {
      const s = getScripture(slug);
      const a = getAudio(slug);
      if (!s || !a) return;
      setError(null);
      const sameTrack = trackRef.current?.slug === slug;
      let startSec = 0;
      if (typeof opts?.verse === "number") {
        startSec = a.cues[Math.min(opts.verse, a.cues.length - 1)]?.start ?? 0;
      } else if (opts?.resume) {
        const h = history.find((e) => e.slug === slug);
        if (h && h.positionSec > 2 && h.positionSec < a.durationSec - 2) startSec = h.positionSec;
      }
      if (sameTrack && raw.isLoaded) {
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
        player.replace({ uri: sourceFor(slug, a) });
        player.setPlaybackRate(speed, "high");
        pendingSeek.current = startSec > 0 ? startSec : null;
        player.play();
        try {
          player.setActiveForLockScreen(true, {
            title: scriptureTitle(s, locale),
            artist: "Vietnam Pagodas",
            albumTitle: locale === "en" ? "Scriptures & prayers" : "Kinh & văn khấn",
          });
        } catch {
          // lock-screen controls need the native media service (dev build)
        }
        recordHistory(slug, startSec);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [history, raw.isLoaded, raw.duration, raw.currentTime, player, sourceFor, speed, locale, recordHistory],
  );

  const toggle = useCallback(() => {
    if (!trackRef.current) return;
    if (raw.playing) {
      player.pause();
      recordHistory(trackRef.current.slug, raw.currentTime);
    } else {
      const atEnd = raw.duration > 0 && raw.currentTime >= raw.duration - 0.5;
      if (atEnd) {
        finishHandled.current = false;
        setRepeatDone(0);
        player.seekTo(0).catch(() => undefined);
      }
      player.play();
    }
  }, [raw.playing, raw.currentTime, raw.duration, player, recordHistory]);

  const stop = useCallback(() => {
    const t = trackRef.current;
    if (t) recordHistory(t.slug, raw.currentTime);
    player.pause();
    try {
      player.clearLockScreenControls();
    } catch {
      // see above
    }
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
      else pendingSeek.current = target;
    },
    [player, raw.isLoaded, status.duration],
  );

  const seekToVerse = useCallback(
    (index: number) => {
      if (!audio) return;
      const cue = audio.cues[Math.max(0, Math.min(index, audio.cues.length - 1))];
      if (cue) seekTo(cue.start);
    },
    [audio, seekTo],
  );

  const skipVerse = useCallback((delta: number) => seekToVerse(verseIndex + delta), [seekToVerse, verseIndex]);

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
    async (slug: string) => {
      const a = getAudio(slug);
      if (!a || downloads[slug] || downloading.includes(slug)) return;
      setDownloading((d) => [...d, slug]);
      try {
        const dir = audioDir();
        dir.create({ intermediates: true, idempotent: true });
        const target = new File(dir, `${slug}.mp3`);
        if (target.exists) target.delete();
        const file = await File.downloadFileAsync(audioUrl(a), target);
        setDownloads((d) => ({ ...d, [slug]: { uri: file.uri, bytes: file.size, at: Date.now() } }));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setDownloading((d) => d.filter((x) => x !== slug));
      }
    },
    [downloads, downloading],
  );

  const removeDownload = useCallback((slug: string) => {
    setDownloads((d) => {
      const e = d[slug];
      if (!e) return d;
      try {
        const f = new File(e.uri);
        if (f.exists) f.delete();
      } catch {
        // already gone
      }
      const { [slug]: _removed, ...rest } = d;
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
      track, audio, status, verseIndex, error, play, toggle, stop, seekTo, seekToVerse, skipVerse,
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
