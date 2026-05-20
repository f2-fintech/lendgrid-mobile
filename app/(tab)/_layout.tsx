import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Dialog,
  Menu,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAppDispatch } from "@/hooks/lightDark";
import { updateField } from "@/redux/features/profileSlice";

// GraphQL auth
import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import {
  clearLocalNotifications,
  unregisterPushTokenForCurrentUser,
} from "@/lib/utils/pushSession";

// shared header
import {
  AppsHeaderRight,
  NotificationBtn,
  NotificationsHeaderRight,
  ThemeToggleBtn,
} from "@/components/common/AppHeader";

export default function Layout() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userType, setUserType] = useState<string | null | undefined>(
    undefined,
  );

  // --- AUTO SELECT COMPANY LOGIC ---
  const autoSelectCompany = useCallback(async () => {
    try {
      const currentCompanyId = await AsyncStorage.getItem("companyId");
      // If companyId isn't set, explicitly set it to 157 for "f2 fintech (lendgrid)"
      if (!currentCompanyId) {
        await AsyncStorage.multiSet([
          ["companyId", "157"],
          ["selectedCompanyId", "157"],
        ]);
      }
    } catch (error) {
      console.error("Failed to auto-select company:", error);
    }
  }, []);

  const loadUserType = useCallback(async () => {
    // Ensure company is auto-selected before or while loading user type
    await autoSelectCompany();
    const type = await AsyncStorage.getItem("userType");
    setUserType(type);
  }, [autoSelectCompany]);

  useEffect(() => {
    loadUserType();
  }, [loadUserType]);

  useFocusEffect(
    useCallback(() => {
      loadUserType();
    }, [loadUserType]),
  );

  if (userType === undefined) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isSales = userType === "sales";
  const notificationBackRoute = isSales ? "/applications" : "/dashboard";

  const getBaseUrl = () => {
    if (__DEV__) return "http://localhost:3000";
    return "https://lendgrid.in";
  };

  const handleShare = async () => {
    try {
      const companyIdStr = await AsyncStorage.getItem("companyId");
      if (!companyIdStr) {
        Alert.alert("Error", "Could not identify company. Log in again.");
        return;
      }
      const shareUrl = `${getBaseUrl()}/apply?company_id=${Number(companyIdStr)}&source=mobile`;

      await Share.share({
        message: `Apply for a loan with me!\n\n${shareUrl}`,
        url: shareUrl,
        title: "Loan Application Link",
      });
    } catch (err: any) {
      if (err.message !== "User cancelled the share") {
        Alert.alert("Error", "Failed to share the link.");
      }
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);
    try {
      await unregisterPushTokenForCurrentUser();
      await clearLocalNotifications();
      await AsyncStorage.multiRemove([
        "token",
        "user",
        "companyId",
        "userType",
        "userId",
        "authSource",
        "selectedCompanyId",
        "selectedAggregatorId",
      ]);
      setGraphqlAuthToken(null);
      await apolloClient.clearStore();
      dispatch(updateField({ key: "username", value: "" }));
      dispatch(updateField({ key: "email", value: "" }));
      router.replace("/(auth)/signin");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // --- HEADER COMPONENTS ---
  const DashboardHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <TouchableOpacity onPress={handleShare} activeOpacity={0.8}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <Feather name="share-2" size={18} color="#ffffff" />
        </View>
      </TouchableOpacity>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const CommissionsHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const ProfileHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  const NotificationsHeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.replace(notificationBackRoute)}
      style={{ marginLeft: 15 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
    </TouchableOpacity>
  );

  const GlobalMenu = () => (
    <Menu
      visible={sidebarVisible}
      onDismiss={() => setSidebarVisible(false)}
      anchor={
        <TouchableOpacity
          onPress={() => setSidebarVisible(true)}
          style={{
            marginLeft: 14,
            padding: 8,
          }}
          activeOpacity={0.8}
        >
          <Feather name="menu" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      }
    >
      <Menu.Item
        leadingIcon="database"
        title="Data"
        onPress={() => {
          setSidebarVisible(false);
          router.push("/data");
        }}
      />
      <Menu.Item
        leadingIcon="logout"
        title="Logout"
        onPress={() => {
          setSidebarVisible(false);
          setLogoutVisible(true);
        }}
      />
    </Menu>
  );

  return (
    <>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={() => setLogoutVisible(false)}
          style={{ borderRadius: 16 }}
        >
          <Dialog.Icon icon="logout" size={32} color={theme.colors.error} />
          <Dialog.Title style={{ fontWeight: "700", textAlign: "center" }}>
            Logout Confirmation
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ textAlign: "center" }}>
              Are you sure you want to log out?
            </Text>
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button
              mode="outlined"
              onPress={() => setLogoutVisible(false)}
              style={{ flex: 1, marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor={theme.colors.error}
              style={{ flex: 1 }}
            >
              Logout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Tabs
        initialRouteName={isSales ? "applications" : "dashboard"}
        backBehavior="history"
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          tabBarStyle: { backgroundColor: theme.colors.surface },
          headerLeft: () => <GlobalMenu />,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            href: isSales ? null : "/dashboard",
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
            href: isSales ? null : "/commissions",
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
            href: "/applications",
            headerRight: () => <AppsHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="file-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Tickets",
            href: isSales ? "/tickets" : null,
            headerRight: () => <AppsHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="clipboard" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: "/profile",
            headerRight: () => <ProfileHeaderRight />,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="data"
          options={{
            title: "Data",
            href: null,
            headerRight: () => <ThemeToggleBtn />,
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            href: null,
            headerLeft: () => <NotificationsHeaderLeft />,
            headerRight: () => <NotificationsHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="notifications-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
