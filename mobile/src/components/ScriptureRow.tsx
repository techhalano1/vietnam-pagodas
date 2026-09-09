import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { formatTime, getAudio } from "@/lib/audio";
import * as haptics from "@/lib/haptics";
import { useReading } from "@/lib/reading";
import {
  hasHanViet,
  readingMinutes,
  scriptureTitle,
  verseCount,
} from "@/lib/scriptures";
import { useSettings } from "@/lib/settings";
import { radius } from "@/lib/theme";
import type { Scripture, ScriptureKind } from "@/lib/types";
import { AppText } from "./Text";
import type { IconName } from "./ui";

export const kindIcon: Record<ScriptureKind, IconName> = {
  sutra: "book",
  mantra: "sparkles",
  prayer: "hand-left",
  ritual: "flame",
};

export function useKindTone() {
  const { theme } = useSettings();
  return (kind: ScriptureKind) => {
    if (kind === "prayer") return { fg: theme.lotus, bg: theme.lotusSoft };
    if (kind === "ritual") return { fg: theme.jade, bg: theme.jadeSoft };
    return { fg: theme.primaryText, bg: theme.primarySoft };
  };
}

export function ScriptureRow({
  s,
  style,
  showProgress = true,
}: {
  s: Scripture;
  style?: StyleProp<ViewStyle>;
  showProgress?: boolean;
}) {
  const { theme, t, locale } = useSettings();
  const { favorites, positions } = useReading();
  const router = useRouter();
  const tone = useKindTone()(s.kind);
  const fav = favorites.includes(s.slug);
  const pos = positions[s.slug];
  const progress = pos && pos.total > 0 ? Math.min(1, (pos.verse + 1) / pos.total) : 0;
  const title = scriptureTitle(s, locale);
  const sub = locale === "en" ? s.title : (s.subtitle ?? s.titleEn);
  const audio = getAudio(s.slug);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.scriptureKind[s.kind]}: ${title}`}
      onPress={() => {
        haptics.tap();
        router.push({ pathname: "/kinh/[slug]", params: { slug: s.slug } });
      }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.line, opacity: pressed ? 0.85 : 1 },
        theme.shadow,
        style,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: tone.bg }]}>
        <Ionicons name={kindIcon[s.kind]} size={20} color={tone.fg} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText variant="h3" numberOfLines={2}>
          {title}
        </AppText>
        {sub ? (
          <AppText variant="bodyS" tone="text2" numberOfLines={1}>
            {sub}
          </AppText>
        ) : null}
        <View style={styles.meta}>
          <AppText variant="caption" tone="text3">
            {t.versesCount(verseCount(s))} · {t.minutesRead(readingMinutes(s))}
          </AppText>
          {hasHanViet(s) ? (
            <View style={[styles.badge, { borderColor: theme.line }]}>
              <AppText variant="caption" tone="text2" style={{ fontSize: 10 }}>
                {t.hanVietBadge}
              </AppText>
            </View>
          ) : null}
          {audio ? (
            <View style={[styles.badge, styles.audioBadge, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="headset" size={10} color={theme.primaryText} />
              <AppText variant="caption" tone="primary" weight={600} style={{ fontSize: 10 }}>
                {formatTime(audio.durationSec)}
              </AppText>
            </View>
          ) : null}
        </View>
        {showProgress && progress > 0 ? (
          <View style={[styles.track, { backgroundColor: theme.cardAlt }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round(progress * 100)}%`, backgroundColor: theme.primary },
              ]}
            />
          </View>
        ) : null}
      </View>
      <View style={{ alignItems: "center", gap: 6 }}>
        {fav ? <Ionicons name="heart" size={16} color={theme.lotus} /> : null}
        <Ionicons name="chevron-forward" size={18} color={theme.text3} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  audioBadge: {
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  track: { height: 4, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
