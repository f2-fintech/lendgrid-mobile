import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import { COLORS } from "./tokens";

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // ── Core brand ──────────────────────────────────────────
    primary: COLORS.primary,            // Indigo-500 #6366F1
    secondary: "#7C3AED",               // Violet-600 — richer in light mode
    tertiary: COLORS.brandAccent,       // Amber-gold

    // ── Backgrounds & surfaces ───────────────────────────────
    background: "#F9F9FB",              // Very slightly warm off-white (not stark white)
    surface: COLORS.surfaceLight,       // Pure white cards
    surfaceVariant: COLORS.surfaceVariantLight, // #F4F4F6 — input backgrounds

    // ── Text ────────────────────────────────────────────────
    onPrimary: "#FFFFFF",
    onSurface: COLORS.textPrimaryLight,         // #18181B
    onSurfaceVariant: COLORS.textSecondaryLight, // #52525B

    // ── Borders & disabled ──────────────────────────────────
    outline: COLORS.borderLight,                // #E4E4E7
    outlineVariant: "#EBEBEF",
    surfaceDisabled: "rgba(0,0,0,0.04)",
    onSurfaceDisabled: "rgba(0,0,0,0.28)",

    // ── Tab bar ─────────────────────────────────────────────
    tabsBg: COLORS.tabsBgLight,
    tabInactiveBg: COLORS.tabInactiveBgLight,
    tabInactiveText: COLORS.tabInactiveTextLight,
    tabActiveBg: COLORS.tabActiveBg,
    tabActiveText: COLORS.tabActiveText,
  },
  roundness: 12,
};

export default lightTheme;
