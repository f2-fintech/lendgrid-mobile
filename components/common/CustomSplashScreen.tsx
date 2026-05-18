// CustomSplashScreen.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

const LogoDark = require("@/assets/images/logo.png");
const LogoLight = require("@/assets/images/logo_blue.png");

type IconItem = { name: string; label: string };

type Props = {
  nextRoute?: string;
  iconDurationMs?: number;
  holdMs?: number;
  repeatCount?: number;
  sequence?: IconItem[];
};

const DEFAULT_SEQUENCE: IconItem[] = [
  { name: "account-cash", label: "Lending" },
  { name: "finance", label: "Growth" },
  { name: "lock-open-check", label: "Secured" },
];

export default function CustomSplashScreen({
  nextRoute = "/(tab)",
  iconDurationMs = 800,
  holdMs = 300,
  repeatCount = 1,
  sequence = DEFAULT_SEQUENCE,
}: Props) {
  const theme = useTheme();
  const logoSource = theme.dark ? LogoDark : LogoLight;

  // icon loop animation
  const iconAnim = useRef(new Animated.Value(0)).current;

  //  intro animations
  const logoDrop = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(0)).current;

  const [index, setIndex] = useState(0);
  const loopsDoneRef = useRef(0);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;

    const playIconLoop = () => {
      const playIcon = (i: number) => {
        if (isUnmountedRef.current) return;

        const half = Math.max(1, Math.floor(iconDurationMs / 2));

        const seq = Animated.sequence([
          Animated.timing(iconAnim, {
            toValue: 1,
            duration: half,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(holdMs),
          Animated.timing(iconAnim, {
            toValue: 0,
            duration: half,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]);

        seq.start(({ finished }) => {
          if (!finished || isUnmountedRef.current) return;

          const nextIdx = (i + 1) % sequence.length;

          if (nextIdx === 0) {
            loopsDoneRef.current += 1;
            if (loopsDoneRef.current >= Math.max(1, repeatCount)) {
              router.replace(nextRoute);
              return;
            }
          }

          setIndex(nextIdx);
          playIcon(nextIdx);
        });
      };

      setIndex(0);
      loopsDoneRef.current = 0;
      iconAnim.setValue(0);
      playIcon(0);
    };

    // intro first, then icon loop
    logoDrop.setValue(0);
    textSlide.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoDrop, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
    ]).start(({ finished }) => {
      if (!finished || isUnmountedRef.current) return;
      playIconLoop();
    });

    return () => {
      isUnmountedRef.current = true;
      iconAnim.stopAnimation();
      logoDrop.stopAnimation();
      textSlide.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    iconDurationMs,
    holdMs,
    repeatCount,
    nextRoute,
    JSON.stringify(sequence),
  ]);

  const current = sequence[index];

  const iconStyle = {
    opacity: iconAnim,
    transform: [
      {
        scale: iconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.15],
        }),
      },
    ],
  };

  const logoStyle = {
    opacity: logoDrop.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateY: logoDrop.interpolate({
          inputRange: [0, 1],
          outputRange: [-45, 0],
        }),
      },
    ],
  };

  const textStyle = {
    opacity: textSlide.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateX: textSlide.interpolate({
          inputRange: [0, 1],
          outputRange: [-60, 0],
        }),
      },
    ],
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      {/*  compact branding */}
      <View style={styles.brandWrap}>
        <Animated.Image
          source={logoSource}
          style={[styles.brandLogo, logoStyle]}
          resizeMode="contain"
        />
        <Animated.Text
          style={[styles.brandText, textStyle, { color: theme.colors.primary }]}
        >
          LendGrid
        </Animated.Text>
      </View>

      {/*  tighter gap to icon */}
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons
          name={current.name as any}
          size={80}
          color={theme.colors.primary}
        />
      </Animated.View>

      {/*  tighter gap to subtitle */}
      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        {current.label} Finance
      </Text>
    </View>
  );
}

/**  FULL STYLES (tighter spacing) */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  //  Reduced logo->text->icon gaps
  brandWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4, // tighter
  },
  brandLogo: {
    width: 130,
    height: 130,
    marginBottom: 0,
  },
  brandText: {
    fontWeight: "800",
    fontSize: 36,
    marginTop: -25,
  },

  iconContainer: {
    width: 100, // 80 + padding feel
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8, // tighter than before
  },

  subtitle: {
    fontSize: 18,
    marginTop: 4, // tighter
    height: 25,
  },
});
