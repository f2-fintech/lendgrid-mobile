import { restApi } from "@/apis/config/axiosConfig";
import { commissionsStyles } from "@/styles/components/applications/applicationsstyles";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { Menu, useTheme } from "react-native-paper";

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

const normalizeTicketParam = (value?: string | string[] | null) => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  const match = String(raw).match(/\d+/);
  return match?.[0] ?? "";
};

type CompanyOption = {
  id: number;
  companyId: number | string;
  name: string;
};

type ApplicationsContentProps = {
  lockedTab?: "applications" | "tickets";
};

export function ApplicationsContent({ lockedTab }: ApplicationsContentProps) {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{
    tab?: string;
    navId?: string;
    ticketId?: string;
    ticketNo?: string;
    ticketNumber?: string;
    openTicket?: string;
  }>();

  const pagerRef = useRef<PagerView>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"applications" | "tickets">(
    lockedTab ?? "applications",
  );

  const [appsPage, setAppsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);

  const [appsRowsPerPage, setAppsRowsPerPage] = useState(10);
  const [ticketsRowsPerPage, setTicketsRowsPerPage] = useState(10);

  const [appsRowsPerPageInput, setAppsRowsPerPageInput] = useState("10");
  const [ticketsRowsPerPageInput, setTicketsRowsPerPageInput] = useState("10");

  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const [userType, setUserType] = useState<string | undefined>(undefined);
  const [salesUserId, setSalesUserId] = useState<string | undefined>(undefined);
  const [authSource, setAuthSource] = useState<string | undefined>(undefined);
  const [decodedClaims, setDecodedClaims] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [companyMenuVisible, setCompanyMenuVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(
    null,
  );
  const notificationTicketId = useMemo(
    () =>
      normalizeTicketParam(
        params?.ticketId ?? params?.ticketNo ?? params?.ticketNumber,
      ),
    [params?.ticketId, params?.ticketNo, params?.ticketNumber],
  );
  const shouldOpenNotificationTicket =
    String(params?.openTicket || "") === "1" && !!notificationTicketId;

  const setTab = useCallback(
    (tab: "applications" | "tickets") => {
      if (lockedTab && tab !== lockedTab) return;

      setActiveTab(tab);

      requestAnimationFrame(() => {
        pagerRef.current?.setPage(tab === "applications" ? 0 : 1);
      });
    },
    [lockedTab],
  );

  useFocusEffect(
    useCallback(() => {
      if (lockedTab) {
        setActiveTab(lockedTab);
        return;
      }

      const t = String(params?.tab || "").toLowerCase();
      if (t === "tickets") setTab("tickets");
      if (t === "applications") setTab("applications");
    }, [lockedTab, params?.tab, setTab]),
  );

  useEffect(() => {
    if (!notificationTicketId) return;

    setActiveTab("tickets");
    setSearch(notificationTicketId);
    setDebouncedSearch(notificationTicketId);
    setTicketsPage(1);

    requestAnimationFrame(() => {
      pagerRef.current?.setPage(1);
    });
  }, [notificationTicketId, params?.navId]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >(undefined);

  const loadCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    setCompaniesError(null);
    try {
      const response = await restApi.get("/companies", {
        params: { page: 1, limit: 100 },
      });
      const payload = response?.data;
      const results =
        payload?.data?.results || payload?.results || payload?.data || [];

      const items = Array.isArray(results)
        ? results.map((item: any) => ({
          id: Number(
            item.id ?? item._id ?? item.companyId ?? item.company_id ?? 0,
          ),
          companyId:
            item.companyId ?? item.company_id ?? item.companyId ?? item.id,
          name:
            item.name ||
            item.company_name ||
            item.displayName ||
            String(item.id),
        }))
        : [];
      setCompanies(items);
    } catch (error: any) {
      console.error("[ApplicationsScreen] failed to load companies", error);
      setCompaniesError(
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load companies",
      );
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

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
        (normalizedUserType === "sales" || decodedRole === "sales") &&
        decodedRole !== "aggregator_member";
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
          ? normalizeStoredValue(storedSelectedCompanyId)
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
    (decodedRole === "sales" || userType === "sales") &&
    decodedRole !== "aggregator_member";
  const isAggregatorMember = decodedRole === "aggregator_member";
  const normalizedSalesUserId =
    (isOmsSales || userType === "sales") && salesUserId
      ? salesUserId
      : undefined;
  const applicationsCompanyId =
    isOmsSales && normalizedSalesUserId
      ? (selectedCompanyId || "all")
      : selectedCompanyId;
  const viewLockedTab =
    lockedTab ??
    (isOmsSales || isAggregatorMember ? "applications" : undefined);

  useEffect(() => {
    if (authLoaded && isOmsSales && viewLockedTab !== "tickets") {
      loadCompanies();
    }
  }, [authLoaded, isOmsSales, loadCompanies, viewLockedTab]);

  useEffect(() => {
    if (!companies.length || !selectedCompanyId) return;
    const match = companies.find(
      (company) =>
        String(company.companyId) === selectedCompanyId ||
        String(company.id) === selectedCompanyId,
    );
    if (match) setSelectedCompany(match);
  }, [companies, selectedCompanyId]);

  const saveSelectedCompany = useCallback(async (company: CompanyOption) => {
    setSelectedCompany(company);
    setSelectedCompanyId(String(company.companyId));
    setAppsPage(1);
    await AsyncStorage.setItem("selectedCompanyId", String(company.companyId));
    await AsyncStorage.setItem("selectedAggregatorId", String(company.id));
    await AsyncStorage.setItem("companyId", String(company.companyId));
    setCompanyMenuVisible(false);
  }, []);

  useEffect(() => {
    if (lockedTab === "tickets") {
      navigation.setOptions({
        title: "Tickets",
        headerTitle: undefined,
      });
      return;
    }

    if (!isOmsSales) {
      navigation.setOptions({
        title: "Applications",
        headerTitle: undefined,
      });
      return;
    }

    navigation.setOptions({
      headerTitle: () => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            maxWidth: 230,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.onSurface,
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            Applications
          </Text>
          <Menu
            visible={companyMenuVisible}
            onDismiss={() => setCompanyMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setCompanyMenuVisible(true)}
                activeOpacity={0.84}
                style={{
                  maxWidth: 116,
                  height: 32,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.dark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(50,56,243,0.16)",
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(50,56,243,0.08)",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    flexShrink: 1,
                    color: selectedCompany?.name
                      ? theme.colors.onSurface
                      : theme.colors.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {selectedCompany?.name || "Company"}
                </Text>
                <Feather
                  name={companyMenuVisible ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            }
          >
            {companiesLoading ? (
              <Menu.Item title="Loading companies..." disabled />
            ) : companiesError ? (
              <Menu.Item title={companiesError} disabled />
            ) : companies.length > 0 ? (
              companies.map((company) => (
                <Menu.Item
                  key={`${company.id}-${company.companyId}`}
                  title={company.name}
                  onPress={() => saveSelectedCompany(company)}
                />
              ))
            ) : (
              <Menu.Item title="No companies available" disabled />
            )}
          </Menu>
        </View>
      ),
    });
  }, [
    companies,
    companiesError,
    companiesLoading,
    companyMenuVisible,
    isOmsSales,
    lockedTab,
    navigation,
    saveSelectedCompany,
    selectedCompany?.name,
    theme.colors.onSurface,
    theme.colors.onSurfaceVariant,
    theme.dark,
  ]);

  useEffect(() => {
    if (!authLoaded || !__DEV__) return;
    console.log("[ApplicationsScreen] applications request scope", {
      isOmsSales,
      appliedBy: normalizedSalesUserId,
      companyId: applicationsCompanyId,
    });
  }, [applicationsCompanyId, authLoaded, isOmsSales, normalizedSalesUserId]);

  // Debounce search to avoid spamming the API and reset pagination on new search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setAppsPage(1);
        setTicketsPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  // Reset tickets pagination on date range changes
  useEffect(() => {
    setTicketsPage(1);
  }, [startDate, endDate]);

  const appsQuery = useCustomerApplications({
    page: appsPage,
    limit: appsRowsPerPage,
    search: debouncedSearch || undefined,
    appliedBy: isAggregatorMember ? salesUserId : normalizedSalesUserId,
    companyId: applicationsCompanyId,
    enabled: activeTab === "applications" && authLoaded,
  });

  const visibleAppsData = appsQuery.data;

  const ticketsQuery = useTickets({
    page: ticketsPage,
    limit: ticketsRowsPerPage,
    search: debouncedSearch || undefined,
    userId: isOmsSales
      ? normalizedSalesUserId
      : isAggregatorMember
        ? salesUserId
        : undefined,
    appliedBy: (isOmsSales || isAggregatorMember) ? "sales" : undefined,
    companyId: applicationsCompanyId,
    startDate,
    endDate,
    enabled:
      activeTab === "tickets" &&
      authLoaded &&
      (!isOmsSales || !!normalizedSalesUserId) &&
      (!isAggregatorMember || !!salesUserId),
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
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          isOmsSales={isOmsSales}
          lockedTab={viewLockedTab}
          hasSelectedCompany={!!selectedCompanyId}
          notificationTicketId={
            shouldOpenNotificationTicket ? notificationTicketId : undefined
          }
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ApplicationsScreen() {
  return <ApplicationsContent />;
}
