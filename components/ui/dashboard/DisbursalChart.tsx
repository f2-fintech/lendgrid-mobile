import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useAppConfig } from "@/contexts/ConfigContext";

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
  const { config: appConfig } = useAppConfig();
  const loanWord = appConfig?.terminology?.loanWord || "Service";

  // ===== Chart values =====
  const labels = (data ?? []).map((x) => monthLabel(x.month));
  const values = (data ?? []).map((x) => Number(x.count ?? 0));

  const safeLabels =
    labels.length > 0
      ? labels
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

  const safeValues =
    values.length > 0 ? values : new Array(safeLabels.length).fill(0);

  const maxValue = Math.max(...safeValues, 10);
  const CHART_HEIGHT = 160;

  // ===== Animation =====
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Animating height, must be false
    }).start();
  }, [anim, safeLabels.join(","), safeValues.join(",")]);

  return (
    <View
      style={[
        dashboardStyles.chartCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isDark ? "rgba(255,255,255,0.10)" : theme.colors.outline,
          padding: 20,
          borderRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        },
      ]}
    >
      <View style={dashboardStyles.chartHeader}>
        <Text
          style={[
            dashboardStyles.chartTitle,
            {
              color: isDark ? "rgba(255,255,255,0.92)" : theme.colors.onSurface,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 4,
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
              fontSize: 13,
            },
          ]}
        >
          {`Track your ${loanWord.toLowerCase()} disbursal performance`}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20, marginTop: 32 }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end", height: CHART_HEIGHT + 30 }}>
          {safeValues.map((val, idx) => {
            const barHeight = (val / maxValue) * CHART_HEIGHT;
            
            const animatedHeight = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, barHeight],
            });

            return (
              <View key={idx} style={{ alignItems: "center", marginRight: 24 }}>
                <Text 
                  style={{ 
                    color: isDark ? "rgba(255,255,255,0.8)" : theme.colors.onSurface,
                    fontSize: 12, 
                    fontWeight: "700",
                    marginBottom: 8 
                  }}
                >
                  {val > 0 ? val : ""}
                </Text>
                
                <View style={{ 
                  height: CHART_HEIGHT, 
                  justifyContent: 'flex-end',
                  width: 36,
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  borderRadius: 18,
                  overflow: "hidden"
                }}>
                  <Animated.View
                    style={{
                      height: animatedHeight,
                      width: "100%",
                      backgroundColor: theme.colors.primary,
                      borderRadius: 18,
                    }}
                  />
                </View>

                <Text 
                  style={{ 
                    marginTop: 12, 
                    color: isDark ? "rgba(255,255,255,0.5)" : theme.colors.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: "600"
                  }}
                >
                  {safeLabels[idx]}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
