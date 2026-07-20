import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppConfig } from "@/contexts/ConfigContext";
import { decodeJwt } from "@/lib/utils/utils";
import { DRAWER_ITEMS, DrawerRoute } from "./_layout";
import { unregisterPushTokenForCurrentUser, clearLocalNotifications } from "@/lib/utils/pushSession";
import { apolloClient, setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { updateField } from "@/redux/features/profileSlice";
import { useAppDispatch } from "@/hooks/lightDark";

export default function MoreScreen() {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { config } = useAppConfig();
  const insets = useSafeAreaInsets();
  
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [role, setRole] = useState("");
  const [appVersion, setAppVersion] = useState("1.0.0");
  
  useEffect(() => {
    setAppVersion(Constants.expoConfig?.version ?? "1.0.0");
    const loadRole = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const claims = decodeJwt(token);
        const userRole = String(claims?.role || claims?.user?.role || "").toLowerCase();
        setRole(userRole);
      } catch (e) {
        console.error("Failed to load role in more screen", e);
      }
    };
    loadRole();
  }, []);

  const isAggregatorAdmin = role === "aggregator_admin";

  const visibleItems = useMemo(() => {
    let items = DRAWER_ITEMS.filter(
      (item) => (item.route !== "/invite" && item.route !== "/team") || isAggregatorAdmin
    );

    if (!config.showEmiCalculator) {
      items = items.filter(item => item.route !== "/emi-calculator");
    }
    if (!config.showCibilCheck) {
      items = items.filter(item => item.route !== "external-cibil-score");
    }

    if (config.isReviewMode) {
      items = items.filter(item => 
        item.route !== "/training-resources" && 
        item.route !== "/loan-products"
      );

      items = items.map(item => {
        if (item.route === "/banker-list") {
          return { ...item, label: `${config.terminology.bankerWord} Lists` };
        }
        if (item.route === "external-eligibility") {
          return { ...item, label: `Check ${config.terminology.eligibilityWord}` };
        }
        return item;
      });
    }

    return items;
  }, [isAggregatorAdmin, config]);

  const openWebsite = async (url: string) => {
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

  const handleNavigate = (route: DrawerRoute) => {
    if (route === "external-cibil-score") {
      openWebsite("https://f2fintech.com/check-cibil-score");
      return;
    }
    if (route === "external-eligibility") {
      openWebsite("https://finwise-eligibility.netlify.app/");
      return;
    }
    router.push(route as any);
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

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.grid}>
          {visibleItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.6}
              style={styles.gridItem}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                {item.iconFamily === "fontawesome" ? (
                  <FontAwesome
                    name={item.icon as keyof typeof FontAwesome.glyphMap}
                    size={26}
                    color={theme.colors.onSurfaceVariant}
                  />
                ) : (
                  <Feather
                    name={item.icon as keyof typeof Feather.glyphMap}
                    size={26}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              </View>
              <Text style={[styles.itemText, { color: theme.colors.onSurface }]} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setLogoutVisible(true)}
          activeOpacity={0.8}
          style={[
            styles.logoutButton,
            { backgroundColor: theme.colors.errorContainer },
          ]}
        >
          <Feather name="log-out" size={20} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error }]}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
          Version {appVersion}
        </Text>
      </ScrollView>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  gridItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  itemText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 32,
    marginBottom: 24,
    minHeight: 56,
    borderRadius: 28,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  versionText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 20,
  }
});
