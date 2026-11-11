import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import { PressableCard } from "@/components/ui";
import { displayName, getPagodaBySlug } from "@/lib/data";
import { useNow, useOfferings } from "@/lib/offerings";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

export function OfferHomeCard({ isObservance }: { isObservance: boolean }) {
  const { t, theme, locale } = useSettings();
  const router = useRouter();
  const { burning, journal } = useOfferings();
  const now = useNow(journal.length > 0, 15000);
  const current = burning(now);
  const p = current ? getPagodaBySlug(current.slug) : undefined;

  return (
    <PressableCard
      tone="soft"
      accessibilityRole="button"
      style={[styles.card, { borderColor: theme.primary }]}
      onPress={() =>
        router.push(current ? `/bao-dien/${current.slug}` : "/thap-huong")
      }
    >
      <View style={[styles.icon, { backgroundColor: theme.primary }]}>
        <Ionicons name="flame" size={22} color="#fff" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="h3">{t.offer.homeTitle}</AppText>
        <AppText variant="bodyS" tone="text2" numberOfLines={2}>
          {p
            ? t.offer.homeBurning(displayName(p, locale))
            : isObservance
              ? t.offer.homeTextObservance
              : t.offer.homeText}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.primaryText} />
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: space.screen,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
