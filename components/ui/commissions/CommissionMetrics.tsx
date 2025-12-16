import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Text, View } from "react-native";
import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

interface MetricCardProps {
  title: string;
  value: string;
  iconName: any;
  color: string;
  subtitle?: string;
  trend?: string;
}

interface CommissionMetricsProps {
  metrics: {
    totalEarned: number;
    pendingAmount: number;
    paidAmount: number;
    avgCommissionRate: number;
  };
  formatCurrency: (amount: number) => string;
}

const MetricCard = ({
  title,
  value,
  iconName,
  color,
  subtitle,
  trend,
}: MetricCardProps) => (
  <View style={commissionsStyles.metricCard}>
    <LinearGradient
      colors={["rgba(31, 41, 55, 0.8)", "rgba(17, 24, 39, 0.9)"]}
      style={commissionsStyles.metricGradient}
    >
      <View style={commissionsStyles.metricContent}>
        <View style={commissionsStyles.metricLeft}>
          <Text style={commissionsStyles.metricTitle}>{title}</Text>
          <Text style={commissionsStyles.metricValue}>{value}</Text>
          {subtitle && (
            <Text style={commissionsStyles.metricSubtitle}>{subtitle}</Text>
          )}
          {trend && (
            <View style={commissionsStyles.trendContainer}>
              <MaterialCommunityIcons
                name="trending-up"
                size={14}
                color="#10B981"
              />
              <Text style={commissionsStyles.trendText}>{trend}</Text>
            </View>
          )}
        </View>
        <View
          style={[
            commissionsStyles.metricIconContainer,
            { backgroundColor: color + "20" },
          ]}
        >
          <MaterialCommunityIcons name={iconName} size={24} color={color} />
        </View>
      </View>
    </LinearGradient>
  </View>
);

export const CommissionMetrics = ({
  metrics,
  formatCurrency,
}: CommissionMetricsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={commissionsStyles.metricsScroll}
    >
      <View style={commissionsStyles.metricsContainer}>
        <MetricCard
          title="Total Commission Earned"
          value={formatCurrency(metrics.totalEarned)}
          iconName="cash"
          color="#FFD700"
          trend="+12.5% from last month"
        />
        <MetricCard
          title="Pending Payouts"
          value={formatCurrency(metrics.pendingAmount)}
          iconName="clock"
          color="#F59E0B"
          subtitle="Awaiting payment"
        />
        <MetricCard
          title="Paid Amount"
          value={formatCurrency(metrics.paidAmount)}
          iconName="check-circle"
          color="#10B981"
          subtitle="Successfully received"
        />
        <MetricCard
          title="Avg Commission Rate"
          value={`${metrics.avgCommissionRate}%`}
          iconName="trending-up"
          color="#3B82F6"
          subtitle="Across all lenders"
        />
      </View>
    </ScrollView>
  );
};
