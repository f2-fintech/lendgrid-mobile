import { useRef } from "react";
import { Dimensions, ScrollView, StatusBar, View } from "react-native";

import { useTheme } from "react-native-paper";

import LendGridSections from "@/components/ui/landing/landingSections";
import {
  lendGridStyles as styles
} from "@/styles/components/landing/landingStyles";

const { width } = Dimensions.get("window");

export default function LandingScreen() {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const isSmallScreen = width <= 400;

  const theme = useTheme();
  const isDark = theme.dark;

  const bgColor = "#15253fff";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentInsetAdjustmentBehavior="never"
        removeClippedSubviews={false}
        style={{ backgroundColor: bgColor }}
        contentContainerStyle={{ backgroundColor: bgColor }}
      >

        <View style={{ height: 50, }} />

        {/* MAIN CONTENT */}
        <LendGridSections isSmallScreen={isSmallScreen} />
      </ScrollView>
    </View>
  );
}
