import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform, Animated } from "react-native";
import * as Network from "expo-network";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

export function NetworkBanner() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [slideAnim] = useState(new Animated.Value(-100)); // Start off-screen
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkNetwork = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const connected = !!networkState.isConnected && !!networkState.isInternetReachable;
        
        // During development, isInternetReachable might be null, so we fallback to isConnected
        const finalConnected = networkState.isInternetReachable === null ? !!networkState.isConnected : connected;
        
        setIsConnected(finalConnected);
      } catch (error) {
        console.warn("Failed to check network state", error);
      }
    };

    // Initial check
    checkNetwork();

    // Check periodically since expo-network doesn't have an event listener yet
    interval = setInterval(checkNetwork, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -100 : 0, // Slide down if offline, slide up if online
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 24 : 0),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Feather name="wifi-off" size={16} color="white" style={styles.icon} />
        <Text style={styles.text}>No Internet Connection</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ef4444",
    zIndex: 9999, // Ensure it sits above everything
    elevation: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
