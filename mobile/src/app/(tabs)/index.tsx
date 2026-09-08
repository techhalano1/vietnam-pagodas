import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Chip, Empty, PagodaRow } from "@/components/ui";
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
import type { Pagoda } from "@/lib/types";

const PAGE = 100;

interface Row {
  pagoda: Pagoda;
  distance?: number;
}

export default function ExploreScreen() {
  const { theme, t, locale } = useSettings();
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string | null>(null);
  const [type, setType] = useState<SiteType | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [near, setNear] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const toggleNearMe = useCallback(async () => {
    if (near) {
      setNear(null);
      return;
    }
    setGeoError(false);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("denied");
      const pos =
        (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
        (await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }));
      setNear({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setGeoError(true);
    } finally {
      setLocating(false);
    }
  }, [near]);

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
        .filter(
          (p): p is Pagoda & { lat: number; lng: number } =>
            p.lat !== null && p.lng !== null,
        )
        .map((p) => ({
          pagoda: p,
          distance: distanceKm(near.lat, near.lng, p.lat, p.lng),
        }))
        .sort((a, b) => a.distance - b.distance);
    }
    list = [...list].sort((a, b) =>
      displayName(a, locale).localeCompare(displayName(b, locale), locale),
    );
    return list.map((pagoda) => ({ pagoda }));
  }, [query, province, type, near, locale]);

  const visible = rows.slice(0, limit);

  const resetLimit = () => setLimit(PAGE);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View
        style={[
          styles.searchWrap,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Ionicons name="search" size={18} color={theme.muted} />
        <TextInput
          value={query}
          onChangeText={(v) => {
            setQuery(v);
            resetLimit();
          }}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={theme.muted}
          style={[styles.input, { color: theme.text }]}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => setQuery("")}
            hitSlop={8}
            accessibilityLabel="Clear"
          >
            <Ionicons name="close-circle" size={18} color={theme.muted} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipBar}
        contentContainerStyle={styles.chips}
        keyboardShouldPersistTaps="handled"
      >
        <Chip
          icon="location-outline"
          label={province ?? t.allProvinces}
          active={!!province}
          onPress={() => setPickerOpen(true)}
        />
        <Chip
          icon={
            locating
              ? "hourglass-outline"
              : near
                ? "navigate"
                : "navigate-outline"
          }
          label={near ? t.nearMeOn : t.nearMe}
          active={!!near}
          onPress={toggleNearMe}
        />
        <Chip
          label={t.allTypes}
          active={type === null}
          onPress={() => {
            setType(null);
            resetLimit();
          }}
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

      {geoError && (
        <Text style={[styles.geoError, { color: theme.danger }]}>
          {t.geoError}
        </Text>
      )}

      <FlatList
        data={visible}
        keyExtractor={(r) => r.pagoda.slug}
        renderItem={({ item }) => (
          <PagodaRow pagoda={item.pagoda} distanceKm={item.distance} />
        )}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <Text style={[styles.count, { color: theme.muted }]}>
            {rows.length.toLocaleString(locale)} {t.results}
          </Text>
        }
        ListEmptyComponent={<Empty text={t.noResults} />}
        ListFooterComponent={
          rows.length > limit ? (
            <Pressable
              onPress={() => setLimit((l) => l + PAGE)}
              style={({ pressed }) => [
                styles.more,
                { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={{ color: theme.accentText, fontWeight: "600" }}>
                {t.showMore} ({(rows.length - limit).toLocaleString(locale)})
              </Text>
            </Pressable>
          ) : (
            <View style={{ height: 24 }} />
          )
        }
      />

      <Modal
        visible={pickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={[styles.modalHeader, { backgroundColor: theme.header }]}>
            <Text style={[styles.modalTitle, { color: theme.headerText }]}>
              {t.allProvinces}
            </Text>
            <Pressable
              onPress={() => setPickerOpen(false)}
              hitSlop={10}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color={theme.headerText} />
            </Pressable>
          </View>
          <FlatList
            data={[{ name: null, count: pagodas.length }, ...provinces]}
            keyExtractor={(pr) => pr.name ?? "__all"}
            renderItem={({ item }) => {
              const active = item.name === province;
              return (
                <Pressable
                  onPress={() => {
                    setProvince(item.name);
                    resetLimit();
                    setPickerOpen(false);
                  }}
                  style={[
                    styles.provinceRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? theme.accent : theme.text,
                      fontWeight: active ? "700" : "400",
                      fontSize: 16,
                      flex: 1,
                    }}
                  >
                    {item.name ?? t.allProvinces}
                  </Text>
                  <Text style={{ color: theme.muted }}>{item.count}</Text>
                  {active && (
                    <Ionicons name="checkmark" size={18} color={theme.accent} />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, height: 44 },
  chipBar: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: 12, paddingBottom: 8 },
  geoError: { paddingHorizontal: 16, paddingBottom: 6, fontSize: 12 },
  count: { paddingHorizontal: 16, paddingBottom: 8, fontSize: 12 },
  more: {
    marginHorizontal: 12,
    marginVertical: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  provinceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
