import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { useAppDispatch, useAppSelector } from "@/hooks/lightDark";
import { useNotifications } from "@/hooks/useNotifications";
import { toggleTheme } from "@/redux/features/themeSlice";

export function ThemeToggleBtn() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useTheme();

  return (
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
}

export function NotificationBtn() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const { meta } = useNotifications({ mode: "stats" });
  const unreadCount = meta?.unreadCount ?? 0;

  const isOnNotifications = useMemo(() => {
    const p = String(pathname || "");
    return p.includes("/notifications") || p.endsWith("notifications");
  }, [pathname]);

  const hasUnreadNotifications = !isOnNotifications && unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      style={{ marginRight: 10 }}
      activeOpacity={0.8}
    >
      <View style={{ position: "relative" }}>
        <Ionicons
          name="notifications-outline"
          size={24}
          color={theme.colors.onSurface}
        />
        {hasUnreadNotifications && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#EF4444",
              borderWidth: 2,
              borderColor: theme.colors.background,
              zIndex: 999,
              elevation: 10,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function AppsHeaderRight() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
      <NotificationBtn />
    </View>
  );
}

export function NotificationsHeaderRight() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemeToggleBtn />
    </View>
  );
}
