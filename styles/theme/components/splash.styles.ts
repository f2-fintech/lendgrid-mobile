import { StyleSheet } from 'react-native';
import { COLORS, SIZES, SPACING } from './tokens';

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.brandBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: SIZES.logo,
    height: SIZES.logo,
    marginBottom: SPACING(2.5), 
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.brandAccent,
    marginBottom: SPACING(1.25), 
    paddingVertical: 5, 
  },
  iconContainer: {
    width: SIZES.icon + 20,
    height: SIZES.icon + 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING(2.5),
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    color: COLORS.textMuted,
    marginTop: SPACING(1.25),
    height: 25,
  },
});
