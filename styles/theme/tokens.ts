// styles/theme/tokens.ts
// Dark mode: Warm Charcoal — Notion/Figma/Linear style
// Light mode: Clean white with subtle lavender tints
export const COLORS = {
  // ─────────────────────────────────────────────
  // Brand
  // ─────────────────────────────────────────────
  brandBg: "#1C1C1E",           // Warm charcoal (not cold navy)
  brandAccent: "#FFB547",       // Warm amber-gold accent (less garish than FFD700)

  // Primary CTA — Indigo violet, softer than the old #3238F3
  primary: "#6366F1",           // Indigo-500 — calm, premium, fintech-perfect

  // ─────────────────────────────────────────────
  // Dark mode text
  // ─────────────────────────────────────────────
  textPrimaryDark: "#FFFFFF",   // Pure white as requested
  textSecondaryDark: "#FFFFFF", // Also pure white
  textMuted: "rgba(255,255,255,0.85)",

  // ─────────────────────────────────────────────
  // Light mode text
  // ─────────────────────────────────────────────
  textPrimaryLight: "#18181B",  // Zinc-900
  textSecondaryLight: "#52525B", // Zinc-600

  // ─────────────────────────────────────────────
  // Dark mode surfaces  (warm charcoal layering)
  // ─────────────────────────────────────────────
  backgroundDark: "#111113",    // Deepest layer — true base (not black, not navy)
  surfaceDark: "#1C1C1F",       // Cards / sheets — warm dark charcoal
  surfaceVariantDark: "#26262B",// Elevated cards, input backgrounds
  surfaceElevatedDark: "#2E2E33", // Modals, popovers (highest layer)

  // ─────────────────────────────────────────────
  // Light mode surfaces
  // ─────────────────────────────────────────────
  surfaceLight: "#FFFFFF",
  surfaceVariantLight: "#F4F4F6", // Very subtle grey — not lavender-tinted

  // ─────────────────────────────────────────────
  // Borders
  // ─────────────────────────────────────────────
  borderDark: "rgba(255,255,255,0.08)",  // Subtle warm white border
  borderLight: "#E4E4E7",               // Zinc-200

  // ─────────────────────────────────────────────
  // Tab bar (dark)
  // ─────────────────────────────────────────────
  tabsBgDark: "#1C1C1F",          // Matches surface — pill floats on bg
  tabInactiveBgDark: "#26262B",   // Slightly lifted inactive zone
  tabInactiveTextDark: "rgba(255,255,255,0.85)", // White with slight opacity for inactive state

  // Tab bar (light)
  tabsBgLight: "#FFFFFF",
  tabInactiveBgLight: "#F4F4F6",
  tabInactiveTextLight: "#71717A",

  // Active tab
  tabActiveBg: "#6366F1",         // Indigo pill
  tabActiveText: "#FFFFFF",
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
  md: 12,
  lg: 16,
};

export const SPACING = (n: number) => n * 8;
