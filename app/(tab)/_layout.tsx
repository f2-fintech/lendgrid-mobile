// app/(tab)/layout.tsx
import { ROUTES } from "@/assets/constants/routes";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, usePathname, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAppDispatch, useAppSelector } from "@/hooks/lightDark";
import { updateField } from "@/redux/features/profileSlice";
import { toggleTheme } from "@/redux/features/themeSlice";

// 🔹 GraphQL auth (HTTP + WS)
import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";

//  Notifications hook (stats mode here)
import { useNotifications } from "@/hooks/useNotifications";

export default function Layout() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [logoutVisible, setLogoutVisible] = useState(false);

  const [rangeVisible, setRangeVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"7" | "30" | "90">("30");

  //  UNREAD COUNT (REAL TIME) — stats mode
  const { meta } = useNotifications({ mode: "stats" });

  const unreadCount = meta?.unreadCount ?? 0;

  //  FIX: Hide red dot immediately when Notifications screen is OPEN
  // (not after back)
  const isOnNotifications = useMemo(() => {
    const p = String(pathname || "");
    return p.includes("/notifications") || p.endsWith("notifications");
  }, [pathname]);

  const hasUnreadNotifications = !isOnNotifications && unreadCount > 0;

  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  const showRangeDialog = () => setRangeVisible(true);
  const hideRangeDialog = () => setRangeVisible(false);

  const rangeLabel = useMemo(() => {
    if (selectedRange === "7") return " 7 Days";
    if (selectedRange === "90") return " 90 Days";
    return " 30 Days";
  }, [selectedRange]);

  // -----------------------------------------
  // LOGOUT
  // -----------------------------------------
  const handleLogout = async () => {
    hideLogoutDialog();

    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch {}

    // Clear GraphQL auth (HTTP + WS)
    setGraphqlAuthToken(null);

    // Clear profile data from Redux
    dispatch(updateField({ key: "username", value: "" }));
    dispatch(updateField({ key: "email", value: "" }));
    dispatch(updateField({ key: "phone", value: "" }));
    dispatch(updateField({ key: "companyName", value: "" }));
    dispatch(updateField({ key: "documents", value: {} }));

    router.replace(ROUTES.signin);
  };

  const ThemeToggleBtn = () => (
    <TouchableOpacity
      onPress={() => dispatch(toggleTheme())}
      style={{ marginRight: 15 }}
    >
      <Ionicons
        name={mode === "dark" ? "sunny-outline" : "moon-outline"}
        size={24}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );

  const NotificationBtn = () => (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      style={{ marginRight: 10 }}
      activeOpacity={0.8}
    >
      <View style={{ position: "relative" }}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme.colors.onSurface}
        />

        {/* 🔴 RED DOT INDICATOR */}
        {hasUnreadNotifications && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#EF4444",
              borderWidth: 2,
              borderColor: theme.colors.background,
              zIndex: 999,
              elevation: 10,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const DashboardHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const CommissionsHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={showRangeDialog}
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 10,
          backgroundColor: theme.colors.surfaceVariant,
          borderWidth: 1,
          borderColor: theme.colors.outline,
          marginRight: 10,
        }}
      >
        <Text style={{ color: theme.colors.onSurface, fontWeight: "600" }}>
          {rangeLabel}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={theme.colors.onSurfaceVariant}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>

      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const ApplicationsHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const ProfileHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity onPress={showLogoutDialog} style={{ marginRight: 12 }}>
        <Ionicons
          name="log-out-outline"
          size={24}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>

      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const NotificationsHeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ marginLeft: 15 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
    </TouchableOpacity>
  );

  const NotificationsHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
    </View>
  );

  return (
    <>
      {/* COMMISSIONS RANGE DIALOG */}
      <Portal>
        <Dialog
          visible={rangeVisible}
          onDismiss={hideRangeDialog}
          style={{
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Dialog.Title
            style={{
              fontWeight: "700",
              fontSize: 18,
              color: theme.colors.onSurface,
            }}
          >
            Select Range
          </Dialog.Title>

          <Dialog.Content>
            {[
              { id: "7" as const, label: "7 Days" },
              { id: "30" as const, label: "30 Days" },
              { id: "90" as const, label: "90 Days" },
            ].map((opt) => {
              const active = selectedRange === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    setSelectedRange(opt.id);
                    hideRangeDialog();
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderRadius: 12,
                    marginBottom: 8,
                    backgroundColor: active
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderWidth: 1,
                    borderColor: active
                      ? theme.colors.primary
                      : theme.colors.outline,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: active ? "700" : "600",
                      color: active
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurface,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Dialog.Content>

          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button mode="outlined" onPress={hideRangeDialog}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* LOGOUT DIALOG */}
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={hideLogoutDialog}
          style={{
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Dialog.Icon icon="logout" size={32} color={theme.colors.error} />

          <Dialog.Title
            style={{
              fontWeight: "700",
              textAlign: "center",
              fontSize: 20,
              color: theme.colors.onSurface,
            }}
          >
            Logout Confirmation
          </Dialog.Title>

          <Dialog.Content>
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Are you sure you want to log out?
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button
              mode="outlined"
              onPress={hideLogoutDialog}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
              style={{ flex: 1 }}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* TABS */}
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            headerRight: () => <DashboardHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="commissions"
          options={{
            title: "Commissions",
            headerRight: () => <CommissionsHeaderRight />,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="money" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="applications"
          options={{
            title: "Applications",
            headerRight: () => <ApplicationsHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="file-text" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerRight: () => <ProfileHeaderRight />,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            href: null,
            title: "Notifications",
            headerLeft: () => <NotificationsHeaderLeft />,
            headerRight: () => <NotificationsHeaderRight />,
          }}
        />
      </Tabs>
    </>
  );
}