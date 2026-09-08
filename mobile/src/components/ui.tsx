import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { describe, displayName, hasDetails, imageUrl, siteType } from "@/lib/data";
import * as haptics from "@/lib/haptics";
import { useSettings } from "@/lib/settings";
import { radius, space } from "@/lib/theme";
import type { Pagoda } from "@/lib/types";
import { AppText } from "./Text";

export type IconName = keyof typeof Ionicons.glyphMap;

// ---------------------------------------------------------------------------
// Layout

export function Screen({
  children,
  style,
  padTop = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padTop?: boolean;
}) {
  const { theme } = useSettings();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: theme.bg, paddingTop: padTop ? insets.top : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Bottom padding so scroll content clears the floating tab bar. */
export function useTabBarPadding() {
  const insets = useSafeAreaInsets();
  return 72 + Math.max(insets.bottom, 12) + 16;
}

export function AppHeader({
  title,
  subtitle,
  right,
  onBack,
  large,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
  large?: boolean;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <IconButton icon="chevron-back" onPress={onBack} style={{ marginLeft: -6 }} />
      ) : null}
      <View style={{ flex: 1 }}>
        {subtitle ? (
          <AppText variant="overline" tone="primary">
            {subtitle}
          </AppText>
        ) : null}
        <AppText variant={large ? "display" : "h1"} numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <AppText variant="h2" style={{ flex: 1 }}>
        {title}
      </AppText>
      {action && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <AppText variant="caption" tone="primary" weight={700}>
            {action} ›
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { theme } = useSettings();
  return (
    <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: theme.line }, style]} />
  );
}

// ---------------------------------------------------------------------------
// Surfaces

export function Card({
  children,
  style,
  tone = "card",
  elevated = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: "card" | "alt" | "soft";
  elevated?: boolean;
}) {
  const { theme } = useSettings();
  const bg =
    tone === "alt" ? theme.cardAlt : tone === "soft" ? theme.primarySoft : theme.card;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg, borderColor: theme.line },
        elevated ? theme.shadow : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  style,
  onPress,
  tone,
  ...rest
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: "card" | "alt" | "soft";
} & Omit<PressableProps, "style" | "children">) {
  const { theme } = useSettings();
  const bg =
    tone === "alt" ? theme.cardAlt : tone === "soft" ? theme.primarySoft : theme.card;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(e) => {
        haptics.tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderColor: theme.line },
        theme.shadow,
        pressed ? styles.pressed : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

export function GoldCard({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useSettings();
  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gold, theme.shadowLg, style]}
    >
      <View style={styles.goldOrb} />
      <View style={styles.goldOrb2} />
      {children}
    </LinearGradient>
  );
}

// ---------------------------------------------------------------------------
// Controls

export function Button({
  label,
  icon,
  onPress,
  variant = "primary",
  size = "md",
  style,
  disabled,
  textColor,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  textColor?: string;
}) {
  const { theme } = useSettings();
  const bg =
    variant === "primary"
      ? theme.primaryDark
      : variant === "secondary"
        ? theme.primarySoft
        : variant === "danger"
          ? theme.dangerSoft
          : "transparent";
  const fg =
    textColor ??
    (variant === "primary"
      ? "#FFFFFF"
      : variant === "danger"
        ? theme.danger
        : theme.primaryText);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        size === "sm" ? styles.buttonSm : null,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === "ghost" ? { borderWidth: 1, borderColor: theme.line } : null,
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={size === "sm" ? 16 : 18} color={fg} /> : null}
      <AppText
        variant={size === "sm" ? "caption" : "h3"}
        weight={700}
        color={fg}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{ flexShrink: 1 }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  active,
  size = 40,
  style,
  tone = "neutral",
  color,
  disabled,
}: {
  icon: IconName;
  onPress: () => void;
  label?: string;
  active?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  tone?: "neutral" | "primary" | "lotus" | "jade";
  color?: string;
  disabled?: boolean;
}) {
  const { theme } = useSettings();
  const activeColor =
    tone === "lotus" ? theme.lotus : tone === "jade" ? theme.jade : theme.primaryText;
  const activeBg =
    tone === "lotus" ? theme.lotusSoft : tone === "jade" ? theme.jadeSoft : theme.primarySoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? activeBg : theme.card,
          borderWidth: 1,
          borderColor: active ? "transparent" : theme.line,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons
        name={icon}
        size={size * 0.5}
        color={color ?? (active ? activeColor : theme.text2)}
      />
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useSettings();
  return (
    <Pressable
      onPress={() => {
        haptics.select();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: active ? theme.primaryDark : theme.card,
          borderColor: active ? theme.primaryDark : theme.line,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={active ? "#fff" : theme.text2} />
      ) : null}
      <AppText variant="caption" weight={600} color={active ? "#fff" : theme.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useSettings();
  return (
    <View
      style={[styles.segment, { backgroundColor: theme.primarySoft }, style]}
      accessibilityRole="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) {
                haptics.select();
                onChange(o.value);
              }
            }}
            style={[
              styles.segmentItem,
              active
                ? { backgroundColor: theme.card, ...theme.shadow }
                : null,
            ]}
          >
            {o.icon ? (
              <Ionicons
                name={o.icon}
                size={15}
                color={active ? theme.primaryText : theme.text2}
              />
            ) : null}
            <AppText
              variant="caption"
              weight={700}
              color={active ? theme.primaryText : theme.text2}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{ flexShrink: 1 }}
            >
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Tag({
  label,
  tone = "primary",
  icon,
}: {
  label: string;
  tone?: "primary" | "lotus" | "jade" | "neutral" | "gold";
  icon?: IconName;
}) {
  const { theme } = useSettings();
  const fg =
    tone === "lotus"
      ? theme.lotus
      : tone === "jade"
        ? theme.jade
        : tone === "neutral"
          ? theme.text2
          : tone === "gold"
            ? "#2B1D0E"
            : theme.primaryText;
  const bg =
    tone === "lotus"
      ? theme.lotusSoft
      : tone === "jade"
        ? theme.jadeSoft
        : tone === "neutral"
          ? theme.cardAlt
          : tone === "gold"
            ? "#FCD34D"
            : theme.primarySoft;
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={11} color={fg} /> : null}
      <AppText variant="caption" weight={700} color={fg} style={{ fontSize: 11 }}>
        {label}
      </AppText>
    </View>
  );
}

export function QuickAction({
  icon,
  label,
  onPress,
  tone = "primary",
  badge,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: "primary" | "lotus" | "jade";
  badge?: string;
}) {
  const { theme } = useSettings();
  const fg = tone === "lotus" ? theme.lotus : tone === "jade" ? theme.jade : theme.primaryText;
  const bg =
    tone === "lotus" ? theme.lotusSoft : tone === "jade" ? theme.jadeSoft : theme.primarySoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.quick, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.quickIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={fg} />
        {badge ? (
          <View style={[styles.quickBadge, { backgroundColor: theme.lotus }]}>
            <AppText variant="caption" color="#fff" style={{ fontSize: 9, lineHeight: 11 }}>
              {badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="caption" center numberOfLines={2} style={{ fontSize: 11.5 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Rows & states

export function ListRow({
  icon,
  iconTone = "primary",
  title,
  subtitle,
  right,
  onPress,
  last,
  emoji,
}: {
  icon?: IconName;
  iconTone?: "primary" | "lotus" | "jade" | "neutral";
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  emoji?: string;
}) {
  const { theme } = useSettings();
  const fg =
    iconTone === "lotus"
      ? theme.lotus
      : iconTone === "jade"
        ? theme.jade
        : iconTone === "neutral"
          ? theme.text2
          : theme.primaryText;
  const bg =
    iconTone === "lotus"
      ? theme.lotusSoft
      : iconTone === "jade"
        ? theme.jadeSoft
        : iconTone === "neutral"
          ? theme.cardAlt
          : theme.primarySoft;
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={() => {
        haptics.tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.listRow,
        !last ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.line } : null,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      {icon || emoji ? (
        <View style={[styles.listIcon, { backgroundColor: bg }]}>
          {emoji ? (
            <AppText style={{ fontSize: 18 }}>{emoji}</AppText>
          ) : icon ? (
            <Ionicons name={icon} size={18} color={fg} />
          ) : null}
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="h3" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodyS" tone="text2" numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ?? (onPress ? (
        <Ionicons name="chevron-forward" size={18} color={theme.text3} />
      ) : null)}
    </Pressable>
  );
}

export function Empty({
  icon = "leaf-outline",
  title,
  text,
  action,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  const { theme } = useSettings();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon} size={30} color={theme.primaryText} />
      </View>
      <AppText variant="h3" center>
        {title}
      </AppText>
      {text ? (
        <AppText variant="bodyS" tone="text2" center style={{ maxWidth: 280 }}>
          {text}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Pagoda card

export function PagodaRow({
  p,
  distanceKm,
  compact,
  style,
}: {
  p: Pagoda;
  distanceKm?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme, locale, t } = useSettings();
  const router = useRouter();
  const onPress = useCallback(() => {
    haptics.tap();
    router.push(`/chua/${p.slug}`);
  }, [router, p.slug]);
  const meta = p.oldProvince
    ? `${p.province} · ${t.formerProvince(p.oldProvince)}`
    : p.province;
  const size = compact ? 56 : 72;
  const img = imageUrl(p.thumbnail ?? p.image);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={displayName(p, locale)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.line },
        theme.shadow,
        pressed ? styles.pressed : null,
        style,
      ]}
    >
      {img ? (
        <Image
          source={{ uri: img }}
          style={[styles.thumb, { width: size, height: size }]}
          contentFit="cover"
          transition={200}
          recyclingKey={p.slug}
        />
      ) : (
        <View
          style={[
            styles.thumb,
            { width: size, height: size, backgroundColor: theme.primarySoft, alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Ionicons name="flower-outline" size={26} color={theme.primaryText} />
        </View>
      )}
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <AppText variant="h3" numberOfLines={1} style={{ flex: 1 }}>
            {displayName(p, locale)}
          </AppText>
          {distanceKm !== undefined ? (
            <AppText variant="caption" tone="jade" weight={700}>
              {t.kmAway(distanceKm)}
            </AppText>
          ) : null}
        </View>
        <AppText variant="caption" tone="text2" numberOfLines={1}>
          {t.typeLabels[siteType(p.name)]} · {meta}
        </AppText>
        {!compact ? (
          <AppText variant="bodyS" tone="text2" numberOfLines={2} style={{ marginTop: 4 }}>
            {describe(p, locale)}
          </AppText>
        ) : null}
        {!compact && hasDetails(p.slug) ? (
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            <Tag label={t.detailedArticle} icon="book-outline" />
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.text3} />
    </Pressable>
  );
}

export function PagodaTile({ p, width = 168 }: { p: Pagoda; width?: number }) {
  const { theme, locale, t } = useSettings();
  const router = useRouter();
  const img = imageUrl(p.image ?? p.thumbnail);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={displayName(p, locale)}
      onPress={() => {
        haptics.tap();
        router.push(`/chua/${p.slug}`);
      }}
      style={({ pressed }) => [
        styles.tile,
        { width, backgroundColor: theme.card, borderColor: theme.line },
        theme.shadow,
        pressed ? styles.pressed : null,
      ]}
    >
      {img ? (
        <Image
          source={{ uri: img }}
          style={styles.tileImage}
          contentFit="cover"
          transition={200}
          recyclingKey={p.slug}
        />
      ) : (
        <View
          style={[styles.tileImage, { backgroundColor: theme.primarySoft, alignItems: "center", justifyContent: "center" }]}
        >
          <Ionicons name="flower-outline" size={30} color={theme.primaryText} />
        </View>
      )}
      <View style={{ padding: 12, gap: 2 }}>
        <AppText variant="h3" numberOfLines={2} style={{ minHeight: 44 }}>
          {displayName(p, locale)}
        </AppText>
        <AppText variant="caption" tone="text2" numberOfLines={1}>
          {t.typeLabels[siteType(p.name)]} · {p.province}
        </AppText>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.screen,
    paddingTop: 10,
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: space.screen,
    marginTop: 22,
    marginBottom: 12,
  },
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: 16,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  gold: {
    borderRadius: radius.hero,
    padding: 20,
    overflow: "hidden",
  },
  goldOrb: {
    position: "absolute",
    right: -40,
    top: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  goldOrb2: {
    position: "absolute",
    left: -30,
    bottom: -60,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 18,
    borderRadius: radius.button,
  },
  buttonSm: { height: 36, paddingHorizontal: 12, borderRadius: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.chip,
    borderWidth: 1,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 36,
    paddingHorizontal: 6,
    borderRadius: 11,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 7,
  },
  quick: { width: "25%", alignItems: "center", gap: 8, paddingVertical: 6 },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  quickBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    paddingHorizontal: 5,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
  },
  listIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: { alignItems: "center", gap: 8, paddingVertical: 40, paddingHorizontal: 24 },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginHorizontal: space.screen,
    marginBottom: 10,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  thumb: { borderRadius: radius.thumb },
  rowBody: { flex: 1, gap: 2 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  tile: {
    borderRadius: radius.card,
    borderWidth: 1,
    overflow: "hidden",
  },
  tileImage: { width: "100%", height: 110 },
});
