// styles/theme/darkTheme.ts
import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';
import { COLORS } from './tokens';

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // CTA color (button, links etc.)
    primary: COLORS.primary,
    secondary: '#B19CD9',

    background: '#0A1628',
    surface: COLORS.surfaceDark,
    surfaceVariant: COLORS.surfaceVariantDark,

    tertiary: COLORS.brandAccent,

    onPrimary: COLORS.textPrimaryDark,
    onSurface: COLORS.textPrimaryDark,
    onSurfaceVariant: COLORS.textSecondaryDark,

    outline: COLORS.borderDark,
    surfaceDisabled: 'rgba(255,255,255,0.05)',
  },
  roundness: 10,
};

export default darkTheme;
