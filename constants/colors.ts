export const Colors = {
  bg: {
    primary: "#09160a",
    secondary: "#162315",
    card: "#202d1f",
    elevated: "#2a3829",
    low: "#121f11",
    lowest: "#051105",
  },
  accent: {
    primary: "#c8813a",
    light: "#ffb876",
    glow: "rgba(200, 129, 58, 0.15)",
    onPrimary: "#422200",
  },
  text: {
    primary: "#d7e7d1",
    secondary: "#d7c3b3",
    muted: "#a08d7f",
  },
  border: "#524438",
  borderSoft: "rgba(212, 232, 212, 0.1)",
  tertiary: "#fcba65",
  tertiaryFixed: "#ffddb7",
  tertiaryContainer: "#c08536",
  secondary: "#aecfa8",
  secondaryContainer: "#314e30",
  glassPanel: "rgba(30, 58, 30, 0.4)",
  chatBubbleEmber: "#1e3a1e",
  chatBubbleUser: "#314e30",
} as const;

export type ColorPalette = typeof Colors;
