export const Colors = {
  bg: {
    primary: "#0D1A0D",
    secondary: "#142014",
    card: "#1E3A1E",
    elevated: "#243824",
  },
  accent: {
    primary: "#C8813A",
    light: "#E8A855",
    glow: "rgba(200, 129, 58, 0.15)",
  },
  text: {
    primary: "#E8F0E8",
    secondary: "#D4E8D4",
    muted: "#6A946A",
  },
  border: "#2A4A2A",
} as const;

export type ColorPalette = typeof Colors;
