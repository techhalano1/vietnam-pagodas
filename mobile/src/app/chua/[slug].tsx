import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LeafletMap } from "@/components/LeafletMap";
import { Card, Empty, PagodaRow, SectionTitle } from "@/components/ui";
import {
  contributePhotosUrl,
  directionsUrl,
  festivals,
  getDetailsBySlug,
  getPagodaBySlug,
  imageUrl,
  pagodas,
  relatedLinks,
  siteUrl,
} from "@/lib/data";
import { useSaved } from "@/lib/saved";
import { useSettings } from "@/lib/settings";
import type { Section } from "@/lib/types";

function open(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function ActionButton({
  icon,
  label,
  onPress,
  active,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
  primary?: boolean;
}) {
  const { theme } = useSettings();
  const bg = primary ? theme.accent : active ? theme.accentSoft : theme.chip;
  const fg = primary
    ? theme.accentText
    : active
      ? theme.accent
      : theme.chipText;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: bg, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Ionicons name={icon} size={16} color={fg} />
      <Text style={[styles.actionText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const { theme } = useSettings();
  return (
    <Pressable
      onPress={() => open(url)}
      accessibilityRole="link"
      style={({ pressed }) => [
        styles.linkRow,
        { borderBottomColor: theme.border, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Ionicons name="open-outline" size={16} color={theme.accent} />
      <Text
        numberOfLines={2}
        style={{ color: theme.accent, flex: 1, fontSize: 14 }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function DetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { theme, t, locale } = useSettings();
  const { favorites, visited, toggle } = useSaved();
  const { width } = useWindowDimensions();

  const p = slug ? getPagodaBySlug(slug) : undefined;
  const d = slug ? getDetailsBySlug(slug) : undefined;

  const related = useMemo(
    () =>
      p
        ? pagodas
            .filter((x) => x.province === p.province && x.id !== p.id)
            .slice(0, 6)
        : [],
    [p],
  );

  if (!p) {
    return (
      <>
        <Stack.Screen options={{ title: t.notFoundTitle }} />
        <Empty text={t.notFoundText} />
      </>
    );
  }

  const useEnglish =
    locale === "en" && d !== undefined && d.sectionsEn.length > 0;
  const viSections: Section[] =
    d && d.sectionsVi.length > 0
      ? d.sectionsVi
      : p.description
        ? [{ heading: null, text: p.description }]
        : [];
  const sections: Section[] = useEnglish && d ? d.sectionsEn : viSections;
  const enSummary =
    locale === "en" && !useEnglish && p.descriptionEn ? p.descriptionEn : null;
  const isOsmPlaceholder =
    (d === undefined || d.sectionsVi.length === 0) &&
    p.description.includes("dữ liệu cộng đồng OpenStreetMap");
  const showViFallback = !enSummary || !isOsmPlaceholder;
  const name = locale === "en" && d?.nameEn ? d.nameEn : p.name;
  const hero = imageUrl(p.image);
  const gallery = (d?.gallery ?? []).filter((g) => imageUrl(g.src) !== hero);
  const worship =
    locale === "en" ? (d?.worshipEn ?? d?.worshipVi) : d?.worshipVi;
  const prayFor =
    locale === "en" ? (d?.prayForEn ?? d?.prayForVi) : d?.prayForVi;
  const festival = festivals.find((f) => f.slug === p.slug);
  const directions = directionsUrl(p);
  const links = relatedLinks(p, locale);
  const isFav = favorites.includes(p.slug);
  const isVisited = visited.includes(p.slug);
  const wikiUrl =
    locale === "en" ? (d?.wikipediaUrlEn ?? p.wikipediaUrl) : p.wikipediaUrl;

  const share = () => {
    const url = siteUrl(p, locale);
    Share.share({ message: `${name} — ${url}`, url, title: name }).catch(
      () => undefined,
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bg }}
        contentContainerStyle={styles.content}
      >
        {hero && (
          <Image
            source={{ uri: hero }}
            style={[styles.hero, { width }]}
            contentFit="cover"
            transition={200}
            alt={name}
          />
        )}

        <View style={styles.body}>
          <Text style={[styles.title, { color: theme.text }]}>{name}</Text>
          {name !== p.name && (
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {p.name}
            </Text>
          )}
          <Text style={[styles.meta, { color: theme.muted }]}>
            <Ionicons name="location-outline" size={13} color={theme.muted} />{" "}
            {p.province}
            {p.oldProvince ? ` · ${t.formerProvince(p.oldProvince)}` : ""}
          </Text>

          <View style={styles.actions}>
            {directions && (
              <ActionButton
                icon="navigate"
                label={t.directionsBtn}
                onPress={() => open(directions)}
                primary
              />
            )}
            <ActionButton
              icon="share-social-outline"
              label={t.shareBtn}
              onPress={share}
            />
            <ActionButton
              icon={isFav ? "heart" : "heart-outline"}
              label={isFav ? t.favBtnActive : t.favBtn}
              active={isFav}
              onPress={() => toggle("vp-favorites", p.slug)}
            />
            <ActionButton
              icon={isVisited ? "checkmark-circle" : "checkmark-circle-outline"}
              label={isVisited ? t.visitedBtnActive : t.visitedBtn}
              active={isVisited}
              onPress={() => toggle("vp-visited", p.slug)}
            />
          </View>

          {enSummary && (
            <Text style={[styles.para, { color: theme.text }]}>
              {enSummary}
            </Text>
          )}
          {showViFallback &&
            locale === "en" &&
            !useEnglish &&
            sections.length > 0 && (
              <View
                style={[styles.note, { backgroundColor: theme.accentSoft }]}
              >
                <Text style={{ color: theme.accent, fontSize: 13 }}>
                  {t.viOnlyNote}
                </Text>
              </View>
            )}
          {showViFallback &&
            sections.map((s, i) => (
              <View key={i}>
                {s.heading && <SectionTitle>{s.heading}</SectionTitle>}
                <Text style={[styles.para, { color: theme.text }]}>
                  {s.text}
                </Text>
              </View>
            ))}
          {!enSummary && sections.length === 0 && (
            <Text style={[styles.para, { color: theme.muted }]}>
              {t.noDescription}
            </Text>
          )}

          {(worship || prayFor) && (
            <>
              <SectionTitle>{t.worshipHeading}</SectionTitle>
              <Card>
                {worship && (
                  <Text style={[styles.para, { color: theme.text }]}>
                    <Text style={{ fontWeight: "700" }}>
                      {t.worshipLabel}:{" "}
                    </Text>
                    {worship}
                  </Text>
                )}
                {prayFor && (
                  <Text style={[styles.para, { color: theme.text }]}>
                    <Text style={{ fontWeight: "700" }}>
                      {t.prayForLabel}:{" "}
                    </Text>
                    {prayFor}
                  </Text>
                )}
              </Card>
            </>
          )}

          {festival && (
            <>
              <SectionTitle>{t.festivalHeading}</SectionTitle>
              <Card>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {locale === "en" ? festival.nameEn : festival.nameVi}
                </Text>
                <Text
                  style={{ color: theme.accent, fontSize: 13, marginBottom: 6 }}
                >
                  {locale === "en" ? festival.dateEn : festival.dateVi}
                </Text>
                <Text style={[styles.para, { color: theme.text }]}>
                  {locale === "en" ? festival.descEn : festival.descVi}
                </Text>
              </Card>
            </>
          )}

          {gallery.length > 0 && (
            <>
              <SectionTitle>{t.galleryHeading}</SectionTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {gallery.map((g) => {
                  const src = imageUrl(g.src);
                  if (!src) return null;
                  return (
                    <Pressable
                      key={g.src}
                      onPress={() => open(g.creditUrl)}
                      style={styles.galleryItem}
                    >
                      <Image
                        source={{ uri: src }}
                        style={styles.galleryImg}
                        contentFit="cover"
                        transition={150}
                        alt={name}
                      />
                      <Text
                        style={{
                          color: theme.muted,
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        Wikimedia Commons · CC BY-SA
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          )}
          <Pressable
            onPress={() => open(contributePhotosUrl(p))}
            style={styles.contribute}
          >
            <Ionicons name="camera-outline" size={16} color={theme.accent} />
            <Text style={{ color: theme.accent, fontSize: 14 }}>
              {t.contributePhotos}
            </Text>
          </Pressable>

          <SectionTitle>{t.visitTipsHeading}</SectionTitle>
          <Card>
            {t.visitTips.map((tip, i) => (
              <Text key={i} style={[styles.para, { color: theme.text }]}>
                • {tip}
              </Text>
            ))}
          </Card>

          {p.lat !== null && p.lng !== null && (
            <>
              <SectionTitle>{t.location}</SectionTitle>
              <View style={[styles.miniMap, { borderColor: theme.border }]}>
                <LeafletMap
                  points={[{ slug: p.slug, name, lat: p.lat, lng: p.lng }]}
                  center={{ lat: p.lat, lng: p.lng, zoom: 14 }}
                  cluster={false}
                />
              </View>
              <Text style={{ color: theme.muted, fontSize: 12, marginTop: 6 }}>
                {t.coordinates}: {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </Text>
            </>
          )}

          <SectionTitle>{t.readMoreHeading}</SectionTitle>
          <Text style={[styles.para, { color: theme.muted, fontSize: 13 }]}>
            {t.readMoreIntro}
          </Text>
          <LinkRow label={`${t.linkExperiences} ${p.name}`} url={links.experiences} />
          <LinkRow label={t.linkReviews} url={links.reviews} />
          <LinkRow label={t.linkVideos} url={links.videos} />
          <LinkRow label={t.linkArticles} url={links.articles} />

          {(wikiUrl || (d && d.references.length > 0)) && (
            <>
              <SectionTitle>{t.referencesHeading}</SectionTitle>
              {wikiUrl && (
                <LinkRow
                  label={
                    locale === "en" && d?.wikipediaUrlEn
                      ? t.wikipediaEn
                      : t.wikipediaVi
                  }
                  url={wikiUrl}
                />
              )}
              {d?.references
                .filter((r) => r !== wikiUrl)
                .map((r) => (
                  <LinkRow
                    key={r}
                    label={r.replace(/^https?:\/\//, "")}
                    url={r}
                  />
                ))}
            </>
          )}

          <Pressable
            onPress={() => open(siteUrl(p, locale))}
            style={styles.contribute}
          >
            <Ionicons name="globe-outline" size={16} color={theme.accent} />
            <Text style={{ color: theme.accent, fontSize: 14 }}>
              {t.openWebsite}
            </Text>
          </Pressable>
        </View>

        {related.length > 0 && (
          <>
            <View style={styles.body}>
              <SectionTitle>{t.relatedIn(p.province)}</SectionTitle>
            </View>
            {related.map((r) => (
              <PagodaRow key={r.slug} pagoda={r} />
            ))}
            <Pressable
              onPress={() => router.navigate("/")}
              style={[styles.contribute, { alignSelf: "center" }]}
            >
              <Text style={{ color: theme.accent, fontSize: 14 }}>
                {t.home}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  hero: { height: 220 },
  body: { paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "800", marginTop: 16 },
  subtitle: { fontSize: 15, marginTop: 2 },
  meta: { fontSize: 13, marginTop: 6 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
    marginBottom: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  actionText: { fontSize: 13, fontWeight: "600" },
  para: { fontSize: 15, lineHeight: 23, marginBottom: 10 },
  note: { padding: 10, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  galleryItem: { marginRight: 10, width: 220 },
  galleryImg: { width: 220, height: 150, borderRadius: 10 },
  contribute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  miniMap: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
