// app/_layout.tsx
import AppProviders from "@/redux/providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import { ApolloProvider } from "@apollo/client/react";

// single react-query client
const queryClient = new QueryClient();

export default function RootLayout() {
  // Boot gate: token MUST be set before ApolloProvider renders
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        // set token BEFORE app tree mounts (fixes WS auth + real-time)
        setGraphqlAuthToken(token || null);

        console.log("[ROOT] token bootstrap =>", token ? "SET" : "EMPTY");
      } catch (e) {
        console.warn("[ROOT] token bootstrap error =>", e);
        setGraphqlAuthToken(null);
      } finally {
        if (alive) setBooted(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!booted) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      {/* 🔹 1. Apollo outer */}
      <QueryClientProvider client={queryClient}>
        {/* 🔹 2. React Query */}
        <AppProviders>
          {/* 🔹 3. Redux / others */}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tab)" />
          </Stack>
        </AppProviders>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
