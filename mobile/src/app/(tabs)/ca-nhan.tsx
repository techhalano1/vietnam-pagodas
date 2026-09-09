import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import {
  Card,
  GoldCard,
  ListRow,
  Screen,
  SectionHeader,
  SegmentedControl,
  useTabBarPadding,
} from "@/components/ui";
import { formatBytes } from "@/lib/audio";
import { getPagodaBySlug, SITE_URL } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import type { Locale } from "@/lib/i18n";
import { usePlayer } from "@/lib/player";
import { useReading } from "@/lib/reading";
import { useSaved } from "@/lib/saved";
import { useSettings, type ThemePreference } from "@/lib/settings";
import { space } from "@/lib/theme";

const REPO_URL = "https://github.com/techhalano1/vietnam-pagodas";

function Stat({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.stat, { opacity: pressed ? 0.7 : 1 }]}
    >
      <AppText variant="h1" color="#fff">
        {value}
      </AppText>
      <AppText variant="caption" color="rgba(255,255,255,0.85)">
        {label}
      </AppText>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { theme, t, locale, setLocale, themePreference, setThemePreference } = useSettings();
  const { favorites, visited } = useSaved();
  const reading = useReading();
  const router = useRouter();
  const bottom = useTabBarPadding();
  const version = Constants.expoConfig?.version ?? "1.0.0";
  const player = usePlayer();
  const downloadCount = Object.keys(player.downloads).length;
  const downloadBytes = Object.values(player.downloads).reduce((n, d) => n + d.bytes, 0);

  const provincesVisited = useMemo(
    () =>
      new Set(
        visited.map((s) => getPagodaBySlug(s)?.province).filter((p): p is string => !!p),
      ).size,
    [visited],
  );

  const langs: { value: Locale; label: string }[] = [
    { value: "vi", label: `🇻🇳 ${t.languageVi}` },
    { value: "en", label: `🇬🇧 ${t.languageEn}` },
  ];
  const themes: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: "system", label: t.themeSystem, icon: "phone-portrait-outline" },
    { value: "light", label: t.themeLight, icon: "sunny-outline" },
    { value: "dark", label: t.themeDark, icon: "moon-outline" },
  ];

  const open = (url: string) => Linking.openURL(url).catch(() => undefined);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">{t.profileTitle}</AppText>
        </View>

        <GoldCard style={{ marginHorizontal: space.screen }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={styles.avatar}>
              <AppText style={{ fontSize: 30 }}>🪷</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="h2" color="#fff">
                {t.profileGuest}
              </AppText>
              <AppText variant="bodyS" color="rgba(255,255,255,0.88)">
                {t.profileGuestText}
              </AppText>
            </View>
          </View>
          <View style={styles.stats}>
            <Stat value={favorites.length} label={t.statFavorites} onPress={() => router.push("/da-luu")} />
            <View style={styles.statLine} />
            <Stat
              value={visited.length}
              label={t.statVisited}
              onPress={() => router.push({ pathname: "/da-luu", params: { tab: "visited" } })}
            />
            <View style={styles.statLine} />
            <Stat
              value={provincesVisited}
              label={t.statProvinces}
              onPress={() => router.push({ pathname: "/da-luu", params: { tab: "visited" } })}
            />
          </View>
        </GoldCard>

        <SectionHeader title={t.sectionCollections} />
        <Card style={styles.group}>
          <ListRow
            icon="heart"
            iconTone="lotus"
            title={t.favoritesHeading}
            subtitle={`${favorites.length}`}
            onPress={() => router.push("/da-luu")}
          />
          <ListRow
            icon="checkmark-circle"
            iconTone="jade"
            title={t.visitedHeading}
            subtitle={`${visited.length}`}
            last
            onPress={() => router.push({ pathname: "/da-luu", params: { tab: "visited" } })}
          />
        </Card>

        <SectionHeader title={t.sectionDiscover} />
        <Card style={styles.group}>
          <ListRow icon="sparkles" title={t.navFestivals} onPress={() => router.push("/le-hoi")} />
          <ListRow icon="trail-sign" title={t.navRoutes} onPress={() => router.push("/hanh-trinh")} />
          <ListRow
            icon="book"
            iconTone="lotus"
            title={t.scripturesTitle}
            subtitle={`${t.scriptureFavorites}: ${reading.favorites.length}`}
            onPress={() => router.push("/(tabs)/kinh")}
          />
          <ListRow
            icon="person-circle-outline"
            iconTone="lotus"
            title={t.personalizeHeading}
            subtitle={reading.profile.name.trim() || t.personalizeText}
            last
            onPress={() => router.push({ pathname: "/kinh/[slug]", params: { slug: "khan-tam-bao" } })}
          />
        </Card>

        <SectionHeader title={t.sectionSettings} />
        <Card style={[styles.group, { gap: 14 }]}>
          <View style={{ gap: 8 }}>
            <AppText variant="overline" tone="text2">
              {t.settingsLanguage}
            </AppText>
            <SegmentedControl<Locale> value={locale} onChange={setLocale} options={langs} />
          </View>
          <View style={{ gap: 8 }}>
            <AppText variant="overline" tone="text2">
              {t.settingsTheme}
            </AppText>
            <SegmentedControl<ThemePreference>
              value={themePreference}
              onChange={setThemePreference}
              options={themes}
            />
          </View>
          <ListRow
            icon="cloud-download-outline"
            title={t.offlineAudio}
            subtitle={t.offlineAudioCount(downloadCount, formatBytes(downloadBytes))}
            last
            right={
              downloadCount > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t.clearDownloads}
                  hitSlop={8}
                  onPress={() => {
                    haptics.tap();
                    player.clearDownloads();
                  }}
                >
                  <AppText variant="caption" weight={700} tone="danger">
                    {t.clearDownloads}
                  </AppText>
                </Pressable>
              ) : (
                <View />
              )
            }
          />
        </Card>

        <SectionHeader title={t.sectionAbout} />
        <Card style={styles.group}>
          <ListRow
            icon="information-circle"
            title={t.aboutApp}
            onPress={() => router.push("/gioi-thieu")}
          />
          <ListRow
            icon="globe"
            iconTone="jade"
            title={t.openWebsite}
            subtitle={t.websiteSubtitle}
            onPress={() => open(`${SITE_URL}/${locale}`)}
          />
          <ListRow
            icon="logo-github"
            iconTone="neutral"
            title={t.sourceCode}
            subtitle="github.com/techhalano1/vietnam-pagodas"
            last
            onPress={() => open(REPO_URL)}
          />
        </Card>

        <View style={styles.footer}>
          <AppText variant="caption" tone="text3" center>
            {t.siteName} · {t.version} {version}
          </AppText>
          <AppText variant="caption" tone="text3" center>
            {t.madeWith}
          </AppText>
          <Ionicons name="flower-outline" size={16} color={theme.text3} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.screen, paddingTop: 12, paddingBottom: 16 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statLine: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.25)" },
  group: { marginHorizontal: space.screen, paddingVertical: 4 },
  footer: { alignItems: "center", gap: 4, marginTop: 24 },
});
