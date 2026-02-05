import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const formatINR = (n: number) => {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

type MetricsInput = {
  applicationsSubmitted: number;
  approvedCount: number;
  approvedAmount: number;
  disbursedCount: number;
  disbursedAmount: number;
  rejectedCount: number;
  commissionTransactions: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
};

type Metric = {
  title: string;
  value?: string;
  topText?: string;
  icon: any;
  library: any;
  color: string;
};

export default function MetricsGrid({ metrics }: { metrics: MetricsInput }) {
  const theme = useTheme();
  const isDarkMode = theme.dark;

  const cards: Metric[] = [
    {
      title: "Applications Submitted",
      topText: `${metrics.applicationsSubmitted} tickets`,
      value: "",
      icon: "file-text",
      library: Feather,
      color: "#2563EB",
    },
    {
      title: "Approved Loans",
      topText: `${metrics.approvedCount} approved`,
      value: formatINR(metrics.approvedAmount),
      icon: "check-circle",
      library: Feather,
      color: "#10B981",
    },
    {
      title: "Disbursed Loans",
      topText: `${metrics.disbursedCount} disbursed`,
      value: formatINR(metrics.disbursedAmount),
      icon: "credit-card",
      library: Feather,
      color: "#14B8A6",
    },
    {
      title: "Rejected Applications",
      topText: `${metrics.rejectedCount} rejected`,
      value: "",
      icon: "x-circle",
      library: Feather,
      color: "#6B7280",
    },
    {
      title: "Commission Transactions",
      topText: `${metrics.commissionTransactions} tickets`,
      value: "",
      icon: "clipboard",
      library: Feather,
      color: "#2563EB",
    },
    {
      title: "Commission Earned",
      value: formatINR(metrics.commissionEarned),
      icon: "currency-rupee",
      library: MaterialIcons,
      color: "#F59E0B",
    },
    {
      title: "Commission Paid",
      value: formatINR(metrics.commissionPaid),
      icon: "trending-up",
      library: Feather,
      color: "#22C55E",
    },
    {
      title: "Commission Pending",
      value: formatINR(metrics.commissionPending),
      icon: "clock",
      library: Feather,
      color: "#6B7280",
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 0,
      }}
      style={{
        marginTop: 0,
        marginBottom: 8,
      }}
    >
      {cards.map((m, i) => (
        <View
          key={i}
          style={[
            dashboardStyles.metricCard,
            {
              backgroundColor: isDarkMode
                ? theme.colors.surfaceVariant
                : theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              marginRight: i === cards.length - 1 ? 0 : 12,
            },
          ]}
        >
          <View style={dashboardStyles.metricContent}>
            <View style={dashboardStyles.metricTextContainer}>
              {m.topText ? (
                <Text
                  style={[
                    dashboardStyles.metricTitle,
                    { color: theme.colors.onSurfaceVariant, marginBottom: 6 },
                  ]}
                >
                  {m.topText}
                </Text>
              ) : null}

              {m.value ? (
                <Text
                  style={[
                    dashboardStyles.metricValue,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {m.value}
                </Text>
              ) : null}

              <Text
                style={[
                  dashboardStyles.metricTitle,
                  {
                    color: theme.colors.onSurfaceVariant,
                    marginTop: m.value ? 8 : 0,
                    fontWeight: "700",
                  },
                ]}
              >
                {m.title}
              </Text>
            </View>

            <View
              style={[
                dashboardStyles.iconContainer,
                {
                  backgroundColor: isDarkMode ? m.color : `${m.color}20`,
                },
              ]}
            >
              <m.library
                name={m.icon}
                size={20}
                color={isDarkMode ? "#FFFFFF" : m.color}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
