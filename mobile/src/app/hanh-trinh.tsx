import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import { Card, Tag } from "@/components/ui";
import { displayName, getPagodaBySlug, pilgrimageRoutes } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";

export default function RoutesScreen() {
  const { theme, t, locale } = useSettings();
  const router = useRouter();
  const en = locale === "en";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppText variant="bodyS" tone="text2">
        {t.routesIntro}
      </AppText>
      {pilgrimageRoutes.map((r) => {
        const stops = r.stops
          .map((s) => getPagodaBySlug(s))
          .filter((p): p is Pagoda => p !== undefined);
        return (
          <Card key={r.id} style={{ marginTop: space.gap }}>
            <View style={styles.head}>
              <View style={[styles.icon, { backgroundColor: theme.jadeSoft }]}>
                <Ionicons name="trail-sign" size={18} color={theme.jade} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="h3">{en ? r.titleEn : r.titleVi}</AppText>
                <Tag label={t.routeStops(stops.length)} tone="jade" />
              </View>
            </View>
            <AppText variant="bodyS" style={{ marginTop: 10, marginBottom: 6 }}>
              {en ? r.descEn : r.descVi}
            </AppText>
            {stops.map((p, i) => (
              <Pressable
                key={p.slug}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.stop,
                  { borderTopColor: theme.line, opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={() => {
                  haptics.tap();
                  router.push({ pathname: "/chua/[slug]", params: { slug: p.slug } });
                }}
              >
                <View style={styles.stepCol}>
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <AppText variant="caption" weight={800} color="#fff">
                      {i + 1}
                    </AppText>
                  </View>
                  {i < stops.length - 1 ? (
                    <View style={[styles.connector, { backgroundColor: theme.line }]} />
                  ) : null}
                </View>
                <View style={{ flex: 1, paddingBottom: i < stops.length - 1 ? 10 : 0 }}>
                  <AppText variant="body" weight={600} numberOfLines={2}>
                    {displayName(p, locale)}
                  </AppText>
                  <AppText variant="caption" tone="text2">
                    {p.province}
                    {p.oldProvince ? ` · ${t.formerProvince(p.oldProvince)}` : ""}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.text3} />
              </Pressable>
            ))}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.screen, paddingTop: 12, paddingBottom: 40 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stop: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingTop: 8 },
  stepCol: { alignItems: "center", alignSelf: "stretch" },
  badge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  connector: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
});
