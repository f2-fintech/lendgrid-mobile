import { StyleSheet } from 'react-native';
import { COLORS } from './theme/components/tokens';

export const globalStyles = StyleSheet.create({
  screenCenter: {
    flex: 1,
    backgroundColor: COLORS.brandBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textMuted: {
    color: COLORS.textMuted,
  },
});
