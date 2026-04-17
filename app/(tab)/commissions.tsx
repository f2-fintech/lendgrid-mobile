// app/(tabs)/commissions.tsx
import { useIsFocused } from "@react-navigation/native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

  const params = useLocalSearchParams<{ tab?: string }>();

  // ==================== STATES ====================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">(
    "30d",
  );
  const [selectedTab, setSelectedTab] = useState<"trends" | "history">(
    "trends",
  );

  const [pageSize] = useState(50);
  const [refreshing, setRefreshing] = useState(false);

  // ==================== HOOK ====================
  const commissionsQuery = useCommissionTransactionsInfinite({
    limit: pageSize,
    filters: {
      status: filterStatus === "all" ? undefined : filterStatus,
      // productType removed completely
    },
    dateRange,
  });

  const transactions: CommissionTransaction[] = useMemo(() => {
    const pages = commissionsQuery.data?.pages ?? [];
    return pages.flatMap((p) => (p?.data ?? []) as any);
  }, [commissionsQuery.data]);

  const total = useMemo(() => {
    const last =
      commissionsQuery.data?.pages?.[commissionsQuery.data.pages.length - 1];
    return Number(last?.total ?? 0);
  }, [commissionsQuery.data]);

  // Reset when filters change
  useEffect(() => {
    commissionsQuery.refetch();
  }, [filterStatus, dateRange]);

  useFocusEffect(
    useCallback(() => {
      const t = String(params?.tab || "").toLowerCase();
      if (t === "history") setSelectedTab("history");
      if (t === "trends") setSelectedTab("trends");
    }, [params?.tab]),
  );

  useEffect(() => {
    if (isFocused) commissionsQuery.refetch();
  }, [isFocused]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await commissionsQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [commissionsQuery]);

  // ==================== FORMATTING ====================
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

  const getStatusLabel = (status: any) => {
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

  // ==================== METRICS ====================
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
      (sum, t: any) =>
        sum + Number(t.finalCommission ?? t.commissionAmount ?? 0),
      0,
    );

    const pendingAmount = transactions
      .filter(
        (t: any) =>
          t.status === CommissionStatus.PENDING ||
          t.status === CommissionStatus.CALCULATED,
      )
      .reduce(
        (sum, t: any) =>
          sum + Number(t.finalCommission ?? t.commissionAmount ?? 0),
        0,
      );

    const paidAmount = transactions
      .filter((t: any) => t.status === CommissionStatus.PAID)
      .reduce(
        (sum, t: any) =>
          sum + Number(t.finalCommission ?? t.commissionAmount ?? 0),
        0,
      );

    const avgRate = transactions.length
      ? transactions.reduce(
          (sum, t: any) => sum + Number(t.commissionRate ?? 0),
          0,
        ) / transactions.length
      : 0;

    return {
      totalEarned,
      pendingAmount,
      paidAmount,
      avgCommissionRate: Number(avgRate.toFixed(2)),
    };
  }, [transactions]);

  // ==================== TRENDS (Monthly) ====================
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

      const amt = Number(t.finalCommission ?? t.commissionAmount ?? 0);
      monthly[key].earned += amt;
      if (t.status === CommissionStatus.PAID) monthly[key].paid += amt;
      else monthly[key].pending += amt;
    });

    return Object.entries(monthly)
      .map(([month, v]) => ({ month: month.split(" ")[0], ...v }))
      .slice(-6);
  }, [transactions]);

  // ==================== COMMISSION HISTORY ====================
  const commissionHistory = useMemo(() => {
    return transactions.map((t: any) => ({
      id: String(t.id ?? t._id ?? ""),
      applicationId: String(t.ticketId ?? t.applicationId ?? ""),
      lenderName: t.provider ?? t.lenderName ?? t.lender ?? "N/A",
      loanType: t.loanType ?? t.productType ?? "N/A",
      disbursedAmount: Number(t.disbursedAmount ?? 0),
      commissionRate: Number(t.commissionRate ?? 0),
      commissionAmount: Number(t.finalCommission ?? t.commissionAmount ?? 0),
      status: getStatusLabel(t.status),
      disbursedDate: formatDate(t.calculatedAt ?? t.createdAt),
      paidDate: t.paidAt ? formatDate(t.paidAt) : null,
      utrNumber: t.utrNumber ?? t.utr ?? "-",
      paymentProofUrl: t.paymentProofUrl,
    }));
  }, [transactions]);

  // Only search filter (status is handled by backend now)
  const filteredCommissions = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return commissionHistory.filter((c) => {
      const matchesSearch =
        c.applicationId.toLowerCase().includes(search) ||
        c.lenderName.toLowerCase().includes(search) ||
        c.loanType.toLowerCase().includes(search);

      return matchesSearch;
    });
  }, [commissionHistory, searchTerm]);

  // ==================== LOADING & ERROR ====================
  if (commissionsQuery.isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (commissionsQuery.isError) {
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
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
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
          <CommissionHistory
            commissions={filteredCommissions}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            metrics={metrics}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            total={total}
          />
        )}
      </ScrollView>
    </View>
  );
}
