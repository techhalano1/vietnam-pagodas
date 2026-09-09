import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { emptyProfile, type UserProfile } from "./scriptures";

export type FontScale = 1 | 2 | 3;

export interface ReadingPosition {
  /** Index of the verse the reader was on. */
  verse: number;
  /** Total verse count at save time (progress = verse / total). */
  total: number;
  at: number;
}

interface Reading {
  fontScale: FontScale;
  setFontScale: (f: FontScale) => void;
  showHanViet: boolean;
  setShowHanViet: (v: boolean) => void;
  showEnglish: boolean;
  setShowEnglish: (v: boolean) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  positions: Record<string, ReadingPosition>;
  savePosition: (slug: string, verse: number, total: number) => void;
  clearPosition: (slug: string) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  ready: boolean;
}

const FONT_KEY = "vp-fontScale";
const FAVS_KEY = "vp-scripture-favs";
const POS_KEY = "vp-reading-positions";
const PROFILE_KEY = "vp-user-profile";
const LAYERS_KEY = "vp-reading-layers";

const ReadingContext = createContext<Reading | null>(null);

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

function parsePositions(raw: string | null): Record<string, ReadingPosition> {
  const v = parseJson(raw);
  if (!isRecord(v)) return {};
  const out: Record<string, ReadingPosition> = {};
  for (const [slug, p] of Object.entries(v)) {
    if (
      isRecord(p) &&
      typeof p.verse === "number" &&
      typeof p.total === "number" &&
      typeof p.at === "number"
    ) {
      out[slug] = { verse: p.verse, total: p.total, at: p.at };
    }
  }
  return out;
}

function parseProfile(raw: string | null): UserProfile {
  const v = parseJson(raw);
  if (!isRecord(v)) return emptyProfile;
  const str = (x: unknown) => (typeof x === "string" ? x : "");
  return { name: str(v.name), address: str(v.address), wish: str(v.wish) };
}

function parseFontScale(raw: string | null): FontScale {
  return raw === "2" ? 2 : raw === "3" ? 3 : 1;
}

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>(1);
  const [showHanViet, setHanVietState] = useState(true);
  const [showEnglish, setEnglishState] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, ReadingPosition>>({});
  const [profile, setProfileState] = useState<UserProfile>(emptyProfile);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([FONT_KEY, FAVS_KEY, POS_KEY, PROFILE_KEY, LAYERS_KEY])
      .then(([[, f], [, favs], [, pos], [, prof], [, layers]]) => {
        setFontScaleState(parseFontScale(f));
        const fv = parseJson(favs);
        if (Array.isArray(fv)) setFavorites(fv.filter((x): x is string => typeof x === "string"));
        setPositions(parsePositions(pos));
        setProfileState(parseProfile(prof));
        const ly = parseJson(layers);
        if (isRecord(ly)) {
          if (typeof ly.hanViet === "boolean") setHanVietState(ly.hanViet);
          if (typeof ly.english === "boolean") setEnglishState(ly.english);
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const setFontScale = useCallback((f: FontScale) => {
    setFontScaleState(f);
    AsyncStorage.setItem(FONT_KEY, String(f)).catch(() => undefined);
  }, []);

  const persistLayers = (hanViet: boolean, english: boolean) =>
    AsyncStorage.setItem(LAYERS_KEY, JSON.stringify({ hanViet, english })).catch(() => undefined);

  const setShowHanViet = useCallback(
    (v: boolean) => {
      setHanVietState(v);
      persistLayers(v, showEnglish);
    },
    [showEnglish],
  );
  const setShowEnglish = useCallback(
    (v: boolean) => {
      setEnglishState(v);
      persistLayers(showHanViet, v);
    },
    [showHanViet],
  );

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [slug, ...prev];
      AsyncStorage.setItem(FAVS_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const savePosition = useCallback((slug: string, verse: number, total: number) => {
    setPositions((prev) => {
      const next = { ...prev, [slug]: { verse, total, at: Date.now() } };
      AsyncStorage.setItem(POS_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const clearPosition = useCallback((slug: string) => {
    setPositions((prev) => {
      if (!(slug in prev)) return prev;
      const next = { ...prev };
      delete next[slug];
      AsyncStorage.setItem(POS_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p)).catch(() => undefined);
  }, []);

  const value = useMemo<Reading>(
    () => ({
      fontScale,
      setFontScale,
      showHanViet,
      setShowHanViet,
      showEnglish,
      setShowEnglish,
      favorites,
      toggleFavorite,
      positions,
      savePosition,
      clearPosition,
      profile,
      setProfile,
      ready,
    }),
    [
      fontScale,
      setFontScale,
      showHanViet,
      setShowHanViet,
      showEnglish,
      setShowEnglish,
      favorites,
      toggleFavorite,
      positions,
      savePosition,
      clearPosition,
      profile,
      setProfile,
      ready,
    ],
  );

  return <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>;
}

export function useReading(): Reading {
  const ctx = useContext(ReadingContext);
  if (!ctx) throw new Error("useReading must be used within ReadingProvider");
  return ctx;
}

/** Most recently read scriptures, newest first. */
export function recentPositions(
  positions: Record<string, ReadingPosition>,
  limit = 3,
): { slug: string; pos: ReadingPosition }[] {
  return Object.entries(positions)
    .map(([slug, pos]) => ({ slug, pos }))
    .sort((a, b) => b.pos.at - a.pos.at)
    .slice(0, limit);
}

export const fontScalePx: Record<FontScale, { body: number; line: number; han: number; hanLine: number }> = {
  1: { body: 18, line: 30, han: 17, hanLine: 28 },
  2: { body: 22, line: 36, han: 20, hanLine: 33 },
  3: { body: 27, line: 43, han: 24, hanLine: 39 },
};
