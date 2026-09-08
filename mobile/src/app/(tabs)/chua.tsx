import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { LeafletMap, type MapPoint } from "@/components/LeafletMap";
import { Sheet } from "@/components/Sheet";
import { AppText } from "@/components/Text";
import {
  Button,
  Chip,
  Empty,
  IconButton,
  PagodaRow,
  Screen,
  SegmentedControl,
  useTabBarPadding,
} from "@/components/ui";
import {
  displayName,
  distanceKm,
  normalize,
  pagodas,
  provinces,
  siteType,
  siteTypes,
  type SiteType,
} from "@/lib/data";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";
import { useLocation } from "@/lib/useLocation";

const PAGE = 100;

interface Row {
  pagoda: Pagoda;
  distance?: number;
}

type View_ = "list" | "map";

export default function PagodasScreen() {
  const { theme, t, locale } = useSettings();
  const router = useRouter();
  const params = useLocalSearchParams<{
    near?: string;
    view?: string;
    province?: string;
    ts?: string;
  }>();
  const bottom = useTabBarPadding();
  const { position, loading, error, request, clear } = useLocation();

  const [view, setView] = useState<View_>("list");
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string | null>(null);
  const [type, setType] = useState<SiteType | null>(null);
  const [nearOn, setNearOn] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const paramKey = `${params.near ?? ""}|${params.view ?? ""}|${params.province ?? ""}|${params.ts ?? ""}`;
  const [handledKey, setHandledKey] = useState("");
  if (paramKey !== handledKey) {
    setHandledKey(paramKey);
    if (params.near === "1") setNearOn(true);
    if (params.view === "map") setView("map");
    if (params.province) setProvince(params.province);
  }
  const wantsNear = params.near === "1";
  useEffect(() => {
    if (wantsNear) void request();
  }, [paramKey, wantsNear, request]);

  const near = nearOn ? position : null;

  const toggleNear = useCallback(async () => {
    if (nearOn) {
      setNearOn(false);
      clear();
      return;
    }
    const ok = position ? true : await request();
    if (ok) setNearOn(true);
  }, [nearOn, position, request, clear]);

  const rows = useMemo<Row[]>(() => {
    const q = normalize(query.trim());
    let list = pagodas.filter((p) => {
      if (province && p.province !== province) return false;
      if (type && siteType(p.name) !== type) return false;
      if (q) {
        const hay = normalize(
          `${p.name} ${p.province} ${p.oldProvince ?? ""} ${locale === "en" ? (p.descriptionEn ?? "") : p.description}`,
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (near) {
      return list
        .filter((p): p is Pagoda & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
        .map((p) => ({ pagoda: p, distance: distanceKm(near.lat, near.lng, p.lat, p.lng) }))
        .sort((a, b) => a.distance - b.distance);
    }
    list = [...list].sort((a, b) =>
      displayName(a, locale).localeCompare(displayName(b, locale), locale),
    );
    return list.map((pagoda) => ({ pagoda }));
  }, [query, province, type, near, locale]);

  const points = useMemo<MapPoint[]>(
    () =>
      rows
        .map((r) => r.pagoda)
        .filter((p): p is Pagoda & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
        .map((p) => ({ slug: p.slug, name: displayName(p, locale), lat: p.lat, lng: p.lng })),
    [rows, locale],
  );

  const mapCenter = useMemo(
    () => (near ? { lat: near.lat, lng: near.lng, zoom: 12 } : undefined),
    [near],
  );

  const visible = rows.slice(0, limit);
  const resetLimit = () => setLimit(PAGE);
  const activeFilters = (province ? 1 : 0) + (type ? 1 : 0);

  const filteredProvinces = useMemo(() => {
    const q = normalize(provinceQuery.trim());
    return q ? provinces.filter((p) => normalize(p.name).includes(q)) : provinces;
  }, [provinceQuery]);

  const header = (
    <View>
      <View style={styles.top}>
        <AppText variant="display" style={{ flex: 1 }}>
          {t.tabPagodas}
        </AppText>
        <SegmentedControl<View_>
          value={view}
          onChange={setView}
          style={{ width: 170 }}
          options={[
            { value: "list", label: t.listView, icon: "list" },
            { value: "map", label: t.mapView, icon: "map" },
          ]}
        />
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.search, { backgroundColor: theme.card, borderColor: theme.line }, theme.shadow]}>
          <Ionicons name="search" size={18} color={theme.text3} />
          <TextInput
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              resetLimit();
            }}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={theme.text3}
            style={[styles.input, { color: theme.text }]}
            autoCorrect={false}
            returnKeyType="search"
            accessibilityLabel={t.searchPlaceholder}
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear">
              <Ionicons name="close-circle" size={18} color={theme.text3} />
            </Pressable>
          ) : null}
        </View>
        <IconButton
          icon="options-outline"
          label={t.filters}
          size={48}
          active={activeFilters > 0}
          onPress={() => setFilterOpen(true)}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipBar}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          icon={loading ? "hourglass-outline" : nearOn && position ? "navigate" : "navigate-outline"}
          label={nearOn && position ? t.nearMeOn : t.nearMe}
          active={nearOn && !!position}
          onPress={() => void toggleNear()}
        />
        <Chip
          icon="location-outline"
          label={province ?? t.allProvinces}
          active={!!province}
          onPress={() => setFilterOpen(true)}
        />
        {siteTypes.map((st) => (
          <Chip
            key={st}
            label={t.typeLabels[st]}
            active={type === st}
            onPress={() => {
              setType(type === st ? null : st);
              resetLimit();
            }}
          />
        ))}
      </ScrollView>

      {error && nearOn ? (
        <AppText variant="caption" tone="danger" style={styles.geoError}>
          {t.geoError}
        </AppText>
      ) : null}
    </View>
  );

  return (
    <Screen>
      {header}
      {view === "list" ? (
        <FlatList
          data={visible}
          keyExtractor={(r) => r.pagoda.slug}
          renderItem={({ item }) => <PagodaRow p={item.pagoda} distanceKm={item.distance} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={{ paddingBottom: bottom }}
          ListHeaderComponent={
            <>
              <View style={styles.countRow}>
                <AppText variant="caption" tone="text2">
                  {t.resultsCount(rows.length)}
                </AppText>
                {near ? (
                  <AppText variant="caption" tone="jade" weight={600}>
                    · {t.sortedByDistance}
                  </AppText>
                ) : null}
              </View>
            </>
          }
          ListEmptyComponent={<Empty icon="search-outline" title={t.noResults} />}
          ListFooterComponent={
            rows.length > limit ? (
              <Button
                variant="secondary"
                label={`${t.showMore} (${(rows.length - limit).toLocaleString(locale)})`}
                onPress={() => setLimit((l) => l + PAGE)}
                style={{ marginHorizontal: space.screen, marginTop: 6 }}
              />
            ) : null
          }
        />
      ) : (
        <View style={{ flex: 1 }}>
          <View style={[styles.mapWrap, { borderColor: theme.line, marginBottom: bottom - 10 }]}>
            <LeafletMap
              points={points}
              onSelect={(slug) => router.push({ pathname: "/chua/[slug]", params: { slug } })}
              center={mapCenter}
            />
            <View style={[styles.mapHint, { backgroundColor: theme.tabBar, borderColor: theme.line }]}>
              <AppText variant="caption" tone="text2">
                {t.resultsCount(points.length)} · {t.mapTapHint}
              </AppText>
            </View>
          </View>
        </View>
      )}

      <Sheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={t.filters}
        footer={
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button
              variant="ghost"
              label={t.clearFilters}
              style={{ flex: 1 }}
              disabled={activeFilters === 0}
              onPress={() => {
                setProvince(null);
                setType(null);
                resetLimit();
              }}
            />
            <Button
              label={`${t.apply} · ${t.resultsCount(rows.length)}`}
              style={{ flex: 2 }}
              onPress={() => setFilterOpen(false)}
            />
          </View>
        }
      >
        <View style={{ paddingHorizontal: space.screen }}>
          <AppText variant="overline" tone="text2" style={{ marginBottom: 8 }}>
            {t.filterType}
          </AppText>
          <View style={styles.wrap}>
            <Chip label={t.allTypes} active={type === null} onPress={() => setType(null)} />
            {siteTypes.map((st) => (
              <Chip
                key={st}
                label={t.typeLabels[st]}
                active={type === st}
                onPress={() => {
                  setType(type === st ? null : st);
                  resetLimit();
                }}
              />
            ))}
          </View>

          <AppText variant="overline" tone="text2" style={{ marginTop: 18, marginBottom: 8 }}>
            {t.filterProvince}
          </AppText>
          <View style={[styles.search, { backgroundColor: theme.cardAlt, borderColor: theme.line, marginBottom: 8 }]}>
            <Ionicons name="search" size={16} color={theme.text3} />
            <TextInput
              value={provinceQuery}
              onChangeText={setProvinceQuery}
              placeholder={t.filterProvince}
              placeholderTextColor={theme.text3}
              style={[styles.input, { color: theme.text, height: 40 }]}
              autoCorrect={false}
            />
          </View>
        </View>
        <FlatList
          data={[{ name: null as string | null, count: pagodas.length }, ...filteredProvinces]}
          keyExtractor={(pr) => pr.name ?? "__all"}
          style={{ maxHeight: 320 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const active = item.name === province;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setProvince(item.name);
                  resetLimit();
                }}
                style={({ pressed }) => [
                  styles.provinceRow,
                  { backgroundColor: active ? theme.primarySoft : pressed ? theme.cardAlt : "transparent" },
                ]}
              >
                <AppText variant="body" weight={active ? 700 : 400} tone={active ? "primary" : "text"} style={{ flex: 1 }}>
                  {item.name ?? t.allProvinces}
                </AppText>
                <AppText variant="caption" tone="text3">
                  {item.count.toLocaleString(locale)}
                </AppText>
                {active ? <Ionicons name="checkmark-circle" size={18} color={theme.primaryText} /> : null}
              </Pressable>
            );
          }}
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.screen,
    paddingTop: 12,
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.screen,
    marginBottom: 10,
  },
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
  chipBar: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: space.screen, gap: 8, paddingBottom: 10 },
  geoError: { paddingHorizontal: space.screen, paddingBottom: 6 },
  countRow: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: space.screen,
    paddingBottom: 10,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: space.screen,
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  mapHint: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  provinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.screen,
    paddingVertical: 13,
  },
});
