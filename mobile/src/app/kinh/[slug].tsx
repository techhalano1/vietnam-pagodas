import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { kindIcon } from "@/components/ScriptureRow";
import { Sheet } from "@/components/Sheet";
import { AppText } from "@/components/Text";
import {
  AppHeader,
  Button,
  Card,
  Empty,
  IconButton,
  Screen,
  SegmentedControl,
  Tag,
} from "@/components/ui";
import { SITE_URL } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { lunarToday, yearCanChi } from "@/lib/lunar";
import { fontScalePx, useReading, type FontScale } from "@/lib/reading";
import {
  fillPlaceholders,
  getScripture,
  hasEnglish,
  hasHanViet,
  lunarDateText,
  needsProfile,
  scriptureIntro,
  scripturePreparation,
  scriptureTitle,
  type UserProfile,
} from "@/lib/scriptures";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import type { ScriptureVerse } from "@/lib/types";

type ReaderTab = "read" | "meaning" | "ritual";

const HEADER_GRADIENT = {
  gold: ["#D4A017", "#8B6508"] as [string, string],
  lotus: ["#E1592A", "#8A2E0B"] as [string, string],
  jade: ["#14A08F", "#0B4F4A"] as [string, string],
};

export default function ScriptureReader() {
  useKeepAwake();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme, t, locale, isDark, setThemePreference } = useSettings();
  const reading = useReading();
  const s = getScripture(slug ?? "");

  const [tab, setTab] = useState<ReaderTab>("read");
  const [current, setCurrent] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showResume, setShowResume] = useState(true);
  const listRef = useRef<FlatList<ScriptureVerse>>(null);
  const lastSaved = useRef(-1);

  const lunar = useMemo(() => {
    const l = lunarToday();
    return lunarDateText(l, yearCanChi(l.year), locale);
  }, [locale]);

  const saved = s ? reading.positions[s.slug] : undefined;
  const canResume = !!s && !!saved && saved.verse > 0 && saved.verse < s.verses.length - 1;

  // Persist the top visible verse (throttled: only when it changes).
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ScriptureVerse>[] }) => {
      if (!s) return;
      const first = viewableItems.find((v) => v.isViewable && typeof v.index === "number");
      if (!first || typeof first.index !== "number") return;
      setCurrent(first.index);
      if (first.index !== lastSaved.current) {
        lastSaved.current = first.index;
        reading.savePosition(s.slug, first.index, s.verses.length);
      }
    },
    [s, reading],
  );
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 40, minimumViewTime: 250 }), []);

  if (!s) {
    return (
      <Screen>
        <AppHeader title={t.scripturesTitle} onBack={() => router.back()} />
        <Empty icon="book-outline" title={t.scriptureNotFound} />
      </Screen>
    );
  }

  const title = scriptureTitle(s, locale);
  const altTitle = locale === "en" ? s.title : s.titleEn;
  const fav = reading.favorites.includes(s.slug);
  const hanAvail = hasHanViet(s);
  const enAvail = hasEnglish(s);
  const showHan = hanAvail && reading.showHanViet;
  const showEn = enAvail && (locale === "en" || reading.showEnglish);
  const gradient =
    s.kind === "prayer" ? HEADER_GRADIENT.lotus : s.kind === "ritual" ? HEADER_GRADIENT.jade : HEADER_GRADIENT.gold;
  const preparation = scripturePreparation(s, locale);
  const personal = needsProfile(s);
  const hasRitualTab = !!preparation || personal || (s.recommendedRepeats?.length ?? 0) > 0;
  const px = fontScalePx[reading.fontScale];

  const fill = (text: string) => fillPlaceholders(text, reading.profile, lunar, locale);

  const share = () => {
    haptics.tap();
    const url = `${SITE_URL}/${locale}/kinh/${s.slug}`;
    Share.share({ message: `${title} — ${url}`, url, title }).catch(() => undefined);
  };

  const scrollTo = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.1 });
  };

  const resume = () => {
    if (!saved) return;
    haptics.tap();
    setShowResume(false);
    setTimeout(() => scrollTo(saved.verse), 50);
  };

  const finish = () => {
    haptics.success();
    reading.clearPosition(s.slug);
    lastSaved.current = -1;
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const tabs: { value: ReaderTab; label: string; icon: "book" | "bulb" | "flame" }[] = [
    { value: "read", label: t.readerTabRead, icon: "book" },
    { value: "meaning", label: t.readerTabMeaning, icon: "bulb" },
  ];
  if (hasRitualTab) tabs.push({ value: "ritual", label: t.readerTabRitual, icon: "flame" });

  const header = (
    <View>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 6 }]}>
        <View style={styles.heroBar}>
          <IconButton icon="chevron-back" label={t.back} color="#fff" style={styles.glass} onPress={() => router.back()} />
          <View style={{ flex: 1 }} />
          <IconButton icon="share-social-outline" label={t.shareBtn} color="#fff" style={styles.glass} onPress={share} />
          <IconButton
            icon={fav ? "heart" : "heart-outline"}
            label={fav ? t.favBtnActive : t.favBtn}
            active={fav}
            tone="lotus"
            color={fav ? theme.lotus : "#fff"}
            style={fav ? null : styles.glass}
            onPress={() => {
              haptics.select();
              reading.toggleFavorite(s.slug);
            }}
          />
        </View>
        <View style={styles.heroBody}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Tag label={t.scriptureKind[s.kind]} tone="gold" icon={kindIcon[s.kind]} />
            {hanAvail ? <Tag label={t.hanVietBadge} tone="gold" /> : null}
            {enAvail ? <Tag label={t.englishBadge} tone="gold" /> : null}
          </View>
          <AppText variant="h1" color="#fff" style={{ marginTop: 10 }}>
            {title}
          </AppText>
          {altTitle && altTitle !== title ? (
            <AppText variant="bodyS" color="rgba(255,255,255,0.9)">
              {altTitle}
            </AppText>
          ) : null}
          {s.subtitle && s.subtitle !== altTitle ? (
            <AppText variant="caption" color="rgba(255,255,255,0.78)" style={{ marginTop: 2 }}>
              {s.subtitle}
            </AppText>
          ) : null}
          <AppText variant="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 8 }}>
            {t.versesCount(s.verses.length)}
            {s.recommendedRepeats?.length ? ` · ${t.repeatsHint(s.recommendedRepeats)}` : ""}
          </AppText>
        </View>
      </LinearGradient>

      <View style={[styles.sheetTop, { backgroundColor: theme.bg }]}>
        <SegmentedControl<ReaderTab> value={tab} onChange={setTab} options={tabs} />
      </View>

      {tab === "read" ? (
        <View style={styles.toolbar}>
          {hanAvail ? (
            <ToolToggle
              icon="text"
              label={t.toggleHanViet}
              short={t.hanVietBadge}
              active={reading.showHanViet}
              onPress={() => reading.setShowHanViet(!reading.showHanViet)}
            />
          ) : null}
          {enAvail && locale !== "en" ? (
            <ToolToggle
              icon="language"
              label={t.toggleEnglish}
              short={t.englishBadge}
              active={reading.showEnglish}
              onPress={() => reading.setShowEnglish(!reading.showEnglish)}
            />
          ) : null}
          <View style={{ flex: 1 }} />
          <FontSizeControl value={reading.fontScale} onChange={reading.setFontScale} />
          <IconButton
            icon={isDark ? "sunny-outline" : "moon-outline"}
            label={isDark ? t.themeLight : t.themeDark}
            onPress={() => setThemePreference(isDark ? "light" : "dark")}
          />
        </View>
      ) : null}

      {tab === "read" && personal ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            haptics.tap();
            setProfileOpen(true);
          }}
          style={({ pressed }) => [
            styles.banner,
            { backgroundColor: theme.lotusSoft, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="person-circle-outline" size={22} color={theme.lotus} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption" weight={700} color={theme.lotus}>
              {t.personalizeHeading}
            </AppText>
            <AppText variant="caption" tone="text2" numberOfLines={1}>
              {reading.profile.name.trim() ? reading.profile.name : t.personalizeText}
            </AppText>
          </View>
          <Ionicons name="create-outline" size={18} color={theme.lotus} />
        </Pressable>
      ) : null}

      {tab === "read" && canResume && showResume ? (
        <Pressable
          accessibilityRole="button"
          onPress={resume}
          style={({ pressed }) => [
            styles.banner,
            { backgroundColor: theme.primarySoft, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Ionicons name="play-circle" size={22} color={theme.primaryText} />
          <AppText variant="caption" weight={700} tone="primary" style={{ flex: 1 }}>
            {t.resumeReading} · {t.readingProgress(saved.verse + 1, s.verses.length)}
          </AppText>
          <Pressable onPress={() => setShowResume(false)} hitSlop={8} accessibilityLabel={t.startOver}>
            <Ionicons name="close" size={18} color={theme.text3} />
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {tab === "read" ? (
        <Card tone="soft" style={{ alignItems: "center", gap: 10 }}>
          <AppText style={{ fontSize: 34 }}>🪷</AppText>
          <AppText variant="h3" center>
            {t.finishedReading}
          </AppText>
          {s.recommendedRepeats?.length ? (
            <AppText variant="bodyS" tone="text2" center>
              {t.repeatsHint(s.recommendedRepeats)}
            </AppText>
          ) : null}
          <Button label={t.markFinished} icon="checkmark-circle" onPress={finish} variant="secondary" />
        </Card>
      ) : null}
      <SourceCard s={s} />
    </View>
  );

  const renderVerse = ({ item, index }: { item: ScriptureVerse; index: number }) => {
    const active = index === current;
    return (
      <Pressable
        onPress={() => setCurrent(index)}
        accessibilityLabel={t.readingProgress(index + 1, s.verses.length)}
        style={[
          styles.verse,
          {
            backgroundColor: active ? theme.card : "transparent",
            borderColor: active ? theme.line : "transparent",
          },
          active ? theme.shadow : null,
        ]}
      >
        <View style={styles.verseHead}>
          <View style={[styles.verseNum, { backgroundColor: active ? theme.primarySoft : theme.cardAlt }]}>
            <AppText variant="caption" weight={700} tone={active ? "primary" : "text3"}>
              {index + 1}
            </AppText>
          </View>
          {item.note ? (
            <AppText variant="caption" tone="jade" weight={600} style={{ flex: 1 }}>
              {item.note}
            </AppText>
          ) : null}
        </View>
        {showHan && item.hanViet ? (
          <AppText
            weight={600}
            style={{ fontSize: px.han, lineHeight: px.hanLine, color: theme.primaryText }}
          >
            {item.hanViet}
          </AppText>
        ) : null}
        <AppText
          style={{
            fontSize: px.body,
            lineHeight: px.line,
            color: theme.text,
            marginTop: showHan && item.hanViet ? 6 : 0,
          }}
          weight={showHan && item.hanViet ? 400 : 500}
        >
          {fill(item.vi)}
        </AppText>
        {showEn && item.en ? (
          <AppText
            tone="text2"
            style={{ fontSize: px.han - 1, lineHeight: px.hanLine - 2, marginTop: 6, fontStyle: "italic" }}
          >
            {fill(item.en)}
          </AppText>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Screen padTop={false}>
      {tab === "read" ? (
        <FlatList
          ref={listRef}
          data={s.verses}
          keyExtractor={(v) => v.id}
          renderItem={renderVerse}
          ListHeaderComponent={header}
          ListFooterComponent={footer}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({ offset: averageItemLength * index, animated: false });
            setTimeout(() => scrollTo(index), 120);
          }}
          initialNumToRender={12}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
          {header}
          {tab === "meaning" ? (
            <View style={styles.body}>
              <AppText variant="overline" tone="primary">
                {t.meaningIntro}
              </AppText>
              <AppText variant="body" style={{ marginTop: 6 }}>
                {scriptureIntro(s, locale)}
              </AppText>
              {hanAvail ? (
                <View style={{ marginTop: 18, gap: 10 }}>
                  {s.verses.map((v, i) => (
                    <View key={v.id} style={[styles.meaningRow, { borderColor: theme.line }]}>
                      <AppText variant="caption" tone="text3" weight={700} style={{ width: 24 }}>
                        {i + 1}
                      </AppText>
                      <View style={{ flex: 1, gap: 3 }}>
                        {v.hanViet ? (
                          <AppText variant="caption" tone="primary" weight={600}>
                            {v.hanViet}
                          </AppText>
                        ) : null}
                        <AppText variant="body">{locale === "en" && v.en ? fill(v.en) : fill(v.vi)}</AppText>
                        {locale !== "en" && v.en && reading.showEnglish ? (
                          <AppText variant="bodyS" tone="text2" style={{ fontStyle: "italic" }}>
                            {fill(v.en)}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.body}>
              {preparation ? (
                <Card style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="flower-outline" size={18} color={theme.jade} />
                    <AppText variant="h3">{t.preparationHeading}</AppText>
                  </View>
                  <AppText variant="body">{preparation}</AppText>
                </Card>
              ) : null}
              {s.recommendedRepeats?.length ? (
                <Card tone="soft" style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="repeat" size={18} color={theme.primaryText} />
                  <AppText variant="body" style={{ flex: 1 }}>
                    {t.repeatsHint(s.recommendedRepeats)}
                  </AppText>
                </Card>
              ) : null}
              {personal ? (
                <Card style={{ marginTop: 12, gap: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="person-circle-outline" size={18} color={theme.lotus} />
                    <AppText variant="h3">{t.personalizeHeading}</AppText>
                  </View>
                  <AppText variant="bodyS" tone="text2">
                    {t.personalizeText}
                  </AppText>
                  <AppText variant="caption" tone="text3">
                    {t.lunarDateAuto(lunar)}
                  </AppText>
                  <Button
                    label={reading.profile.name.trim() ? reading.profile.name : t.profileName}
                    icon="create-outline"
                    variant="secondary"
                    onPress={() => setProfileOpen(true)}
                  />
                </Card>
              ) : null}
            </View>
          )}
          {footer}
        </ScrollView>
      )}

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={reading.profile}
        onSave={reading.setProfile}
        lunar={lunar}
      />
    </Screen>
  );
}

// ---------------------------------------------------------------------------

function ToolToggle({
  icon,
  label,
  short,
  active,
  onPress,
}: {
  icon: "text" | "language";
  label: string;
  short: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme } = useSettings();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: active }}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={({ pressed }) => [
        styles.tool,
        {
          backgroundColor: active ? theme.primaryDark : theme.card,
          borderColor: active ? theme.primaryDark : theme.line,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={active ? "#fff" : theme.text2} />
      <AppText variant="caption" weight={700} color={active ? "#fff" : theme.text}>
        {short}
      </AppText>
    </Pressable>
  );
}

function FontSizeControl({ value, onChange }: { value: FontScale; onChange: (f: FontScale) => void }) {
  const { theme, t } = useSettings();
  const labels: Record<FontScale, string> = { 1: t.fontSizeSmall, 2: t.fontSizeMedium, 3: t.fontSizeLarge };
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t.fontSize}
      style={[styles.fontGroup, { backgroundColor: theme.card, borderColor: theme.line }]}
    >
      {([1, 2, 3] as FontScale[]).map((f) => {
        const active = value === f;
        return (
          <Pressable
            key={f}
            accessibilityRole="radio"
            accessibilityLabel={`${t.fontSize}: ${labels[f]}`}
            accessibilityState={{ checked: active }}
            onPress={() => {
              haptics.select();
              onChange(f);
            }}
            style={[styles.fontItem, active ? { backgroundColor: theme.primarySoft } : null]}
          >
            <AppText
              weight={700}
              color={active ? theme.primaryText : theme.text2}
              style={{ fontSize: 11 + f * 3, lineHeight: 22 }}
            >
              A
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function SourceCard({ s }: { s: NonNullable<ReturnType<typeof getScripture>> }) {
  const { theme, t, locale } = useSettings();
  const date = new Date(s.updatedAt);
  const dateText = Number.isNaN(date.getTime())
    ? s.updatedAt
    : date.toLocaleDateString(locale === "en" ? "en-GB" : "vi-VN");
  return (
    <Card tone="card" style={{ marginTop: 16, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="shield-checkmark-outline" size={18} color={theme.jade} />
        <AppText variant="h3">{t.sourceHeading}</AppText>
      </View>
      <AppText variant="bodyS">{s.source.name}</AppText>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <AppText variant="caption" tone="text3" weight={700}>
          {t.licenseLabel}:
        </AppText>
        <AppText variant="caption" tone="text2" style={{ flex: 1 }}>
          {s.source.license}
        </AppText>
      </View>
      {s.source.note ? (
        <View style={{ flexDirection: "row", gap: 6 }}>
          <AppText variant="caption" tone="text3" weight={700}>
            {t.sourceNoteLabel}:
          </AppText>
          <AppText variant="caption" tone="text2" style={{ flex: 1 }}>
            {s.source.note}
          </AppText>
        </View>
      ) : null}
      <AppText variant="caption" tone="text3">
        {t.updatedLabel(dateText)}
      </AppText>
    </Card>
  );
}

function ProfileSheet({
  open,
  onClose,
  profile,
  onSave,
  lunar,
}: {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (p: UserProfile) => void;
  lunar: string;
}) {
  const { theme, t } = useSettings();
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(profile);
  }

  const field = (key: keyof UserProfile, label: string, placeholder: string, multiline = false) => (
    <View style={{ gap: 6 }}>
      <AppText variant="overline" tone="text2">
        {label}
      </AppText>
      <TextInput
        value={draft[key]}
        onChangeText={(v) => setDraft((d) => ({ ...d, [key]: v }))}
        placeholder={placeholder}
        placeholderTextColor={theme.text3}
        multiline={multiline}
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline ? { height: 84, paddingTop: 12, textAlignVertical: "top" } : null,
          { color: theme.text, backgroundColor: theme.cardAlt, borderColor: theme.line },
        ]}
      />
    </View>
  );

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t.personalizeHeading}
      footer={
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Button
            label={t.profileClear}
            variant="ghost"
            onPress={() => setDraft({ name: "", address: "", wish: "" })}
          />
          <Button
            label={t.profileSave}
            icon="checkmark"
            style={{ flex: 1 }}
            onPress={() => {
              haptics.success();
              onSave({ name: draft.name.trim(), address: draft.address.trim(), wish: draft.wish.trim() });
              onClose();
            }}
          />
        </View>
      }
    >
      <View style={{ gap: 14 }}>
        <AppText variant="bodyS" tone="text2">
          {t.personalizeText}
        </AppText>
        {field("name", t.profileName, t.profileNamePlaceholder)}
        {field("address", t.profileAddress, t.profileAddressPlaceholder)}
        {field("wish", t.profileWish, t.profileWishPlaceholder, true)}
        <View style={[styles.lunarNote, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="moon-outline" size={16} color={theme.primaryText} />
          <AppText variant="caption" tone="primary" style={{ flex: 1 }}>
            {t.lunarDateAuto(lunar)}
          </AppText>
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 36 },
  heroBar: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12 },
  heroBody: { paddingHorizontal: space.screen, paddingTop: 10 },
  glass: { backgroundColor: "rgba(0,0,0,0.28)", borderColor: "transparent" },
  sheetTop: {
    marginTop: -radius.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 18,
    paddingHorizontal: space.screen,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: space.screen,
    paddingTop: 12,
    paddingBottom: 4,
  },
  tool: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.chip,
    borderWidth: 1,
  },
  fontGroup: {
    flexDirection: "row",
    height: 40,
    borderRadius: radius.chip,
    borderWidth: 1,
    overflow: "hidden",
  },
  fontItem: {
    minWidth: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: space.screen,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.button,
    minHeight: 48,
  },
  verse: {
    marginHorizontal: space.screen,
    marginTop: 10,
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  verseHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  verseNum: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  footer: { paddingHorizontal: space.screen, paddingTop: 20 },
  body: { paddingHorizontal: space.screen, paddingTop: 16 },
  meaningRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "BeVietnamPro_400Regular",
  },
  lunarNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: radius.button,
  },
});
