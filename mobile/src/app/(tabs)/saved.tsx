import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Chip, Empty, PagodaRow } from "@/components/ui";
import { getPagodaBySlug } from "@/lib/data";
import { useSaved } from "@/lib/saved";
import { useSettings } from "@/lib/settings";
import type { Pagoda } from "@/lib/types";

export default function SavedScreen() {
  const { theme, t } = useSettings();
  const { favorites, visited } = useSaved();
  const [tab, setTab] = useState<"favorites" | "visited">("favorites");

  const slugs = tab === "favorites" ? favorites : visited;
  const items = slugs
    .map((s) => getPagodaBySlug(s))
    .filter((p): p is Pagoda => p !== undefined)
    .reverse();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.tabs}>
        <Chip
          icon="heart"
          label={`${t.favoritesHeading} (${favorites.length})`}
          active={tab === "favorites"}
          onPress={() => setTab("favorites")}
        />
        <Chip
          icon="checkmark-circle"
          label={`${t.visitedHeading} (${visited.length})`}
          active={tab === "visited"}
          onPress={() => setTab("visited")}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PagodaRow pagoda={item} />}
        ListEmptyComponent={<Empty text={t.favoritesEmpty} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: "row", padding: 12 },
});
