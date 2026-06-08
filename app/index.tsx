import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { ROUTES } from "@/assets/constants/routes";
import CustomSplashScreen from "@/components/common/CustomSplashScreen";
import { decodeJwt } from "@/lib/utils/utils";
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
          const role = String(decodeJwt(token)?.role || "").toLowerCase();
          if (role === "aggregator_member") {
            await AsyncStorage.multiSet([
              ["userType", "sales"],
              ["authSource", "oms"],
            ]);
          }

          if (userType === "sales" || role === "aggregator_member") {
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
