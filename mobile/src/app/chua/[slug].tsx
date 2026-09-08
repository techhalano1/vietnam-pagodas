import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Linking,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeafletMap } from "@/components/LeafletMap";
import { AppText } from "@/components/Text";
import {
  AppHeader,
  Button,
  Card,
  Empty,
  IconButton,
  PagodaRow,
  Screen,
  SectionHeader,
  Tag,
} from "@/components/ui";
import {
  contributePhotosUrl,
  directionsUrl,
  festivals,
  getDetailsBySlug,
  getPagodaBySlug,
  imageUrl,
  pagodas,
  relatedLinks,
  siteType,
  siteUrl,
} from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { useSaved } from "@/lib/saved";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import type { Section } from "@/lib/types";

const HERO_H = 300;

function open(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function LinkRow({
  label,
  url,
  icon = "open-outline",
  last,
}: {
  label: string;
  url: string;
  icon?: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}) {
  const { theme } = useSettings();
  return (
    <Pressable
      onPress={() => {
        haptics.tap();
        open(url);
      }}
      accessibilityRole="link"
      style={({ pressed }) => [
        styles.linkRow,
        !last ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.line } : null,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View style={[styles.linkIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={16} color={theme.primaryText} />
      </View>
      <AppText variant="bodyS" weight={600} numberOfLines={2} style={{ flex: 1 }}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={16} color={theme.text3} />
    </Pressable>
  );
}

function Toggle({
  icon,
  iconActive,
  label,
  labelActive,
  active,
  tone,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
  labelActive: string;
  active: boolean;
  tone: "lotus" | "jade";
  onPress: () => void;
}) {
  const { theme } = useSettings();
  const fg = tone === "lotus" ? theme.lotus : theme.jade;
  const bg = tone === "lotus" ? theme.lotusSoft : theme.jadeSoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptics.select();
        onPress();
      }}
      style={({ pressed }) => [
        styles.toggle,
        {
          backgroundColor: active ? bg : theme.card,
          borderColor: active ? fg : theme.line,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Ionicons name={active ? iconActive : icon} size={20} color={active ? fg : theme.text2} />
      <AppText variant="caption" weight={700} color={active ? fg : theme.text2}>
        {active ? labelActive : label}
      </AppText>
    </Pressable>
  );
}

export default function DetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { theme, t, locale } = useSettings();
  const { favorites, visited, toggle } = useSaved();
  const insets = useSafeAreaInsets();
  const [scrolled, setScrolled] = useState(false);

  const p = slug ? getPagodaBySlug(slug) : undefined;
  const d = slug ? getDetailsBySlug(slug) : undefined;

  const related = useMemo(
    () => (p ? pagodas.filter((x) => x.province === p.province && x.id !== p.id).slice(0, 6) : []),
    [p],
  );

  if (!p) {
    return (
      <Screen>
        <AppHeader title={t.notFoundTitle} onBack={() => router.back()} />
        <Empty title={t.notFoundTitle} text={t.notFoundText} />
      </Screen>
    );
  }

  const useEnglish = locale === "en" && d !== undefined && d.sectionsEn.length > 0;
  const viSections: Section[] =
    d && d.sectionsVi.length > 0
      ? d.sectionsVi
      : p.description
        ? [{ heading: null, text: p.description }]
        : [];
  const sections: Section[] = useEnglish && d ? d.sectionsEn : viSections;
  const enSummary = locale === "en" && !useEnglish && p.descriptionEn ? p.descriptionEn : null;
  const isOsmPlaceholder =
    (d === undefined || d.sectionsVi.length === 0) &&
    p.description.includes("dữ liệu cộng đồng OpenStreetMap");
  const showViFallback = !enSummary || !isOsmPlaceholder;
  const name = locale === "en" && d?.nameEn ? d.nameEn : p.name;
  const hero = imageUrl(p.image);
  const gallery = (d?.gallery ?? []).filter((g) => imageUrl(g.src) !== hero);
  const worship = locale === "en" ? (d?.worshipEn ?? d?.worshipVi) : d?.worshipVi;
  const prayFor = locale === "en" ? (d?.prayForEn ?? d?.prayForVi) : d?.prayForVi;
  const festival = festivals.find((f) => f.slug === p.slug);
  const directions = directionsUrl(p);
  const links = relatedLinks(p, locale);
  const isFav = favorites.includes(p.slug);
  const isVisited = visited.includes(p.slug);
  const wikiUrl = locale === "en" ? (d?.wikipediaUrlEn ?? p.wikipediaUrl) : p.wikipediaUrl;
  const typeLabel = t.typeLabels[siteType(p.name)];

  const share = () => {
    haptics.tap();
    const url = siteUrl(p, locale);
    Share.share({ message: `${name} — ${url}`, url, title: name }).catch(() => undefined);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const next = y > HERO_H - insets.top - 60;
    if (next !== scrolled) setScrolled(next);
  };

  const heroTop = insets.top + 8;

  return (
    <Screen padTop={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
          {hero ? (
            <Image
              source={{ uri: hero }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              alt={name}
            />
          ) : (
            <LinearGradient colors={theme.gradient} style={StyleSheet.absoluteFill}>
              <View style={styles.heroPlaceholder}>
                <AppText style={{ fontSize: 72 }}>🪷</AppText>
              </View>
            </LinearGradient>
          )}
          <LinearGradient
            colors={["rgba(20,17,11,0.35)", "transparent", "rgba(20,17,11,0.75)"]}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroText, { paddingBottom: 28 }]}>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <Tag label={typeLabel} tone="gold" />
              {festival ? <Tag label={t.festivalHeading} tone="lotus" /> : null}
            </View>
            <AppText variant="display" color="#fff" numberOfLines={3}>
              {name}
            </AppText>
            {name !== p.name ? (
              <AppText variant="bodyS" color="rgba(255,255,255,0.88)">
                {p.name}
              </AppText>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
              <Ionicons name="location" size={14} color="#FCD34D" />
              <AppText variant="bodyS" color="rgba(255,255,255,0.92)" weight={600}>
                {p.province}
                {p.oldProvince ? ` · ${t.formerProvince(p.oldProvince)}` : ""}
              </AppText>
            </View>
          </View>
        </View>

        <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
          <View style={styles.actions}>
            {directions ? (
              <Button
                label={t.directionsBtn}
                icon="navigate"
                style={{ flex: 1 }}
                onPress={() => open(directions)}
              />
            ) : (
              <Button label={t.shareBtn} icon="share-social-outline" style={{ flex: 1 }} onPress={share} />
            )}
            {directions ? (
              <IconButton icon="share-social-outline" label={t.shareBtn} size={50} onPress={share} />
            ) : null}
          </View>
          <View style={styles.toggles}>
            <Toggle
              icon="heart-outline"
              iconActive="heart"
              label={t.favBtn}
              labelActive={t.favBtnActive}
              active={isFav}
              tone="lotus"
              onPress={() => toggle("vp-favorites", p.slug)}
            />
            <Toggle
              icon="checkmark-circle-outline"
              iconActive="checkmark-circle"
              label={t.visitedBtn}
              labelActive={t.visitedBtnActive}
              active={isVisited}
              tone="jade"
              onPress={() => toggle("vp-visited", p.slug)}
            />
          </View>

          <View style={styles.body}>
            {enSummary ? <AppText variant="body">{enSummary}</AppText> : null}
            {showViFallback && locale === "en" && !useEnglish && sections.length > 0 ? (
              <View style={[styles.note, { backgroundColor: theme.primarySoft }]}>
                <Ionicons name="language-outline" size={16} color={theme.primaryText} />
                <AppText variant="caption" tone="primary" style={{ flex: 1 }}>
                  {t.viOnlyNote}
                </AppText>
              </View>
            ) : null}
            {showViFallback
              ? sections.map((s, i) => (
                  <View key={i} style={{ gap: 6 }}>
                    {s.heading ? <AppText variant="h2">{s.heading}</AppText> : null}
                    <AppText variant="body">{s.text}</AppText>
                  </View>
                ))
              : null}
            {!enSummary && sections.length === 0 ? (
              <AppText variant="body" tone="text2">
                {t.noDescription}
              </AppText>
            ) : null}
          </View>

          {worship || prayFor ? (
            <>
              <SectionHeader title={t.worshipHeading} />
              <Card style={styles.card} tone="soft" elevated={false}>
                {worship ? (
                  <View style={styles.kv}>
                    <View style={[styles.kvIcon, { backgroundColor: theme.card }]}>
                      <AppText style={{ fontSize: 18 }}>🙏</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="overline" tone="primary">
                        {t.worshipLabel}
                      </AppText>
                      <AppText variant="body">{worship}</AppText>
                    </View>
                  </View>
                ) : null}
                {prayFor ? (
                  <View style={[styles.kv, worship ? { marginTop: 14 } : null]}>
                    <View style={[styles.kvIcon, { backgroundColor: theme.card }]}>
                      <AppText style={{ fontSize: 18 }}>🪷</AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="overline" tone="primary">
                        {t.prayForLabel}
                      </AppText>
                      <AppText variant="body">{prayFor}</AppText>
                    </View>
                  </View>
                ) : null}
              </Card>
            </>
          ) : null}

          {festival ? (
            <>
              <SectionHeader title={t.festivalHeading} action={t.seeAll} onAction={() => router.push("/le-hoi")} />
              <Card style={styles.card}>
                <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                  <View style={[styles.kvIcon, { backgroundColor: theme.lotusSoft }]}>
                    <Ionicons name="sparkles" size={18} color={theme.lotus} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AppText variant="h3">{locale === "en" ? festival.nameEn : festival.nameVi}</AppText>
                    <Tag label={locale === "en" ? festival.dateEn : festival.dateVi} tone="primary" />
                  </View>
                </View>
                <AppText variant="bodyS" style={{ marginTop: 10 }}>
                  {locale === "en" ? festival.descEn : festival.descVi}
                </AppText>
              </Card>
            </>
          ) : null}

          <SectionHeader
            title={t.galleryHeading}
            action={t.contributePhotos}
            onAction={() => open(contributePhotosUrl(p))}
          />
          {gallery.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: space.screen, gap: 12 }}
            >
              {gallery.map((g) => {
                const src = imageUrl(g.src);
                if (!src) return null;
                return (
                  <Pressable
                    key={g.src}
                    accessibilityRole="link"
                    onPress={() => open(g.creditUrl)}
                    style={({ pressed }) => [styles.galleryItem, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Image
                      source={{ uri: src }}
                      style={styles.galleryImg}
                      contentFit="cover"
                      transition={150}
                      alt={name}
                    />
                    <AppText variant="caption" tone="text3" style={{ marginTop: 6 }}>
                      Wikimedia Commons · CC BY-SA
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => open(contributePhotosUrl(p))}
              style={({ pressed }) => [
                styles.contributeCard,
                { borderColor: theme.line, backgroundColor: theme.cardAlt, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="camera-outline" size={26} color={theme.primaryText} />
              <AppText variant="bodyS" tone="text2" center style={{ flex: 1 }}>
                {t.contributePhotosText}
              </AppText>
            </Pressable>
          )}

          <SectionHeader title={t.visitTipsHeading} />
          <Card style={styles.card}>
            {t.visitTips.map((tip, i) => (
              <View key={i} style={[styles.tip, i > 0 ? { marginTop: 10 } : null]}>
                <View style={[styles.tipDot, { backgroundColor: theme.primary }]}>
                  <AppText variant="caption" weight={800} color="#fff">
                    {i + 1}
                  </AppText>
                </View>
                <AppText variant="bodyS" style={{ flex: 1 }}>
                  {tip}
                </AppText>
              </View>
            ))}
          </Card>

          {p.lat !== null && p.lng !== null ? (
            <>
              <SectionHeader title={t.location} />
              <View style={[styles.miniMap, { borderColor: theme.line }]}>
                <LeafletMap
                  points={[{ slug: p.slug, name, lat: p.lat, lng: p.lng }]}
                  center={{ lat: p.lat, lng: p.lng, zoom: 14 }}
                  cluster={false}
                />
              </View>
              <AppText variant="caption" tone="text3" style={{ paddingHorizontal: space.screen, marginTop: 8 }}>
                {t.coordinates}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </AppText>
            </>
          ) : null}

          <SectionHeader title={t.readMoreHeading} />
          <Card style={[styles.card, { paddingVertical: 4 }]}>
            <LinkRow icon="compass-outline" label={`${t.linkExperiences} ${p.name}`} url={links.experiences} />
            <LinkRow icon="star-outline" label={t.linkReviews} url={links.reviews} />
            <LinkRow icon="logo-youtube" label={t.linkVideos} url={links.videos} />
            <LinkRow icon="newspaper-outline" label={t.linkArticles} url={links.articles} last={!wikiUrl && !d?.references.length} />
            {wikiUrl ? (
              <LinkRow
                icon="book-outline"
                label={locale === "en" && d?.wikipediaUrlEn ? t.wikipediaEn : t.wikipediaVi}
                url={wikiUrl}
                last={!d?.references.filter((r) => r !== wikiUrl).length}
              />
            ) : null}
            {d?.references
              .filter((r) => r !== wikiUrl)
              .map((r, i, arr) => (
                <LinkRow
                  key={r}
                  icon="link-outline"
                  label={r.replace(/^https?:\/\//, "")}
                  url={r}
                  last={i === arr.length - 1}
                />
              ))}
          </Card>

          <Button
            label={t.openWebsite}
            icon="globe-outline"
            variant="ghost"
            style={{ marginHorizontal: space.screen, marginTop: 12 }}
            onPress={() => open(siteUrl(p, locale))}
          />

          {related.length > 0 ? (
            <>
              <SectionHeader
                title={t.relatedIn(p.province)}
                action={t.seeAll}
                onAction={() =>
                  router.push({
                    pathname: "/(tabs)/chua",
                    params: { province: p.province, ts: String(Date.now()) },
                  })
                }
              />
              {related.map((r) => (
                <PagodaRow key={r.slug} p={r} />
              ))}
            </>
          ) : null}
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[
          styles.topBar,
          {
            paddingTop: heroTop,
            backgroundColor: scrolled ? theme.tabBar : "transparent",
            borderBottomColor: scrolled ? theme.line : "transparent",
          },
        ]}
      >
        <IconButton
          icon="chevron-back"
          label={t.back}
          size={40}
          color={scrolled ? theme.text : "#fff"}
          style={scrolled ? null : styles.glass}
          onPress={() => router.back()}
        />
        {scrolled ? (
          <AppText variant="h3" numberOfLines={1} style={{ flex: 1 }} center>
            {name}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <IconButton
          icon={isFav ? "heart" : "heart-outline"}
          label={t.favBtn}
          size={40}
          tone="lotus"
          active={isFav}
          color={isFav ? theme.lotus : scrolled ? theme.text : "#fff"}
          style={scrolled || isFav ? null : styles.glass}
          onPress={() => {
            haptics.select();
            toggle("vp-favorites", p.slug);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40 },
  hero: { height: HERO_H, justifyContent: "flex-end" },
  heroPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroText: { paddingHorizontal: space.screen, gap: 2 },
  sheet: {
    marginTop: -radius.sheet,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: 20,
  },
  actions: { flexDirection: "row", gap: 10, paddingHorizontal: space.screen },
  toggles: { flexDirection: "row", gap: 10, paddingHorizontal: space.screen, marginTop: 10 },
  toggle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: radius.button,
    borderWidth: 1.5,
  },
  body: { paddingHorizontal: space.screen, paddingTop: 20, gap: 14 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  card: { marginHorizontal: space.screen },
  kv: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  kvIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  galleryItem: { width: 240 },
  galleryImg: { width: 240, height: 160, borderRadius: radius.thumb },
  contributeCard: {
    marginHorizontal: space.screen,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  tip: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  tipDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", marginTop: 1 },
  miniMap: {
    marginHorizontal: space.screen,
    height: 200,
    borderRadius: radius.card,
    overflow: "hidden",
    borderWidth: 1,
  },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  linkIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  glass: { backgroundColor: "rgba(0,0,0,0.35)", borderColor: "transparent" },
});
