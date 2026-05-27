import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, useFocusEffect, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Linking,
  Pressable,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { useAppDispatch } from "@/hooks/lightDark";
import { updateField } from "@/redux/features/profileSlice";
import { RootState } from "@/redux/store";

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
import { decodeJwt } from "@/lib/utils/utils";

type DrawerRoute =
  // | "/data"
  | "/training-resources"
  | "/saas-products"
  | "/loan-products"
  | "/emi-calculator"
  | "/banker-list"
  | "/help-support"
  | "external-cibil-score"
  | "external-eligibility";

type DrawerItem = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  route: DrawerRoute;
};

const DRAWER_ITEMS: DrawerItem[] = [
  // { icon: "database", label: "Data", route: "/data" },
  {
    icon: "book-open",
    label: "Training and Resources",
    route: "/training-resources",
  },
  { icon: "grid", label: "SAAS Products", route: "/saas-products" },
  { icon: "credit-card", label: "Loan Products", route: "/loan-products" },
  {
    icon: "percent",
    label: "EMI Calculator",
    route: "/emi-calculator",
  },
  { icon: "users", label: "Banker Lists", route: "/banker-list" },
  {
    icon: "file-text",
    label: "Check CIBIL Score & Report",
    route: "external-cibil-score",
  },
  {
    icon: "shield",
    label: "Check Eligibility",
    route: "external-eligibility",
  },
  { icon: "help-circle", label: "Help Support", route: "/help-support" },
];

const firstDefined = (...values: any[]) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const formatRoleLabel = (role: string) =>
  role
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatDisplayName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export default function Layout() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const profile = useSelector((state: RootState) => state.profile);
  const drawerProgress = useRef(new Animated.Value(0)).current;

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [pendingDrawerRoute, setPendingDrawerRoute] =
    useState<DrawerRoute | null>(null);
  const [storedProfile, setStoredProfile] = useState<{
    name: string;
    companyName: string;
    email: string;
    photoUrl: string | null;
    role: string;
  }>({ name: "", companyName: "", email: "", photoUrl: null, role: "" });
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

  const closeDrawer = useCallback(() => {
    setPendingDrawerRoute(null);
    setSidebarVisible(false);
  }, []);

  useEffect(() => {
    loadUserType();
  }, [loadUserType]);

  useFocusEffect(
    useCallback(() => {
      loadUserType();
    }, [loadUserType]),
  );

  const loadDrawerProfile = useCallback(async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("token"),
        AsyncStorage.getItem("user"),
      ]);
      const claims = decodeJwt(storedToken);
      let parsedUser: any = null;

      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }

      const role = String(
        firstDefined(
          claims?.role,
          claims?.user?.role,
          claims?.data?.role,
          parsedUser?.role,
          "",
        ),
      ).toLowerCase();

      setStoredProfile({
        name: String(
          firstDefined(
            profile.username,
            (profile as any).firstName &&
              `${(profile as any).firstName} ${(profile as any).lastName || ""}`,
            claims?.username,
            claims?.name,
            claims?.fullName,
            claims?.user?.username,
            claims?.user?.name,
            parsedUser?.username,
            parsedUser?.name,
            "LendGrid User",
          ),
        ).trim(),
        companyName: String(
          firstDefined(
            claims?.registeredCompanyName,
            claims?.registered_company_name,
            claims?.companyName,
            claims?.company_name,
            claims?.company?.registeredCompanyName,
            claims?.company?.companyName,
            claims?.company?.company_name,
            claims?.company?.name,
            claims?.user?.registeredCompanyName,
            claims?.user?.companyName,
            claims?.user?.company_name,
            claims?.data?.registeredCompanyName,
            claims?.data?.companyName,
            claims?.data?.company_name,
            claims?.tenant?.companyName,
            parsedUser?.registeredCompanyName,
            parsedUser?.companyName,
            parsedUser?.company_name,
            profile.companyName,
            "",
          ),
        ).trim(),
        email: String(
          firstDefined(
            profile.email,
            claims?.email,
            claims?.user?.email,
            parsedUser?.email,
            "user@lendgrid.in",
          ),
        ),
        photoUrl: firstDefined(
          profile.photoUrl,
          (profile as any).avatar?.uri,
          (profile as any).avatar,
          claims?.photoUrl,
          claims?.avatar?.uri,
          claims?.avatar,
          claims?.user?.photoUrl,
          claims?.user?.avatar?.uri,
          claims?.user?.avatar,
          claims?.data?.photoUrl,
          claims?.data?.avatar?.uri,
          claims?.data?.avatar,
          parsedUser?.photoUrl,
          parsedUser?.avatar?.uri,
          parsedUser?.avatar,
          null,
        ),
        role,
      });
    } catch {
      setStoredProfile({
        name: profile.username || "LendGrid User",
        companyName: profile.companyName || "",
        email: profile.email || "user@lendgrid.in",
        photoUrl:
          profile.photoUrl ||
          (profile as any).avatar?.uri ||
          (profile as any).avatar ||
          null,
        role: "",
      });
    }
  }, [profile]);

  useEffect(() => {
    loadDrawerProfile();
  }, [loadDrawerProfile]);

  useFocusEffect(
    useCallback(() => {
      loadDrawerProfile();
    }, [loadDrawerProfile]),
  );

  const avatarInitial = useMemo(
    () => (storedProfile.name || "L").trim().charAt(0).toUpperCase(),
    [storedProfile.name],
  );

  useEffect(() => {
    if (!drawerMounted) return;

    Animated.timing(drawerProgress, {
      toValue: sidebarVisible ? 1 : 0,
      duration: sidebarVisible ? 220 : 180,
      easing: sidebarVisible
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !sidebarVisible) {
        setDrawerMounted(false);
      }
    });
  }, [drawerMounted, drawerProgress, sidebarVisible]);

  useEffect(() => {
    if (!pendingDrawerRoute || pathname !== pendingDrawerRoute) return;

    closeDrawer();
  }, [closeDrawer, pathname, pendingDrawerRoute]);

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
  const drawerWidth = width;
  const drawerTranslateX = drawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });
  const showCompanyName =
    storedProfile.role === "aggregator_admin" && !!storedProfile.companyName;
  const roleLabel = formatRoleLabel(storedProfile.role);
  const companyDisplayName = formatDisplayName(storedProfile.companyName);
  const userDisplayName = formatDisplayName(storedProfile.name);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

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

  const openDrawer = () => {
    setPendingDrawerRoute(null);
    drawerProgress.setValue(0);
    setDrawerMounted(true);
    setSidebarVisible(true);
  };

  const navigateFromDrawer = (route: DrawerRoute) => {
    if (route === "external-cibil-score") {
      closeDrawer();
      Linking.openURL("https://f2fintech.com/check-cibil-score").catch(
        () => {},
      );
      return;
    }

    if (route === "external-eligibility") {
      closeDrawer();
      Linking.openURL("https://finwise-eligibility.netlify.app/").catch(
        () => {},
      );
      return;
    }

    if (route === pathname) {
      closeDrawer();
      return;
    }

    setPendingDrawerRoute(route);
    router.push(route as any);
  };

  const GlobalMenu = () => (
    <TouchableOpacity
      onPress={openDrawer}
      style={{
        marginLeft: 14,
        padding: 8,
      }}
      activeOpacity={0.8}
    >
      <Feather name="menu" size={24} color={theme.colors.onSurface} />
    </TouchableOpacity>
  );

  const Drawer = () => (
    <View
      pointerEvents={drawerMounted ? "auto" : "none"}
      style={styles.drawerOverlay}
    >
      <View style={styles.drawerRoot}>
        <Pressable
          style={[
            styles.drawerBackdrop,
            {
              opacity: drawerMounted ? 1 : 0,
              backgroundColor: theme.dark
                ? "rgba(0,0,0,0.72)"
                : "rgba(15,23,42,0.46)",
            },
          ]}
          onPress={closeDrawer}
        >
          <View style={StyleSheet.absoluteFillObject} />
        </Pressable>
        <Animated.View
          style={[
            styles.drawerPanel,
            {
              width: drawerWidth,
              paddingTop: insets.top + 6,
              paddingBottom: insets.bottom + 18,
              backgroundColor: theme.colors.surface,
              borderRightColor: theme.colors.outlineVariant,
              transform: [{ translateX: drawerTranslateX }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={closeDrawer}
            activeOpacity={0.72}
            style={styles.drawerBackButton}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>

          <View style={styles.drawerHeader}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              {storedProfile.photoUrl ? (
                <Image
                  source={{ uri: storedProfile.photoUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text
                  style={[
                    styles.avatarText,
                    { color: theme.colors.onPrimaryContainer },
                  ]}
                >
                  {avatarInitial}
                </Text>
              )}
            </View>

            {showCompanyName ? (
              <Text
                numberOfLines={2}
                style={[styles.drawerCompany, { color: theme.colors.primary }]}
              >
                {companyDisplayName}
              </Text>
            ) : null}

            <Text
              numberOfLines={1}
              style={[styles.drawerName, { color: theme.colors.onSurface }]}
            >
              {userDisplayName}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.drawerEmail,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {storedProfile.email}
            </Text>
            {roleLabel ? (
              <View
                style={[
                  styles.roleCapsule,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.roleCapsuleText,
                    { color: theme.colors.onPrimaryContainer },
                  ]}
                >
                  {roleLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.drawerDivider,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />

          <View style={styles.drawerNav}>
            {DRAWER_ITEMS.map((item) => {
              const active = pathname === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => navigateFromDrawer(item.route)}
                  activeOpacity={0.78}
                  style={[
                    styles.drawerItem,
                    active && {
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Feather
                    name={item.icon}
                    size={19}
                    color={
                      active
                        ? theme.colors.onPrimary
                        : theme.colors.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.drawerItemText,
                      {
                        color: active
                          ? theme.colors.onPrimary
                          : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.drawerFooter}>
            <TouchableOpacity
              onPress={() => {
                closeDrawer();
                setLogoutVisible(true);
              }}
              activeOpacity={0.82}
              style={[
                styles.signOutButton,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Feather
                name="log-out"
                size={18}
                color={theme.colors.onSurface}
              />
              <Text
                style={[styles.signOutText, { color: theme.colors.onSurface }]}
              >
                Logout
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.versionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Version {appVersion}
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
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
      <View style={styles.appShell}>
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
            name="training-resources"
            options={{
              title: "Training and Resources",
              href: null,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="saas-products"
            options={{
              title: "SAAS Products",
              href: null,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="loan-products"
            options={{
              title: "Loan Products",
              href: null,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="emi-calculator"
            options={{
              title: "EMI Calculator",
              href: null,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="banker-list"
            options={{
              title: "Banker Lists",
              href: null,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="help-support"
            options={{
              title: "Help Support",
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
        <Drawer />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  drawerRoot: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  drawerPanel: {
    height: "100%",
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerBackButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    minHeight: 32,
    minWidth: 32,
    justifyContent: "center",
  },
  drawerHeader: {
    alignItems: "center",
    paddingHorizontal: 2,
  },
  avatar: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 14,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
  },
  drawerName: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  drawerCompany: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 25,
    marginBottom: 8,
    textAlign: "center",
  },
  drawerEmail: {
    fontSize: 14,
    marginTop: 2,
    textAlign: "center",
  },
  roleCapsule: {
    alignSelf: "center",
    borderRadius: 999,
    marginTop: 10,
    minHeight: 28,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  roleCapsuleText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  drawerDivider: {
    height: StyleSheet.hairlineWidth,
    marginTop: 10,
    marginBottom: 10,
  },
  drawerNav: {
    gap: 2,
  },
  drawerItem: {
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  signOutButton: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  drawerFooter: {
    marginTop: "auto",
    gap: 10,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
