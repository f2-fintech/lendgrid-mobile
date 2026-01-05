import { ROUTES } from "@/assets/constants/routes";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@/hooks/lightDark";
import { toggleTheme } from "@/redux/features/themeSlice";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

import { updateField } from "@/redux/features/profileSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Layout() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useTheme();
  const router = useRouter();

  const [logoutVisible, setLogoutVisible] = useState(false);

  const [rangeVisible, setRangeVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"7" | "30" | "90">("30");

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

    await AsyncStorage.removeItem("access_token");

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
      // TODO: add navigation when Notifications screen is ready
      // onPress={() => router.push("/notifications")}
      onPress={() => {}}
      style={{ marginRight: 10 }}
      activeOpacity={0.8}
    >
      <Ionicons
        name="notifications-outline"
        size={24}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );

  // Dashboard header: theme toggle + notification
  const DashboardHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  // Commissions header: dropdown + theme toggle + notification
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

  // Applications header: theme toggle + notification
  const ApplicationsHeaderRight = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );

  // Profile header: logout + theme toggle + notification
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
        {/* Dashboard */}
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

        {/* Commissions */}
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

        {/* Applications */}
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

        {/* Profile */}
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
      </Tabs>
    </>
  );
}
