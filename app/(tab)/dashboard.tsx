import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { AppState, RefreshControl, ScrollView, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useSelector } from "react-redux";

import CommissionHistoryList from "@/components/ui/dashboard/ApplicationsList";
import DisbursalChart from "@/components/ui/dashboard/DisbursalChart";
import HeroCard from "@/components/ui/dashboard/HeroCard";
import LoanProductsSlider from "@/components/ui/dashboard/LoanProductsSlider";
import QuickStats from "@/components/ui/dashboard/QuickStats";
import ServicesAndTools from "@/components/ui/dashboard/ServicesAndTools";
import SkeletonLoader from "@/components/ui/dashboard/SkeletonLoader";

import { useAppConfig } from "@/contexts/ConfigContext";
import {
  useApplicationCount,
  useDashboardTicketStats,
  useDisbursedTicketsByMonth,
} from "@/hooks/use-aggregator-dashboard";
import { useCommissionTransactionsInfinite } from "@/hooks/useCommissions";
import { CommissionStatus } from "@/types/commissions";

// No Mock Data used anymore

export default function AggregatorDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const isDarkMode = useSelector((state: any) => state.theme.mode) === "dark";
  const isFocused = useIsFocused();
  const { config } = useAppConfig();

  const [refreshing, setRefreshing] = useState(false);
  const year = new Date().getFullYear();

  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [isSalesUser, setIsSalesUser] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [cid, userType] = await Promise.all([
        AsyncStorage.getItem("companyId"),
        AsyncStorage.getItem("userType"),
      ]);
      setCompanyId(cid ? Number(cid) : undefined);
      setIsSalesUser(userType === "sales");
    })();
  }, []);

  useEffect(() => {
    if (isSalesUser) {
      router.replace("/(tab)/applications");
    }
  }, [isSalesUser, router]);

  const appCount = useApplicationCount(true);
  const approved = useDashboardTicketStats({ status: "approved" }, true);
  const disbursed = useDashboardTicketStats({ status: "disbursed" }, true);
  const rejected = useDashboardTicketStats({ status: "rejected" }, true);
  const disbursedByMonth = useDisbursedTicketsByMonth(year, companyId, true);

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
      const amt = Number(tx?.finalCommission ?? tx?.commissionAmount ?? 0);
      const status = String(tx?.status ?? "").toUpperCase();

      total += amt;

      if (status === CommissionStatus.PAID || status === "PAID") {
        paid += amt;
      }

      if (
        status === CommissionStatus.PENDING ||
        status === CommissionStatus.CALCULATED ||
        status === "PENDING" ||
        status === "CALCULATED"
      ) {
        pending += amt;
      }
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

  if (isSalesUser !== false || loading) {
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

  const displayEarned = commissionSummary.total || 0;
  const displayPaid = commissionSummary.paid || 0;
  const displayPending = commissionSummary.pending || 0;

  const displaySubmitted = appCount.data || 0;
  const displayApproved = approved.data?.count || 0;
  const displayDisbursed = disbursed.data?.count || 0;
  const displayRejected = rejected.data?.count || 0;

  const displayChartData = disbursedByMonth.data || [];

  const displayCommissionRows = commissionRows || [];
  const displayTotalCount = totalCount || 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <ScrollView
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
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
        {!config.isReviewMode && <LoanProductsSlider />}

        <HeroCard
          earned={displayEarned}
          paid={displayPaid}
          pending={displayPending}
        />

        <QuickStats
          submitted={displaySubmitted}
          approved={displayApproved}
          disbursed={displayDisbursed}
          rejected={displayRejected}
        />

        <ServicesAndTools />

        <View style={{ marginBottom: 24, marginHorizontal: 20 }}>
          <DisbursalChart data={displayChartData} />
        </View>

        <CommissionHistoryList
          data={displayCommissionRows}
          fetchNextPage={commissions.fetchNextPage}
          hasNextPage={!!commissions.hasNextPage}
          isFetchingNextPage={commissions.isFetchingNextPage}
          totalCount={Number(displayTotalCount ?? 0)}
        />
      </ScrollView>
    </View>
  );
}
