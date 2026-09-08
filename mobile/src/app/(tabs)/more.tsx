import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter, type Href } from "expo-router";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Chip, SectionTitle } from "@/components/ui";
import { SITE_URL } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { useSettings, type ThemePreference } from "@/lib/settings";

function MenuRow({
  icon,
  label,
  href,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href: Href;
}) {
  const { theme } = useSettings();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.menuRow,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={theme.accent} />
      <Text style={[styles.menuText, { color: theme.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

const LANGS: { locale: Locale; flag: string; label: string }[] = [
  { locale: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
  { locale: "en", flag: "🇬🇧", label: "English" },
];

export default function MoreScreen() {
  const { theme, t, locale, setLocale, themePreference, setThemePreference } =
    useSettings();
  const themes: {
    key: ThemePreference;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "system", label: t.themeSystem, icon: "phone-portrait-outline" },
    { key: "light", label: t.themeLight, icon: "sunny-outline" },
    { key: "dark", label: t.themeDark, icon: "moon-outline" },
  ];
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
    >
      <MenuRow icon="calendar-outline" label={t.navFestivals} href="/le-hoi" />
      <MenuRow
        icon="trail-sign-outline"
        label={t.navRoutes}
        href="/hanh-trinh"
      />
      <MenuRow
        icon="information-circle-outline"
        label={t.navAbout}
        href="/gioi-thieu"
      />

      <SectionTitle>{t.settingsLanguage}</SectionTitle>
      <View style={styles.chips}>
        {LANGS.map((l) => (
          <Chip
            key={l.locale}
            label={`${l.flag} ${l.label}`}
            active={locale === l.locale}
            onPress={() => setLocale(l.locale)}
          />
        ))}
      </View>

      <SectionTitle>{t.settingsTheme}</SectionTitle>
      <View style={styles.chips}>
        {themes.map((th) => (
          <Chip
            key={th.key}
            icon={th.icon}
            label={th.label}
            active={themePreference === th.key}
            onPress={() => setThemePreference(th.key)}
          />
        ))}
      </View>

      <Pressable
        onPress={() =>
          Linking.openURL(`${SITE_URL}/${locale}`).catch(() => undefined)
        }
        style={styles.link}
      >
        <Ionicons name="globe-outline" size={16} color={theme.accent} />
        <Text style={{ color: theme.accent }}>
          {t.openWebsite} · vietnam-pagodas.com
        </Text>
      </Pressable>
      <Text style={[styles.version, { color: theme.muted }]}>
        {t.version} {version}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12, paddingBottom: 32 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  menuText: { flex: 1, fontSize: 16, fontWeight: "600" },
  chips: { flexDirection: "row", flexWrap: "wrap", rowGap: 8 },
  link: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 24 },
  version: { marginTop: 12, fontSize: 12 },
});
