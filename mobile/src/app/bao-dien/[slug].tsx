import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Altar } from "@/components/Altar";
import { Sheet } from "@/components/Sheet";
import { AppText } from "@/components/Text";
import {
  Button,
  Card,
  Chip,
  Empty,
  IconButton,
  Screen,
  SegmentedControl,
} from "@/components/ui";
import { displayName, getPagodaBySlug, siteUrl } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import type { OfferFor, OfferItem } from "@/lib/i18n";
import { lunarToday } from "@/lib/lunar";
import { BURN_MS, type Offering, useNow, useOfferings } from "@/lib/offerings";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

const ITEMS: { key: OfferItem; emoji: string }[] = [
  { key: "hoa", emoji: "🪷" },
  { key: "den", emoji: "🕯️" },
  { key: "nuoc", emoji: "💧" },
  { key: "qua", emoji: "🍊" },
];
const HOLD_MS = 1200;
const WISH_MAX = 300;

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function HoldToLight({
  label,
  hint,
  onLit,
}: {
  label: string;
  hint: string;
  onLit: () => void;
}) {
  const { theme } = useSettings();
  const [progress] = useState(() => new Animated.Value(0));
  const done = useRef(false);

  const start = () => {
    done.current = false;
    haptics.tap();
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;
      done.current = true;
      onLit();
      progress.setValue(0);
    });
  };
  const cancel = () => {
    if (done.current) return;
    Animated.timing(progress, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={{ gap: 6 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
        onPressIn={start}
        onPressOut={cancel}
        style={[
          styles.hold,
          { backgroundColor: theme.primarySoft, borderColor: theme.primary },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: theme.primary,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
        <Ionicons name="flame" size={20} color={theme.primaryText} />
        <AppText variant="h3" tone="primary">
          {label}
        </AppText>
      </Pressable>
      <AppText variant="caption" tone="text3" style={{ textAlign: "center" }}>
        {hint}
      </AppText>
    </View>
  );
}

export default function BaoDienScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const p = getPagodaBySlug(slug);
  const { t, theme, locale } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { add, countFor, burning } = useOfferings();
  const bell = useAudioPlayer(require("../../../assets/sounds/chuong.mp3"));

  const [sheet, setSheet] = useState(false);
  const [sticks, setSticks] = useState<1 | 3>(3);
  const [items, setItems] = useState<OfferItem[]>(["hoa", "den"]);
  const [forWhom, setForWhom] = useState<OfferFor>("family");
  const [wish, setWish] = useState("");
  const [lastLit, setLastLit] = useState<Offering>();

  const now = useNow(true);
  const current = burning(now, slug);
  const shown = current ?? lastLit;
  const remaining = current
    ? 1 - (now - current.at) / BURN_MS
    : shown
      ? 0
      : null;

  if (!p) {
    return (
      <Screen>
        <Empty icon="alert-circle-outline" title={t.notFoundTitle} />
      </Screen>
    );
  }
  const name = displayName(p, locale);
  const lunar = lunarToday(new Date(now));

  const toggleItem = (k: OfferItem) => {
    haptics.select();
    setItems((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k],
    );
  };

  const light = () => {
    haptics.success();
    try {
      bell.seekTo(0);
      bell.play();
    } catch {
      // sound is decorative
    }
    const entry = add({
      slug: p.slug,
      sticks,
      items,
      forWhom,
      wish: wish.slice(0, WISH_MAX),
    });
    setLastLit(entry);
    setWish("");
    setSheet(false);
  };

  const share = () => {
    const url = siteUrl(p, locale);
    Share.share({ message: t.offer.shareText(name, url), url }).catch(
      () => undefined,
    );
  };

  return (
    <Screen padTop={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
        <View>
          <Altar
            items={shown?.items ?? items}
            sticks={shown?.sticks ?? sticks}
            remaining={remaining}
            height={380 + insets.top}
          />
          <IconButton
            icon="chevron-back"
            label={t.back}
            onPress={() => router.back()}
            style={[styles.back, { top: insets.top + 8 }]}
          />
        </View>

        <View style={styles.body}>
          <View>
            <AppText variant="overline" tone="primary">
              {t.offer.hallOverline}
            </AppText>
            <AppText variant="h1">{name}</AppText>
            <AppText variant="bodyS" tone="text2">
              {p.province} · {t.offer.lunarShort(lunar.day, lunar.month)}
            </AppText>
            <AppText variant="caption" tone="text3" style={{ marginTop: 4 }}>
              {t.offer.yourCount(countFor(p.slug))}
            </AppText>
          </View>

          {current ? (
            <Card tone="soft" style={styles.status}>
              <Ionicons name="flame" size={22} color={theme.primaryDark} />
              <View style={{ flex: 1 }}>
                <AppText variant="h3">{t.offer.burning}</AppText>
                <AppText variant="bodyS" tone="text2">
                  {t.offer.burningLeft(mmss(BURN_MS - (now - current.at)))}
                </AppText>
              </View>
            </Card>
          ) : shown ? (
            <Card tone="soft">
              <AppText variant="h3">{t.offer.burntOut}</AppText>
              <AppText variant="bodyS" tone="text2">
                {t.offer.burntOutText}
              </AppText>
            </Card>
          ) : null}

          {shown?.wish ? (
            <Card>
              <AppText variant="overline" tone="text3">
                {t.offer.yourWish} · {t.offer.forWhom[shown.forWhom]}
              </AppText>
              <AppText
                variant="body"
                style={{ fontStyle: "italic", marginTop: 4 }}
              >
                “{shown.wish}”
              </AppText>
            </Card>
          ) : null}

          {shown ? (
            <>
              <Card tone="alt" style={{ alignItems: "center" }}>
                <AppText variant="overline" tone="primary">
                  {t.offer.dedicationTitle}
                </AppText>
                <AppText variant="body" style={styles.verse}>
                  {t.offer.dedication}
                </AppText>
                <AppText variant="h3" tone="primary" style={{ marginTop: 8 }}>
                  Nam Mô A Di Đà Phật
                </AppText>
              </Card>
              {current ? (
                <Button
                  label={t.offer.listenWhileBurning}
                  icon="musical-notes"
                  variant="secondary"
                  onPress={() => router.push("/kinh/chu-dai-bi")}
                />
              ) : (
                <Button
                  label={t.offer.offerAgain}
                  icon="flame"
                  onPress={() => setSheet(true)}
                />
              )}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Button
                  label={t.offer.share}
                  icon="share-social-outline"
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={share}
                />
                <Button
                  label={t.offer.backToPagoda}
                  icon="business-outline"
                  variant="ghost"
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/chua/${p.slug}`)}
                />
              </View>
            </>
          ) : (
            <>
              <Button
                label={t.offer.offerBtn}
                icon="flame"
                onPress={() => setSheet(true)}
              />
              <AppText
                variant="caption"
                tone="text3"
                style={{ textAlign: "center" }}
              >
                {t.offer.freeNote}
              </AppText>
            </>
          )}
        </View>
      </ScrollView>

      <Sheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={t.offer.sheetTitle}
        footer={
          <HoldToLight
            label={t.offer.holdToLight}
            hint={t.offer.holdHint}
            onLit={light}
          />
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 8,
            paddingHorizontal: space.screen,
          }}
        >
          <View style={{ gap: 8 }}>
            <AppText variant="h3">{t.offer.sticksLabel}</AppText>
            <SegmentedControl<"1" | "3">
              value={String(sticks) as "1" | "3"}
              onChange={(v) => setSticks(v === "1" ? 1 : 3)}
              options={[
                { value: "1", label: t.offer.sticks(1) },
                { value: "3", label: t.offer.sticks(3) },
              ]}
            />
          </View>
          <View style={{ gap: 8 }}>
            <AppText variant="h3">{t.offer.itemsLabel}</AppText>
            <View style={styles.chips}>
              {ITEMS.map((it) => (
                <Chip
                  key={it.key}
                  label={`${it.emoji} ${t.offer.items[it.key]}`}
                  active={items.includes(it.key)}
                  onPress={() => toggleItem(it.key)}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <AppText variant="h3">{t.offer.forLabel}</AppText>
            <SegmentedControl<OfferFor>
              value={forWhom}
              onChange={setForWhom}
              options={(["self", "family", "departed"] as OfferFor[]).map(
                (v) => ({
                  value: v,
                  label: t.offer.forWhom[v],
                }),
              )}
            />
          </View>
          <View style={{ gap: 8 }}>
            <AppText variant="h3">{t.offer.wishLabel}</AppText>
            <TextInput
              value={wish}
              onChangeText={setWish}
              placeholder={t.offer.wishPlaceholder}
              placeholderTextColor={theme.text3}
              multiline
              maxLength={WISH_MAX}
              style={[
                styles.input,
                {
                  borderColor: theme.line,
                  color: theme.text,
                  backgroundColor: theme.card,
                },
              ]}
            />
            <View style={styles.chips}>
              {t.offer.wishSuggestions.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={wish === s}
                  onPress={() => setWish(s)}
                />
              ))}
            </View>
            <View
              style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={14}
                color={theme.text3}
              />
              <AppText variant="caption" tone="text3">
                {t.offer.wishPrivate}
              </AppText>
            </View>
          </View>
        </ScrollView>
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    position: "absolute",
    left: space.screen,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  body: { paddingHorizontal: space.screen, paddingTop: 18, gap: 14 },
  status: { flexDirection: "row", alignItems: "center", gap: 12 },
  verse: { textAlign: "center", lineHeight: 26, marginTop: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    textAlignVertical: "top",
    fontSize: 15,
  },
  hold: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
