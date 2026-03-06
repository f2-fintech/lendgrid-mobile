import { MaterialCommunityIcons } from "@expo/vector-icons";
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

// -------------------- helpers --------------------
const clamp = (n: number, min = 0, max = 255) =>
  Math.max(min, Math.min(max, n));

const hexToRgb = (hex: string) => {
  const h = (hex || "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;

  return {
    r: parseInt(full.substring(0, 2) || "00", 16),
    g: parseInt(full.substring(2, 4) || "00", 16),
    b: parseInt(full.substring(4, 6) || "00", 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const mixHex = (a: string, b: string, amount: number) => {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(
    Math.round(A.r + (B.r - A.r) * amount),
    Math.round(A.g + (B.g - A.g) * amount),
    Math.round(A.b + (B.b - A.b) * amount),
  );
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${alpha})`;
};

//  Light stays soft + premium
//  Dark becomes clean ticket-like (no tinted muddy bg)
const getCardPalette = (accent: string, isDark: boolean, theme: any) => {
  if (!isDark) {
    // LIGHT MODE (your “good” look)
    const base = "#FFFFFF";
    const soft = "#F8FAFC";

    // small tint only (very light)
    const cardBg = mixHex(base, accent, 0.06);
    const cardBg2 = mixHex(soft, accent, 0.03);

    return {
      bg: cardBg2, // nice soft bg
      border: hexToRgba(accent, 0.16),
      strip: hexToRgba(accent, 0.85),
      title: "rgba(15,23,41,0.72)",
      value: "#0B0F1A",
      subtitle: "rgba(15,23,41,0.60)",
      trendText: "rgba(15,23,41,0.70)",
      iconBg: hexToRgba(accent, 0.12),
      iconColor: accent,
      shadow: false,
    };
  }

  // DARK MODE (CLEAN — same family as ticket card)
  // Key: DO NOT tint the whole background with accent.
  // Use theme surface tones + neutral border.
  const bg = theme?.colors?.surfaceVariant || "#111827";
  const borderNeutral = theme?.colors?.outline || "rgba(255,255,255,0.10)";

  return {
    bg,
    border: borderNeutral, // neutral border (clean)
    strip: hexToRgba(accent, 0.9), // accent strip only
    title: "rgba(255,255,255,0.78)",
    value: "#FFFFFF",
    subtitle: "rgba(255,255,255,0.60)",
    trendText: "rgba(255,255,255,0.72)",
    iconBg: "rgba(255,255,255,0.06)", // neutral icon bg (no dirty tint)
    iconColor: "#FFFFFF", // clean
    shadow: true,
  };
};

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

  const isDark = !!theme?.dark;
  const p = getCardPalette(color, isDark, theme);

  return (
    <View style={styles.metricCard}>
      {/*  NO GRADIENT: pure soft card */}
      <View
        style={[
          styles.metricGradient,
          {
            backgroundColor: p.bg,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: p.border,

            ...(p.shadow
              ? {
                  shadowColor: "#000",
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 5,
                }
              : {}),
          },
        ]}
      >
        {/* Accent strip (premium & consistent) */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: p.strip,
          }}
        />

        <View style={styles.metricContent}>
          <View style={styles.metricLeft}>
            <Text
              style={[styles.metricTitle, { color: p.title }]}
              numberOfLines={1}
            >
              {title}
            </Text>

            <Text
              style={[styles.metricValue, { color: p.value }]}
              numberOfLines={1}
            >
              {value}
            </Text>

            {!!subtitle && (
              <Text
                style={[styles.metricSubtitle, { color: p.subtitle }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}

            {!!trend && (
              <View style={styles.trendContainer}>
                <MaterialCommunityIcons
                  name="trending-up"
                  size={14}
                  color="#10B981"
                />
                <Text
                  style={[styles.trendText, { color: p.trendText }]}
                  numberOfLines={1}
                >
                  {trend}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.metricIconContainer,
              {
                backgroundColor: p.iconBg,
                borderColor: isDark ? "rgba(255,255,255,0.10)" : p.border,
                borderWidth: 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={24}
              color={p.iconColor}
            />
          </View>
        </View>
      </View>
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
      contentContainerStyle={styles.metricsScrollContent}
    >
      <View style={styles.metricsContainer}>
        <MetricCard
          title="Total Commission Earned"
          value={formatCurrency(metrics.totalEarned)}
          iconName="cash"
          color={theme.colors.tertiary}
          subtitle="Commission Transections"
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
