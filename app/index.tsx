import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { ROUTES } from "@/assets/constants/routes";
import CustomSplashScreen from "@/components/common/CustomSplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function Index() {
  const [nextRoute, setNextRoute] = useState<string>(ROUTES.signin);

  useEffect(() => {
    let alive = true;

    const checkUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userType = await AsyncStorage.getItem("userType");

        setGraphqlAuthToken(token || null);

        if (!alive) return;

        if (token) {
          if (userType === "sales") {
            setNextRoute("/(tab)/applications");
          } else {
            setNextRoute(ROUTES.Dashboard);
          }
        } else {
          setNextRoute(ROUTES.signin);
        }
      } catch {
        setGraphqlAuthToken(null);
        if (!alive) return;
        setNextRoute(ROUTES.signin);
      }
    };

    checkUser();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <CustomSplashScreen
      nextRoute={nextRoute}
      repeatCount={1}
      iconDurationMs={800}
      holdMs={300}
    />
  );
}
