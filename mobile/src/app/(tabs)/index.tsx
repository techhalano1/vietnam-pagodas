import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import {
  Button,
  Card,
  GoldCard,
  IconButton,
  ListRow,
  PagodaRow,
  PagodaTile,
  PressableCard,
  QuickAction,
  Screen,
  SectionHeader,
  useTabBarPadding,
} from "@/components/ui";
import {
  displayName,
  distanceKm,
  festivals,
  getPagodaBySlug,
  hasDetails,
  pagodas,
} from "@/lib/data";
import {
  daysUntilNextObservance,
  holidaysOn,
  lunarToday,
  upcomingHolidays,
  yearAnimalEn,
  yearCanChi,
} from "@/lib/lunar";
import { formatTime, getAudio, trackOf } from "@/lib/audio";
import { usePlayer } from "@/lib/player";
import { useReading } from "@/lib/reading";
import { useSaved } from "@/lib/saved";
import { dailyScripture, getScripture, readingMinutes, scriptureTitle, verseCount } from "@/lib/scriptures";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";
import { useLocation } from "@/lib/useLocation";

function greeting(t: ReturnType<typeof useSettings>["t"], h = new Date().getHours()) {
  if (h < 12) return t.greetingMorning;
  if (h < 18) return t.greetingAfternoon;
  return t.greetingEvening;
}

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

const featuredPool = pagodas.filter((p) => p.image && hasDetails(p.slug));
const featuredCache = new Map<number, Pagoda[]>();
function featuredFor(seed: number): Pagoda[] {
  const cached = featuredCache.get(seed);
  if (cached) return cached;
  const out: Pagoda[] = [];
  for (let i = 0; i < 8 && featuredPool.length; i++) {
    out.push(featuredPool[(seed * 7 + i * 131) % featuredPool.length]);
  }
  const result = Array.from(new Set(out));
  featuredCache.set(seed, result);
  return result;
}

export default function HomeScreen() {
  const { theme, t, locale } = useSettings();
  const { favorites } = useSaved();
  const router = useRouter();
  const bottom = useTabBarPadding();
  const { position, loading, request } = useLocation();

  const now = new Date();
  const lunar = lunarToday(now);
  const { positions } = useReading();
  const daily = dailyScripture(lunar, now);
  const dailyPos = positions[daily.slug];
  const player = usePlayer();
  const lastListen = player.history.find((e) => e.slug !== player.track?.slug && getScripture(e.slug));
  const lastListenS = lastListen ? getScripture(lastListen.slug) : undefined;
  const lastListenA = lastListen ? getAudio(lastListen.slug) : undefined;
  const lastListenAudio =
    lastListen && lastListenA ? trackOf(lastListenA, lastListen.voice ?? "ai") : undefined;
  const canChi = locale === "en" ? yearAnimalEn(lunar.year) : yearCanChi(lunar.year);
  const todayHolidays = holidaysOn(lunar);
  const next = daysUntilNextObservance(now);
  const isObservance = lunar.day === 1 || lunar.day === 15;
  const upcoming = upcomingHolidays(now, 3);

  const nearby = useMemo(() => {
    if (!position) return [];
    return pagodas
      .filter((p): p is Pagoda & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
      .map((p) => ({ p, d: distanceKm(position.lat, position.lng, p.lat, p.lng) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 4);
  }, [position]);

  const featured = featuredFor(dayOfYear(now));

  const upcomingFestivals = festivals
    .filter((f) => f.lunarMonth === lunar.month || f.lunarMonth === (lunar.month % 12) + 1)
    .slice(0, 2);

  const goChua = (params?: Record<string, string>) =>
    router.push({
      pathname: "/(tabs)/chua",
      params: params ? { ...params, ts: String(Date.now()) } : undefined,
    });

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText variant="display" numberOfLines={1}>
              {greeting(t)}
            </AppText>
            <AppText variant="bodyS" tone="text2">
              {t.homeSubtitle}
            </AppText>
          </View>
          <IconButton
            icon="person-outline"
            label={t.tabProfile}
            size={44}
            onPress={() => router.push("/(tabs)/ca-nhan")}
          />
        </View>

        <GoldCard style={{ marginHorizontal: space.screen }}>
          <Image
            source={require("../../../assets/quan-am.png")}
            style={styles.heroFigure}
            contentFit="contain"
            accessibilityLabel={t.heroFigureAlt}
          />
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <AppText variant="overline" color="rgba(255,255,255,0.85)">
                {t.lunarToday}
              </AppText>
              <View style={styles.heroDate}>
                <AppText color="#fff" style={styles.heroDay}>
                  {lunar.day}
                </AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="h3" color="#fff">
                    {t.lunarDate(lunar.day, lunar.month, canChi)}
                  </AppText>
                  <AppText variant="caption" color="rgba(255,255,255,0.85)">
                    {t.solarDate(now)}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroPill}>
            <Ionicons name="sparkles" size={14} color="#fff" />
            <AppText variant="caption" color="#fff" weight={600} style={{ flex: 1 }}>
              {todayHolidays.length
                ? todayHolidays.map((h) => (locale === "en" ? h.en : h.vi)).join(" · ")
                : isObservance
                  ? t.todayObservance(lunar.day === 1 ? "mung1" : "ram")
                  : t.daysUntil(next.days, next.kind)}
            </AppText>
            <Button
              label={t.tabCalendar}
              size="sm"
              variant="secondary"
              onPress={() => router.push("/(tabs)/lich")}
              style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
              textColor="#fff"
            />
          </View>
        </GoldCard>

        <Card style={styles.quick}>
          <View style={styles.quickGrid}>
            <QuickAction icon="navigate" label={t.qaNearby} onPress={() => goChua({ near: "1" })} />
            <QuickAction icon="map" label={t.qaMap} onPress={() => goChua({ view: "map" })} />
            <QuickAction
              icon="book"
              label={t.qaScriptures}
              tone="lotus"
              onPress={() => router.push("/(tabs)/kinh")}
            />
            <QuickAction
              icon="sparkles"
              label={t.qaFestivals}
              tone="jade"
              onPress={() => router.push("/le-hoi")}
            />
            <QuickAction icon="trail-sign" label={t.qaRoutes} onPress={() => router.push("/hanh-trinh")} />
            <QuickAction
              icon="heart"
              label={t.qaFavorites}
              tone="lotus"
              badge={favorites.length ? String(favorites.length) : undefined}
              onPress={() => router.push("/da-luu")}
            />
            <QuickAction
              icon="calendar"
              label={t.qaCalendar}
              tone="jade"
              onPress={() => router.push("/(tabs)/lich")}
            />
            <QuickAction icon="search" label={t.qaSearch} onPress={() => goChua()} />
          </View>
        </Card>

        <SectionHeader
          title={t.nearbyHeading}
          action={nearby.length ? t.seeAll : undefined}
          onAction={() => goChua({ near: "1" })}
        />
        {nearby.length ? (
          nearby.map(({ p, d }) => <PagodaRow key={p.slug} p={p} distanceKm={d} compact />)
        ) : (
          <Card style={{ marginHorizontal: space.screen }} tone="alt">
            <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
              <View style={[styles.nearIcon, { backgroundColor: theme.jadeSoft }]}>
                <Ionicons name="locate" size={24} color={theme.jade} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <AppText variant="h3">{loading ? t.nearbyLoading : t.nearbyEnable}</AppText>
                <AppText variant="bodyS" tone="text2">
                  {t.nearbyEnableText}
                </AppText>
              </View>
            </View>
            <Button
              label={t.nearbyEnable}
              icon="navigate"
              onPress={() => void request()}
              disabled={loading}
              style={{ marginTop: 14 }}
            />
          </Card>
        )}

        <SectionHeader
          title={t.upcomingHeading}
          action={t.seeAll}
          onAction={() => router.push("/(tabs)/lich")}
        />
        <Card style={{ marginHorizontal: space.screen, paddingVertical: 4 }}>
          {upcoming.map((h, i) => (
            <ListRow
              key={`${h.month}-${h.day}-${h.vi}`}
              emoji={h.kind === "buddhist" ? "🪷" : "🏮"}
              title={locale === "en" ? h.en : h.vi}
              subtitle={`${h.day}/${h.month} ${locale === "en" ? "lunar" : "âm lịch"} · ${t.solarDate(h.date)}`}
              right={
                <View style={[styles.days, { backgroundColor: theme.primarySoft }]}>
                  <AppText variant="caption" tone="primary" weight={700}>
                    {t.inDays(h.daysAway)}
                  </AppText>
                </View>
              }
              last={i === upcoming.length - 1 && upcomingFestivals.length === 0}
              onPress={() => router.push("/(tabs)/lich")}
            />
          ))}
          {upcomingFestivals.map((f, i) => {
            const p = getPagodaBySlug(f.slug);
            return (
              <ListRow
                key={f.slug}
                icon="sparkles"
                iconTone="jade"
                title={locale === "en" ? f.nameEn : f.nameVi}
                subtitle={`${locale === "en" ? f.dateEn : f.dateVi}${p ? ` · ${displayName(p, locale)}` : ""}`}
                last={i === upcomingFestivals.length - 1}
                onPress={() => router.push("/le-hoi")}
              />
            );
          })}
        </Card>

        <SectionHeader title={t.featuredHeading} action={t.seeAll} onAction={() => goChua()} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.screen, gap: 12, paddingBottom: 6 }}
        >
          {featured.map((p) => (
            <PagodaTile key={p.slug} p={p} />
          ))}
        </ScrollView>

        <SectionHeader
          title={t.todayScripture}
          action={t.seeAll}
          onAction={() => router.push("/(tabs)/kinh")}
          style={{ marginTop: 22 }}
        />
        <PressableCard
          tone="soft"
          style={{ marginHorizontal: space.screen }}
          accessibilityLabel={`${t.todayScripture}: ${scriptureTitle(daily, locale)}`}
          onPress={() => router.push({ pathname: "/kinh/[slug]", params: { slug: daily.slug } })}
        >
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <View style={[styles.nearIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="book" size={24} color={theme.lotus} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="overline" tone="primary">
                {t.scriptureKind[daily.kind]}
                {dailyPos ? ` · ${t.readingProgress(dailyPos.verse + 1, dailyPos.total)}` : ""}
              </AppText>
              <AppText variant="h3">{scriptureTitle(daily, locale)}</AppText>
              <AppText variant="bodyS" tone="text2">
                {t.todayScriptureText(lunar.day === 1 ? "mung1" : lunar.day === 15 ? "ram" : "normal")}{" "}
                {t.versesCount(verseCount(daily))} · {t.minutesRead(readingMinutes(daily))}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.text3} />
          </View>
        </PressableCard>

        {lastListen && lastListenS && lastListenAudio ? (
          <>
            <SectionHeader title={t.continueListening} style={{ marginTop: 22 }} />
            <PressableCard
              style={{ marginHorizontal: space.screen }}
              accessibilityLabel={`${t.continueListening}: ${scriptureTitle(lastListenS, locale)}`}
              onPress={() => {
                player.play(lastListen.slug, { resume: true });
                router.push({ pathname: "/kinh/[slug]", params: { slug: lastListen.slug } });
              }}
            >
              <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
                <View style={[styles.nearIcon, { backgroundColor: theme.primarySoft }]}>
                  <Ionicons name="headset" size={22} color={theme.primaryText} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="overline" tone="primary">
                    {t.scriptureKind[lastListenS.kind]}
                  </AppText>
                  <AppText variant="h3">{scriptureTitle(lastListenS, locale)}</AppText>
                  <AppText variant="bodyS" tone="text2">
                    {formatTime(lastListen.positionSec)} / {formatTime(lastListenAudio.durationSec)}
                  </AppText>
                  <View style={[styles.listenTrack, { backgroundColor: theme.cardAlt }]}>
                    <View
                      style={{
                        width: `${Math.round(
                          Math.min(1, lastListen.positionSec / lastListenAudio.durationSec) * 100,
                        )}%`,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: theme.primary,
                      }}
                    />
                  </View>
                </View>
                <View style={[styles.playCircle, { backgroundColor: theme.primaryDark }]}>
                  <Ionicons name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </PressableCard>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listenTrack: { height: 4, borderRadius: 2, marginTop: 6, overflow: "hidden" },
  playCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: space.screen,
    paddingTop: 12,
    paddingBottom: 16,
  },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingRight: 108 },
  heroDate: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  heroDay: { fontSize: 52, lineHeight: 58, fontFamily: "BeVietnamPro_800ExtraBold" },
  heroFigure: {
    position: "absolute",
    right: -2,
    top: 6,
    width: 122,
    height: 182,
    transform: [{ rotate: "-8deg" }],
  },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    marginRight: 108,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  quick: { marginHorizontal: space.screen, marginTop: 16, paddingHorizontal: 8, paddingVertical: 10 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 8 },
  nearIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  days: { paddingHorizontal: 10, height: 26, borderRadius: 8, justifyContent: "center" },
});
