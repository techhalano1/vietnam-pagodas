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

export type SavedListKey = "vp-favorites" | "vp-visited";

interface Saved {
  favorites: string[];
  visited: string[];
  toggle: (key: SavedListKey, slug: string) => void;
  ready: boolean;
}

const SavedContext = createContext<Saved | null>(null);

function parse(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v)
      ? v.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [visited, setVisited] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(["vp-favorites", "vp-visited"])
      .then(([[, f], [, v]]) => {
        setFavorites(parse(f));
        setVisited(parse(v));
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  const toggle = useCallback((key: SavedListKey, slug: string) => {
    const setter = key === "vp-favorites" ? setFavorites : setVisited;
    setter((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo<Saved>(
    () => ({ favorites, visited, toggle, ready }),
    [favorites, visited, toggle, ready],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}

export function useSaved(): Saved {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
