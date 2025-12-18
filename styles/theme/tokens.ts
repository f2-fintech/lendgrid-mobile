// styles/theme/tokens.ts
export const COLORS = {
  brandBg: "#0F1F3A",
  brandAccent: "#FFD700",

  primary: "#1E90FF",

  // text
  textPrimaryDark: "#FFFFFF",
  textSecondaryDark: "#B8C5D6",
  textMuted: "rgba(255,255,255,0.7)",

  textPrimaryLight: "#1E1E1E",
  textSecondaryLight: "#4B5563",

  // surfaces
  surfaceDark: "#0F1F3A",
  surfaceVariantDark: "#1A2B45",

  surfaceLight: "#FFFFFF",
  surfaceVariantLight: "#F5F3FF",

  borderDark: "#2E3A4A",
  borderLight: "#E0E0E0",

  tabsBgDark: "#0B1A2F",
  tabInactiveBgDark: "#13253F",
  tabInactiveTextDark: "#9FB3C8",

  tabActiveBg: "#1E90FF",
  tabActiveText: "#FFFFFF",

  // (optional for light theme if you want later)
  tabsBgLight: "#EEF2FF",
  tabInactiveBgLight: "#E5E7EB",
  tabInactiveTextLight: "#4B5563",
};

export const TYPOGRAPHY = {
  h1: { fontSize: 36, lineHeight: 44, fontWeight: "700" },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: "700" },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" },

  body: { fontSize: 14, lineHeight: 20, fontWeight: "400" },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: "400" },

  button: { fontSize: 15, fontWeight: "600" },
};

export const SIZES = {
  logo: 150,
  icon: 80,
};

export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 12,
};

export const SPACING = (n: number) => n * 8;
