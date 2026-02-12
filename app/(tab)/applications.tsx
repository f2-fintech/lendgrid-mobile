// app/(tab)/applications.tsx
import { commissionsStyles } from "@/styles/components/applications/applicationsstyles";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTheme } from "react-native-paper";

import { useCustomerApplications } from "@/hooks/use-customer-applications_rest";
import { useTickets } from "@/hooks/use-tickets_rest";

import ApplicationsTicketsView from "@/components/ui/ApplicationsTicketsView/ApplicationsTicketsView";

export default function ApplicationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"applications" | "tickets">(
    "applications",
  );

  // PAGE STATES
  const [appsPage, setAppsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);

  // ROWS PER PAGE
  const [appsRowsPerPage, setAppsRowsPerPage] = useState(10);
  const [ticketsRowsPerPage, setTicketsRowsPerPage] = useState(10);

  // INPUTS (typed by user)
  const [appsRowsPerPageInput, setAppsRowsPerPageInput] = useState("10");
  const [ticketsRowsPerPageInput, setTicketsRowsPerPageInput] = useState("10");

  // ----------------- API HOOKS -----------------
  const appsQuery = useCustomerApplications({
    page: appsPage,
    limit: appsRowsPerPage,
    search: search || undefined,
    enabled: activeTab === "applications",
  });

  const ticketsQuery = useTickets({
    page: ticketsPage,
    limit: ticketsRowsPerPage,
    search: search || undefined,
    enabled: activeTab === "tickets",
  });

  const {
    data: appsData,
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

  // Switch tab helper
  const setTab = (tab: "applications" | "tickets") => {
    setActiveTab(tab);
    pagerRef.current?.setPage(tab === "applications" ? 0 : 1);
  };

  // When coming back from Create Application screen -> refetch
  useFocusEffect(
    useCallback(() => {
      refetchApps?.();
      refetchTickets?.();
    }, [refetchApps, refetchTickets]),
  );

  // Debounced rows-per-page apply
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
          // apps
          appsData={appsData}
          appsLoading={appsLoading}
          appsError={appsError}
          refetchApps={refetchApps}
          appsPage={appsPage}
          setAppsPage={setAppsPage}
          appsRowsPerPage={appsRowsPerPage}
          appsRowsPerPageInput={appsRowsPerPageInput}
          setAppsRowsPerPageInput={setAppsRowsPerPageInput}
          // tickets
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
