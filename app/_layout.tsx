import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import AppProviders from "@/redux/providers";
import { ApolloProvider } from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { updatePushTokenApi } from "@/apis/modules/auth.api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient();

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  console.log("Is Device:", Device.isDevice);

  // 1. Create Channel FIRST (Essential for Android)
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // 2. Request Permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Please enable notifications in settings to receive updates!");
    return null;
  }

  console.log("Existing Permission:", existingStatus);
  console.log("Final Permission:", finalStatus);

  // 3. Get Token with CORRECT Project ID
  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "16608c42-65bc-47d0-9cca-f5158e848475",
      })
    ).data;
    console.log("🔥 PUSH TOKEN:", token); // CHECK THIS IN YOUR TERMINAL
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const router = useRouter();

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  // Add this inside RootLayout
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "LendGrid Notifications", // Visible name in Android settings
        importance: Notifications.AndroidImportance.MAX, // Wakes lock screen
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        enableVibrate: true,
        showBadge: true,
      });
    }
  }, []);

  useEffect(() => {
    let alive = true;

    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token && alive) {
          setGraphqlAuthToken(token);

          const [userType, authSource] = await Promise.all([
            AsyncStorage.getItem("userType"),
            AsyncStorage.getItem("authSource"),
          ]);
          const canSyncGraphqlPushToken =
            userType !== "sales" && authSource !== "oms";

          if (canSyncGraphqlPushToken) {
            const pushToken = await registerForPushNotificationsAsync();
            if (pushToken) {
              await updatePushTokenApi(pushToken);
            }
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (alive) setBooted(true);
      }
    };

    initAuth();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Foreground Notification:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification Tapped. Data received:", data);

        const webPath =
          typeof data?.actionUrl === "string" ? data.actionUrl : "";

        if (webPath) {
          // 1. Create a Mapping for Web -> Mobile routes
          // Add more cases here based on what your backend sends
          if (webPath.includes("/aggregator/applications")) {
            // Try the path without the group name
            router.push("/applications");
          } else if (webPath.includes("/some-other-web-route")) {
            // Make sure this matches a file name in your /app folder exactly
            router.push("/profile");
          } else {
            // Fallback: If no match, try pushing the path directly
            // or go to a general notifications list
            router.push("/notifications");
          }
        } else {
          router.push("/notifications");
        }
      });

    return () => {
      alive = false;
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
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
