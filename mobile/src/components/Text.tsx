import { Text, type TextProps, type TextStyle } from "react-native";
import { useSettings } from "@/lib/settings";

export type Weight = 400 | 500 | 600 | 700 | 800;

export const fontFamily: Record<Weight, string> = {
  400: "BeVietnamPro_400Regular",
  500: "BeVietnamPro_500Medium",
  600: "BeVietnamPro_600SemiBold",
  700: "BeVietnamPro_700Bold",
  800: "BeVietnamPro_800ExtraBold",
};

export function font(weight: Weight = 400): TextStyle {
  return { fontFamily: fontFamily[weight] };
}

export type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodyS"
  | "caption"
  | "overline";

const variants: Record<Variant, TextStyle> = {
  display: { fontSize: 32, lineHeight: 38, ...font(800), letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 30, ...font(700), letterSpacing: -0.3 },
  h2: { fontSize: 18, lineHeight: 24, ...font(700) },
  h3: { fontSize: 16, lineHeight: 22, ...font(600) },
  body: { fontSize: 15, lineHeight: 23, ...font(400) },
  bodyS: { fontSize: 13.5, lineHeight: 20, ...font(400) },
  caption: { fontSize: 12, lineHeight: 16, ...font(500) },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    ...font(700),
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
};

export type Tone =
  | "text"
  | "text2"
  | "text3"
  | "primary"
  | "onPrimary"
  | "lotus"
  | "jade"
  | "danger";

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  tone?: Tone;
  color?: string;
  center?: boolean;
}

export function AppText({
  variant = "body",
  weight,
  tone = "text",
  color,
  center,
  style,
  ...rest
}: Props) {
  const { theme } = useSettings();
  const toneColor: Record<Tone, string> = {
    text: theme.text,
    text2: theme.text2,
    text3: theme.text3,
    primary: theme.primaryText,
    onPrimary: theme.onPrimary,
    lotus: theme.lotus,
    jade: theme.jade,
    danger: theme.danger,
  };
  return (
    <Text
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        variants[variant],
        weight ? font(weight) : null,
        { color: color ?? toneColor[tone] },
        center ? { textAlign: "center" } : null,
        style,
      ]}
    />
  );
}
