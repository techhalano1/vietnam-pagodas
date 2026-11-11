import { useRouter } from "expo-router";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { AppText } from "@/components/Text";
import {
  AppHeader,
  Button,
  Empty,
  IconButton,
  PressableCard,
  Screen,
  Tag,
} from "@/components/ui";
import { displayName, getPagodaBySlug } from "@/lib/data";
import { solarToLunar } from "@/lib/lunar";
import { useOfferings, type Offering } from "@/lib/offerings";
import { useSettings } from "@/lib/settings";
import { space } from "@/lib/theme";

const EMOJI = { hoa: "🪷", den: "🕯️", nuoc: "💧", qua: "🍊" } as const;

function when(at: number) {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    solar: `${pad(d.getHours())}:${pad(d.getMinutes())} · ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
    lunar: solarToLunar(d.getDate(), d.getMonth() + 1, d.getFullYear()),
  };
}

export default function JournalScreen() {
  const { t, locale } = useSettings();
  const router = useRouter();
  const { journal, clear } = useOfferings();

  const confirmClear = () =>
    Alert.alert(t.offer.journalClear, t.offer.journalClearConfirm, [
      { text: t.offer.cancel, style: "cancel" },
      { text: t.offer.journalClear, style: "destructive", onPress: clear },
    ]);

  const renderItem = ({ item }: { item: Offering }) => {
    const p = getPagodaBySlug(item.slug);
    const w = when(item.at);
    return (
      <PressableCard
        style={styles.card}
        onPress={() => router.push(`/bao-dien/${item.slug}`)}
        accessibilityRole="button"
      >
        <AppText variant="h3" numberOfLines={1}>
          {p ? displayName(p, locale) : item.slug}
        </AppText>
        <AppText variant="caption" tone="text3">
          {w.solar} · {t.offer.lunarShort(w.lunar.day, w.lunar.month)}
        </AppText>
        <View style={styles.tags}>
          <Tag label={`🔥 ${t.offer.sticks(item.sticks)}`} tone="gold" />
          {item.items.map((k) => (
            <Tag
              key={k}
              label={`${EMOJI[k]} ${t.offer.items[k]}`}
              tone="neutral"
            />
          ))}
          <Tag label={t.offer.forWhom[item.forWhom]} tone="lotus" />
        </View>
        {item.wish ? (
          <AppText
            variant="bodyS"
            tone="text2"
            style={{ fontStyle: "italic", marginTop: 6 }}
          >
            “{item.wish}”
          </AppText>
        ) : null}
      </PressableCard>
    );
  };

  return (
    <Screen>
      <AppHeader
        title={t.offer.journalTitle}
        subtitle={
          journal.length ? t.offer.journalCount(journal.length) : undefined
        }
        onBack={() => router.back()}
        right={
          journal.length ? (
            <IconButton
              icon="trash-outline"
              label={t.offer.journalClear}
              onPress={confirmClear}
            />
          ) : undefined
        }
      />
      <FlatList
        data={journal}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Empty
            icon="flame-outline"
            title={t.offer.journalEmpty}
            text={t.offer.journalEmptyText}
            action={
              <Button
                label={t.offer.offerBtn}
                icon="flame"
                variant="secondary"
                onPress={() => router.push("/thap-huong")}
              />
            }
          />
        }
        contentContainerStyle={{
          paddingBottom: 32,
          paddingHorizontal: space.screen,
          gap: 10,
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
});
