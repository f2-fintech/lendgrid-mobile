// app/_layout.tsx
import AppProviders from "@/redux/providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

// Create a single client instance (outside component)
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tab)" />
        </Stack>
      </AppProviders>
    </QueryClientProvider>
  );
}
