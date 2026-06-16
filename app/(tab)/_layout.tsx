import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  Pressable,
  ScrollView,
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
  NotificationsHeaderRight,
  ThemeToggleBtn,
} from "@/components/common/AppHeader";
import { decodeJwt } from "@/lib/utils/utils";

type DrawerRoute =
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

const DRAWER_ITEMS: DrawerItem[] = [
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
    if (userType === undefined || !isSales || pathname !== "/invite") return;

    router.replace("/applications");
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

  const SidebarBackButton = () => (
    <TouchableOpacity
      onPress={() => openDrawer(params.backTo || drawerOriginRoute || pathname)}
      style={styles.sidebarBackButton}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={29} color={theme.colors.primary} />
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

  const GlobalMenu = () => (
    <TouchableOpacity
      onPress={() => openDrawer()}
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
              paddingTop: insets.top + 4,
              paddingBottom: insets.bottom + 18,
              backgroundColor: theme.colors.surface,
              borderRightColor: theme.colors.outlineVariant,
              transform: [{ translateX: drawerTranslateX }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleDrawerBack}
            activeOpacity={0.72}
            style={{
              position: "absolute",
              top: insets.top + 4,
              left: 10,
              minWidth: 44,
              minHeight: 44,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>

          <View style={[styles.drawerHeader, { marginTop: 10, alignItems: "center", paddingBottom: 16 }]}>
              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowAvatarModal(true)}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.primaryContainer,
                      width: 130,
                      height: 130,
                      borderRadius: 65,
                      marginBottom: 8,
                      alignSelf: "center",
                    },
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
                        {
                          color: theme.colors.onPrimaryContainer,
                          fontSize: 54,
                        },
                      ]}
                    >
                      {avatarInitial}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowAvatarModal(true)}
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    backgroundColor: theme.colors.primary,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: theme.colors.surface,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                >
                  <Feather name="maximize-2" size={15} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigateFromDrawer("/profile")}
                style={{ alignItems: "center", width: "100%" }}
              >
                {showCompanyName ? (
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.drawerCompany,
                      {
                        fontSize: 16,
                        marginBottom: 4,
                        color: theme.colors.primary,
                      },
                    ]}
                  >
                    {companyDisplayName}
                  </Text>
                ) : null}

                <Text
                  numberOfLines={1}
                  style={[
                    styles.drawerName,
                    { fontSize: 18, color: theme.colors.onSurface },
                  ]}
                >
                  {userDisplayName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.drawerEmail,
                    {
                      fontSize: 12,
                      marginTop: 0,
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {storedProfile.email}
                </Text>
                {roleLabel ? (
                  <View
                    style={[
                      styles.roleCapsule,
                      {
                        backgroundColor: theme.colors.primaryContainer,
                        marginTop: 6,
                        minHeight: 22,
                        paddingHorizontal: 10,
                      },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.roleCapsuleText,
                        {
                          color: theme.colors.onPrimaryContainer,
                          fontSize: 10,
                        },
                      ]}
                    >
                      {roleLabel}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

          <View
            style={[
              styles.drawerDivider,
              {
                backgroundColor: theme.colors.outlineVariant,
                marginTop: 6,
                marginBottom: 8,
              },
            ]}
          />

          <View style={{ flex: 1, flexDirection: "row", position: "relative" }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              scrollEventThrottle={16}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: false }
              )}
              onContentSizeChange={(w, h) => setContentHeight(h || 1)}
              onLayout={(e) => setVisibleHeight(e.nativeEvent.layout.height || 1)}
            >
              <View style={styles.drawerNav}>
                {visibleDrawerItems.map((item) => {
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
                      {item.iconFamily === "fontawesome" ? (
                        <FontAwesome
                          name={item.icon as keyof typeof FontAwesome.glyphMap}
                          size={19}
                          color={
                            active
                              ? theme.colors.onPrimary
                              : theme.colors.onSurfaceVariant
                          }
                        />
                      ) : (
                        <Feather
                          name={item.icon as keyof typeof Feather.glyphMap}
                          size={19}
                          color={
                            active
                              ? theme.colors.onPrimary
                              : theme.colors.onSurfaceVariant
                          }
                        />
                      )}
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
            </ScrollView>

            {/* Custom visual scrollbar indicator visible in both light/dark modes */}
            {contentHeight > visibleHeight && (
              <View
                style={{
                  position: "absolute",
                  right: -8,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: theme.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={{
                    width: "100%",
                    borderRadius: 2,
                    backgroundColor: theme.dark ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.22)",
                    height: visibleHeight * (visibleHeight / contentHeight),
                    transform: [
                      {
                        translateY: scrollY.interpolate({
                          inputRange: [0, contentHeight - visibleHeight],
                          outputRange: [0, visibleHeight - visibleHeight * (visibleHeight / contentHeight)],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  }}
                />
              </View>
            )}
          </View>

          <View style={styles.drawerFooter}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                position: "relative",
                minHeight: 48,
              }}
            >
              {/* Logo box centered in the row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.dark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(50,56,243,0.3)",
                  overflow: "hidden",
                  paddingHorizontal: 26,
                  paddingVertical: 4,
                  height: 52,
                  position: "relative",
                }}
              >
                <LinearGradient
                  colors={
                    theme.dark
                      ? ["rgba(255,255,255,0.09)", "rgba(255,255,255,0.03)"]
                      : ["rgba(255,255,255,0.98)", "rgba(232,240,255,0.92)"]
                  }
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Image
                  source={
                    theme.dark
                      ? require("@/assets/images/logo.png")
                      : require("@/assets/images/logo_blue.png")
                  }
                  style={{ width: 65, height: 65 }}
                  resizeMode="contain"
                />
                <View
                  style={{
                    width: 1,
                    height: 28,
                    backgroundColor: theme.dark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(15,23,42,0.3)",
                    borderRadius: 99,
                  }}
                />
                <View
                  style={{ flexDirection: "column", alignItems: "flex-start" }}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "900",
                      fontSize: 16,
                      lineHeight: 16,
                    }}
                  >
                    LendGrid
                  </Text>
                  <Text
                    style={{
                      color: theme.dark
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(15,23,42,0.65)",
                      fontWeight: "700",
                      fontSize: 8,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      marginTop: 0,
                    }}
                  >
                    {storedProfile.role === "aggregator_admin"
                      ? "AGGREGATOR"
                      : "AGENT NETWORK"}
                  </Text>
                </View>
              </View>

              {/* Logout button shifted to the right corner, circular */}
              <TouchableOpacity
                onPress={() => {
                  closeDrawer();
                  setLogoutVisible(true);
                }}
                activeOpacity={0.82}
                style={{
                  position: "absolute",
                  right: 0,
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.colors.surfaceVariant,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: theme.colors.outlineVariant,
                }}
              >
                <Feather
                  name="log-out"
                  size={18}
                  color={theme.colors.onSurface}
                />
              </TouchableOpacity>
            </View>
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
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="invite"
            options={{
              title: "Invite Agent",
              href: null,
              tabBarItemStyle: { display: "none" },
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="team"
            options={{
              title: "Team Management",
              href: null,
              tabBarItemStyle: { display: "none" },
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="training-resources"
            options={{
              title: "Training and Resources",
              href: null,
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="saas-products"
            options={{
              title: "SAAS Products",
              href: null,
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="loan-products"
            options={{
              title: "Loan Products",
              href: null,
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="emi-calculator"
            options={{
              title: "EMI Calculator",
              href: null,
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="banker-list"
            options={{
              title: "Banker Lists",
              href: null,
              headerLeft: () => <SidebarBackButton />,
              headerRight: () => <ThemeToggleBtn />,
            }}
          />

          <Tabs.Screen
            name="help-support"
            options={{
              title: "Help Support",
              href: null,
              headerLeft: () => <SidebarBackButton />,
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
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
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
