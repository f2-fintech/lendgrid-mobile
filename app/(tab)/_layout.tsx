import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import {
  Tabs,
  useFocusEffect,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { useAppDispatch } from "@/hooks/lightDark";
import { useProfile } from "@/hooks/useAuth";
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
  ThemeToggleBtn
} from "@/components/common/AppHeader";
import { decodeJwt } from "@/lib/utils/utils";

export type DrawerRoute =
  | "/profile"
  // | "/data"
  | "/invite"
  | "/team"
  | "/training-resources"
  | "/saas-products"
  | "/loan-products"
  | "/emi-calculator"
  | "/banker-list"
  | "/help-support"
  | "external-cibil-score"
  | "external-eligibility";

type DrawerItem = {
  icon: keyof typeof Feather.glyphMap | keyof typeof FontAwesome.glyphMap;
  iconFamily?: "feather" | "fontawesome";
  label: string;
  route: DrawerRoute;
};

export const DRAWER_ITEMS: DrawerItem[] = [
  // { icon: "database", label: "Data", route: "/data" },
  {
    icon: "whatsapp",
    iconFamily: "fontawesome",
    label: "Invite and Add Your Agent",
    route: "/invite",
  },
  {
    icon: "users",
    label: "Team Management",
    route: "/team",
  },
  {
    icon: "book-open",
    label: "Learn and Grow",
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

const TabBarButton = ({ route, focused, opts, onPress, theme }: any) => {
  const animatedValue = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 60,
    }).start();
  }, [focused, animatedValue]);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const textTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          transform: [{ translateY }],
        }}
      >
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.primary,
            borderRadius: 28,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
            opacity: opacity,
            transform: [{ scale }],
          }}
        />
        <Ionicons
          name={focused ? opts?._iconName : (`${opts?._iconName}-outline` as any)}
          size={focused ? 24 : 24}
          color={focused ? "#fff" : theme.colors.onSurfaceVariant}
        />
      </Animated.View>
      <Animated.Text
        style={{
          color: theme.colors.onSurfaceVariant,
          fontSize: 10,
          fontWeight: "600",
          position: "absolute",
          bottom: 6,
          opacity: textOpacity,
          transform: [{ translateY: textTranslateY }],
        }}
      >
        {opts?._tabLabel}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, theme, isSales }: any) => {
  const routes = state.routes.filter((r: any) => {
    const opts = descriptors[r.key]?.options;
    // A tab must have an icon assigned, must not be explicitly marked hidden,
    // AND must not have href:null (href is the source of truth for whether the
    // route is even reachable — checking only _isHidden let href:null screens
    // like "notifications" sneak into the bar, and could let a role-hidden tab
    // like dashboard/commissions/tickets show if the two flags ever disagreed).
    return opts?._iconName && !opts?._isHidden && opts?.href !== null;
  });

  return (
    <View
      style={{
        backgroundColor: 'transparent',
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 64,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: theme.colors.surface,
          borderRadius: 32,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 20,
          paddingHorizontal: 8,
        }}
      >
        {routes.map((route: any, index: number) => {
          const opts = descriptors[route.key]?.options;
          const focused = state.index === state.routes.findIndex((r: any) => r.key === route.key);

          return (
            <TabBarButton
              key={route.key}
              route={route}
              focused={focused}
              opts={opts}
              theme={theme}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
};


export default function Layout() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{
    openDrawer?: string;
    backTo?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const profile = useSelector((state: RootState) => state.profile);
  const drawerProgress = useRef(new Animated.Value(0)).current;

  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      setHasToken(!!token);
    });
  }, [pathname]);

  const { data: user } = useProfile(hasToken);

  useEffect(() => {
    if (!user) return;
    dispatch(updateField({ key: "username", value: user.username || "" }));
    dispatch(updateField({ key: "email", value: user.email || "" }));
    dispatch(updateField({ key: "phone", value: user.contact || "" }));
    dispatch(updateField({ key: "photoUrl", value: user.photoUrl || null }));
    dispatch(
      updateField({ key: "status", value: (user.status || "ACTIVE") as any }),
    );
  }, [user, dispatch]);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerOriginRoute, setDrawerOriginRoute] = useState<string | null>(
    null,
  );
  const [pendingDrawerRoute, setPendingDrawerRoute] = useState<string | null>(
    null,
  );
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

  const [contentHeight, setContentHeight] = useState(1);
  const [visibleHeight, setVisibleHeight] = useState(1);
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- AUTO SELECT COMPANY LOGIC ---
  const autoSelectCompany = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const decoded = decodeJwt(token);
      const role = String(decoded?.role || "").toLowerCase();

      // Skip default company override for roles with specialized scopes
      if (
        role === "aggregator_member" ||
        role === "sales" ||
        role === "lendgrid_sales"
      ) {
        return;
      }

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
    const [type, token] = await Promise.all([
      AsyncStorage.getItem("userType"),
      AsyncStorage.getItem("token"),
    ]);
    const role = String(decodeJwt(token)?.role || "").toLowerCase();

    if (role === "aggregator_member") {
      await AsyncStorage.multiSet([
        ["userType", "sales"],
        ["authSource", "oms"],
      ]);
      setUserType("sales");
      return;
    }

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

  const defaultBackRoute =
    userType === "sales" ? "/applications" : "/dashboard";

  const openDrawer = useCallback(
    (originRoute = pathname) => {
      setDrawerOriginRoute(originRoute);
      setPendingDrawerRoute(null);
      drawerProgress.setValue(0);
      setDrawerMounted(true);
      setSidebarVisible(true);
    },
    [drawerProgress, pathname],
  );

  const openDrawerFromParam = useCallback(
    (originRoute: string) => {
      setDrawerOriginRoute(originRoute);
      setPendingDrawerRoute(null);
      drawerProgress.setValue(0);
      setDrawerMounted(true);
      setSidebarVisible(true);
    },
    [drawerProgress],
  );

  useEffect(() => {
    if (params.openDrawer !== "1") return;

    openDrawerFromParam(params.backTo || pathname);
    router.setParams({ openDrawer: undefined });
  }, [openDrawerFromParam, params.backTo, params.openDrawer, pathname, router]);

  const isSales = String(userType || "").toLowerCase() === "sales";

  useEffect(() => {
    if (userType === undefined) return;

    if (isSales && (pathname === "/dashboard" || pathname === "/commissions" || pathname === "/invite" || pathname === "/")) {
      router.replace("/applications");
    } else if (!isSales && pathname === "/tickets") {
      router.replace("/dashboard");
    }
  }, [isSales, pathname, router, userType]);

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

  const notificationBackRoute = defaultBackRoute;
  const drawerWidth = width;
  const drawerTranslateX = drawerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-drawerWidth, 0],
  });
  const showCompanyName =
    (storedProfile.role === "aggregator_admin" ||
      storedProfile.role === "aggregator_member") &&
    !!storedProfile.companyName;
  const isAggregatorAdmin =
    !isSales && storedProfile.role === "aggregator_admin";
  const visibleDrawerItems = DRAWER_ITEMS.filter(
    (item) =>
      (item.route !== "/invite" && item.route !== "/team") || isAggregatorAdmin,
  );
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
    <View style={{ flexDirection: "row", alignItems: "center", marginRight: 4 }}>
      <TouchableOpacity onPress={handleShare} activeOpacity={0.8} style={{ marginRight: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.dark ? "rgba(99, 102, 241, 0.15)" : "rgba(99, 102, 241, 0.1)",
            paddingHorizontal: 16,
            height: 40,
            borderRadius: 20,
            gap: 6,
          }}
        >
          <Feather name="share-2" size={16} color={theme.colors.primary} />
          {/* <Text style={{ color: theme.colors.primary, fontWeight: "600", fontSize: 13 }}>Share</Text> */}
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


  const handleDrawerBack = () => {
    const originRoute = drawerOriginRoute || params.backTo;

    if (
      typeof originRoute === "string" &&
      originRoute.startsWith("/") &&
      originRoute !== pathname
    ) {
      setPendingDrawerRoute(originRoute);
      router.replace(originRoute as any);
      return;
    }

    closeDrawer();
  };

  const openDrawerWebsite = async (url: string) => {
    closeDrawer();

    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: theme.colors.background,
        controlsColor: theme.colors.primary,
        enableBarCollapsing: true,
        showTitle: true,
      });
    } catch {
      Alert.alert("Error", "Could not open this page.");
    }
  };

  const navigateFromDrawer = (route: DrawerRoute) => {
    if ((route === "/invite" || route === "/team") && !isAggregatorAdmin) {
      closeDrawer();
      return;
    }

    if (route === "external-cibil-score") {
      openDrawerWebsite("https://f2fintech.com/check-cibil-score");
      return;
    }

    if (route === "external-eligibility") {
      openDrawerWebsite("https://finwise-eligibility.netlify.app/");
      return;
    }

    if (route === "/profile") {
      closeDrawer();
      router.push("/profile");
      return;
    }

    if (route === pathname) {
      closeDrawer();
      return;
    }

    const backTo = drawerOriginRoute || pathname || notificationBackRoute;
    setPendingDrawerRoute(route);

    if (route === "/banker-list") {
      router.push({
        pathname: route,
        params: { backTo },
      } as any);
      return;
    }

    router.push({
      pathname: route as any,
      params: { backTo },
    } as any);
  };

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

        {/* Zoom profile picture modal dialog */}
        <Dialog
          visible={showAvatarModal}
          onDismiss={() => setShowAvatarModal(false)}
          style={{
            backgroundColor: "transparent",
            shadowColor: "transparent",
            elevation: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 280,
                height: 280,
                borderRadius: 140,
                borderWidth: 3,
                borderColor: "#ffffff",
                overflow: "hidden",
                backgroundColor: theme.colors.surface,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {storedProfile.photoUrl ? (
                <Image
                  source={{ uri: storedProfile.photoUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.primaryContainer,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.onPrimaryContainer,
                      fontSize: 110,
                      fontWeight: "800",
                    }}
                  >
                    {avatarInitial}
                  </Text>
                </View>
              )}
            </View>

            {/* Close button below the image */}
            <TouchableOpacity
              onPress={() => setShowAvatarModal(false)}
              activeOpacity={0.8}
              style={{
                marginTop: 20,
                backgroundColor: theme.colors.surface,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 5,
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Dialog>
      </Portal>
      <View style={styles.appShell}>
        <Tabs
          sceneContainerStyle={{ paddingBottom: 110 }}
          initialRouteName={isSales ? "applications" : "dashboard"}
          backBehavior="history"
          screenOptions={{
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.colors.background,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTitleStyle: {
              fontWeight: "800",
              fontSize: 18,
            },
            headerTintColor: theme.colors.onSurface,
            tabBarShowLabel: false,
            tabBarStyle: { display: 'none' }, // Hidden — we use custom tabBar prop below
          }}
          tabBar={(props) => <CustomTabBar {...props} theme={theme} isSales={isSales} />}
        >
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              headerTitle: "",
              headerLeft: () => (
                <View>
                  <Image
                    source={theme.dark ? require('@/assets/images/logo_white_croped.png') : require('@/assets/images/logo_blue_croped.png')}
                    style={{
                      width: 140,
                      height: 44,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              ),
              href: isSales ? null : "/dashboard",
              _isHidden: isSales,
              headerRight: () => <DashboardHeaderRight />,
              _iconName: 'home',
              _tabLabel: 'Home',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          />
          <Tabs.Screen
            name="commissions"
            options={{
              title: "Commissions",
              href: isSales ? null : "/commissions",
              _isHidden: isSales,
              headerRight: () => <CommissionsHeaderRight />,
              _iconName: 'wallet',
              _tabLabel: 'Commission',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          />
          <Tabs.Screen
            name="applications"
            options={{
              title: "Applications",
              headerTitle: "",
              headerLeft: () => (
                <View>
                  <Image
                    source={theme.dark ? require('@/assets/images/logo_white_croped.png') : require('@/assets/images/logo_blue_croped.png')}
                    style={{
                      width: 140,
                      height: 44,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              ),
              href: "/applications",
              headerRight: () => <AppsHeaderRight />,
              _iconName: 'document-text',
              _tabLabel: 'Apps',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          />
          <Tabs.Screen
            name="tickets"
            options={{
              title: "Tickets",
              headerTitle: "",
              headerLeft: () => (
                <View>
                  <Image
                    source={theme.dark ? require('@/assets/images/logo_white_croped.png') : require('@/assets/images/logo_blue_croped.png')}
                    style={{
                      width: 140,
                      height: 44,
                      resizeMode: "contain",
                    }}
                  />
                </View>
              ),
              href: isSales ? "/tickets" : null,
              _isHidden: !isSales,
              headerRight: () => <AppsHeaderRight />,
              _iconName: 'ticket',
              _tabLabel: 'Tickets',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              href: "/profile",
              headerRight: () => <ProfileHeaderRight />,
              _iconName: 'person',
              _tabLabel: 'Profile',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
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
            name="invite"
            options={{
              title: "Invite Agent",
              href: null,
              tabBarItemStyle: { display: "none" },
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="team"
            options={{
              title: "Team Management",
              href: null,
              tabBarItemStyle: { display: "none" },
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="training-resources"
            options={{
              title: "Learn and Grow",
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

          {/* <Tabs.Screen
            name="notifications"
            options={{
              title: "Notifications",
              href: null,
              headerLeft: () => <NotificationsHeaderLeft />,
              headerRight: () => <NotificationsHeaderRight />,
              _iconName: 'bell',
              _tabLabel: 'Alerts',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          /> */}
          <Tabs.Screen
            name="more"
            options={{
              title: "More",
              headerTitle: "More Options",
              headerRight: () => <ThemeToggleBtn />,
              _iconName: 'grid',
              _tabLabel: 'More',
              tabBarIcon: ({ focused }) => (<></>),
            } as any}
          />
        </Tabs>

        {drawerMounted && (
          <Animated.View style={styles.drawerOverlay}>
            <TouchableOpacity
              style={styles.drawerBackdrop}
              activeOpacity={1}
              onPress={closeDrawer}
            />
            <Animated.View
              style={[
                styles.drawerPanel,
                {
                  width: drawerWidth,
                  backgroundColor: theme.colors.surface,
                  transform: [{ translateX: drawerTranslateX }]
                }
              ]}
            >
              <View style={[styles.drawerHeader, { marginTop: insets.top + 20 }]}>
                <View style={[styles.avatar, { backgroundColor: `${theme.colors.primary}1A` }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{avatarInitial}</Text>
                </View>
                <Text style={[styles.drawerName, { color: theme.colors.onSurface }]}>{userDisplayName}</Text>
                {showCompanyName && (
                  <Text style={[styles.drawerCompany, { color: theme.colors.primary }]}>{companyDisplayName}</Text>
                )}
                <Text style={[styles.drawerEmail, { color: theme.colors.onSurfaceVariant }]}>{storedProfile.email}</Text>
                <View style={[styles.roleCapsule, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Text style={[styles.roleCapsuleText, { color: theme.colors.primary }]}>{roleLabel}</Text>
                </View>
              </View>

              <View style={[styles.drawerDivider, { backgroundColor: theme.colors.outline }]} />

              <ScrollView style={styles.drawerNav} showsVerticalScrollIndicator={false}>
                {visibleDrawerItems.map((item: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.drawerItem,
                      { backgroundColor: pendingDrawerRoute === item.route ? `${theme.colors.primary}1A` : 'transparent' }
                    ]}
                    onPress={() => navigateFromDrawer(item.route)}
                  >
                    <Feather name={item.icon as any} size={20} color={pendingDrawerRoute === item.route ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                    <Text style={[styles.drawerItemText, { color: pendingDrawerRoute === item.route ? theme.colors.primary : theme.colors.onSurface }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={[styles.drawerFooter, { marginBottom: insets.bottom + 20 }]}>
                <TouchableOpacity
                  style={[styles.signOutButton, { backgroundColor: `${theme.colors.error}10` }]}
                  onPress={() => setLogoutVisible(true)}
                >
                  <Feather name="log-out" size={18} color={theme.colors.error} />
                  <Text style={[styles.signOutText, { color: theme.colors.error }]}>Sign Out</Text>
                </TouchableOpacity>
                <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>v{appVersion}</Text>
              </View>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  sidebarBackButton: {
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 30,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 54,
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
    minHeight: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  signOutButton: {
    minHeight: 52,
    borderRadius: 16,
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