import {
    chartConfig,
    dashboardStyles,
} from "@/styles/components/dashboard/dashboard.styles";
import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [{ data: [1200000, 1800000, 2200000, 1900000, 2500000, 2800000] }],
};

export default function DisbursalChart() {
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
      <BarChart
        data={chartData}
        width={width - 64}
        height={220}
        chartConfig={config}
        yAxisLabel="₹"
        showValuesOnTopOfBars
        withInnerLines={false}
        fromZero
        style={{ borderRadius: 16 }}
      />
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
        Amounts in Indian Rupees (₹)
      </Text>
    </View>
  );
}
