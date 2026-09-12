import type { ViewStyle } from "react-native";

export interface Theme {
  primary: string;
  primaryDark: string;
  primaryText: string;
  primarySoft: string;
  onPrimary: string;
  bg: string;
  card: string;
  cardAlt: string;
  line: string;
  text: string;
  text2: string;
  text3: string;
  lotus: string;
  lotusSoft: string;
  jade: string;
  jadeSoft: string;
  danger: string;
  dangerSoft: string;
  gradient: [string, string];
  tabBar: string;
  overlay: string;
  shadow: ViewStyle;
  shadowLg: ViewStyle;
}

export const radius = {
  chip: 999,
  button: 14,
  card: 20,
  sheet: 28,
  hero: 24,
  thumb: 14,
} as const;

export const space = {
  screen: 20,
  gap: 12,
} as const;

export const lightTheme: Theme = {
  primary: "#D4A017",
  primaryDark: "#B8860B",
  primaryText: "#8B6508",
  primarySoft: "#FEF3C7",
  onPrimary: "#FFFFFF",
  bg: "#FFFDF7",
  card: "#FFFFFF",
  cardAlt: "#FFFBEB",
  line: "#F1E7CF",
  text: "#2B1D0E",
  text2: "#6B5A45",
  text3: "#9C8C74",
  lotus: "#C2410C",
  lotusSoft: "#FFEDD5",
  jade: "#0F766E",
  jadeSoft: "#CCFBF1",
  danger: "#B91C1C",
  dangerSoft: "#FEE2E2",
  gradient: ["#D4A017", "#8B6508"],
  tabBar: "rgba(255,255,255,0.96)",
  overlay: "rgba(43,29,14,0.45)",
  shadow: {
    shadowColor: "#4A3505",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  shadowLg: {
    shadowColor: "#4A3505",
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const darkTheme: Theme = {
  primary: "#FCD34D",
  primaryDark: "#D4A017",
  primaryText: "#FCD34D",
  primarySoft: "#3A2E12",
  onPrimary: "#2B1D0E",
  bg: "#14110B",
  card: "#1E1912",
  cardAlt: "#241D13",
  line: "#2C251A",
  text: "#F5EEDC",
  text2: "#C9B995",
  text3: "#8A7A5E",
  lotus: "#F97316",
  lotusSoft: "#3B2113",
  jade: "#2DD4BF",
  jadeSoft: "#0F2E2B",
  danger: "#F87171",
  dangerSoft: "#3B1414",
  gradient: ["#B8860B", "#5C4308"],
  tabBar: "rgba(30,25,18,0.97)",
  overlay: "rgba(0,0,0,0.55)",
  shadow: { elevation: 0 },
  shadowLg: { elevation: 0 },
};
