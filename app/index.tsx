import CustomSplashScreen from "@/components/CustomSplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Index() {
  const [nextRoute, setNextRoute] = useState("/(auth)/signin");

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        setNextRoute("/(tab)/dashboard");
      } else {
        setNextRoute("/(auth)/signin");
      }
    };

    checkUser();
  }, []);
  return (
    <CustomSplashScreen
      // nextRoute="/(tab)/dashboard"
      // nextRoute="/(auth)/signin"
      nextRoute={nextRoute}
      repeatCount={1}
      iconDurationMs={800}
      holdMs={300}
    />
  );
}
