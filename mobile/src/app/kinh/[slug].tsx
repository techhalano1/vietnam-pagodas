import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useKeepAwake } from "expo-keep-awake";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { PlayerBar } from "@/components/Player";
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
import { formatTime, getAudio, resolveVoice, trackOf } from "@/lib/audio";
import { SITE_URL } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { ENGLISH_ENABLED } from "@/lib/i18n";
import { lunarToday, yearCanChi } from "@/lib/lunar";
import { usePlayer } from "@/lib/player";
import { fontScalePx, useReading, type FontScale } from "@/lib/reading";
import {
  fillPlaceholders,
  getScripture,
  hasEnglish,
  hasHanViet,
  lunarDateText,
  needsProfile,
  repeatsToShow,
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
  const player = usePlayer();
  const s = getScripture(slug ?? "");
  const audio = slug ? getAudio(slug) : undefined;
  const playingThis = !!s && player.track?.slug === s.slug;
  // The rendition that is (or would be) played for this scripture.
  const voice = audio ? (playingThis ? player.voice : resolveVoice(audio, player.voicePref)) : "ai";
  const track = audio ? trackOf(audio, voice) : undefined;
  const chant = audio && voice === "chant" ? audio.chant : undefined;

  const [tab, setTab] = useState<ReaderTab>("read");
  const [current, setCurrent] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  // Snapshot of the stored position when the reader opened; the live value is
  // overwritten as soon as the list reports its first visible verse.
  const [saved] = useState(() => (s ? reading.positions[s.slug] : undefined));
  const canResume = !!s && !!saved && saved.verse > 0 && saved.verse < s.verses.length - 1;
  const [showResume, setShowResume] = useState(canResume);
  const listRef = useRef<FlatList<ScriptureVerse>>(null);
  const lastSaved = useRef(-1);
  const resumePending = useRef(canResume);

  const lunarParts = useMemo(() => {
    const l = lunarToday();
    const cc = yearCanChi(l.year);
    return { vi: lunarDateText(l, cc, "vi"), en: lunarDateText(l, cc, "en") };
  }, []);
  const lunar = lunarParts[locale];

  // Persist the top visible verse (throttled: only when it changes). While the
  // resume banner is still up, the initial verse-0 report must not clobber the
  // stored position.
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ScriptureVerse>[] }) => {
      if (!s) return;
      const first = viewableItems.find((v) => v.isViewable && typeof v.index === "number");
      if (!first || typeof first.index !== "number") return;
      setCurrent(first.index);
      if (resumePending.current) {
        if (first.index === 0) return;
        resumePending.current = false;
      }
      if (first.index !== lastSaved.current) {
        lastSaved.current = first.index;
        reading.savePosition(s.slug, first.index, s.verses.length);
      }
    },
    [s, reading],
  );
  const viewabilityConfig = useMemo(() => ({ itemVisiblePercentThreshold: 40, minimumViewTime: 250 }), []);

  // Follow the spoken verse while playing, but back off for a few seconds after
  // the reader scrolls by hand so manual reading is not hijacked.
  const userScrollAt = useRef(0);
  const followIndex = playingThis && player.cues && player.status.playing && tab === "read" ? player.verseIndex : -1;
  useEffect(() => {
    if (followIndex < 0) return;
    if (Date.now() - userScrollAt.current < 4000) return;
    resumePending.current = false;
    listRef.current?.scrollToIndex({ index: followIndex, animated: true, viewPosition: 0.15 });
  }, [followIndex]);

  if (!s) {
    return (
      <Screen>
        <AppHeader title={t.scripturesTitle} onBack={() => router.back()} />
        <Empty icon="book-outline" title={t.scriptureNotFound} />
      </Screen>
    );
  }

  const title = scriptureTitle(s, locale);
  const altTitle = locale === "en" ? s.title : ENGLISH_ENABLED ? s.titleEn : undefined;
  const fav = reading.favorites.includes(s.slug);
  const hanAvail = hasHanViet(s);
  const enAvail = ENGLISH_ENABLED && hasEnglish(s);
  const showHan = hanAvail && reading.showHanViet;
  const showEn = enAvail && (locale === "en" || reading.showEnglish);
  const gradient =
    s.kind === "prayer" ? HEADER_GRADIENT.lotus : s.kind === "ritual" ? HEADER_GRADIENT.jade : HEADER_GRADIENT.gold;
  const preparation = scripturePreparation(s, locale);
  const personal = needsProfile(s);
  const hasRitualTab = !!preparation || personal || !!repeatsToShow(s);
  const px = fontScalePx[reading.fontScale];
  const repeats = repeatsToShow(s);

  const fill = (text: string, lang: "vi" | "en" = locale) =>
    fillPlaceholders(text, reading.profile, lunarParts[lang], lang);

  const slugKey = s.slug;
  const listened = player.history.find((e) => e.slug === slugKey);
  const listenLabel = playingThis
    ? player.status.playing
      ? t.playerPause
      : t.playerPlay
    : listened &&
        track &&
        (listened.voice ?? "ai") === voice &&
        listened.positionSec > 2 &&
        listened.positionSec < track.durationSec - 2
      ? t.listenResume(formatTime(listened.positionSec))
      : t.listenBtn;

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
    resumePending.current = false;
    setTimeout(() => scrollTo(saved.verse), 50);
  };

  const finish = () => {
    haptics.success();
    reading.clearPosition(s.slug);
    lastSaved.current = -1;
    resumePending.current = true;
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
            {track ? ` · ${formatTime(track.durationSec)}` : ""}
            {repeats ? ` · ${t.repeatsHint(repeats)}` : ""}
          </AppText>
          {chant ? (
            <AppText variant="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }}>
              {t.chantBy(chant.performer)} · {chant.source}
            </AppText>
          ) : null}
          {audio ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={listenLabel}
              onPress={() => {
                haptics.tap();
                if (playingThis) player.toggle();
                else player.play(slugKey, { resume: true });
              }}
              style={({ pressed }) => [styles.listen, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons
                name={playingThis && player.status.playing ? "pause" : "play"}
                size={18}
                color="#8B6508"
              />
              <AppText variant="caption" weight={700} color="#8B6508">
                {listenLabel}
              </AppText>
            </Pressable>
          ) : null}
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
          <Pressable
            onPress={() => {
              setShowResume(false);
              resumePending.current = false;
              reading.savePosition(s.slug, 0, s.verses.length);
            }}
            hitSlop={8}
            accessibilityLabel={t.startOver}
          >
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
          {repeats ? (
            <AppText variant="bodyS" tone="text2" center>
              {t.repeatsHint(repeats)}
            </AppText>
          ) : null}
          <Button label={t.markFinished} icon="checkmark-circle" onPress={finish} variant="secondary" />
        </Card>
      ) : null}
    </View>
  );

  const renderVerse = ({ item, index }: { item: ScriptureVerse; index: number }) => {
    const spoken = playingThis && !!player.cues && index === player.verseIndex;
    const active = spoken || ((!playingThis || !player.cues) && index === current);
    return (
      <Pressable
        onPress={() => {
          if (playingThis && player.cues) {
            haptics.select();
            player.seekToVerse(index);
          } else {
            setCurrent(index);
          }
        }}
        accessibilityLabel={t.readingProgress(index + 1, s.verses.length)}
        accessibilityState={{ selected: active }}
        style={[
          styles.verse,
          {
            backgroundColor: active ? theme.card : "transparent",
            borderColor: spoken ? theme.primary : active ? theme.line : "transparent",
          },
          active ? theme.shadow : null,
        ]}
      >
        <View style={styles.verseHead}>
          <View style={[styles.verseNum, { backgroundColor: active ? theme.primarySoft : theme.cardAlt }]}>
            {spoken ? (
              <Ionicons name="volume-high" size={13} color={theme.primaryText} />
            ) : (
              <AppText variant="caption" weight={700} tone={active ? "primary" : "text3"}>
                {index + 1}
              </AppText>
            )}
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
          {fill(item.vi, "vi")}
        </AppText>
        {showEn && item.en ? (
          <AppText
            tone="text2"
            style={{ fontSize: px.han - 1, lineHeight: px.hanLine - 2, marginTop: 6, fontStyle: "italic" }}
          >
            {fill(item.en, "en")}
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
          contentContainerStyle={{ paddingBottom: playingThis ? 24 : insets.bottom + 24 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollBeginDrag={() => {
            userScrollAt.current = Date.now();
          }}
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
                        <AppText variant="body">
                          {locale === "en" && v.en ? fill(v.en, "en") : fill(v.vi, "vi")}
                        </AppText>
                        {enAvail && locale !== "en" && v.en && reading.showEnglish ? (
                          <AppText variant="bodyS" tone="text2" style={{ fontStyle: "italic" }}>
                            {fill(v.en, "en")}
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
              {repeats ? (
                <Card tone="soft" style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="repeat" size={18} color={theme.primaryText} />
                  <AppText variant="body" style={{ flex: 1 }}>
                    {t.repeatsHint(repeats)}
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

      {playingThis ? <PlayerBar bottomInset={insets.bottom} /> : null}

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
  listen: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#FFFDF7",
  },
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
