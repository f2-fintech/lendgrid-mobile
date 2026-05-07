import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import { restRequest } from "@/apis/config/restClient";

import { omsAuthApi, OmsLoginPayload } from "@/apis/modules/OmsAuth.api";
import { ROUTES } from "@/assets/constants/routes";

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch {
    return null;
  }
};

const extractCompanyIdFromClaims = (claims: any) => {
  return (
    claims?.companyId ??
    claims?.company_id ??
    claims?.company?.id ??
    claims?.company?.companyId ??
    claims?.company?.company_id ??
    claims?.user?.companyId ??
    claims?.user?.company_id ??
    claims?.data?.companyId ??
    claims?.data?.company_id ??
    claims?.tenant?.companyId ??
    claims?.tenant?.company_id
  );
};

const discoverCompanyIdFromProfile = async () => {
  const trialPaths = [
    "/me",
    "/profile",
    "/auth/me",
    "/user",
    "/users/me",
    "/users/profile",
  ];

  for (const path of trialPaths) {
    try {
      const profile = await restRequest<any>(path);
      console.log("[OMS AUTH] discovered profile from", path, profile);
      const candidate =
        extractCompanyIdFromClaims(profile) ??
        extractCompanyIdFromClaims(profile?.data) ??
        extractCompanyIdFromClaims(profile?.user) ??
        extractCompanyIdFromClaims(profile?.result);
      if (candidate !== undefined && candidate !== null) {
        return candidate;
      }
    } catch (error: any) {
      console.warn(
        `[OMS AUTH] profile lookup failed for ${path}:`,
        error?.response?.status,
        error?.response?.data || error?.message || error,
      );
    }
  }

  return null;
};

export function useOmsLogin() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const loginOmsStaff = async (
    payload: OmsLoginPayload,
    onError: (msg: string) => void,
  ) => {
    setIsPending(true);

    try {
      if (__DEV__) {
        console.log("[OMS AUTH] Starting OMS login with email:", payload.email);
      }

      const result = await omsAuthApi.login(payload);

      if (__DEV__) {
        console.log(
          "[OMS AUTH] API response received:",
          result ? "success" : "null",
        );
      }

      if (!result?.access_token) {
        console.error("[OMS AUTH] No access_token in response:", result);
        onError("Login failed");
        return;
      }

      const decoded = decodeJwt(result.access_token);
      const role = decoded?.role?.toLowerCase() || "";

      if (__DEV__) {
        console.log(
          "[OMS AUTH] Decoded JWT - role raw:",
          decoded?.role,
          "role lowercase:",
          role,
          "full decoded:",
          decoded,
        );
      }

      const isSales = role === "sales";
      const isAggregator =
        role === "aggregator_admin" || role === "aggregator_member";

      if (__DEV__) {
        console.log(
          "[OMS AUTH] Role detection - isSales:",
          isSales,
          "isAggregator:",
          isAggregator,
          "role value:",
          role,
          "matches: sales?",
          role === "sales",
          "matches: aggregator_admin?",
          role === "aggregator_admin",
          "matches: aggregator_member?",
          role === "aggregator_member",
        );
      }

      if (!isSales && !isAggregator) {
        console.error("[OMS AUTH] Role not recognized:", role);
        onError("Access denied");
        return;
      }

      // 🔥 STEP 1: CLEAR AUTH STORAGE
      await AsyncStorage.multiRemove([
        "token",
        "user",
        "companyId",
        "userType",
        "userId",
        "authSource",
        "selectedCompanyId",
        "selectedAggregatorId",
      ]);

      // 🔥 STEP 2: RESET APOLLO (VERY IMPORTANT)
      await apolloClient.clearStore();

      // 🔥 STEP 3: RESET AUTH TOKEN (force refresh)
      setGraphqlAuthToken(null);

      // 🔥 STEP 4: SAVE NEW TOKEN
      await AsyncStorage.setItem("token", result.access_token);
      await AsyncStorage.setItem("authSource", "oms");
      const savedType = isSales ? "sales" : "aggregator";
      await AsyncStorage.setItem("userType", savedType);
      const userIdValue =
        decoded?.userId ??
        decoded?.id ??
        decoded?.sub ??
        decoded?.salesUserId ??
        decoded?.user_id;
      if (userIdValue !== undefined && userIdValue !== null) {
        await AsyncStorage.setItem("userId", String(userIdValue));
      }

      if (__DEV__) {
        console.log(
          "[OMS AUTH] Saved userType:",
          savedType,
          "- isSales:",
          isSales,
          "isAggregator:",
          isAggregator,
        );
      }

      let companyIdValue =
        decoded?.companyId ??
        decoded?.company_id ??
        decoded?.company?.id ??
        decoded?.company?.companyId ??
        decoded?.company?.company_id ??
        decoded?.user?.companyId ??
        decoded?.user?.company_id ??
        decoded?.data?.companyId ??
        decoded?.data?.company_id ??
        decoded?.tenant?.companyId ??
        decoded?.tenant?.company_id;

      if (companyIdValue === undefined || companyIdValue === null) {
        console.warn("[OMS AUTH] companyId not found in token claims", decoded);
        const discovered = await discoverCompanyIdFromProfile();
        if (discovered !== null) {
          companyIdValue = discovered;
          console.log(
            "[OMS AUTH] recovered companyId via profile lookup",
            companyIdValue,
          );
        }
      }

      if (companyIdValue !== undefined && companyIdValue !== null) {
        await AsyncStorage.setItem("companyId", String(companyIdValue));
      }

      // 🔥 STEP 5: SET NEW TOKEN
      setGraphqlAuthToken(result.access_token);

      // 🔥 STEP 6: FORCE SMALL DELAY (WS RECONNECT FIX)
      await new Promise((res) => setTimeout(res, 300));

      // 🔥 STEP 7: NAVIGATION
      router.replace(isSales ? "/(tab)/applications" : ROUTES.Dashboard);
    } catch (err: any) {
      console.error("[OMS AUTH] Error during login:", {
        message: err?.message,
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
        fullError: err,
      });
      onError(err?.message || "Login failed");
    } finally {
      setIsPending(false);
    }
  };

  return { loginOmsStaff, isPending };
}
