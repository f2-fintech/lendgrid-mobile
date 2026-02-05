import {
  chartConfig,
  dashboardStyles,
} from "@/styles/components/dashboard/dashboard.styles";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

type DisbursedByMonthItem = {
  month: string; // e.g. "January"
  count: number; // e.g. 5
};

const monthLabel = (m: string) => {
  if (!m) return "";
  // "January" -> "Jan"
  const s = String(m).trim();
  return s.length >= 3
    ? s.slice(0, 3).charAt(0).toUpperCase() + s.slice(1, 3).toLowerCase()
    : s;
};

export default function DisbursalChart({
  data = [],
}: {
  data?: DisbursedByMonthItem[];
}) {
  const theme = useTheme();

  const config = {
    ...chartConfig,
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surfaceVariant,
    color: () => theme.colors.primary,
    labelColor: () => theme.colors.onSurface,
    propsForLabels: { fill: theme.colors.onSurfaceVariant },
    propsForBackgroundLines: { stroke: theme.colors.outline },
  };

  //  Dynamic labels/values from backend
  const labels = (data ?? []).map((x) => monthLabel(x.month));
  const values = (data ?? []).map((x) => Number(x.count ?? 0));

  //  If backend returns empty, keep chart stable (optional safety)
  const safeLabels =
    labels.length > 0
      ? labels
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

  const safeValues =
    values.length > 0 ? values : new Array(safeLabels.length).fill(0);

  const chartData = {
    labels: safeLabels,
    datasets: [{ data: safeValues }],
  };

  //  Wider chart when many months => horizontal scroll
  const baseCardWidth = width - 64;
  const perBarWidth = 52; // increase if you want more spacing
  const computedWidth = Math.max(
    baseCardWidth,
    safeLabels.length * perBarWidth,
  );

  return (
    <View
      style={[
        dashboardStyles.chartCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={dashboardStyles.chartHeader}>
        <Text
          style={[
            dashboardStyles.chartTitle,
            { color: theme.colors.onSurface },
          ]}
        >
          Monthly Disbursal Trend
        </Text>
        <Text
          style={[
            dashboardStyles.chartSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Track your loan disbursal performance
        </Text>
      </View>

      {/*  Horizontal scroll to avoid congestion */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={computedWidth}
          height={220}
          chartConfig={config}
          yAxisLabel=""
          showValuesOnTopOfBars
          withInnerLines={false}
          fromZero
          style={{ borderRadius: 16 }}
          // Optional: control bar thickness
          // barPercentage={0.6}
        />
      </ScrollView>

      <Text
        style={[
          dashboardStyles.chartLegendText,
          {
            color: theme.colors.onSurfaceVariant,
            textAlign: "center",
            marginTop: 8,
          },
        ]}
      >
        Disbursed tickets count by month
      </Text>
    </View>
  );
}
