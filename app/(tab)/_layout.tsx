import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useAppDispatch } from "@/hooks/lightDark";
import { updateField } from "@/redux/features/profileSlice";

// GraphQL auth
import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";

// shared header
import {
  AppsHeaderRight,
  NotificationBtn,
  NotificationsHeaderRight,
  ThemeToggleBtn,
} from "@/components/common/AppHeader";

export default function Layout() {
  const dispatch = useAppDispatch(); // This will work now because we've ensured the tree order
  const theme = useTheme();
  const router = useRouter();

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [userType, setUserType] = useState<string | null | undefined>(
    undefined,
  );

  const loadUserType = useCallback(async () => {
    const type = await AsyncStorage.getItem("userType");
    if (__DEV__) {
      console.log("Tab layout userType:", type);
    }
    setUserType(type);
  }, []);

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

  if (__DEV__) {
    console.log("[TAB LAYOUT] isSales:", isSales, "userType:", userType);
    console.log(
      "[TAB LAYOUT] Tab visibility config:",
      `dashboard=${isSales ? "hidden" : "visible"}, commissions=${isSales ? "hidden" : "visible"}, applications=visible, profile=${isSales ? "hidden" : "visible"}, notifications=hidden`,
    );
  }

  /** * NOTE: We removed isVerifying and isAuthenticated here.
   * Your RootLayout already handles the auth logic and
   * setGraphqlAuthToken. Let RootLayout be the "Source of Truth."
   */

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
      dispatch(updateField({ key: "username", value: "" }));
      dispatch(updateField({ key: "email", value: "" }));
      router.replace("/(auth)/signin");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Header Components
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
      <TouchableOpacity
        onPress={() => setLogoutVisible(true)}
        style={{ marginRight: 12 }}
      >
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
      onPress={() => router.replace(notificationBackRoute)}
      style={{ marginLeft: 15 }}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
    </TouchableOpacity>
  );

  const AppsHeaderRightWithLogout = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TouchableOpacity
        onPress={() => setLogoutVisible(true)}
        style={{ marginRight: 12 }}
        activeOpacity={0.8}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color={theme.colors.onSurface}
        />
      </TouchableOpacity>
      <AppsHeaderRight />
    </View>
  );

  return (
    <>
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
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          tabBarStyle: { backgroundColor: theme.colors.surface },
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
            headerRight: () =>
              isSales ? <AppsHeaderRightWithLogout /> : <AppsHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Feather name="file-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: isSales ? null : "/profile",
            headerRight: () => <ProfileHeaderRight />,
            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
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
