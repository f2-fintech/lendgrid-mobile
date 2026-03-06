import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { AppState, RefreshControl, ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import CommissionHistoryList from "@/components/ui/dashboard/ApplicationsList";
import DisbursalChart from "@/components/ui/dashboard/DisbursalChart";
import MetricsGrid from "@/components/ui/dashboard/MetricsGrid";
import SkeletonLoader from "@/components/ui/dashboard/SkeletonLoader";

import {
  useApplicationCount,
  useDashboardTicketStats,
  useDisbursedTicketsByMonth,
} from "@/hooks/use-aggregator-dashboard";
import { useCommissionTransactionsInfinite } from "@/hooks/useCommissions";

export default function AggregatorDashboard() {
  const theme = useTheme();
  const isDarkMode = useSelector((state: any) => state.theme.mode) === "dark";
  const isFocused = useIsFocused();

  const [refreshing, setRefreshing] = useState(false);
  const year = new Date().getFullYear();

  const [companyId, setCompanyId] = useState<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const cid = await AsyncStorage.getItem("companyId");
      setCompanyId(cid ? Number(cid) : undefined);
    })();
  }, []);

  const appCount = useApplicationCount(true);
  const approved = useDashboardTicketStats({ status: "approved" }, true);
  const disbursed = useDashboardTicketStats({ status: "disbursed" }, true);
  const rejected = useDashboardTicketStats({ status: "rejected" }, true);
  const disbursedByMonth = useDisbursedTicketsByMonth(year, companyId, true);

  // Commissions Infinite
  const commissions = useCommissionTransactionsInfinite({
    limit: 10,
    filters: undefined,
    enabled: true,
  });

  const commissionRows =
    commissions.data?.pages?.flatMap((p) => p?.data ?? []) ?? [];

  const totalCount =
    commissions.data?.pages?.[commissions.data.pages.length - 1]?.total ??
    commissions.data?.pages?.[0]?.total ??
    0;

  // Refetch on tab focus (ONLY REST; don’t refetch commissions pages)
  useEffect(() => {
    if (!isFocused) return;

    appCount.refetch();
    approved.refetch();
    disbursed.refetch();
    rejected.refetch();
    disbursedByMonth.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) return;

    commissions.resetToFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // Refetch on app resume
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isFocused) {
        appCount.refetch();
        approved.refetch();
        disbursed.refetch();
        rejected.refetch();
        disbursedByMonth.refetch();
      }
    });

    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const commissionSummary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;

    for (const tx of commissionRows) {
      const amt = Number(tx?.commissionAmount ?? 0);
      total += amt;
      if (tx?.status === "PAID") paid += amt;
      if (tx?.status === "PENDING" || tx?.status === "CALCULATED")
        pending += amt;
    }

    return { total, paid, pending };
  }, [commissionRows]);

  const loading =
    appCount.isLoading ||
    approved.isLoading ||
    disbursed.isLoading ||
    rejected.isLoading ||
    disbursedByMonth.isLoading;

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.allSettled([
      appCount.refetch(),
      approved.refetch(),
      disbursed.refetch(),
      rejected.refetch(),
      disbursedByMonth.refetch(),
      commissions.refetch(),
    ]);

    setRefreshing(false);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <SkeletonLoader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <MetricsGrid
          metrics={{
            applicationsSubmitted: appCount.data ?? 0,

            approvedCount: approved.data?.count ?? 0,
            approvedAmount: approved.data?.amount ?? 0,

            disbursedCount: disbursed.data?.count ?? 0,
            disbursedAmount: disbursed.data?.amount ?? 0,

            rejectedCount: rejected.data?.count ?? 0,

            commissionTransactions: Number(totalCount ?? 0),
            commissionEarned: commissionSummary.total,
            commissionPaid: commissionSummary.paid,
            commissionPending: commissionSummary.pending,
          }}
        />

        <View style={{ marginTop: -12 }}>
          <DisbursalChart data={disbursedByMonth.data ?? []} />
        </View>

        <CommissionHistoryList
          data={commissionRows}
          fetchNextPage={commissions.fetchNextPage}
          hasNextPage={!!commissions.hasNextPage}
          isFetchingNextPage={commissions.isFetchingNextPage}
          totalCount={Number(totalCount ?? 0)}
        />
      </ScrollView>
    </View>
  );
}
