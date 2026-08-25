import Constants from "expo-constants";
import { clearPushTokenApi, updatePushTokenApi } from "@/apis/modules/auth.api";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const EXPO_PROJECT_ID =
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId ??
  "3cf91ffe-266c-441e-a633-c3f0f25e3b50";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "LendGrid Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      enableVibrate: true,
      showBadge: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: EXPO_PROJECT_ID,
      })
    ).data;
    return token;
  } catch (error) {
    console.warn("Could not get push token (expected on emulators):", error);
    return null;
  }
}

export async function syncPushTokenForCurrentUser() {
  const expoToken = await registerForPushNotificationsAsync();
  if (expoToken) {
    await updatePushTokenApi(expoToken);
  }
  return expoToken;
}

export async function unregisterPushTokenForCurrentUser() {
  try {
    await clearPushTokenApi();
  } catch (error) {
    console.warn("[PUSH] Failed to clear backend push token:", error);
  }
}

export async function clearLocalNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.warn("[PUSH] Failed to clear local notifications:", error);
  }
}
