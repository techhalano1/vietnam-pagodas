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
import type { OfferFor, OfferItem } from "./i18n";
import {
  cancelReminders,
  requestReminderPermission,
  scheduleReminders,
} from "./reminders";
import { useSettings } from "./settings";

/** Real-time length of one stick of incense on screen. */
export const BURN_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 500;
const KEY_JOURNAL = "vp-offerings";
const KEY_REMINDERS = "vp-reminders";

export interface Offering {
  id: string;
  slug: string;
  sticks: 1 | 3;
  items: OfferItem[];
  forWhom: OfferFor;
  wish?: string;
  /** Epoch ms when the incense was lit. */
  at: number;
}

export type NewOffering = Omit<Offering, "id" | "at">;

interface Offerings {
  /** Newest first. */
  journal: Offering[];
  add: (o: NewOffering) => Offering;
  clear: () => void;
  countFor: (slug: string) => number;
  /** Latest offering whose incense is still burning (for `slug`, or anywhere). */
  burning: (now: number, slug?: string) => Offering | undefined;
  reminders: boolean;
  /** Returns false when the OS permission was refused. */
  setReminders: (on: boolean) => Promise<boolean>;
  ready: boolean;
}

const OfferingsContext = createContext<Offerings | null>(null);

function parse(raw: string | null): Offering[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter(
      (x): x is Offering =>
        !!x &&
        typeof x === "object" &&
        typeof x.slug === "string" &&
        typeof x.at === "number",
    );
  } catch {
    return [];
  }
}

export function OfferingsProvider({ children }: { children: ReactNode }) {
  const { t } = useSettings();
  const [journal, setJournal] = useState<Offering[]>([]);
  const [reminders, setRemindersState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([KEY_JOURNAL, KEY_REMINDERS])
      .then(([[, j], [, r]]) => {
        setJournal(parse(j));
        setRemindersState(r === "1");
      })
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  // One-off triggers only cover the next weeks; top them up on each launch.
  useEffect(() => {
    if (ready && reminders) scheduleReminders(t).catch(() => undefined);
  }, [ready, reminders, t]);

  const add = useCallback((o: NewOffering) => {
    const entry: Offering = {
      ...o,
      wish: o.wish?.trim() || undefined,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
    };
    setJournal((prev) => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      AsyncStorage.setItem(KEY_JOURNAL, JSON.stringify(next)).catch(
        () => undefined,
      );
      return next;
    });
    return entry;
  }, []);

  const clear = useCallback(() => {
    setJournal([]);
    AsyncStorage.removeItem(KEY_JOURNAL).catch(() => undefined);
  }, []);

  const countFor = useCallback(
    (slug: string) =>
      journal.reduce((n, o) => (o.slug === slug ? n + 1 : n), 0),
    [journal],
  );

  const burning = useCallback(
    (now: number, slug?: string) =>
      journal.find(
        (o) =>
          (!slug || o.slug === slug) && now - o.at < BURN_MS && now >= o.at,
      ),
    [journal],
  );

  const setReminders = useCallback(
    async (on: boolean) => {
      if (on) {
        const granted = await requestReminderPermission().catch(() => false);
        if (!granted) return false;
        await scheduleReminders(t).catch(() => undefined);
      } else {
        await cancelReminders().catch(() => undefined);
      }
      setRemindersState(on);
      AsyncStorage.setItem(KEY_REMINDERS, on ? "1" : "0").catch(
        () => undefined,
      );
      return true;
    },
    [t],
  );

  const value = useMemo<Offerings>(
    () => ({
      journal,
      add,
      clear,
      countFor,
      burning,
      reminders,
      setReminders,
      ready,
    }),
    [journal, add, clear, countFor, burning, reminders, setReminders, ready],
  );

  return (
    <OfferingsContext.Provider value={value}>
      {children}
    </OfferingsContext.Provider>
  );
}

export function useOfferings(): Offerings {
  const ctx = useContext(OfferingsContext);
  if (!ctx)
    throw new Error("useOfferings must be used within OfferingsProvider");
  return ctx;
}

/** Re-renders every `ms` while `active`, returning the current time. */
export function useNow(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [active, ms]);
  return now;
}
