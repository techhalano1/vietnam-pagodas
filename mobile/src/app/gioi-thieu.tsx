import { Ionicons } from "@expo/vector-icons";
import { Linking, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Card, SectionTitle } from "@/components/ui";
import { pagodas, provinces, SITE_URL } from "@/lib/data";
import { useSettings } from "@/lib/settings";

function ExtLink({ label, url }: { label: string; url: string }) {
  const { theme } = useSettings();
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => undefined)}
      accessibilityRole="link"
      style={styles.link}
    >
      <Ionicons name="open-outline" size={14} color={theme.accent} />
      <Text style={{ color: theme.accent, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export default function AboutScreen() {
  const { theme, t, locale } = useSettings();
  const en = locale === "en";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.text }]}>{t.siteName}</Text>
      <Text style={[styles.para, { color: theme.text }]}>
        {t.heroSubtitle(pagodas.length, provinces.length)}
      </Text>
      <Text style={[styles.para, { color: theme.text }]}>
        {t.metaDescription}
      </Text>
      <ExtLink
        label={`${t.openWebsite} · vietnam-pagodas.com`}
        url={`${SITE_URL}/${locale}`}
      />

      <SectionTitle>{t.sponsor}</SectionTitle>
      <Card>
        <Text style={[styles.para, { color: theme.text, marginBottom: 6 }]}>
          {en
            ? "This project is sponsored by Cognition, which provides the AI tokens that power its research, writing and development."
            : "Dự án được tài trợ bởi Cognition — đơn vị cung cấp toàn bộ token AI cho việc nghiên cứu, biên soạn và phát triển trang."}
        </Text>
        <ExtLink label="cognition.ai" url="https://cognition.ai" />
      </Card>

      <SectionTitle>{t.referencesHeading}</SectionTitle>
      <Text style={[styles.para, { color: theme.muted, fontSize: 13 }]}>
        {t.footer}
      </Text>
      <Text style={[styles.para, { color: theme.muted, fontSize: 13 }]}>
        {t.licenseWiki}
      </Text>
      <Text style={[styles.para, { color: theme.muted, fontSize: 13 }]}>
        {t.licenseOsm}
      </Text>
      <ExtLink
        label="CC BY-SA 4.0"
        url="https://creativecommons.org/licenses/by-sa/4.0/"
      />
      <ExtLink
        label="OpenStreetMap"
        url="https://www.openstreetmap.org/copyright"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  para: { fontSize: 15, lineHeight: 23, marginBottom: 10 },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
});
