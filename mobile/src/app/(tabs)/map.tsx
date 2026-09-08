import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LeafletMap, type MapPoint } from "@/components/LeafletMap";
import { displayName, pagodas } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Pagoda } from "@/lib/types";

export default function MapScreen() {
  const router = useRouter();
  const { theme, t, locale } = useSettings();

  const points = useMemo<MapPoint[]>(
    () =>
      pagodas
        .filter(
          (p): p is Pagoda & { lat: number; lng: number } =>
            p.lat !== null && p.lng !== null,
        )
        .map((p) => ({
          slug: p.slug,
          name: displayName(p, locale),
          lat: p.lat,
          lng: p.lng,
        })),
    [locale],
  );

  return (
    <View style={{ flex: 1 }}>
      <LeafletMap
        points={points}
        onSelect={(slug) =>
          router.push({ pathname: "/chua/[slug]", params: { slug } })
        }
      />
      <View
        style={[
          styles.hint,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={{ color: theme.muted, fontSize: 12 }}>
          {points.length.toLocaleString(locale)} · {t.mapTapHint}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
});
