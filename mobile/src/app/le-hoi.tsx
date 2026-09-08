import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import { Card, SectionHeader, Tag } from "@/components/ui";
import { displayName, festivals, getPagodaBySlug } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

export default function FestivalsScreen() {
  const { theme, t } = useSettings();
  const months = Array.from(new Set(festivals.map((f) => f.lunarMonth))).sort((a, b) => a - b);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="bodyS" tone="text2" style={{ paddingHorizontal: space.screen }}>
        {t.festivalsIntro}
      </AppText>
      {months.map((m) => (
        <MonthGroup key={m} month={m} />
      ))}
    </ScrollView>
  );
}

function MonthGroup({ month }: { month: number }) {
  const { theme, t, locale } = useSettings();
  const router = useRouter();
  const en = locale === "en";
  return (
    <>
      <SectionHeader title={t.lunarMonth(month)} />
      <View style={{ paddingHorizontal: space.screen, gap: space.gap }}>
        {festivals
          .filter((f) => f.lunarMonth === month)
          .map((f) => {
            const p = getPagodaBySlug(f.slug);
            return (
              <Card key={f.slug}>
                <View style={styles.head}>
                  <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name="sparkles" size={18} color={theme.primaryText} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="h3">{en ? f.nameEn : f.nameVi}</AppText>
                    <Tag label={en ? f.dateEn : f.dateVi} tone="primary" />
                  </View>
                </View>
                <AppText variant="bodyS" style={{ marginTop: 10 }}>
                  {en ? f.descEn : f.descVi}
                </AppText>
                {p ? (
                  <Pressable
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.link,
                      { borderTopColor: theme.line, opacity: pressed ? 0.6 : 1 },
                    ]}
                    onPress={() => {
                      haptics.tap();
                      router.push({ pathname: "/chua/[slug]", params: { slug: p.slug } });
                    }}
                  >
                    <Ionicons name="location" size={16} color={theme.primaryText} />
                    <AppText variant="bodyS" tone="primary" weight={600} style={{ flex: 1 }}>
                      {displayName(p, locale)} · {p.province}
                    </AppText>
                    <Ionicons name="chevron-forward" size={16} color={theme.text3} />
                  </Pressable>
                ) : null}
              </Card>
            );
          })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
