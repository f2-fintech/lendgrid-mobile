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
import {
  clearLocalNotifications,
  syncPushTokenForCurrentUser,
  unregisterPushTokenForCurrentUser,
} from "@/lib/utils/pushSession";

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
          JSON.stringify(decoded),
        );
      }

      // ── Role Classification ──────────────────────────────────────────────────
      // Channel partners who came via OMS referral:
      const isAggregatorAdmin = role === "aggregator_admin";
      const isAggregatorMember = role === "aggregator_member";

      // OMS sales staff (can create applications)
      const isSales =
        role === "sales" || role === "lendgrid_sales" || role === "sales_manager";

      // ALL other OMS roles (operations, hr, manager, cre, team_lead, etc.)
      // These are valid OMS employees — they get "oms_viewer" mode
      const isOmsViewer =
        !isSales && !isAggregatorAdmin && !isAggregatorMember;

      if (__DEV__) {
        console.log(
          "[OMS AUTH] Role classification — isSales:", isSales,
          "isOmsViewer:", isOmsViewer,
          "isAggregatorAdmin:", isAggregatorAdmin,
          "isAggregatorMember:", isAggregatorMember,
        );
      }

      const previousToken = await AsyncStorage.getItem("token");
      if (previousToken) {
        setGraphqlAuthToken(previousToken);
        await unregisterPushTokenForCurrentUser();
        await clearLocalNotifications();
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

      // 🔥 STEP 2: RESET APOLLO
      await apolloClient.clearStore();

      // 🔥 STEP 3: RESET AUTH TOKEN
      setGraphqlAuthToken(null);

      // 🔥 STEP 4: SAVE NEW TOKEN
      await AsyncStorage.setItem("token", result.access_token);
      await AsyncStorage.setItem("authSource", "oms");

      // userType logic:
      // sales          → "sales"       (can create apps, sees existing UI)
      // aggregator_*   → "aggregator"  (channel partner, existing UI)
      // all other OMS  → "oms_viewer"  (read-only Your Partners mode)
      const savedType = isSales || isAggregatorMember
        ? "sales"
        : isAggregatorAdmin
          ? "aggregator"
          : "oms_viewer";

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
          "[OMS AUTH] Saved userType:", savedType,
          "authSource: oms",
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

      try {
        await syncPushTokenForCurrentUser();
      } catch (error) {
        console.error("[OMS AUTH] Push token error:", error);
      }

      // 🔥 STEP 6: FORCE SMALL DELAY (WS RECONNECT FIX)
      await new Promise((res) => setTimeout(res, 300));

      // 🔥 STEP 7: NAVIGATION
      // - oms_viewer  → directly to Your Partners (they have no apps to create)
      // - sales/member → tickets tab (landing page)
      // - aggregator  → dashboard (existing flow)
      router.replace(
        isOmsViewer
          ? "/(tab)/oms-partners"
          : isSales || isAggregatorMember
            ? "/(tab)/tickets"
            : ROUTES.Dashboard,
      );
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
