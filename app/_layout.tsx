import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import AppProviders from "@/redux/providers";
import { ApolloProvider } from "@apollo/client/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Platform,
  StatusBar,
  Text as RNText,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useTheme } from "react-native-paper";

import { useAppDispatch } from "@/hooks/lightDark";
import { syncPushTokenForCurrentUser } from "@/lib/utils/pushSession";
import { decodeJwt } from "@/lib/utils/utils";
import { setTheme } from "@/redux/features/themeSlice";
import { ConfigProvider } from "@/contexts/ConfigContext";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    const token = await AsyncStorage.getItem("token");
    const shouldShow = !!token;

    return {
      shouldShowAlert: shouldShow,
      shouldShowBanner: shouldShow,
      shouldShowList: shouldShow,
      shouldPlaySound: shouldShow,
      shouldSetBadge: shouldShow,
    };
  },
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
  const router = useRouter();
  const params = useLocalSearchParams<{ backTo?: string }>();
  const theme = useTheme();
  const [ready, setReady] = useState(false);

  const openSidebarFromRoot = useCallback(() => {
    const targetRoute =
      typeof params.backTo === "string" && params.backTo.startsWith("/")
        ? params.backTo
        : "/dashboard";

    router.replace({
      pathname: targetRoute as any,
      params: { openDrawer: "1", backTo: targetRoute },
    });
  }, [params.backTo, router]);

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
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="create-application" options={{ headerShown: true }} />
      <Stack.Screen
        name="banker-list"
        options={{
          headerShown: true,
          title: "Banker Lists",
          headerTitle: () => (
            <RNText
              style={{
                color: theme.colors.onSurface,
                fontSize: 18,
                fontWeight: "700",
                marginLeft: 4,
              }}
            >
              Banker Lists
            </RNText>
          ),
          headerTitleAlign: "left",
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={openSidebarFromRoot}
              style={{
                marginLeft: -8,
                marginRight: 0,
                minWidth: 36,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={29}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          ),
        }}
      />
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
          const role = String(decodeJwt(token)?.role || "").toLowerCase();
          const normalizedUserType =
            role === "aggregator_member" ? "sales" : userType;
          const normalizedAuthSource =
            role === "aggregator_member" ? "oms" : authSource;

          if (role === "aggregator_member") {
            await AsyncStorage.multiSet([
              ["userType", "sales"],
              ["authSource", "oms"],
            ]);
          }

          const canSyncGraphqlPushToken =
            normalizedUserType !== "sales" && normalizedAuthSource !== "oms";

          if (canSyncGraphqlPushToken) {
            await syncPushTokenForCurrentUser();
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
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        const data = response.notification.request.content.data;
        console.log("Notification Tapped. Data received:", data);

        const token = await AsyncStorage.getItem("token");

        if (!token) return;

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
          } else if (webPath.includes("/aggregator/commission")) {
            router.push("/commissions");
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
          backgroundColor: activeTheme === "dark" ? "#111113" : "#FFFFFF",
        }}
      >
        <StatusBar
          barStyle={activeTheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={activeTheme === "dark" ? "#111113" : "#FFFFFF"}
        />
      </View>
    );
  }

  return (
    <ConfigProvider>
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
    </ConfigProvider>
  );
}
