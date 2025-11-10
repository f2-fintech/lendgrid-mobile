import { Stack } from "expo-router";
import React from "react";
import "react-native-gesture-handler";
import AppProviders from "../redux/providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack screenOptions={{ headerShown: false }} />
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
