import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import AppProviders from "@/redux/providers";
import { ApolloProvider } from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setGraphqlAuthToken(token || null);
      } catch {
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
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tab)" />
            <Stack.Screen
              name="create-application"
              options={{ headerShown: true }}
            />
          </Stack>
        </AppProviders>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
