import { Platform, StatusBar, StyleSheet } from 'react-native';

const ANDROID_FALLBACK = 24;
export const TOP_INSET = Platform.select({
  android: StatusBar.currentHeight ?? ANDROID_FALLBACK,
  ios: 44,
  default: 0,
});

export const lendGridStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F1F3A' },

  contentSection: {
    backgroundColor: '#0F1F3A',
    paddingTop: 1,    
  },

  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
    backgroundColor: '#0F1F3A',
    marginTop: 2,
    elevation: 0,
  },

  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 44,
  },
  heroTitleSmall: {
    fontSize: 24,
    lineHeight: 32,
  },

  heroSubtitle: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  heroSubtitleSmall: {
    fontSize: 13,
    lineHeight: 18,
  },

  logoWrapper: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  logo: {
    width: 200,
    height: 60,
  },

  buttonContainer: {
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    minHeight: 44,
    maxWidth: 280,
    width: '40%',
  },
  primaryButtonSmall: {
    minHeight: 40,
    maxWidth: 240,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonLabelSmall: { fontSize: 14 },
  buttonContent: {
    flexDirection: 'row-reverse',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    padding: 24,
    backgroundColor: '#0F1F3A',
    marginTop: 2,
    elevation: 0,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  sectionTitleCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  sectionSubtitleCompact: {
    fontSize: 13,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 14,   
  },

  joinActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 14,   
  },

  secondaryButton: {
    borderRadius: 10,
    minHeight: 44,
    maxWidth: 280,
    width: '40%',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  secondaryButtonSmall: {
    minHeight: 40,
    maxWidth: 240,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  benefitCard: {
    backgroundColor: '#1A2B45',
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 4,
  },
  benefitItem: { flexDirection: 'row', gap: 12 },
  benefitText: { flex: 1 },
  benefitItemTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  benefitItemDesc: { fontSize: 13, color: '#B8C5D6', lineHeight: 18 },

  painPointsContainer: { marginTop: 24, gap: 16 },
  painPointCard: { backgroundColor: '#1A2B45', borderRadius: 8, marginBottom: 16 },
  painPointHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  painPointTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  painPointSubtitle: { fontSize: 14, color: '#B8C5D6', marginBottom: 12 },
  painPointList: { gap: 8 },
  painPointItem: { fontSize: 14, color: '#FFFFFF', lineHeight: 22 },

  solutionSection: { padding: 24, backgroundColor: '#0F1F3A', marginTop: 2, elevation: 0 },
  solutionGrid: { marginTop: 24, gap: 12 },
  solutionCard: { backgroundColor: '#1A2B45', borderRadius: 8 },
  solutionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  solutionDesc: { fontSize: 14, color: '#B8C5D6', lineHeight: 20 },

  testimonialsContainer: { gap: 16 },
  testimonialCard: { backgroundColor: '#1A2B45', borderRadius: 12, marginBottom: 16 },
  testimonialHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testimonialInfo: { flex: 1 },
  testimonialName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  testimonialRole: { fontSize: 14, color: '#B8C5D6', marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', gap: 2 },
  testimonialText: { fontSize: 15, color: '#B8C5D6', lineHeight: 22, fontStyle: 'italic' },

  footer: { height: 30, backgroundColor: '#0F1F3A' },

  headerShell: {
    backgroundColor: '#0F1F3A',
  },

  themeBar: {
    backgroundColor: '#0F1F3A',
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },

  themeToggleButton: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
