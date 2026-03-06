import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
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
  isSelected: boolean;
  onPress: () => void;
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
  isSelected,
  onPress,
}: TrendBarProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const barWidth = SCREEN_WIDTH - 80;

  const safeMax = Math.max(1, Number(maxValue || 0));

  const earnedW = (Number(earned || 0) / safeMax) * barWidth;
  const paidW = (Number(paid || 0) / safeMax) * barWidth;
  const pendingW = (Number(pending || 0) / safeMax) * barWidth;

  return (
    <Pressable onPress={onPress} style={styles.trendBarContainer}>
      <Text style={styles.trendBarLabel}>{label}</Text>

      <View
        style={[
          styles.trendBar,
          isSelected && {
            borderWidth: 1,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View
          style={[
            styles.trendBarSegment,
            {
              width: earnedW,
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
              width: paidW,
              backgroundColor: "#10B981",
              marginLeft: 2,
            },
          ]}
        />

        <View
          style={[
            styles.trendBarSegment,
            {
              width: pendingW,
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
    </Pressable>
  );
};

export const CommissionTrends = ({
  trends,
  formatCurrency,
}: CommissionTrendsProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const [selected, setSelected] = useState<{
    month: string;
    earned: number;
    paid: number;
    pending: number;
  } | null>(null);

  const maxTrendValue = Math.max(
    1,
    ...trends.map((t) => Number(t.earned ?? 0)),
  );

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Commission Trends</Text>

      <Text style={styles.cardSubtitle}>
        Monthly commission earnings and payout status
      </Text>

      {/* Legend */}
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

      {/* Bars */}
      <View style={styles.trendsContainer}>
        {trends.map((trend) => {
          const t = {
            month: trend.month,
            earned: Number(trend.earned ?? 0),
            paid: Number(trend.paid ?? 0),
            pending: Number(trend.pending ?? 0),
          };

          return (
            <TrendBar
              key={t.month}
              label={t.month}
              earned={t.earned}
              paid={t.paid}
              pending={t.pending}
              maxValue={maxTrendValue}
              formatCurrency={formatCurrency}
              isSelected={selected?.month === t.month}
              onPress={() => setSelected(t)}
            />
          );
        })}
      </View>

      {/* Summary panel */}
      {selected && (
        <View
          style={{
            marginTop: 14,
            borderRadius: 12,
            padding: 14,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.outline,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: "800",
                fontSize: 15,
              }}
            >
              {selected.month} Summary
            </Text>

            {/* Close button */}
            <Pressable onPress={() => setSelected(null)}>
              <MaterialIcons
                name="close"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
          </View>

          {/* Values */}
          <View style={{ gap: 6 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                Total Earned
              </Text>

              <Text
                style={{ color: theme.colors.onSurface, fontWeight: "900" }}
              >
                {formatCurrency(selected.earned)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                Paid
              </Text>

              <Text style={{ color: "#10B981", fontWeight: "900" }}>
                {formatCurrency(selected.paid)}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                Pending
              </Text>

              <Text style={{ color: "#F59E0B", fontWeight: "900" }}>
                {formatCurrency(selected.pending)}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
