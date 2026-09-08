import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import { Card, GoldCard, ListRow, SectionHeader } from "@/components/ui";
import { pagodas, provinces, SITE_URL } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

export default function AboutScreen() {
  const { theme, t, locale } = useSettings();
  const en = locale === "en";
  const open = (url: string) => Linking.openURL(url).catch(() => undefined);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <GoldCard style={{ marginHorizontal: space.screen }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <AppText style={{ fontSize: 36 }}>🪷</AppText>
          <View style={{ flex: 1 }}>
            <AppText variant="h1" color="#fff">
              {t.siteName}
            </AppText>
            <AppText variant="bodyS" color="rgba(255,255,255,0.9)">
              {t.tagline}
            </AppText>
          </View>
        </View>
        <AppText variant="bodyS" color="rgba(255,255,255,0.92)" style={{ marginTop: 14 }}>
          {t.heroSubtitle(pagodas.length, provinces.length)}
        </AppText>
      </GoldCard>

      <View style={{ paddingHorizontal: space.screen, paddingTop: 16 }}>
        <AppText variant="body" tone="text2">
          {t.metaDescription}
        </AppText>
      </View>

      <SectionHeader title={t.sponsor} />
      <Card style={styles.group}>
        <View style={{ paddingTop: 12, paddingBottom: 4 }}>
          <AppText variant="bodyS">
            {en
              ? "This project is sponsored by Cognition, which provides the AI tokens that power its research, writing and development."
              : "Dự án được tài trợ bởi Cognition — đơn vị cung cấp toàn bộ token AI cho việc nghiên cứu, biên soạn và phát triển trang."}
          </AppText>
        </View>
        <ListRow icon="open-outline" title="cognition.ai" last onPress={() => open("https://cognition.ai")} />
      </Card>

      <SectionHeader title={t.referencesHeading} />
      <Card style={styles.group}>
        <View style={{ paddingTop: 12, paddingBottom: 4, gap: 8 }}>
          <AppText variant="caption" tone="text2">
            {t.footer}
          </AppText>
          <AppText variant="caption" tone="text2">
            {t.licenseWiki}
          </AppText>
          <AppText variant="caption" tone="text2">
            {t.licenseOsm}
          </AppText>
        </View>
        <ListRow
          icon="globe-outline"
          iconTone="jade"
          title={t.openWebsite}
          subtitle="vietnam-pagodas.com"
          onPress={() => open(`${SITE_URL}/${locale}`)}
        />
        <ListRow
          icon="document-text-outline"
          iconTone="neutral"
          title="CC BY-SA 4.0"
          onPress={() => open("https://creativecommons.org/licenses/by-sa/4.0/")}
        />
        <ListRow
          icon="map-outline"
          iconTone="neutral"
          title="OpenStreetMap"
          last
          onPress={() => open("https://www.openstreetmap.org/copyright")}
        />
      </Card>

      <View style={styles.footer}>
        <Ionicons name="flower-outline" size={16} color={theme.text3} />
        <AppText variant="caption" tone="text3" center>
          {t.madeWith}
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 40 },
  group: { marginHorizontal: space.screen, paddingVertical: 4 },
  footer: { alignItems: "center", gap: 4, marginTop: 24 },
});
