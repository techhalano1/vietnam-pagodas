"use client";

import { useCallback, useEffect, useState } from "react";

export type SavedListKey = "vp-favorites" | "vp-visited";

function readList(key: SavedListKey): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function useSavedList(key: SavedListKey) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlugs(readList(key));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setSlugs(readList(key));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  const toggle = useCallback(
    (slug: string) => {
      setSlugs((prev) => {
        const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // storage unavailable (private mode) — keep in-memory state only
        }
        return next;
      });
    },
    [key]
  );

  return { slugs, toggle, ready };
}
