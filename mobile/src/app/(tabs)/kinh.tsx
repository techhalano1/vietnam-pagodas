import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import { Card, GoldCard, Screen, Tag, useTabBarPadding } from "@/components/ui";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

type IconName = keyof typeof Ionicons.glyphMap;

export default function ScripturesScreen() {
  const { theme, t } = useSettings();
  const bottom = useTabBarPadding();

  const cats: { icon: IconName; label: string; tone: "primary" | "lotus" | "jade" }[] = [
    { icon: "book", label: t.scriptureCatSutra, tone: "primary" },
    { icon: "hand-left", label: t.scriptureCatPrayer, tone: "lotus" },
    { icon: "flame", label: t.scriptureCatRitual, tone: "jade" },
    { icon: "ellipse", label: t.scriptureCatMala, tone: "primary" },
  ];
  const toneColor = { primary: theme.primaryText, lotus: theme.lotus, jade: theme.jade };
  const toneBg = { primary: theme.primarySoft, lotus: theme.lotusSoft, jade: theme.jadeSoft };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">{t.scripturesTitle}</AppText>
          <AppText variant="bodyS" tone="text2">
            {t.scripturesIntro}
          </AppText>
        </View>

        <GoldCard style={{ marginHorizontal: space.screen }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={styles.heroIcon}>
              <Ionicons name="musical-notes" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="h2" color="#fff">
                {t.comingSoonScriptures}
              </AppText>
              <AppText variant="bodyS" color="rgba(255,255,255,0.88)">
                {t.scriptureComingSoon}
              </AppText>
            </View>
          </View>
        </GoldCard>

        <View style={styles.grid}>
          {cats.map((c) => (
            <Card key={c.label} style={styles.cat} tone="card">
              <View style={[styles.catIcon, { backgroundColor: toneBg[c.tone] }]}>
                <Ionicons name={c.icon} size={22} color={toneColor[c.tone]} />
              </View>
              <AppText variant="h3">{c.label}</AppText>
              <Tag label={t.comingSoon} tone="neutral" />
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.screen, paddingTop: 12, paddingBottom: 16, gap: 4 },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: space.screen,
    marginTop: 16,
  },
  cat: { width: "47.5%", gap: 10, alignItems: "flex-start" },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
