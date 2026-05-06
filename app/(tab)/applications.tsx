import { commissionsStyles } from "@/styles/components/applications/applicationsstyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTheme } from "react-native-paper";

import { useCustomerApplications } from "@/hooks/use-customer-applications_rest";
import { useTickets } from "@/hooks/use-tickets_rest";

import ApplicationsTicketsView from "@/components/ui/ApplicationsTicketsView/ApplicationsTicketsView";

const decodeJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
  } catch (error) {
    if (__DEV__) {
      console.warn("[ApplicationsScreen] failed to decode token", error);
    }
    return null;
  }
};

const normalizeStoredValue = (value?: string | null) => {
  if (!value || value === "undefined" || value === "null") return undefined;
  return value;
};

export default function ApplicationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string; navId?: string }>();

  const pagerRef = useRef<PagerView>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"applications" | "tickets">(
    "applications",
  );

  const [appsPage, setAppsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);

  const [appsRowsPerPage, setAppsRowsPerPage] = useState(10);
  const [ticketsRowsPerPage, setTicketsRowsPerPage] = useState(10);

  const [appsRowsPerPageInput, setAppsRowsPerPageInput] = useState("10");
  const [ticketsRowsPerPageInput, setTicketsRowsPerPageInput] = useState("10");

  const [userType, setUserType] = useState<string | undefined>(undefined);
  const [salesUserId, setSalesUserId] = useState<string | undefined>(undefined);
  const [authSource, setAuthSource] = useState<string | undefined>(undefined);
  const [decodedClaims, setDecodedClaims] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  const setTab = useCallback((tab: "applications" | "tickets") => {
    setActiveTab(tab);

    requestAnimationFrame(() => {
      pagerRef.current?.setPage(tab === "applications" ? 0 : 1);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const t = String(params?.tab || "").toLowerCase();
      if (t === "tickets") setTab("tickets");
      if (t === "applications") setTab("applications");
    }, [params?.tab, params?.navId, setTab]),
  );

  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    let mounted = true;

    const loadAuthState = async () => {
      const [
        storedUserType,
        storedUserId,
        storedSelectedCompanyId,
        storedCompanyId,
        storedAuthSource,
        storedToken,
      ] = await Promise.all([
        AsyncStorage.getItem("userType"),
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("selectedCompanyId"),
        AsyncStorage.getItem("companyId"),
        AsyncStorage.getItem("authSource"),
        AsyncStorage.getItem("token"),
      ]);

      const decoded = decodeJwt(storedToken);
      const normalizedAuthSource = normalizeStoredValue(
        storedAuthSource ?? decoded?.source,
      );
      const normalizedUserType = normalizeStoredValue(storedUserType);
      const decodedRole = String(decoded?.role || "").toLowerCase();
      const isOmsSalesSession =
        normalizedAuthSource === "oms" &&
        (normalizedUserType === "sales" || decodedRole === "sales");
      if (!mounted) return;
      setUserType(normalizedUserType);
      setSalesUserId(
        normalizeStoredValue(
          storedUserId ??
            decoded?.id ??
            decoded?.userId ??
            decoded?.sub ??
            decoded?.salesUserId ??
            decoded?.user_id,
        ),
      );
      setAuthSource(normalizedAuthSource);
      setDecodedClaims(decoded);
      setSelectedCompanyId(
        isOmsSalesSession
          ? normalizeStoredValue(storedSelectedCompanyId) ||
              normalizeStoredValue(storedCompanyId)
          : normalizeStoredValue(storedCompanyId),
      );
      setAuthLoaded(true);

      if (__DEV__) {
        console.log("[ApplicationsScreen] loaded application auth state", {
          storedUserType,
          storedUserId,
          storedAuthSource,
          storedSelectedCompanyId,
          storedCompanyId,
          decodedRole: decoded?.role,
          decodedSource: decoded?.source,
          decodedId: decoded?.id,
        });
      }
    };

    loadAuthState();

    return () => {
      mounted = false;
    };
  }, []);

  const decodedRole = String(decodedClaims?.role || "").toLowerCase();
  const decodedSource = String(decodedClaims?.source || "").toLowerCase();
  const isOmsSales =
    (authSource === "oms" || decodedSource === "oms") &&
    decodedRole === "sales";
  const normalizedSalesUserId =
    (isOmsSales || userType === "sales") && salesUserId
      ? salesUserId
      : undefined;
  const applicationsCompanyId =
    isOmsSales && normalizedSalesUserId ? "all" : selectedCompanyId;

  useEffect(() => {
    if (!authLoaded || !__DEV__) return;
    console.log("[ApplicationsScreen] applications request scope", {
      isOmsSales,
      appliedBy: normalizedSalesUserId,
      companyId: applicationsCompanyId,
    });
  }, [applicationsCompanyId, authLoaded, isOmsSales, normalizedSalesUserId]);

  const appsQuery = useCustomerApplications({
    page: appsPage,
    limit: appsRowsPerPage,
    search: search || undefined,
    appliedBy: normalizedSalesUserId,
    companyId: applicationsCompanyId,
    enabled: activeTab === "applications" && authLoaded,
  });

  const visibleAppsData = useMemo(() => {
    if (!appsQuery.data || isOmsSales) return appsQuery.data;

    const results = appsQuery.data.results.filter((application: any) => {
      const source = String(application?.source || "").toLowerCase();
      if (source !== "oms") return true;

      const picked =
        application?.is_picked ??
        application?.isPicked ??
        application?.picked ??
        application?.isPickedByAggregator;

      return (
        picked === true ||
        picked === 1 ||
        picked === "1" ||
        picked === "true"
      );
    });

    return {
      ...appsQuery.data,
      results,
      count: Math.min(appsQuery.data.count, results.length),
    };
  }, [appsQuery.data, isOmsSales]);

  const ticketsQuery = useTickets({
    page: ticketsPage,
    limit: ticketsRowsPerPage,
    search: search || undefined,
    enabled: activeTab === "tickets",
  });

  const {
    isLoading: appsLoading,
    isError: appsError,
    refetch: refetchApps,
  } = appsQuery;

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    isError: ticketsError,
    refetch: refetchTickets,
  } = ticketsQuery;

  useFocusEffect(
    useCallback(() => {
      refetchApps?.();
      refetchTickets?.();
    }, [refetchApps, refetchTickets]),
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const n = parseInt(appsRowsPerPageInput.trim(), 10);
      if (!isNaN(n) && n > 0 && n !== appsRowsPerPage) {
        setAppsRowsPerPage(n);
        setAppsPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [appsRowsPerPageInput, appsRowsPerPage]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const n = parseInt(ticketsRowsPerPageInput.trim(), 10);
      if (!isNaN(n) && n > 0 && n !== ticketsRowsPerPage) {
        setTicketsRowsPerPage(n);
        setTicketsPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [ticketsRowsPerPageInput, ticketsRowsPerPage]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 80}
    >
      <View style={styles.container}>
        <ApplicationsTicketsView
          theme={theme}
          styles={styles}
          router={router}
          pagerRef={pagerRef}
          activeTab={activeTab}
          setTab={setTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          appsData={visibleAppsData}
          appsLoading={appsLoading}
          appsError={appsError}
          refetchApps={refetchApps}
          appsPage={appsPage}
          setAppsPage={setAppsPage}
          appsRowsPerPage={appsRowsPerPage}
          appsRowsPerPageInput={appsRowsPerPageInput}
          setAppsRowsPerPageInput={setAppsRowsPerPageInput}
          ticketsData={ticketsData}
          ticketsLoading={ticketsLoading}
          ticketsError={ticketsError}
          refetchTickets={refetchTickets}
          ticketsPage={ticketsPage}
          setTicketsPage={setTicketsPage}
          ticketsRowsPerPage={ticketsRowsPerPage}
          ticketsRowsPerPageInput={ticketsRowsPerPageInput}
          setTicketsRowsPerPageInput={setTicketsRowsPerPageInput}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
