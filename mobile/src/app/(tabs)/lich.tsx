import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import {
  Button,
  Card,
  GoldCard,
  IconButton,
  ListRow,
  Screen,
  SectionHeader,
  Tag,
  useTabBarPadding,
} from "@/components/ui";
import { displayName, festivals, getPagodaBySlug } from "@/lib/data";
import {
  dayCanChi,
  daysUntilNextObservance,
  holidaysOn,
  lunarToday,
  monthCanChi,
  upcomingHolidays,
  yearAnimalEn,
  yearCanChi,
} from "@/lib/lunar";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

const MAX_AHEAD = 365;

export default function CalendarScreen() {
  const { theme, t, locale } = useSettings();
  const router = useRouter();
  const bottom = useTabBarPadding();
  const [offset, setOffset] = useState(0);

  const date = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d;
  }, [offset]);
  const lunar = lunarToday(date);
  const canChi = locale === "en" ? yearAnimalEn(lunar.year) : yearCanChi(lunar.year);
  const holidays = holidaysOn(lunar);
  const next = daysUntilNextObservance(date);
  const isObservance = lunar.day === 1 || lunar.day === 15;
  const upcoming = upcomingHolidays(new Date(), 8);
  const monthFestivals = festivals.filter((f) => f.lunarMonth === lunar.month);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: bottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="display">{t.calendarTitle}</AppText>
        </View>

        <GoldCard style={{ marginHorizontal: space.screen }}>
          <View style={styles.nav}>
            <IconButton
              icon="chevron-back"
              label={t.today}
              size={36}
              color="#fff"
              style={styles.navBtn}
              disabled={offset <= -MAX_AHEAD}
              onPress={() => setOffset((o) => o - 1)}
            />
            <AppText variant="overline" color="rgba(255,255,255,0.85)" center style={{ flex: 1 }}>
              {offset === 0 ? t.today : offset === 1 ? t.tomorrow : t.solarDate(date)}
            </AppText>
            <IconButton
              icon="chevron-forward"
              label={t.tomorrow}
              size={36}
              color="#fff"
              style={styles.navBtn}
              disabled={offset >= MAX_AHEAD}
              onPress={() => setOffset((o) => o + 1)}
            />
          </View>

          <View style={styles.big}>
            <AppText color="#fff" style={styles.bigDay}>
              {lunar.day}
            </AppText>
            <View style={{ flex: 1 }}>
              <AppText variant="h2" color="#fff">
                {t.lunarDate(lunar.day, lunar.month, canChi)}
              </AppText>
              <AppText variant="bodyS" color="rgba(255,255,255,0.88)">
                {t.solarDate(date)}
              </AppText>
              {locale === "vi" ? (
                <AppText variant="caption" color="rgba(255,255,255,0.8)">
                  Ngày {dayCanChi(date)} · Tháng {monthCanChi(lunar.month, lunar.year)}
                  {lunar.leap ? " (nhuận)" : ""}
                </AppText>
              ) : null}
            </View>
          </View>

          <View style={styles.pill}>
            <Ionicons name={isObservance || holidays.length ? "sparkles" : "time-outline"} size={14} color="#fff" />
            <AppText variant="caption" color="#fff" weight={600} style={{ flex: 1 }}>
              {holidays.length
                ? holidays.map((h) => (locale === "en" ? h.en : h.vi)).join(" · ")
                : isObservance
                  ? t.todayObservance(lunar.day === 1 ? "mung1" : "ram")
                  : t.daysUntil(next.days, next.kind)}
            </AppText>
            {offset !== 0 ? (
              <Button
                label={t.today}
                size="sm"
                variant="secondary"
                textColor="#fff"
                style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
                onPress={() => setOffset(0)}
              />
            ) : null}
          </View>
        </GoldCard>

        <SectionHeader title={t.calendarUpcoming} />
        <Card style={{ marginHorizontal: space.screen, paddingVertical: 4 }}>
          {upcoming.map((h, i) => (
            <ListRow
              key={`${h.month}-${h.day}-${h.vi}`}
              emoji={h.kind === "buddhist" ? "🪷" : "🏮"}
              title={locale === "en" ? h.en : h.vi}
              subtitle={`${h.day}/${h.month} ${locale === "en" ? "lunar" : "âm lịch"} · ${t.solarDate(h.date)}`}
              right={
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={[styles.days, { backgroundColor: theme.primarySoft }]}>
                    <AppText variant="caption" tone="primary" weight={700}>
                      {t.inDays(h.daysAway)}
                    </AppText>
                  </View>
                  <Tag label={t.calendarHolidayKind[h.kind]} tone={h.kind === "buddhist" ? "primary" : "neutral"} />
                </View>
              }
              last={i === upcoming.length - 1}
            />
          ))}
        </Card>

        <SectionHeader
          title={`${t.calendarFestivals} · ${t.lunarMonth(lunar.month)}`}
          action={t.seeAll}
          onAction={() => router.push("/le-hoi")}
        />
        {monthFestivals.length ? (
          <Card style={{ marginHorizontal: space.screen, paddingVertical: 4 }}>
            {monthFestivals.map((f, i) => {
              const p = getPagodaBySlug(f.slug);
              return (
                <ListRow
                  key={f.slug}
                  icon="sparkles"
                  iconTone="jade"
                  title={locale === "en" ? f.nameEn : f.nameVi}
                  subtitle={`${locale === "en" ? f.dateEn : f.dateVi}${p ? ` · ${displayName(p, locale)}` : ""}`}
                  last={i === monthFestivals.length - 1}
                  onPress={
                    p
                      ? () => router.push({ pathname: "/chua/[slug]", params: { slug: p.slug } })
                      : () => router.push("/le-hoi")
                  }
                />
              );
            })}
          </Card>
        ) : (
          <Card style={{ marginHorizontal: space.screen }} tone="alt">
            <AppText variant="bodyS" tone="text2">
              {t.festivalsIntro}
            </AppText>
            <Button
              label={t.navFestivals}
              variant="secondary"
              icon="sparkles"
              style={{ marginTop: 12 }}
              onPress={() => router.push("/le-hoi")}
            />
          </Card>
        )}

        <Card style={[styles.soon, { borderColor: theme.line }]} tone="soft">
          <Ionicons name="notifications-outline" size={20} color={theme.primaryText} />
          <AppText variant="bodyS" tone="text2" style={{ flex: 1 }}>
            {t.calendarRemindersSoon}
          </AppText>
          <Tag label={t.comingSoon} tone="neutral" />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.screen, paddingTop: 12, paddingBottom: 16 },
  nav: { flexDirection: "row", alignItems: "center", gap: 8 },
  navBtn: { backgroundColor: "rgba(255,255,255,0.18)", borderColor: "transparent" },
  big: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  bigDay: { fontSize: 64, lineHeight: 70, fontFamily: "BeVietnamPro_800ExtraBold" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  days: { paddingHorizontal: 10, height: 26, borderRadius: 8, justifyContent: "center" },
  soon: {
    marginHorizontal: space.screen,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
});
