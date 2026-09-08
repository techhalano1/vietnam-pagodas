import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Card, SectionTitle } from "@/components/ui";
import { displayName, festivals, getPagodaBySlug } from "@/lib/data";
import { useSettings } from "@/lib/settings";

export default function FestivalsScreen() {
  const { theme, t } = useSettings();
  const months = Array.from(new Set(festivals.map((f) => f.lunarMonth))).sort(
    (a, b) => a - b,
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.intro, { color: theme.muted }]}>
        {t.festivalsIntro}
      </Text>
      {months.map((m) => (
        <SectionGroup key={m} month={m} />
      ))}
    </ScrollView>
  );
}

function SectionGroup({ month }: { month: number }) {
  const { theme, t, locale } = useSettings();
  const router = useRouter();
  return (
    <>
      <SectionTitle>{t.lunarMonth(month)}</SectionTitle>
      {festivals
        .filter((f) => f.lunarMonth === month)
        .map((f) => {
          const p = getPagodaBySlug(f.slug);
          return (
            <Card key={f.slug} style={{ marginBottom: 10 }}>
              <Text style={[styles.name, { color: theme.text }]}>
                {locale === "en" ? f.nameEn : f.nameVi}
              </Text>
              <Text
                style={{ color: theme.accent, fontSize: 13, marginBottom: 6 }}
              >
                {locale === "en" ? f.dateEn : f.dateVi}
              </Text>
              <Text style={[styles.desc, { color: theme.text }]}>
                {locale === "en" ? f.descEn : f.descVi}
              </Text>
              {p && (
                <Pressable
                  style={styles.link}
                  onPress={() =>
                    router.push({
                      pathname: "/chua/[slug]",
                      params: { slug: p.slug },
                    })
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={theme.accent}
                  />
                  <Text style={{ color: theme.accent, fontSize: 14 }}>
                    {displayName(p, locale)} · {p.province}
                  </Text>
                </Pressable>
              )}
            </Card>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  intro: { fontSize: 14, lineHeight: 21 },
  name: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 14, lineHeight: 21 },
  link: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
});
