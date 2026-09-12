import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, View } from "react-native";
import { AppHeader, Button, Empty, PagodaRow, Screen, SegmentedControl } from "@/components/ui";
import { getPagodaBySlug } from "@/lib/data";
import { useSaved } from "@/lib/saved";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";

type Tab = "favorites" | "visited";

export default function SavedScreen() {
  const { t } = useSettings();
  const { favorites, visited } = useSaved();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === "visited" ? "visited" : "favorites");

  const slugs = tab === "favorites" ? favorites : visited;
  const items = slugs
    .map((s) => getPagodaBySlug(s))
    .filter((p): p is Pagoda => p !== undefined)
    .reverse();

  return (
    <Screen>
      <AppHeader title={t.favoritesTitle} onBack={() => router.back()} />
      <View style={{ paddingHorizontal: space.screen, paddingBottom: 12 }}>
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "favorites", label: `${t.favoritesHeading} (${favorites.length})`, icon: "heart" },
            { value: "visited", label: `${t.visitedHeading} (${visited.length})`, icon: "checkmark-circle" },
          ]}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(p) => p.slug}
        renderItem={({ item }) => <PagodaRow p={item} />}
        ListEmptyComponent={
          <Empty
            icon={tab === "favorites" ? "heart-outline" : "checkmark-circle-outline"}
            title={t.favoritesEmpty}
            action={
              <Button
                label={t.tabPagodas}
                icon="search"
                variant="secondary"
                onPress={() => router.push("/(tabs)/chua")}
              />
            }
          />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </Screen>
  );
}
