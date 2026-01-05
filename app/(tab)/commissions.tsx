import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { CommissionHistory } from "../../components/ui/commissions/CommissionHistory";
import { CommissionMetrics } from "../../components/ui/commissions/CommissionMetrics";
import { CommissionTabs } from "../../components/ui/commissions/CommissionTabs";
import { CommissionTrends } from "../../components/ui/commissions/CommissionTrends";

import { commissionsStyles } from "../../styles/components/commissions/commissions.styles";

import { useMyAggregatorProfile } from "@/hooks/useAggregator";
import { useCommissionTransactions } from "@/hooks/useCommissions";
import { CommissionStatus, CommissionTransaction } from "@/types/commissions";

export default function CommissionsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [selectedTab, setSelectedTab] = useState<"trends" | "history">(
    "trends"
  );
  const [page] = useState(1);
  const [pageSize] = useState(50);

  // 1) Aggregator profile (may be null right now – that’s okay)
  const {
    data: myProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useMyAggregatorProfile();

  // 2) Fetch commissions (currently no filter; later you can add { aggregatorId })
  const {
    data: commissionsData,
    isLoading: isCommissionsLoading,
    isError: isCommissionsError,
  } = useCommissionTransactions({
    page,
    limit: pageSize,
    // filters: aggregatorId ? { aggregatorId } : undefined,
    filters: undefined,
    enabled: true,
  });

  const isLoading = isProfileLoading || isCommissionsLoading;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  //  Correct mapping from backend enum → UI label
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
        return "#10B981"; // green
      case "Pending":
      case "Calculated":
        return "#F59E0B"; // orange
      case "Approved":
        return "#3B82F6"; // blue
      case "Disputed":
        return "#EF4444"; // red
      case "Rejected":
      case "Cancelled":
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  // Icons based on UI label
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return "check-circle";
      case "Pending":
        return "pending";
      case "Calculated":
        return "schedule"; // clock icon
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

  const transactions: CommissionTransaction[] = commissionsData?.data || [];

  // ---------- Metrics ----------

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
      (sum, t) => sum + t.commissionAmount,
      0
    );

    const pendingAmount = transactions
      .filter(
        (t) =>
          t.status === CommissionStatus.PENDING ||
          t.status === CommissionStatus.CALCULATED
      )
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const paidAmount = transactions
      .filter((t) => t.status === CommissionStatus.PAID)
      .reduce((sum, t) => sum + t.commissionAmount, 0);

    const avgRate =
      transactions.reduce((sum, t) => sum + t.commissionRate, 0) /
      transactions.length;

    const result = {
      totalEarned,
      pendingAmount,
      paidAmount,
      avgCommissionRate: Number(avgRate.toFixed(2)),
    };

    return result;
  }, [transactions]);

  // ---------- Trends ----------

  const commissionTrends = useMemo(() => {
    if (!transactions.length) return [];

    const monthly: Record<
      string,
      { earned: number; paid: number; pending: number }
    > = {};

    transactions.forEach((t) => {
      const baseDate = t.calculatedAt || t.createdAt;
      const d = new Date(baseDate);
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthly[key]) {
        monthly[key] = { earned: 0, paid: 0, pending: 0 };
      }

      monthly[key].earned += t.commissionAmount;

      if (t.status === CommissionStatus.PAID) {
        monthly[key].paid += t.commissionAmount;
      } else {
        monthly[key].pending += t.commissionAmount;
      }
    });

    const arr = Object.entries(monthly)
      .map(([month, v]) => ({
        month: month.split(" ")[0],
        ...v,
      }))
      .slice(-6);

    console.log("📈 COMMISSION TRENDS >>>", arr);
    return arr;
  }, [transactions]);

  // ---------- History mapping (appId forced to string) ----------

  const commissionHistory = useMemo(
    () =>
      transactions.map((t) => ({
        id: t.id,
        applicationId: String(t.ticketId), // always string
        lenderName: t.provider || "N/A",
        loanType: t.productType || "N/A",
        disbursedAmount: t.disbursedAmount,
        commissionRate: t.commissionRate,
        commissionAmount: t.commissionAmount,
        status: getStatusLabel(t.status), // label like "Calculated"
        disbursedDate: formatDate(t.calculatedAt),
        paidDate: t.paidAt ? formatDate(t.paidAt) : null,
      })),
    [transactions]
  );

  // ---------- Filters ----------

  const filteredCommissions = commissionHistory.filter((c) => {
    const appId = (c.applicationId ?? "").toString().toLowerCase();
    const lender = (c.lenderName ?? "").toString().toLowerCase();
    const search = (searchTerm ?? "").toLowerCase();

    const matchesSearch = appId.includes(search) || lender.includes(search);

    const matchesStatus = filterStatus === "all" || c.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const renderSelectedTab = () => {
    switch (selectedTab) {
      case "trends":
        return (
          <CommissionTrends
            trends={commissionTrends}
            formatCurrency={formatCurrency}
          />
        );
      case "history":
        return (
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
        );
      default:
        return null;
    }
  };

  // ---------- Loading / Error ----------

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isProfileError || isCommissionsError) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={{ color: theme.colors.error, textAlign: "center" }}>
          Failed to load commissions. Please try again.
        </Text>
      </View>
    );
  }

  // ---------- Main UI ----------

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <CommissionMetrics metrics={metrics} formatCurrency={formatCurrency} />

        {/* Tabs stay same as before: Trends + Payment History */}
        <CommissionTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {renderSelectedTab()}
      </ScrollView>
    </View>
  );
}
