import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  downloadKey,
  formatBytes,
  formatTime,
  REPEAT_OPTIONS,
  SLEEP_OPTIONS,
  SPEEDS,
  type Speed,
} from "@/lib/audio";
import * as haptics from "@/lib/haptics";
import { usePlayer } from "@/lib/player";
import { scriptureTitle } from "@/lib/scriptures";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import { Sheet } from "./Sheet";
import { AppText } from "./Text";
import { Chip, IconButton } from "./ui";

/** Tap-to-seek progress bar. */
export function SeekBar({
  height = 6,
  style,
}: {
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme, t } = useSettings();
  const { status, seekTo } = usePlayer();
  const [width, setWidth] = useState(0);
  const ratio = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const onPress = (e: GestureResponderEvent) => {
    if (!width || !status.duration) return;
    const x = Math.max(0, Math.min(e.nativeEvent.locationX, width));
    seekTo((x / width) * status.duration);
  };
  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel={t.seekLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(ratio * 100) }}
      onPress={onPress}
      onLayout={onLayout}
      hitSlop={{ top: 12, bottom: 12 }}
      style={[{ height, borderRadius: height / 2, backgroundColor: theme.cardAlt, overflow: "hidden" }, style]}
    >
      <View
        style={{
          width: `${ratio * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: theme.primary,
        }}
      />
    </Pressable>
  );
}

function PlayPauseButton({ size = 56 }: { size?: number }) {
  const { theme, t } = useSettings();
  const { status, toggle } = usePlayer();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={status.playing ? t.playerPause : t.playerPlay}
      onPress={() => {
        haptics.tap();
        toggle();
      }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.primaryDark,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {status.isBuffering && !status.playing ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Ionicons
          name={status.playing ? "pause" : "play"}
          size={size * 0.5}
          color="#fff"
          style={status.playing ? undefined : { marginLeft: size * 0.06 }}
        />
      )}
    </Pressable>
  );
}

function useSleepCountdown(): string | null {
  const { sleepUntil } = usePlayer();
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (sleepUntil === null) return;
    const first = setTimeout(() => setNow(Date.now()), 0);
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [sleepUntil]);
  if (sleepUntil === null || now === 0) return null;
  return formatTime(Math.max(0, (sleepUntil - now) / 1000));
}

/** Full player docked at the bottom of the reader screen. */
export function PlayerBar({ bottomInset }: { bottomInset: number }) {
  const { theme, t } = useSettings();
  const p = usePlayer();
  const [sheet, setSheet] = useState(false);
  const sleep = useSleepCountdown();
  if (!p.track || !p.audio) return null;
  const chant = p.voice === "chant" ? p.audio.chant : undefined;
  const position = p.cues ? t.readingProgress(p.verseIndex + 1, p.cues.length) : chant ? t.chantBy(chant.performer) : "";

  return (
    <View
      style={[
        styles.bar,
        { backgroundColor: theme.card, borderColor: theme.line, paddingBottom: bottomInset + 10 },
        theme.shadowLg,
      ]}
    >
      <SeekBar />
      <View style={styles.times}>
        <AppText variant="caption" tone="text3">
          {formatTime(p.status.currentTime)}
        </AppText>
        <AppText variant="caption" tone="text2" weight={600} numberOfLines={1} style={{ flex: 1, textAlign: "center" }}>
          {position}
          {p.repeat > 1 ? ` · ${t.repeatProgress(Math.min(p.repeatDone + 1, p.repeat), p.repeat)}` : ""}
          {sleep ? ` · ${t.sleepRemaining(sleep)}` : ""}
        </AppText>
        <AppText variant="caption" tone="text3">
          {formatTime(p.status.duration)}
        </AppText>
      </View>
      <View style={styles.controls}>
        <IconButton icon="options-outline" label={t.playbackOptions} onPress={() => setSheet(true)} size={40} />
        <IconButton
          icon={p.cues ? "play-skip-back" : "play-back"}
          label={p.cues ? t.prevVerse : t.skipBack}
          onPress={() => p.skipVerse(-1)}
          size={44}
        />
        <PlayPauseButton />
        <IconButton
          icon={p.cues ? "play-skip-forward" : "play-forward"}
          label={p.cues ? t.nextVerse : t.skipForward}
          onPress={() => p.skipVerse(1)}
          size={44}
        />
        <IconButton
          icon="close"
          label={t.playerClose}
          onPress={() => p.stop()}
          size={40}
        />
      </View>
      {p.error ? (
        <AppText variant="caption" tone="danger" style={{ textAlign: "center", marginTop: 6 }}>
          {t.audioError}
        </AppText>
      ) : null}
      <PlaybackSheet open={sheet} onClose={() => setSheet(false)} />
    </View>
  );
}

export function PlaybackSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, t } = useSettings();
  const p = usePlayer();
  const slug = p.track?.slug;
  const key = slug ? downloadKey(slug, p.voice) : undefined;
  const dl = key ? p.downloads[key] : undefined;
  const busy = !!key && p.downloading.includes(key);
  const chant = p.audio?.chant;
  const aiDuration = p.audio?.durationSec ?? 0;
  return (
    <Sheet open={open} onClose={onClose} title={t.playbackOptions}>
      <View style={{ paddingHorizontal: space.screen, gap: 18, paddingBottom: 8 }}>
        {chant ? (
          <View style={{ gap: 8 }}>
            <AppText variant="overline" tone="text2">
              {t.voiceLabel}
            </AppText>
            <View style={styles.chips}>
              <Chip
                label={`${t.voiceChant} · ${formatTime(chant.durationSec)}`}
                active={p.voice === "chant"}
                onPress={() => p.setVoice("chant")}
              />
              <Chip
                label={`${t.voiceAi} · ${formatTime(aiDuration)}`}
                active={p.voice === "ai"}
                onPress={() => p.setVoice("ai")}
              />
            </View>
          </View>
        ) : null}
        <View style={{ gap: 8 }}>
          <AppText variant="overline" tone="text2">
            {t.speedLabel}
          </AppText>
          <View style={styles.chips}>
            {SPEEDS.map((s: Speed) => (
              <Chip key={s} label={`${s}×`} active={p.speed === s} onPress={() => p.setSpeed(s)} />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <AppText variant="overline" tone="text2">
            {t.repeatLabel}
          </AppText>
          <View style={styles.chips}>
            {REPEAT_OPTIONS.map((n) => (
              <Chip
                key={n}
                label={n === 1 ? t.repeatOnce : t.repeatTimes(n)}
                active={p.repeat === n}
                onPress={() => p.setRepeat(n)}
              />
            ))}
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <AppText variant="overline" tone="text2">
            {t.sleepLabel}
          </AppText>
          <View style={styles.chips}>
            {SLEEP_OPTIONS.map((m) => {
              const active =
                m === 0 ? p.sleepUntil === null : p.sleepUntil !== null && sleepMinutesOf(p.sleepUntil) === m;
              return (
                <Chip
                  key={m}
                  label={m === 0 ? t.sleepOff : t.sleepMinutes(m)}
                  active={active}
                  onPress={() => p.setSleepMinutes(m)}
                />
              );
            })}
          </View>
        </View>
        {slug && p.audio ? (
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => {
              haptics.tap();
              if (dl) p.removeDownload(slug, p.voice);
              else p.download(slug, p.voice).catch(() => undefined);
            }}
            style={({ pressed }) => [
              styles.download,
              { backgroundColor: theme.cardAlt, borderColor: theme.line, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <View style={[styles.dlIcon, { backgroundColor: dl ? theme.jadeSoft : theme.primarySoft }]}>
              {busy ? (
                <ActivityIndicator color={theme.primaryText} />
              ) : (
                <Ionicons
                  name={dl ? "checkmark-circle" : "cloud-download-outline"}
                  size={20}
                  color={dl ? theme.jade : theme.primaryText}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="h3">
                {busy ? t.downloadingLabel : dl ? t.downloadedLabel : t.downloadBtn}
              </AppText>
              <AppText variant="bodyS" tone="text2">
                {formatBytes(dl?.bytes ?? (p.current ?? p.audio).bytes)}
                {dl ? ` · ${t.removeDownload}` : ""}
              </AppText>
            </View>
          </Pressable>
        ) : null}
        {p.voice === "chant" && chant ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(chant.sourceUrl).catch(() => undefined)}
          >
            <AppText variant="caption" tone="text3">
              {t.chantCredit(chant.performer, chant.source)}
            </AppText>
          </Pressable>
        ) : (
          <AppText variant="caption" tone="text3">
            {t.audioVoiceNote}
          </AppText>
        )}
      </View>
    </Sheet>
  );
}

/** Reverse-map a sleep deadline back to the option that created it (within a minute). */
function sleepMinutesOf(until: number): number {
  const remaining = (until - Date.now()) / 60_000;
  let best = 0;
  let bestDiff = Infinity;
  for (const m of SLEEP_OPTIONS) {
    if (m === 0) continue;
    const diff = m - remaining;
    if (diff >= -0.05 && diff < bestDiff) {
      bestDiff = diff;
      best = m;
    }
  }
  return best;
}

/** Compact bar rendered above the tab bar while something is playing. */
export function MiniPlayer() {
  const { theme, t, locale } = useSettings();
  const p = usePlayer();
  const router = useRouter();
  if (!p.track || !p.audio) return null;
  const chant = p.voice === "chant" ? p.audio.chant : undefined;
  const position = p.cues
    ? t.readingProgress(p.verseIndex + 1, p.cues.length)
    : chant
      ? t.chantBy(chant.performer)
      : t.nowPlaying;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t.nowPlaying}: ${scriptureTitle(p.track, locale)}`}
      onPress={() => {
        haptics.tap();
        router.push({ pathname: "/kinh/[slug]", params: { slug: p.track!.slug } });
      }}
      style={({ pressed }) => [
        styles.mini,
        { backgroundColor: theme.card, borderColor: theme.line, opacity: pressed ? 0.9 : 1 },
        theme.shadowLg,
      ]}
    >
      <View style={styles.miniRow}>
        <View style={[styles.miniIcon, { backgroundColor: theme.primarySoft }]}>
          <Ionicons name="musical-notes" size={18} color={theme.primaryText} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="h3" numberOfLines={1}>
            {scriptureTitle(p.track, locale)}
          </AppText>
          <AppText variant="caption" tone="text2" numberOfLines={1}>
            {position} · {formatTime(p.status.currentTime)} / {formatTime(p.status.duration)}
          </AppText>
        </View>
        <PlayPauseButton size={40} />
        <IconButton icon="close" label={t.playerClose} onPress={() => p.stop()} size={32} />
      </View>
      <SeekBar height={3} style={{ marginTop: 8 }} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingHorizontal: space.screen,
    paddingTop: 12,
  },
  times: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  download: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  dlIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  mini: {
    marginHorizontal: space.screen,
    marginBottom: 8,
    padding: 10,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  miniRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  miniIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
