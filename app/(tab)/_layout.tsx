import { ROUTES } from "@/assets/constants/routes";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

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

  const showLogoutDialog = () => setLogoutVisible(true);
  const hideLogoutDialog = () => setLogoutVisible(false);

  // -----------------------------------------
  //  LOGOUT FUNCTION
  // -----------------------------------------
  const handleLogout = async () => {
    hideLogoutDialog();

    // Remove Access Token
    await AsyncStorage.removeItem("access_token");

    // Reset Redux profile
    dispatch(updateField({ key: "username", value: "" }));
    dispatch(updateField({ key: "email", value: "" }));
    dispatch(updateField({ key: "phone", value: "" }));
    dispatch(updateField({ key: "companyName", value: "" }));
    dispatch(updateField({ key: "documents", value: {} }));
    // (Redux auto-resets others when empty)

    // Navigate to Login Page
    router.replace(ROUTES.signin);

    console.log("User Logged Out Successfully");
  };

  return (
    <>
      {/* LOGOUT CONFIRMATION DIALOG */}
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
                lineHeight: 22,
              }}
            >
              Are you sure you want to log out?
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Button
              mode="outlined"
              onPress={hideLogoutDialog}
              textColor={theme.colors.onSurface}
              style={{
                flex: 1,
                marginRight: 8,
                borderColor: theme.colors.outline,
              }}
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

          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.outline,
          },

          sceneStyle: { backgroundColor: theme.colors.background },

          headerRight: () => (
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
          ),
        }}
      >
        {/* Dashboard */}
        <Tabs.Screen
          name="dashboard"
          options={{
            headerShown: false,
            title: "Dashboard",
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
            tabBarIcon: ({ color }) => (
              <FontAwesome name="money" size={24} color={color} />
            ),
          }}
        />

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",

            headerRight: () => (
              <>
                {/* LOGOUT BUTTON */}
                <TouchableOpacity
                  onPress={showLogoutDialog}
                  style={{ marginRight: 12 }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={24}
                    color={theme.colors.onSurface}
                  />
                </TouchableOpacity>

                {/* THEME TOGGLE */}
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
              </>
            ),

            tabBarIcon: ({ color }) => (
              <FontAwesome name="user-circle-o" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
