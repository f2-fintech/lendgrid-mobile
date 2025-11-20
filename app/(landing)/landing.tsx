import { useRef } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from 'react-native-paper';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import LendGridSections from '@/components/ui/landing/landingSections';
import {
  lendGridStyles as styles,
  TOP_INSET,
} from '@/styles/components/landing/landingStyles';

import { useAppDispatch, useAppSelector } from '@/hooks/lightDark';
import { toggleTheme } from '@/redux/features/themeSlice';

const { width } = Dimensions.get('window');

export default function LandingScreen() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isSmallScreen = width <= 400;

  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const isDark = mode === 'dark';

  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentInsetAdjustmentBehavior="never"
        removeClippedSubviews={false}
      >
        {/* Sticky Header */}
        <View
          style={[
            styles.headerShell,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={{
              height: TOP_INSET || 0,
              backgroundColor: theme.colors.background,
            }}
          />

          {/* Theme Toggle Button */}
          <View
            style={[
              styles.themeBar,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <TouchableOpacity
              style={styles.themeToggleButton}
              onPress={() => dispatch(toggleTheme())}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
                size={22}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <LendGridSections isSmallScreen={isSmallScreen} />

        {/* Footer Space */}
        <View
          style={[
            styles.footer,
            { backgroundColor: theme.colors.background },
          ]}
        />
      </ScrollView>
    </View>
  );
}
