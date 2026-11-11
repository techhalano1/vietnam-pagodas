import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, TextInput, View } from "react-native";
import { AppHeader, ListRow, Screen, SectionHeader } from "@/components/ui";
import { displayName, getPagodaBySlug, normalize, pagodas } from "@/lib/data";
import { useOfferings } from "@/lib/offerings";
import { useSaved } from "@/lib/saved";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";

const SUGGESTED = [
  "chua-huong",
  "chua-tran-quoc",
  "chua-mot-cot",
  "chua-bai-dinh",
  "chua-but-thap",
  "chua-con-son",
];

type Row = { kind: "header"; title: string } | { kind: "pagoda"; p: Pagoda };

export default function PickPagodaScreen() {
  const { t, theme, locale } = useSettings();
  const router = useRouter();
  const { journal } = useOfferings();
  const { favorites } = useSaved();
  const [q, setQ] = useState("");

  const rows = useMemo<Row[]>(() => {
    const toRows = (title: string, list: Pagoda[]): Row[] =>
      list.length
        ? [
            { kind: "header", title },
            ...list.map((p) => ({ kind: "pagoda" as const, p })),
          ]
        : [];
    const bySlugs = (slugs: string[]) =>
      [...new Set(slugs)].map(getPagodaBySlug).filter((p): p is Pagoda => !!p);
    const needle = normalize(q.trim());
    if (needle) {
      const hits = pagodas
        .filter((p) => normalize(`${p.name} ${p.province}`).includes(needle))
        .slice(0, 50);
      return toRows(t.offer.pickResults, hits);
    }
    const recent = bySlugs(journal.map((o) => o.slug)).slice(0, 5);
    const favs = bySlugs([...favorites].reverse()).slice(0, 10);
    const seen = new Set([...recent, ...favs].map((p) => p.slug));
    const suggested = bySlugs(SUGGESTED).filter((p) => !seen.has(p.slug));
    return [
      ...toRows(t.offer.pickRecent, recent),
      ...toRows(t.offer.pickFavorites, favs),
      ...toRows(
        t.offer.pickSuggested,
        suggested.length ? suggested : pagodas.slice(0, 8),
      ),
    ];
  }, [q, journal, favorites, t]);

  return (
    <Screen>
      <AppHeader title={t.offer.pickTitle} onBack={() => router.back()} />
      <View
        style={[
          styles.search,
          { backgroundColor: theme.card, borderColor: theme.line },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.text3} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t.offer.pickSearch}
          placeholderTextColor={theme.text3}
          style={[styles.input, { color: theme.text }]}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r, i) =>
          r.kind === "header" ? `h-${r.title}` : `${r.p.slug}-${i}`
        }
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) =>
          item.kind === "header" ? (
            <SectionHeader title={item.title} style={{ marginTop: 12 }} />
          ) : (
            <View style={{ paddingHorizontal: space.screen }}>
              <ListRow
                emoji="🛕"
                title={displayName(item.p, locale)}
                subtitle={item.p.province}
                onPress={() => router.push(`/bao-dien/${item.p.slug}`)}
                right={
                  <Ionicons
                    name="flame-outline"
                    size={18}
                    color={theme.primaryText}
                  />
                }
              />
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    marginHorizontal: space.screen,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
  },
  input: { flex: 1, fontSize: 15 },
});
