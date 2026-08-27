import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { ROUTES } from "@/assets/constants/routes";
import CustomSplashScreen from "@/components/common/CustomSplashScreen";
import { decodeJwt } from "@/lib/utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Clipboard from "expo-clipboard";

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
          // If no token, check for a deferred deep link (Play Install Referrer)
          if (Platform.OS === 'android') {
            try {
              const Application = await import('expo-application');
              const referrer = await Application.getInstallReferrerAsync();
              if (referrer) {
                const extractParam = (query: string, param: string) => {
                  const match = RegExp('[?&]' + param + '=([^&]*)').exec('?' + query);
                  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
                };
                const ref = extractParam(referrer, 'ref');
                if (ref) {
                  await AsyncStorage.setItem("referralCode", ref);
                  const processed = await AsyncStorage.getItem("processedReferrer");
                  if (processed !== ref) {
                    await AsyncStorage.setItem("processedReferrer", ref);
                    setNextRoute(`/signup?ref=${encodeURIComponent(ref)}`);
                    return;
                  }
                }
              }
            } catch (e) {
              console.warn("Failed to get Play Install Referrer", e);
            }
          }

          // Fallback: Check clipboard for referral link
          try {
            const hasString = await Clipboard.hasStringAsync();
            if (hasString) {
              const clipboardContent = await Clipboard.getStringAsync();
              if (clipboardContent && clipboardContent.includes("lendgrid.in/signup?ref=")) {
                const refMatch = clipboardContent.match(/ref=([^&\s]+)/);
                if (refMatch && refMatch[1]) {
                  const ref = decodeURIComponent(refMatch[1]);
                  const processed = await AsyncStorage.getItem("processedClipboardRef");
                  if (processed !== ref) {
                    await AsyncStorage.setItem("processedClipboardRef", ref);
                    await AsyncStorage.setItem("referralCode", ref);
                    setNextRoute(`/signup?ref=${encodeURIComponent(ref)}`);
                    return;
                  }
                }
              }
            }
          } catch (e) {
            console.warn("Clipboard fallback failed", e);
          }

          // Default to sign-in if no valid referrer found
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
