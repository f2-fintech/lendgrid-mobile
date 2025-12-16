import { Dimensions, Text, View } from "react-native";
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
  trends: Array<{
    month: string;
    earned: number;
    paid: number;
    pending: number;
  }>;
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
  const barWidth = SCREEN_WIDTH - 80;

  return (
    <View style={commissionsStyles.trendBarContainer}>
      <Text style={commissionsStyles.trendBarLabel}>{label}</Text>
      <View style={commissionsStyles.trendBar}>
        <View
          style={[
            commissionsStyles.trendBarSegment,
            {
              width: (earned / maxValue) * barWidth,
              backgroundColor: "#FFD700",
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
            },
          ]}
        />
        <View
          style={[
            commissionsStyles.trendBarSegment,
            {
              width: (paid / maxValue) * barWidth,
              backgroundColor: "#10B981",
              marginLeft: 2,
            },
          ]}
        />
        <View
          style={[
            commissionsStyles.trendBarSegment,
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
      <View style={commissionsStyles.trendBarValues}>
        <Text style={commissionsStyles.trendBarValue}>
          {formatCurrency(earned)}
        </Text>
      </View>
    </View>
  );
};

export const CommissionTrends = ({
  trends,
  formatCurrency,
}: CommissionTrendsProps) => {
  const maxTrendValue = Math.max(...trends.map((t) => t.earned));

  return (
    <View style={commissionsStyles.contentCard}>
      <Text style={commissionsStyles.cardTitle}>Commission Trends</Text>
      <Text style={commissionsStyles.cardSubtitle}>
        Monthly commission earnings and payout status
      </Text>

      <View style={commissionsStyles.legendContainer}>
        <View style={commissionsStyles.legendItem}>
          <View
            style={[
              commissionsStyles.legendDot,
              { backgroundColor: "#FFD700" },
            ]}
          />
          <Text style={commissionsStyles.legendText}>Total Earned</Text>
        </View>
        <View style={commissionsStyles.legendItem}>
          <View
            style={[
              commissionsStyles.legendDot,
              { backgroundColor: "#10B981" },
            ]}
          />
          <Text style={commissionsStyles.legendText}>Paid</Text>
        </View>
        <View style={commissionsStyles.legendItem}>
          <View
            style={[
              commissionsStyles.legendDot,
              { backgroundColor: "#F59E0B" },
            ]}
          />
          <Text style={commissionsStyles.legendText}>Pending</Text>
        </View>
      </View>

      <View style={commissionsStyles.trendsContainer}>
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
