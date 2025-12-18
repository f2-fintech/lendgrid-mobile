import { useMemo } from "react";
import { Dimensions, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TrendBarProps {
  label: string;
  earned: number;
  paid: number;
  pending: number;
  maxValue: number;
  formatCurrency: (amount: number) => string;
}

interface CommissionTrendsProps {
  trends: {
    month: string;
    earned: number;
    paid: number;
    pending: number;
  }[];
  formatCurrency: (amount: number) => string;
}

const TrendBar = ({
  label,
  earned,
  paid,
  pending,
  maxValue,
  formatCurrency,
}: TrendBarProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const barWidth = SCREEN_WIDTH - 80;

  return (
    <View style={styles.trendBarContainer}>
      <Text style={styles.trendBarLabel}>{label}</Text>

      <View style={styles.trendBar}>
        <View
          style={[
            styles.trendBarSegment,
            {
              width: (earned / maxValue) * barWidth,
              backgroundColor: theme.colors.tertiary,
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            },
          ]}
        />
        <View
          style={[
            styles.trendBarSegment,
            {
              width: (paid / maxValue) * barWidth,
              backgroundColor: "#10B981",
              marginLeft: 2,
            },
          ]}
        />
        <View
          style={[
            styles.trendBarSegment,
            {
              width: (pending / maxValue) * barWidth,
              backgroundColor: "#F59E0B",
              marginLeft: 2,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            },
          ]}
        />
      </View>

      <View style={styles.trendBarValues}>
        <Text style={styles.trendBarValue}>{formatCurrency(earned)}</Text>
      </View>
    </View>
  );
};

export const CommissionTrends = ({
  trends,
  formatCurrency,
}: CommissionTrendsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const maxTrendValue = Math.max(...trends.map((t) => t.earned));

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Commission Trends</Text>
      <Text style={styles.cardSubtitle}>
        Monthly commission earnings and payout status
      </Text>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.tertiary },
            ]}
          />
          <Text style={styles.legendText}>Total Earned</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
          <Text style={styles.legendText}>Paid</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
      </View>

      <View style={styles.trendsContainer}>
        {trends.map((trend) => (
          <TrendBar
            key={trend.month}
            label={trend.month}
            earned={trend.earned}
            paid={trend.paid}
            pending={trend.pending}
            maxValue={maxTrendValue}
            formatCurrency={formatCurrency}
          />
        ))}
      </View>
    </View>
  );
};
