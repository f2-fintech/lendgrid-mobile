import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Profile() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/signin");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 20 }}>My Profile</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}
