import AsyncStorage from "@react-native-async-storage/async-storage";
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular";
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium";
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold";
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold";
import { BeVietnamPro_800ExtraBold } from "@expo-google-fonts/be-vietnam-pro/800ExtraBold";
import { useFonts } from "expo-font";
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
import { ENGLISH_ENABLED, getDict, isEnabledLocale, type Dict, type Locale } from "./i18n";
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
  if (!ENGLISH_ENABLED) return "vi";
  const code = getLocales()[0]?.languageCode ?? "vi";
  return isEnabledLocale(code) ? code : "en";
}

function isThemePreference(x: string): x is ThemePreference {
  return x === "system" || x === "light" || x === "dark";
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [themePreference, setThemeState] = useState<ThemePreference>("system");
  const [stored, setStored] = useState(false);
  const [fontsLoaded, fontsError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  });
  const ready = stored && (fontsLoaded || fontsError !== null);

  useEffect(() => {
    AsyncStorage.multiGet([LOCALE_KEY, THEME_KEY])
      .then(([[, l], [, th]]) => {
        setLocaleState(l && isEnabledLocale(l) ? l : deviceLocale());
        if (th && isThemePreference(th)) setThemeState(th);
      })
      .catch(() => setLocaleState(deviceLocale()))
      .finally(() => setStored(true));
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
