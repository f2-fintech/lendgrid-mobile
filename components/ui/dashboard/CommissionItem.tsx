import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

function StatusBadge({ label = "Calculated" }: { label?: string }) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(251,191,36,0.12)" : "#FFF7ED",
        borderWidth: 1,
        borderColor: isDark ? "rgba(251,191,36,0.35)" : "#FB923C",
      }}
    >
      <Text
        numberOfLines={1}
        style={{
          color: isDark ? "#FBBF24" : "#C2410C",
          fontSize: 10,
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function CommissionHistoryItem({ item }: { item: any }) {
  const theme = useTheme();

  const ticketNo = item?.ticketId ?? item?.id ?? "-";
  const lenderName = item?.lenderName ?? item?.provider ?? "N/A";
  const loanType = item?.loanType ?? item?.productType ?? "N/A";

  const rate = Number(item?.commissionPercent ?? item?.commissionRate ?? 0);

  const commissionAmount = formatCurrency(
    Number(item?.finalCommission ?? item?.commissionAmount ?? 0),
  );

  const status = item?.status ?? "Calculated";
  const normalizedStatus = String(status).trim().toLowerCase();
  const isPaid = normalizedStatus === "paid";

  // Using a softer style for the card in dashboard.styles
  return (
    <View
      style={[
        dashboardStyles.applicationItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.dark ? "rgba(255,255,255,0.05)" : theme.colors.outline,
        },
      ]}
    >
      {/* Icon */}
      <View style={dashboardStyles.itemIconContainer}>
        <Feather name="file-text" size={20} color="#3B82F6" />
      </View>

      {/* Center content */}
      <View style={dashboardStyles.applicationHeader}>
        <Text
          numberOfLines={1}
          style={dashboardStyles.appId}
        >
          F2FIN-{ticketNo}
        </Text>
        <Text
          numberOfLines={1}
          style={dashboardStyles.lenderName}
        >
          {lenderName}
        </Text>
        <Text
          numberOfLines={1}
          style={dashboardStyles.loanType}
        >
          {loanType} • {rate}%
        </Text>
      </View>

      {/* Right content */}
      <View style={dashboardStyles.applicationRight}>
        <Text
          numberOfLines={1}
          style={dashboardStyles.commissionValue}
        >
          {commissionAmount}
        </Text>
        <StatusBadge label={status} />
      </View>
    </View>
  );
}
