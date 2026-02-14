// app/(tab)/commissions.tsx
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { CommissionHistory } from "../../components/ui/commissions/CommissionHistory";
import { CommissionMetrics } from "../../components/ui/commissions/CommissionMetrics";
import { CommissionTabs } from "../../components/ui/commissions/CommissionTabs";
import { CommissionTrends } from "../../components/ui/commissions/CommissionTrends";
import { commissionsStyles } from "../../styles/components/commissions/commissions.styles";

import { useCommissionTransactionsInfinite } from "@/hooks/useCommissions";
import { CommissionStatus, CommissionTransaction } from "@/types/commissions";

export default function CommissionsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);
  const isFocused = useIsFocused();

  const params = useLocalSearchParams<{ tab?: string; navId?: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [selectedTab, setSelectedTab] = useState<"trends" | "history">(
    "trends",
  );
  const [pageSize] = useState(50);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ FIX: apply desired internal tab EVERY TIME screen focuses
  useFocusEffect(
    useCallback(() => {
      const t = String(params?.tab || "").toLowerCase();
      if (t === "history") setSelectedTab("history");
      if (t === "trends") setSelectedTab("trends");
    }, [params?.tab, params?.navId]),
  );

  const commissions = useCommissionTransactionsInfinite({
    limit: pageSize,
    filters: undefined,
    enabled: true,
  });

  const transactions: CommissionTransaction[] = useMemo(() => {
    const pages = commissions.data?.pages ?? [];
    return pages.flatMap((p) => (p?.data ?? []) as any);
  }, [commissions.data]);

  const total = useMemo(() => {
    const last = commissions.data?.pages?.[commissions.data.pages.length - 1];
    return Number(last?.total ?? 0);
  }, [commissions.data]);

  useEffect(() => {
    if (isFocused) commissions.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isFocused) commissions.refetch();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  const isLoading = commissions.isLoading;
  const isFetchingNext = commissions.isFetchingNextPage;
  const hasNext = !!commissions.hasNextPage;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await commissions.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [commissions]);

  const onScroll = useCallback(
    (e: any) => {
      if (selectedTab !== "history") return;
      if (!hasNext || isFetchingNext) return;

      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      const paddingToBottom = 220;
      const reachedBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (reachedBottom) commissions.fetchNextPage();
    },
    [selectedTab, hasNext, isFetchingNext, commissions],
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: CommissionStatus | string) => {
    switch (status) {
      case CommissionStatus.PAID:
        return "Paid";
      case CommissionStatus.PENDING:
        return "Pending";
      case CommissionStatus.CALCULATED:
        return "Calculated";
      case CommissionStatus.APPROVED:
        return "Approved";
      case CommissionStatus.DISPUTED:
        return "Disputed";
      case CommissionStatus.REJECTED:
        return "Rejected";
      case CommissionStatus.CANCELLED:
        return "Cancelled";
      default:
        return String(status);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "#10B981";
      case "Pending":
      case "Calculated":
        return "#F59E0B";
      case "Approved":
        return "#3B82F6";
      case "Disputed":
        return "#EF4444";
      case "Rejected":
      case "Cancelled":
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return "check-circle";
      case "Pending":
        return "pending";
      case "Calculated":
        return "schedule";
      case "Approved":
        return "check-circle";
      case "Disputed":
        return "error";
      case "Rejected":
      case "Cancelled":
        return "cancel";
      default:
        return "schedule";
    }
  };

  const metrics = useMemo(() => {
    if (!transactions.length) {
      return {
        totalEarned: 0,
        pendingAmount: 0,
        paidAmount: 0,
        avgCommissionRate: 0,
      };
    }

    const totalEarned = transactions.reduce(
      (sum, t) => sum + Number((t as any).commissionAmount ?? 0),
      0,
    );

    const pendingAmount = transactions
      .filter(
        (t) =>
          (t as any).status === CommissionStatus.PENDING ||
          (t as any).status === CommissionStatus.CALCULATED,
      )
      .reduce((sum, t) => sum + Number((t as any).commissionAmount ?? 0), 0);

    const paidAmount = transactions
      .filter((t) => (t as any).status === CommissionStatus.PAID)
      .reduce((sum, t) => sum + Number((t as any).commissionAmount ?? 0), 0);

    const avgRate =
      transactions.reduce(
        (sum, t) => sum + Number((t as any).commissionRate ?? 0),
        0,
      ) / transactions.length;

    return {
      totalEarned,
      pendingAmount,
      paidAmount,
      avgCommissionRate: Number(avgRate.toFixed(2)),
    };
  }, [transactions]);

  const commissionTrends = useMemo(() => {
    if (!transactions.length) return [];

    const monthly: Record<
      string,
      { earned: number; paid: number; pending: number }
    > = {};

    transactions.forEach((t: any) => {
      const baseDate = t.calculatedAt || t.createdAt;
      if (!baseDate) return;

      const d = new Date(baseDate);
      if (Number.isNaN(d.getTime())) return;

      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthly[key]) monthly[key] = { earned: 0, paid: 0, pending: 0 };

      const amt = Number(t.commissionAmount ?? 0);
      monthly[key].earned += amt;
      if (t.status === CommissionStatus.PAID) monthly[key].paid += amt;
      else monthly[key].pending += amt;
    });

    return Object.entries(monthly)
      .map(([month, v]) => ({ month: month.split(" ")[0], ...v }))
      .slice(-6);
  }, [transactions]);

  const commissionHistory = useMemo(
    () =>
      transactions.map((t: any) => ({
        id: t.id,
        applicationId: String(t.ticketId),
        lenderName: t.provider || "N/A",
        loanType: t.productType || "N/A",
        disbursedAmount: Number(t.disbursedAmount ?? 0),
        commissionRate: Number(t.commissionRate ?? 0),
        commissionAmount: Number(t.commissionAmount ?? 0),
        status: getStatusLabel(t.status),
        disbursedDate: formatDate(t.calculatedAt),
        paidDate: t.paidAt ? formatDate(t.paidAt) : null,
      })),
    [transactions],
  );

  const filteredCommissions = useMemo(() => {
    const search = (searchTerm ?? "").toLowerCase();
    return commissionHistory.filter((c) => {
      const appId = (c.applicationId ?? "").toLowerCase();
      const lender = (c.lenderName ?? "").toLowerCase();
      const matchesSearch = appId.includes(search) || lender.includes(search);
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [commissionHistory, searchTerm, filterStatus]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (commissions.isError) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={{ color: theme.colors.error, textAlign: "center" }}>
          Failed to load commissions. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <CommissionMetrics metrics={metrics} formatCurrency={formatCurrency} />

        <CommissionTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {selectedTab === "trends" ? (
          <CommissionTrends
            trends={commissionTrends}
            formatCurrency={formatCurrency}
          />
        ) : (
          <>
            <CommissionHistory
              commissions={filteredCommissions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />

            <View style={{ paddingTop: 12, alignItems: "center" }}>
              {isFetchingNext ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : hasNext ? (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  Scroll to load more ({filteredCommissions.length}/
                  {total || "?"})
                </Text>
              ) : (
                <Text style={{ color: theme.colors.onSurfaceVariant }}>
                  No more records ({filteredCommissions.length}/
                  {total || filteredCommissions.length})
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
