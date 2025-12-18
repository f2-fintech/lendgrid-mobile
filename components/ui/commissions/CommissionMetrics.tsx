import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

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
}: MetricCardProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  return (
    <View style={styles.metricCard}>
      <LinearGradient
        colors={[theme.colors.surfaceVariant, theme.colors.surface]}
        style={styles.metricGradient}
      >
        <View style={styles.metricContent}>
          <View style={styles.metricLeft}>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricValue}>{value}</Text>
            {!!subtitle && (
              <Text style={styles.metricSubtitle}>{subtitle}</Text>
            )}
            {!!trend && (
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={14}
                  color="#10B981"
                />
                <Text style={styles.trendText}>{trend}</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.metricIconContainer,
              { backgroundColor: color + "20" },
            ]}
          >
            <MaterialCommunityIcons name={iconName} size={24} color={color} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export const CommissionMetrics = ({
  metrics,
  formatCurrency,
}: CommissionMetricsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.metricsScroll}
    >
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Commission Earned"
          value={formatCurrency(metrics.totalEarned)}
          iconName="cash"
          color={theme.colors.tertiary}
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
