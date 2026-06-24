import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers for a clean UI
        animation: "slide_from_right", // Nice slide animation
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="oms-forgot-password" />
      <Stack.Screen name="delete-account" />
    </Stack>
  );
}
