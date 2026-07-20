import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import { useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { useAppDispatch, useAppSelector } from "@/hooks/lightDark";
import { useNotifications } from "@/hooks/useNotifications";
import { setTheme } from "@/redux/features/themeSlice";

export function ThemeToggleBtn() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const theme = useTheme();

  const handleToggle = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    dispatch(setTheme(newMode));
    await AsyncStorage.setItem("themeMode", newMode);
  };

  return (
    <TouchableOpacity onPress={handleToggle} style={{ marginRight: 12 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name={mode === "dark" ? "sunny-outline" : "moon-outline"}
          size={20}
          color={theme.colors.onSurface}
        />
      </View>
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
      style={{ marginRight: 16 }}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={theme.colors.onSurface}
        />
        {hasUnreadNotifications && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#EF4444",
              borderWidth: 1.5,
              borderColor: theme.dark ? "#1F2937" : "#FFFFFF",
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
