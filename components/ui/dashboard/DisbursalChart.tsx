import {
  chartConfig,
  dashboardStyles,
} from "@/styles/components/dashboard/dashboard.styles";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

type DisbursedByMonthItem = {
  month: string; // e.g. "January"
  count: number; // e.g. 5
};

const monthLabel = (m: string) => {
  if (!m) return "";
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
  const isDark = !!theme?.dark;

  // ===== Chart values =====
  const labels = (data ?? []).map((x) => monthLabel(x.month));
  const values = (data ?? []).map((x) => Number(x.count ?? 0));

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

  const chartData = useMemo(
    () => ({
      labels: safeLabels,
      datasets: [{ data: safeValues }],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeLabels.join(","), safeValues.join(",")],
  );

  // ===== Layout =====
  const baseCardWidth = width - 64;
  const perBarWidth = 52;
  const computedWidth = Math.max(
    baseCardWidth,
    safeLabels.length * perBarWidth,
  );

  const CHART_HEIGHT = 220;

  // ===== Animation =====
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, safeLabels.join(","), safeValues.join(",")]);

  // scale from bottom feel (translate + scale)
  const scaleY = anim;
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [CHART_HEIGHT / 2, 0],
  });

  // ===== Bar color (solid) for BOTH MODES =====
  const barColor = theme.colors.primary;

  // ===== Chart Config =====
  const config = {
    ...chartConfig,

    backgroundColor: theme.colors.background,
    backgroundGradientFrom: isDark
      ? theme.colors.surface
      : theme.colors.surface,
    backgroundGradientTo: isDark
      ? theme.colors.surface
      : theme.colors.surfaceVariant,

    // main chart color used by library
    color: () => barColor,

    // labels
    labelColor: () =>
      isDark ? "rgba(255,255,255,0.92)" : theme.colors.onSurface,
    propsForLabels: {
      fill: isDark ? "rgba(255,255,255,0.75)" : theme.colors.onSurfaceVariant,
    },
    propsForBackgroundLines: {
      stroke: isDark ? "rgba(255,255,255,0.10)" : theme.colors.outline,
    },

    // SOLID BAR FILL (no gradient) - works in light + dark
    fillShadowGradient: barColor,
    fillShadowGradientFrom: barColor,
    fillShadowGradientTo: barColor,
    fillShadowGradientOpacity: 1,
    fillShadowGradientFromOpacity: 1,
    fillShadowGradientToOpacity: 1,
  };

  return (
    <View
      style={[
        dashboardStyles.chartCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.10)" : theme.colors.outline,
        },
      ]}
    >
      <View style={dashboardStyles.chartHeader}>
        <Text
          style={[
            dashboardStyles.chartTitle,
            {
              color: isDark ? "rgba(255,255,255,0.92)" : theme.colors.onSurface,
            },
          ]}
        >
          Monthly Disbursal Trend
        </Text>
        <Text
          style={[
            dashboardStyles.chartSubtitle,
            {
              color: isDark
                ? "rgba(255,255,255,0.65)"
                : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          Track your loan disbursal performance
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Animated.View
          style={{
            transform: [{ translateY }, { scaleY }],
          }}
        >
          <BarChart
            data={chartData}
            width={computedWidth}
            height={CHART_HEIGHT}
            chartConfig={config}
            yAxisLabel=""
            showValuesOnTopOfBars
            withInnerLines={false}
            fromZero
            style={{ borderRadius: 16 }}
            // Optional: control bar thickness
            // barPercentage={0.6}
          />
        </Animated.View>
      </ScrollView>

      <Text
        style={[
          dashboardStyles.chartLegendText,
          {
            color: isDark
              ? "rgba(255,255,255,0.65)"
              : theme.colors.onSurfaceVariant,
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
