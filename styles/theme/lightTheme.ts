import { MD3LightTheme as DefaultTheme } from "react-native-paper";
import { COLORS } from "./tokens";

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    primary: COLORS.brandBg,
    secondary: "#B19CD9",

    background: COLORS.surfaceLight,
    surface: COLORS.surfaceLight,
    surfaceVariant: COLORS.surfaceVariantLight,

    tertiary: COLORS.brandAccent,

    onSurface: COLORS.textPrimaryLight,
    onSurfaceVariant: COLORS.textSecondaryLight,

    outline: COLORS.borderLight,
    surfaceDisabled: "rgba(0,0,0,0.05)",

    tabsBg: COLORS.tabsBgLight,
    tabInactiveBg: COLORS.tabInactiveBgLight,
    tabInactiveText: COLORS.tabInactiveTextLight,
    tabActiveBg: COLORS.tabsBgDark,
    tabActiveText: COLORS.tabActiveText,
  },
  roundness: 10,
};

export default lightTheme;
