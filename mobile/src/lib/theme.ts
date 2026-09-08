export interface Theme {
  bg: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  header: string;
  headerText: string;
  chip: string;
  chipActive: string;
  chipText: string;
  chipActiveText: string;
  danger: string;
}

export const lightTheme: Theme = {
  bg: "#fafaf9",
  card: "#ffffff",
  border: "#e7e5e4",
  text: "#1c1917",
  muted: "#78716c",
  accent: "#b45309",
  accentText: "#ffffff",
  accentSoft: "#fef3c7",
  header: "#451a03",
  headerText: "#fde68a",
  chip: "#f5f5f4",
  chipActive: "#b45309",
  chipText: "#44403c",
  chipActiveText: "#ffffff",
  danger: "#b91c1c",
};

export const darkTheme: Theme = {
  bg: "#0c0a09",
  card: "#1c1917",
  border: "#292524",
  text: "#f5f5f4",
  muted: "#a8a29e",
  accent: "#f59e0b",
  accentText: "#1c1917",
  accentSoft: "#3b2a0a",
  header: "#1c1917",
  headerText: "#fde68a",
  chip: "#292524",
  chipActive: "#f59e0b",
  chipText: "#d6d3d1",
  chipActiveText: "#1c1917",
  danger: "#f87171",
};
