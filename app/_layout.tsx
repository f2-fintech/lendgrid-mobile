import AppProviders from "@/redux/providers";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />     
        <Stack.Screen name="(tab)" />     
      </Stack>
    </AppProviders>
  );
}
