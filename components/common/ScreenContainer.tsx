import React from 'react';
import { StatusBar, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function ScreenContainer({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 16,
      }}
    >
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {children}
    </View>
  );
}
