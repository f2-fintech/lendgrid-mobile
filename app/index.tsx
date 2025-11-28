import { ROUTES } from "@/assets/constants/routes";
import CustomSplashScreen from "@/components/common/CustomSplashScreen";
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
      nextRoute={ROUTES.landing}
      // nextRoute={nextRoute}
      repeatCount={1}
      iconDurationMs={800}
      holdMs={300}
    />
  );
}
