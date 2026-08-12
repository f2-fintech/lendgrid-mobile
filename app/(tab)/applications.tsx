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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import {
  ActivityIndicator,
  Button,
  Dialog,
  Portal,
  useTheme,
} from "react-native-paper";

import { useCustomerApplications } from "@/hooks/use-customer-applications_rest";
import { useTickets } from "@/hooks/use-tickets_rest";
import { useAppConfig } from "@/contexts/ConfigContext";

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
  const { config } = useAppConfig();
  const effectiveLockedTab = config.isReviewMode ? "tickets" : lockedTab;

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
    effectiveLockedTab ?? "applications",
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
      if (effectiveLockedTab && tab !== effectiveLockedTab) return;

      setActiveTab(tab);

      requestAnimationFrame(() => {
        pagerRef.current?.setPage(tab === "applications" ? 0 : 1);
      });
    },
    [effectiveLockedTab],
  );

  useFocusEffect(
    useCallback(() => {
      if (effectiveLockedTab) {
        setActiveTab(effectiveLockedTab);
        return;
      }

      const t = String(params?.tab || "").toLowerCase();
      if (t === "tickets") setTab("tickets");
      if (t === "applications") setTab("applications");
    }, [effectiveLockedTab, params?.tab, setTab]),
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
          ? "101"
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
      ? "101"
      : selectedCompanyId;
  const viewLockedTab =
    effectiveLockedTab ??
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
    if (effectiveLockedTab === "tickets") {
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
      title: "Applications",
      headerTitle: undefined,
    });
  }, [
    isOmsSales,
    effectiveLockedTab,
    navigation,
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
        {isOmsSales && viewLockedTab !== "tickets" && (
          <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4, zIndex: 10 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13, marginBottom: 8, fontWeight: "600" }}>Company:</Text>
            <View
              style={{
                height: 48,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: theme.dark
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(50,56,243,0.16)",
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(50,56,243,0.04)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  flexShrink: 1,
                  color: theme.colors.onSurface,
                  fontSize: 15,
                  fontWeight: "600",
                }}
              >
                {selectedCompany?.name || "Financial Freedom"}
              </Text>
            </View>
          </View>
        )}

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

      <Portal>
        <Dialog
          visible={companyMenuVisible}
          onDismiss={() => setCompanyMenuVisible(false)}
          style={{
            borderRadius: 16,
            maxHeight: "80%",
            backgroundColor: theme.dark ? "#1E1E2D" : "#FFFFFF",
          }}
        >
          <Dialog.Title style={{ fontWeight: "700", fontSize: 18 }}>
            Select Company
          </Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: 16, maxHeight: 350 }}>
            {companiesLoading ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={{ marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                  Loading companies...
                </Text>
              </View>
            ) : companiesError ? (
              <Text style={{ color: theme.colors.error, padding: 16 }}>
                {companiesError}
              </Text>
            ) : companies.length > 0 ? (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={true}>
                {companies.map((company) => {
                  const isSelected =
                    selectedCompany?.companyId === company.companyId ||
                    selectedCompany?.id === company.id;
                  return (
                    <TouchableOpacity
                      key={`${company.id}-${company.companyId}`}
                      onPress={() => saveSelectedCompany(company)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingVertical: 14,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        marginBottom: 4,
                        backgroundColor: isSelected
                          ? theme.dark
                            ? "rgba(99, 102, 241, 0.18)"
                            : "rgba(50, 56, 243, 0.08)"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: isSelected ? "700" : "500",
                          color: isSelected
                            ? theme.colors.primary
                            : theme.colors.onSurface,
                          flex: 1,
                          marginRight: 8,
                        }}
                        numberOfLines={1}
                      >
                        {company.name}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={18} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant, padding: 16 }}>
                No companies available
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Button mode="contained" onPress={() => setCompanyMenuVisible(false)}>
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
}

export default function ApplicationsScreen() {
  return <ApplicationsContent />;
}
