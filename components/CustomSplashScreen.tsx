import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Text, View } from 'react-native';
import { Headline } from 'react-native-paper';

import { splashStyles as styles } from '../styles/theme/components/splash.styles';
import { COLORS } from '../styles/theme/components/tokens';

const LogoImage = require('../assets/images/logo.png');

type IconItem = { name: string; label: string };

type Props = {
  nextRoute?: string;
  iconDurationMs?: number;
  holdMs?: number;         
  repeatCount?: number;   
  sequence?: IconItem[];
};

const DEFAULT_SEQUENCE: IconItem[] = [
  { name: 'account-cash', label: 'Lending' },
  { name: 'finance', label: 'Growth' },
  { name: 'lock-open-check', label: 'Secured' }
];

export default function CustomSplashScreen({
  nextRoute = '/(tab)',
  iconDurationMs = 800,
  holdMs = 300,
  repeatCount = 1,
  sequence = DEFAULT_SEQUENCE
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);
  const loopsDoneRef = useRef(0);
  const isUnmountedRef = useRef(false);

  useEffect(() => {
    isUnmountedRef.current = false;

    const playIcon = (i: number) => {
      if (isUnmountedRef.current) return;

      // animate: fade/scale in → hold → fade/scale out
      const half = Math.max(1, Math.floor(iconDurationMs / 2));

      const seq = Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: half,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.delay(holdMs),
        Animated.timing(anim, {
          toValue: 0,
          duration: half,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true
        })
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

    playIcon(0);

    return () => {
      isUnmountedRef.current = true;
      anim.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iconDurationMs, holdMs, repeatCount, nextRoute, JSON.stringify(sequence)]);

  const current = sequence[index];

  const iconStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1.15]
        })
      }
    ]
  };

  return (
    <View style={styles.container}>
      <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
      <Headline style={styles.title}>LendGrid</Headline>

      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <MaterialCommunityIcons name={current.name as any} size={80} color={COLORS.brandAccent} />
      </Animated.View>

      <Text style={styles.subtitle}>{current.label} Finance</Text>
    </View>
  );
}
