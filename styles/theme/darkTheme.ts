import { MD3DarkTheme as DefaultTheme } from "react-native-paper";
import { COLORS } from "./tokens";

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // ── Core brand ──────────────────────────────────────────
    primary: COLORS.primary,             // Indigo-500 #6366F1
    secondary: "#A78BFA",                // Violet-400 — warm purple complement
    tertiary: COLORS.brandAccent,        // Amber-gold

    // ── Backgrounds & surfaces ───────────────────────────────
    background: COLORS.backgroundDark,           // #111113 — deepest base
    surface: COLORS.surfaceDark,                 // #1C1C1F — cards/sheets
    surfaceVariant: COLORS.surfaceVariantDark,   // #26262B — inputs, elevated
    elevation: {
      level0: "transparent",
      level1: COLORS.surfaceDark,                // slight lift
      level2: COLORS.surfaceVariantDark,
      level3: COLORS.surfaceElevatedDark,        // modals
      level4: COLORS.surfaceElevatedDark,
      level5: COLORS.surfaceElevatedDark,
    },

    // ── Text ────────────────────────────────────────────────
    onPrimary: "#FFFFFF",
    onSurface: COLORS.textPrimaryDark,           // #F4F4F5
    onSurfaceVariant: COLORS.textSecondaryDark,  // #A1A1AA — warm muted

    // ── Borders & disabled ──────────────────────────────────
    outline: COLORS.borderDark,                  // rgba(255,255,255,0.08)
    outlineVariant: "rgba(255,255,255,0.05)",
    surfaceDisabled: "rgba(255,255,255,0.04)",
    onSurfaceDisabled: "rgba(255,255,255,0.28)",

    // ── Tab bar ─────────────────────────────────────────────
    tabsBg: COLORS.tabsBgDark,
    tabInactiveBg: COLORS.tabInactiveBgDark,
    tabInactiveText: COLORS.tabInactiveTextDark,
    tabActiveBg: COLORS.tabActiveBg,
    tabActiveText: COLORS.tabActiveText,
  },
  roundness: 12,
};

export default darkTheme;
