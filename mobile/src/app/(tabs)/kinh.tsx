import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ScriptureRow } from "@/components/ScriptureRow";
import { AppText } from "@/components/Text";
import {
  Chip,
  Empty,
  GoldCard,
  Screen,
  SectionHeader,
  SegmentedControl,
  useTabBarPadding,
} from "@/components/ui";
import * as haptics from "@/lib/haptics";
import { recentPositions, useReading } from "@/lib/reading";
import {
  getScripture,
  occasionFilters,
  scriptureTitle,
  searchScriptures,
  type ScriptureGroup,
} from "@/lib/scriptures";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import type { Scripture } from "@/lib/types";

type Group = ScriptureGroup | "all";

export default function ScripturesScreen() {
  const { theme, t, locale } = useSettings();
  const { positions, favorites } = useReading();
  const router = useRouter();
  const bottom = useTabBarPadding();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [occasion, setOccasion] = useState<string | null>(null);
  const [favOnly, setFavOnly] = useState(false);

  const results = useMemo(() => {
    const list = searchScriptures(query, group, occasion, locale);
    return favOnly ? list.filter((s) => favorites.includes(s.slug)) : list;
  }, [query, group, occasion, locale, favOnly, favorites]);

  const recent = useMemo(
    () =>
      recentPositions(positions, 3)
        .map(({ slug, pos }) => ({ s: getScripture(slug), pos }))
        .filter((x): x is { s: Scripture; pos: (typeof x)["pos"] } => !!x.s)
        .filter((x) => x.pos.verse + 1 < x.pos.total),
    [positions],
  );

  const filtering = query.trim().length > 0 || occasion !== null || favOnly || group !== "all";

  const header = (
    <View>
      <View style={styles.header}>
        <AppText variant="display">{t.scripturesTitle}</AppText>
        <AppText variant="bodyS" tone="text2">
          {t.scripturesIntro}
        </AppText>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.line }, theme.shadow]}>
          <Ionicons name="search" size={18} color={theme.text3} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.scriptureSearch}
            placeholderTextColor={theme.text3}
            style={[styles.input, { color: theme.text }]}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t.scriptureSearch}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear">
              <Ionicons name="close-circle" size={18} color={theme.text3} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.scriptureFavorites}
          accessibilityState={{ selected: favOnly }}
          onPress={() => {
            haptics.select();
            setFavOnly((v) => !v);
          }}
          style={[
            styles.favBtn,
            {
              backgroundColor: favOnly ? theme.lotusSoft : theme.card,
              borderColor: favOnly ? "transparent" : theme.line,
            },
          ]}
        >
          <Ionicons name={favOnly ? "heart" : "heart-outline"} size={20} color={favOnly ? theme.lotus : theme.text2} />
        </Pressable>
      </View>

      <SegmentedControl<Group>
        value={group}
        onChange={setGroup}
        style={{ marginHorizontal: space.screen, marginTop: 12 }}
        options={[
          { value: "all", label: t.scriptureGroupAll },
          { value: "kinh", label: t.scriptureGroupKinh, icon: "book" },
          { value: "khan", label: t.scriptureGroupKhan, icon: "hand-left" },
        ]}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipBar}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        {occasionFilters.map((o) => (
          <Chip
            key={o}
            label={t.occasionLabels[o]}
            active={occasion === o}
            onPress={() => setOccasion(occasion === o ? null : o)}
          />
        ))}
      </ScrollView>

      {!filtering && recent.length > 0 ? (
        <View style={{ marginTop: 6 }}>
          <SectionHeader title={t.continueReading} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: space.screen, gap: 12, paddingBottom: 6 }}
          >
            {recent.map(({ s, pos }) => (
              <Pressable
                key={s.slug}
                accessibilityRole="button"
                accessibilityLabel={`${t.continueReading}: ${scriptureTitle(s, locale)}`}
                onPress={() => {
                  haptics.tap();
                  router.push({ pathname: "/kinh/[slug]", params: { slug: s.slug } });
                }}
                style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
              >
              <GoldCard style={styles.continueCard}>
                <View style={{ flex: 1, gap: 6 }}>
                  <AppText variant="overline" color="rgba(255,255,255,0.8)">
                    {t.scriptureKind[s.kind]}
                  </AppText>
                  <AppText variant="h3" color="#fff" numberOfLines={2}>
                    {scriptureTitle(s, locale)}
                  </AppText>
                  <View style={styles.continueTrack}>
                    <View
                      style={[
                        styles.continueFill,
                        { width: `${Math.round(((pos.verse + 1) / pos.total) * 100)}%` },
                      ]}
                    />
                  </View>
                  <AppText variant="caption" color="rgba(255,255,255,0.88)">
                    {t.readingProgress(pos.verse + 1, pos.total)}
                  </AppText>
                </View>
              </GoldCard>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.countRow}>
        <AppText variant="overline" tone="text2">
          {t.scriptureCount(results.length)}
        </AppText>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={results}
        keyExtractor={(s) => s.slug}
        ListHeaderComponent={header}
        renderItem={({ item }) => <ScriptureRow s={item} style={styles.rowItem} />}
        contentContainerStyle={{ paddingBottom: bottom }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Empty
            icon={favOnly ? "heart-outline" : "search"}
            title={favOnly ? t.favoritesEmptyScripture : t.noResults}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.screen, paddingTop: 12, paddingBottom: 14, gap: 4 },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: space.screen },
  search: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, height: 48, fontFamily: "BeVietnamPro_400Regular" },
  favBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipBar: { flexGrow: 0, flexShrink: 0, marginTop: 12 },
  chips: { paddingHorizontal: space.screen, gap: 8, paddingBottom: 4 },
  continueCard: { width: 220, minHeight: 130 },
  continueTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
    marginTop: 4,
  },
  continueFill: { height: 4, borderRadius: 2, backgroundColor: "#fff" },
  countRow: { paddingHorizontal: space.screen, paddingTop: 12, paddingBottom: 8 },
  rowItem: { marginHorizontal: space.screen, marginBottom: 10 },
});
