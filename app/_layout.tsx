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
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StatusBar, View, useColorScheme } from "react-native";

import { updatePushTokenApi } from "@/apis/modules/auth.api";
import { useAppDispatch } from "@/hooks/lightDark";
import { setTheme } from "@/redux/features/themeSlice";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Prevent the splash screen from hiding while we load auth and assets
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const normalizeTicketId = (value: any) => {
  if (value === null || value === undefined) return "";
  const match = String(value).match(/\d+/);
  return match?.[0] ?? "";
};

const getNotificationTicketId = (data: any) => {
  const directTicketId = normalizeTicketId(
    data?.ticketId ?? data?.ticketNo ?? data?.ticketNumber ?? data?.ticket_id,
  );
  if (directTicketId) return directTicketId;

  return normalizeTicketId(data?.actionUrl);
};

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

function RootNavigation({
  persistedTheme,
  colorScheme,
  onReady,
}: {
  persistedTheme: "light" | "dark" | null;
  colorScheme: "light" | "dark" | null | undefined;
  onReady: () => void;
}) {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const themeToSet = persistedTheme || colorScheme || "light";
    dispatch(setTheme(themeToSet as "light" | "dark"));

    // Wait exactly 1 frame to ensure Redux has distributed the dark theme
    requestAnimationFrame(() => {
      setReady(true);
      onReady();
    });
  }, [colorScheme, dispatch, onReady, persistedTheme]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="create-application" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [booted, setBooted] = useState(false);
  const colorScheme = useColorScheme();
  const [persistedTheme, setPersistedTheme] = useState<"light" | "dark" | null>(
    null,
  );
  const router = useRouter();
  const handleNavigationReady = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

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
        const savedTheme = await AsyncStorage.getItem("themeMode");
        if (savedTheme === "dark" || savedTheme === "light") {
          if (alive) setPersistedTheme(savedTheme as "light" | "dark");
        }

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
        const ticketId = getNotificationTicketId(data);

        if (ticketId || webPath.toLowerCase().includes("ticket")) {
          router.push({
            pathname: "/tickets" as any,
            params: {
              ...(ticketId ? { ticketId, openTicket: "1" } : {}),
              navId: String(Date.now()),
            },
          } as any);
        } else if (webPath) {
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
  }, [router]);

  if (!booted) {
    const activeTheme = persistedTheme || colorScheme || "light";
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: activeTheme === "dark" ? "#0A1628" : "#FFFFFF",
        }}
      >
        <StatusBar
          barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={activeTheme === "dark" ? "#0A1628" : "#FFFFFF"}
        />
      </View>
    );
  }

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <RootNavigation
            persistedTheme={persistedTheme}
            colorScheme={colorScheme}
            onReady={handleNavigationReady}
          />
        </AppProviders>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
