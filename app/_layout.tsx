import { Stack } from 'expo-router';
import React from 'react';
import 'react-native-gesture-handler';
import AppProviders from '../redux/providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
