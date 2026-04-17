import { ROUTES } from "@/assets/constants/routes";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ====================== AUTH GUARD ======================
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
      setIsVerifying(false);
    };
    checkAuth();
  }, []);

  // ====================== DYNAMIC BASE URL ======================
  const getBaseUrl = () => {
    if (__DEV__) return "http://localhost:3000";
    return "https://lendgrid.in";
  };

  // ====================== SHARE FUNCTION ======================
  const handleShare = async () => {
    try {
      const companyIdStr = await AsyncStorage.getItem("companyId");
      if (!companyIdStr) {
        Alert.alert(
          "Error",
          "Could not identify your company. Please try logging in again.",
        );
        return;
      }

      const companyId = Number(companyIdStr);
      const BASE_URL = getBaseUrl();
      const shareUrl = `${BASE_URL}/apply?company_id=${companyId}&source=mobile`;

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

  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  const handleLogout = async () => {
    hideLogoutDialog();
    try {
      await AsyncStorage.multiRemove(["token", "user", "companyId"]);
      setGraphqlAuthToken(null);
      dispatch(updateField({ key: "username", value: "" }));
      dispatch(updateField({ key: "email", value: "" }));

      // Use replace to reset the navigation stack
      router.replace("/(auth)/signin");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  // Guard: Show nothing or a loader while checking token
  if (isVerifying) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Guard: Redirect if not logged in
  if (!isAuthenticated) {
    return <Redirect href={ROUTES.signin} />;
  }

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

  return (
    <>
      <Portal>
        <Dialog
          visible={logoutVisible}
          onDismiss={hideLogoutDialog}
          style={{ borderRadius: 16, backgroundColor: theme.colors.surface }}
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

      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
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
            headerRight: () => <AppsHeaderRight />,
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
