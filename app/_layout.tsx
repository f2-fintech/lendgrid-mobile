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

import * as Notifications from "expo-notifications";

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Request notification permission
  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Notification permission not granted");
        }
      } catch (err) {
        console.log("Failed to request notification permission", err);
      }
    };
    requestNotificationPermission();
  }, []);

  // Check Auth Session
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          setGraphqlAuthToken(token);
          if (alive) setHasToken(true);
        } else {
          setGraphqlAuthToken(null);
          if (alive) setHasToken(false);
        }
      } catch {
        setGraphqlAuthToken(null);
        if (alive) setHasToken(false);
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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <Stack screenOptions={{ headerShown: false }}>
            {/* If no token, the first thing the app shows is the index/auth flow */}
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
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
