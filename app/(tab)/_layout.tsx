import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";

import { useAppDispatch, useAppSelector } from "@/hooks/lightDark";
import { toggleTheme } from "@/redux/features/themeSlice";
import { useTheme } from "react-native-paper";

export default function Layout() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,

        // THEME FOR HEADER
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onSurface,

        // THEME FOR TABS BAR
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },

        // THEME FOR SCREEN BACKGROUND
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },

        // THEME TOGGLE BUTTON
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
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="commissions"
        options={{
          title: "Commissions",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="money" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-circle-o" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
