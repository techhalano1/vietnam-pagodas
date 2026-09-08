import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { describe, displayName, imageUrl, siteType } from "@/lib/data";
import { useSettings } from "@/lib/settings";
import type { Pagoda } from "@/lib/types";

export function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { theme } = useSettings();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.chipActive : theme.chip,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? theme.chipActiveText : theme.chipText}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.chipText,
          { color: active ? theme.chipActiveText : theme.chipText },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const { theme } = useSettings();
  return (
    <Text
      style={[
        styles.sectionTitle,
        { color: theme.text, borderBottomColor: theme.border },
      ]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useSettings();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  const { theme } = useSettings();
  return (
    <View style={styles.empty}>
      <Text style={{ color: theme.muted, textAlign: "center" }}>{text}</Text>
    </View>
  );
}

export const PagodaRow = memo(function PagodaRow({
  pagoda,
  distanceKm,
}: {
  pagoda: Pagoda;
  distanceKm?: number;
}) {
  const { theme, locale, t } = useSettings();
  const router = useRouter();
  const thumb = imageUrl(pagoda.thumbnail ?? pagoda.image);
  const type = siteType(pagoda.name);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({ pathname: "/chua/[slug]", params: { slug: pagoda.slug } })
      }
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {thumb ? (
        <Image
          source={{ uri: thumb }}
          style={styles.thumb}
          contentFit="cover"
          transition={150}
          alt=""
        />
      ) : (
        <View
          style={[
            styles.thumb,
            styles.thumbFallback,
            { backgroundColor: theme.accentSoft },
          ]}
        >
          <Ionicons name="business-outline" size={22} color={theme.accent} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={2}
          style={[styles.rowTitle, { color: theme.text }]}
        >
          {displayName(pagoda, locale)}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.rowMeta, { color: theme.muted }]}
        >
          {t.typeLabels[type]} · {pagoda.province}
          {pagoda.oldProvince ? ` (${pagoda.oldProvince})` : ""}
          {distanceKm !== undefined ? ` · ${t.kmAway(distanceKm)}` : ""}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.rowDesc, { color: theme.muted }]}
        >
          {describe(pagoda, locale)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  empty: { padding: 32, alignItems: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  thumbFallback: { alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowMeta: { fontSize: 12, marginTop: 2 },
  rowDesc: { fontSize: 12, marginTop: 3 },
});
