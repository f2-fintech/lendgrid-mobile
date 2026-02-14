import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const formatINR = (n: number) => {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

type MetricsInput = {
  applicationsSubmitted: number;
  approvedCount: number;
  approvedAmount: number;
  disbursedCount: number;
  disbursedAmount: number;
  rejectedCount: number;
  commissionTransactions: number;
  commissionEarned: number;
  commissionPaid: number;
  commissionPending: number;
};

type Metric = {
  title: string;
  value?: string;
  topText?: string;
  icon: any;
  library: any;
  color: string;
};

// ---------- Color Helpers ----------
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

// NO GRADIENT. Soft card palette for both modes.
// Light: very soft tint
// Dark: clean dark surface (no muddy tint), only subtle accent in border + icon bg
const getSoftCardPalette = (accent: string, isDark: boolean) => {
  if (!isDark) {
    const base = "#FFFFFF";
    const soft = "#F8FAFC";

    const bg = mixHex(soft, accent, 0.05);
    const border = hexToRgba(accent, 0.14);
    const iconBg = hexToRgba(accent, 0.12);

    return {
      bg,
      border,
      iconBg,
      iconColor: accent,
      topText: "rgba(15,23,41,0.70)",
      value: "#0B0F1A",
      title: "rgba(15,23,41,0.62)",
    };
  }

  const bg = "#15223e";
  const border = "rgba(255,255,255,0.10)";
  const iconBg = "rgba(255,255,255,0.06)";

  return {
    bg,
    border,
    iconBg,
    iconColor: accent,
    topText: "rgba(255,255,255,0.78)",
    value: "#FFFFFF",
    title: "rgba(255,255,255,0.62)",
  };
};

export default function MetricsGrid({ metrics }: { metrics: MetricsInput }) {
  const theme = useTheme();
  const isDarkMode = !!theme?.dark;

  const row1: Metric[] = [
    {
      title: "Approved Loans",
      topText: `${metrics.approvedCount} approved`,
      value: formatINR(metrics.approvedAmount),
      icon: "check-circle",
      library: Feather,
      color: "#10B981",
    },
    {
      title: "Commission Earned",
      value: formatINR(metrics.commissionEarned),
      icon: "currency-rupee",
      library: MaterialIcons,
      color: "#F59E0B",
    },
    {
      title: "Disbursed Loans",
      topText: `${metrics.disbursedCount} disbursed`,
      value: formatINR(metrics.disbursedAmount),
      icon: "credit-card",
      library: Feather,
      color: "#14B8A6",
    },
    {
      title: "Commission Paid",
      value: formatINR(metrics.commissionPaid),
      icon: "trending-up",
      library: Feather,
      color: "#22C55E",
    },
    {
      title: "Commission Pending",
      value: formatINR(metrics.commissionPending),
      icon: "clock",
      library: Feather,
      color: "#9CA3AF",
    },
  ];

  const row2: Metric[] = [
    {
      title: "Applications Submitted",
      topText: `${metrics.applicationsSubmitted} submitted`,
      icon: "file-text",
      library: Feather,
      color: "#2563EB",
    },
    {
      title: "Commission Transactions",
      topText: `${metrics.commissionTransactions} tickets`,
      icon: "clipboard",
      library: Feather,
      color: "#7C3AED",
    },
    {
      title: "Rejected Applications",
      topText: `${metrics.rejectedCount} rejected`,
      icon: "x-circle",
      library: Feather,
      color: "#EF4444",
    },
  ];

  const renderRow = (row: Metric[], isCapsule = false) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollContainer}
    >
      {row.map((m, i) => {
        const IconComponent = m.library;
        const p = getSoftCardPalette(m.color, isDarkMode);

        return (
          <View
            key={i}
            style={[
              isCapsule ? styles.capsuleWrapper : styles.cardWrapper,
              { marginRight: i === row.length - 1 ? 0 : 12 },
            ]}
          >
            <View
              style={[
                isCapsule ? styles.capsuleBase : styles.cardBase,
                {
                  backgroundColor: p.bg,
                  borderColor: p.border,
                },
              ]}
            >
              {isCapsule ? (
                // Capsule Layout
                <View style={styles.capsuleContent}>
                  <View
                    style={[
                      styles.capsuleIconContainer,
                      {
                        backgroundColor: p.iconBg,
                        borderColor: p.border,
                      },
                    ]}
                  >
                    <IconComponent
                      name={m.icon}
                      size={20}
                      color={p.iconColor}
                    />
                  </View>

                  <View style={styles.capsuleTextContainer}>
                    <Text
                      style={[styles.capsuleTopText, { color: p.value }]}
                      numberOfLines={1}
                    >
                      {m.topText}
                    </Text>

                    <Text
                      style={[styles.capsuleTitle, { color: p.title }]}
                      numberOfLines={1}
                    >
                      {m.title}
                    </Text>
                  </View>
                </View>
              ) : (
                // Card Layout
                <>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        backgroundColor: p.iconBg,
                        borderColor: p.border,
                      },
                    ]}
                  >
                    <IconComponent
                      name={m.icon}
                      size={22}
                      color={p.iconColor}
                    />
                  </View>

                  <View style={styles.contentContainer}>
                    {m.topText ? (
                      <Text
                        style={[styles.topText, { color: p.topText }]}
                        numberOfLines={1}
                      >
                        {m.topText}
                      </Text>
                    ) : null}

                    {m.value ? (
                      <Text
                        style={[styles.value, { color: p.value }]}
                        numberOfLines={1}
                      >
                        {m.value}
                      </Text>
                    ) : null}

                    <Text
                      style={[styles.title, { color: p.title }]}
                      numberOfLines={2}
                    >
                      {m.title}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderRow(row1)}
      {renderRow(row2, true)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  scrollContainer: { marginBottom: 8 },
  scrollContent: { paddingHorizontal: 16 },

  // Card wrapper
  cardWrapper: {
    width: 160,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardBase: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  contentContainer: { gap: 4 },

  topText: {
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    fontSize: 18,
    fontWeight: "900",
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 14,
  },

  capsuleWrapper: {
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },

  capsuleBase: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    borderRadius: 35,
    borderWidth: 1,
  },

  capsuleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  capsuleIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  capsuleTextContainer: { flex: 1, gap: 2 },

  capsuleTopText: {
    fontSize: 14,
    fontWeight: "900",
  },

  capsuleTitle: {
    fontSize: 11,
    fontWeight: "700",
  },
});
