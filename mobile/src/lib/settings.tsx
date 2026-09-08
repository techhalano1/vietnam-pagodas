import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { getDict, isLocale, type Dict, type Locale } from "./i18n";
import { darkTheme, lightTheme, type Theme } from "./theme";

export type ThemePreference = "system" | "light" | "dark";

interface Settings {
  locale: Locale;
  setLocale: (l: Locale) => void;
  themePreference: ThemePreference;
  setThemePreference: (t: ThemePreference) => void;
  theme: Theme;
  isDark: boolean;
  t: Dict;
  ready: boolean;
}

const LOCALE_KEY = "vp-locale";
const THEME_KEY = "vp-theme";

const SettingsContext = createContext<Settings | null>(null);

function deviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode ?? "vi";
  return isLocale(code) ? code : "en";
}

function isThemePreference(x: string): x is ThemePreference {
  return x === "system" || x === "light" || x === "dark";
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [themePreference, setThemeState] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([LOCALE_KEY, THEME_KEY])
      .then(([[, l], [, th]]) => {
        setLocaleState(l && isLocale(l) ? l : deviceLocale());
        if (th && isThemePreference(th)) setThemeState(th);
      })
      .catch(() => setLocaleState(deviceLocale()))
      .finally(() => setReady(true));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    AsyncStorage.setItem(LOCALE_KEY, l).catch(() => undefined);
  }, []);

  const setThemePreference = useCallback((th: ThemePreference) => {
    setThemeState(th);
    AsyncStorage.setItem(THEME_KEY, th).catch(() => undefined);
  }, []);

  const isDark =
    themePreference === "system"
      ? system === "dark"
      : themePreference === "dark";

  const value = useMemo<Settings>(
    () => ({
      locale,
      setLocale,
      themePreference,
      setThemePreference,
      theme: isDark ? darkTheme : lightTheme,
      isDark,
      t: getDict(locale),
      ready,
    }),
    [locale, setLocale, themePreference, setThemePreference, isDark, ready],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
