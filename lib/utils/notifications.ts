import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  // Define the high-priority channel for Android
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
        projectId: "16608c42-65bc-47d0-9cca-f5158e848475",
      })
    ).data;
    return token;
  } catch (error) {
    console.error("Error getting push token:", error);
    return null;
  }
}
