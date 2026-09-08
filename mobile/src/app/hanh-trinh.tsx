import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { displayName, getPagodaBySlug, pilgrimageRoutes } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Pagoda } from "@/lib/types";

export default function RoutesScreen() {
  const { theme, t, locale } = useSettings();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.intro, { color: theme.muted }]}>
        {t.routesIntro}
      </Text>
      {pilgrimageRoutes.map((r) => {
        const stops = r.stops
          .map((s) => getPagodaBySlug(s))
          .filter((p): p is Pagoda => p !== undefined);
        return (
          <Card key={r.id} style={{ marginTop: 14 }}>
            <Text style={[styles.title, { color: theme.text }]}>
              {locale === "en" ? r.titleEn : r.titleVi}
            </Text>
            <Text
              style={{ color: theme.accent, fontSize: 13, marginBottom: 6 }}
            >
              {t.routeStops(stops.length)}
            </Text>
            <Text style={[styles.desc, { color: theme.text }]}>
              {locale === "en" ? r.descEn : r.descVi}
            </Text>
            {stops.map((p, i) => (
              <Pressable
                key={p.slug}
                style={[styles.stop, { borderTopColor: theme.border }]}
                onPress={() =>
                  router.push({
                    pathname: "/chua/[slug]",
                    params: { slug: p.slug },
                  })
                }
              >
                <View style={[styles.badge, { backgroundColor: theme.accent }]}>
                  <Text
                    style={{
                      color: theme.accentText,
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                    numberOfLines={2}
                  >
                    {displayName(p, locale)}
                  </Text>
                  <Text style={{ color: theme.muted, fontSize: 12 }}>
                    {p.province}
                    {p.oldProvince ? ` (${p.oldProvince})` : ""}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.muted}
                />
              </Pressable>
            ))}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  intro: { fontSize: 14, lineHeight: 21 },
  title: { fontSize: 17, fontWeight: "700" },
  desc: { fontSize: 14, lineHeight: 21, marginBottom: 8 },
  stop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
