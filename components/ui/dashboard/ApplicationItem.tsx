import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const StatusBadge = ({ status }: { status: string }) => {
  const theme = useTheme();
  const isDarkMode = theme.dark;
  const isPaid = status === "Paid";

  return (
    <View
      style={[
        dashboardStyles.badge,
        isPaid
          ? {
              backgroundColor: isDarkMode ? "#064E3B" : "#D1FAE5",
              borderColor: isDarkMode ? "#34D399" : "#10B981",
            }
          : {
              backgroundColor: isDarkMode ? "#7C2D12" : "#FEE2E2",
              borderColor: isDarkMode ? "#F97316" : "#DC2626",
            },
      ]}
    >
      <Text
        style={[
          dashboardStyles.badgeText,
          isPaid
            ? { color: isDarkMode ? "#34D399" : "#065F46" }
            : { color: isDarkMode ? "#F97316" : "#991B1B" },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

export default function ApplicationItem({ item }: { item: any }) {
  const theme = useTheme();

  return (
    <View
      style={[
        dashboardStyles.applicationItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={dashboardStyles.applicationHeader}>
        <Text
          style={[dashboardStyles.appId, { color: theme.colors.onSurface }]}
        >
          {item.id}
        </Text>
        <StatusBadge status={item.payoutStatus} />
      </View>

      <Text
        style={[dashboardStyles.lenderName, { color: theme.colors.onSurface }]}
      >
        {item.lenderName}
      </Text>

      <Text
        style={[
          dashboardStyles.loanType,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {item.loanType}
      </Text>

      <View style={dashboardStyles.applicationDetails}>
        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Disbursed Amount
          </Text>
          <Text
            style={[
              dashboardStyles.detailValue,
              { color: theme.colors.onSurface },
            ]}
          >
            {formatCurrency(item.disbursedAmount)}
          </Text>
        </View>

        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Commission
          </Text>
          <Text
            style={[
              dashboardStyles.commissionValue,
              { color: theme.colors.primary },
            ]}
          >
            {item.commissionPercent}% •{" "}
            {formatCurrency(item.calculatedCommission)}
          </Text>
        </View>

        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Payout Date
          </Text>
          <Text
            style={[
              dashboardStyles.detailValue,
              { color: theme.colors.onSurface },
            ]}
          >
            {item.payoutDate || "Pending"}
          </Text>
        </View>
      </View>
    </View>
  );
}
