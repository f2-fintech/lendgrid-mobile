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
import QuickStats from "@/components/ui/dashboard/QuickStats";
import SkeletonLoader from "@/components/ui/dashboard/SkeletonLoader";
import ServicesAndTools from "@/components/ui/dashboard/ServicesAndTools";
import DashboardHeader from "@/components/ui/dashboard/DashboardHeader";

import {
  useApplicationCount,
  useDashboardTicketStats,
  useDisbursedTicketsByMonth,
} from "@/hooks/use-aggregator-dashboard";
import { useCommissionTransactionsInfinite } from "@/hooks/useCommissions";
import { CommissionStatus } from "@/types/commissions";

// Mock Data
const MOCK_STATS = {
  submitted: 42,
  approved: 28,
  disbursed: 15,
  rejected: 4,
};

const MOCK_COMMISSION = {
  total: 125000,
  paid: 85000,
  pending: 40000,
};

const MOCK_DISBURSAL = [
  { month: "Jan", count: 45 },
  { month: "Feb", count: 52 },
  { month: "Mar", count: 38 },
  { month: "Apr", count: 65 },
  { month: "May", count: 48 },
  { month: "Jun", count: 72 },
];

export default function AggregatorDashboard() {
  const theme = useTheme();
  const router = useRouter();
  const isDarkMode = useSelector((state: any) => state.theme.mode) === "dark";
  const isFocused = useIsFocused();

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

  // Use mock data if actual data is 0 or empty for demo purposes
  const displayEarned = commissionSummary.total > 0 ? commissionSummary.total : MOCK_COMMISSION.total;
  const displayPaid = commissionSummary.paid > 0 ? commissionSummary.paid : MOCK_COMMISSION.paid;
  const displayPending = commissionSummary.pending > 0 ? commissionSummary.pending : MOCK_COMMISSION.pending;
  
  const displaySubmitted = appCount.data ? appCount.data : MOCK_STATS.submitted;
  const displayApproved = approved.data?.count ? approved.data.count : MOCK_STATS.approved;
  const displayDisbursed = disbursed.data?.count ? disbursed.data.count : MOCK_STATS.disbursed;
  const displayRejected = rejected.data?.count ? rejected.data.count : MOCK_STATS.rejected;

  const hasChartData = disbursedByMonth.data?.some((item: any) => Number(item.count) > 0);
  const displayChartData = hasChartData ? disbursedByMonth.data : MOCK_DISBURSAL;

  const MOCK_ROWS = [
    { id: 1, lenderName: "HDFC Bank", loanType: "Personal Loan", commissionAmount: 12500, commissionRate: 2.5, status: "PAID", createdAt: new Date().toISOString() },
    { id: 2, lenderName: "ICICI Bank", loanType: "Home Loan", commissionAmount: 8400, commissionRate: 1.2, status: "PENDING", createdAt: new Date().toISOString() },
    { id: 3, lenderName: "Axis Bank", loanType: "Business Loan", commissionAmount: 22100, commissionRate: 3.0, status: "CALCULATED", createdAt: new Date().toISOString() },
  ];
  const displayCommissionRows = commissionRows.length ? commissionRows : MOCK_ROWS;
  const displayTotalCount = totalCount > 0 ? totalCount : MOCK_ROWS.length;

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
