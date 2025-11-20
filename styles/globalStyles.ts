// globalStyles.ts
import { StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from './theme/tokens';

export const globalStyles = StyleSheet.create({
  screenCenter: {
    flex: 1,
    backgroundColor: COLORS.brandBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textMuted: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
});
