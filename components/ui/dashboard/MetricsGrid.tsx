import { Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
  gradientColors: string[];
};

export default function MetricsGrid({ metrics }: { metrics: MetricsInput }) {
  const theme = useTheme();
  const isDarkMode = theme.dark;

  // Row 1: Monetary value cards (5 cards)
  const row1: Metric[] = [
    {
      title: "Approved Loans",
      topText: `${metrics.approvedCount} approved`,
      value: formatINR(metrics.approvedAmount),
      icon: "check-circle",
      library: Feather,
      color: "#10B981",
      gradientColors: ["#ECFDF5", "#D1FAE5"],
    },
    {
      title: "Commission Earned",
      value: formatINR(metrics.commissionEarned),
      icon: "currency-rupee",
      library: MaterialIcons,
      color: "#F59E0B",
      gradientColors: ["#FFFBEB", "#FEF3C7"],
    },
    {
      title: "Disbursed Loans",
      topText: `${metrics.disbursedCount} disbursed`,
      value: formatINR(metrics.disbursedAmount),
      icon: "credit-card",
      library: Feather,
      color: "#14B8A6",
      gradientColors: ["#F0FDFA", "#CCFBF1"],
    },
    {
      title: "Commission Paid",
      value: formatINR(metrics.commissionPaid),
      icon: "trending-up",
      library: Feather,
      color: "#22C55E",
      gradientColors: ["#F0FDF4", "#DCFCE7"],
    },
    {
      title: "Commission Pending",
      value: formatINR(metrics.commissionPending),
      icon: "clock",
      library: Feather,
      color: "#6B7280",
      gradientColors: ["#F9FAFB", "#F3F4F6"],
    },
  ];

  // Row 2: Count-based capsule cards (3 cards)
  const row2: Metric[] = [
    {
      title: "Applications Submitted",
      topText: `${metrics.applicationsSubmitted} tickets`,
      value: "",
      icon: "file-text",
      library: Feather,
      color: "#2563EB",
      gradientColors: ["#EFF6FF", "#DBEAFE"],
    },
    {
      title: "Commission Transactions",
      topText: `${metrics.commissionTransactions} tickets`,
      value: "",
      icon: "clipboard",
      library: Feather,
      color: "#2563EB",
      gradientColors: ["#EFF6FF", "#DBEAFE"],
    },
    {
      title: "Rejected Applications",
      topText: `${metrics.rejectedCount} rejected`,
      value: "",
      icon: "x-circle",
      library: Feather,
      color: "#EF4444",
      gradientColors: ["#FEF2F2", "#FEE2E2"],
    },
  ];

  const renderRow = (row: Metric[], isCapsule: boolean = false) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollContainer}
    >
      {row.map((m, i) => {
        const IconComponent = m.library;
        const isLastCard = i === row.length - 1;

        return (
          <View
            key={i}
            style={[
              isCapsule ? styles.capsuleWrapper : styles.cardWrapper,
              {
                marginRight: isLastCard ? 0 : 12,
                shadowColor: isDarkMode ? "#000" : m.color,
              },
            ]}
          >
            {isDarkMode ? (
              // Dark Mode Card/Capsule
              <View
                style={[
                  isCapsule ? styles.capsuleDark : styles.cardDark,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                  },
                ]}
              >
                {isCapsule ? (
                  // Capsule Layout (Horizontal)
                  <View style={styles.capsuleContent}>
                    <View
                      style={[
                        styles.capsuleIconContainer,
                        {
                          backgroundColor: `${m.color}25`,
                        },
                      ]}
                    >
                      <IconComponent name={m.icon} size={20} color={m.color} />
                    </View>
                    <View style={styles.capsuleTextContainer}>
                      {m.topText ? (
                        <Text
                          style={[
                            styles.capsuleTopTextDark,
                            { color: theme.colors.onSurface },
                          ]}
                          numberOfLines={1}
                        >
                          {m.topText}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.capsuleTitleDark,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                        numberOfLines={1}
                      >
                        {m.title}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // Regular Card Layout (Vertical)
                  <>
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: `${m.color}25`,
                        },
                      ]}
                    >
                      <IconComponent name={m.icon} size={22} color={m.color} />
                    </View>
                    <View style={styles.contentContainer}>
                      {m.topText ? (
                        <Text
                          style={[
                            styles.topTextDark,
                            { color: theme.colors.onSurfaceVariant },
                          ]}
                          numberOfLines={1}
                        >
                          {m.topText}
                        </Text>
                      ) : null}
                      {m.value ? (
                        <Text
                          style={[
                            styles.valueDark,
                            { color: theme.colors.onSurface },
                          ]}
                          numberOfLines={1}
                        >
                          {m.value}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.titleDark,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                        numberOfLines={2}
                      >
                        {m.title}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            ) : (
              // Light Mode Card/Capsule with Gradient
              <LinearGradient
                colors={m.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={isCapsule ? styles.capsuleLight : styles.cardLight}
              >
                {isCapsule ? (
                  // Capsule Layout (Horizontal)
                  <View style={styles.capsuleContent}>
                    <View
                      style={[
                        styles.capsuleIconContainer,
                        styles.capsuleIconContainerLight,
                        {
                          shadowColor: m.color,
                        },
                      ]}
                    >
                      <IconComponent name={m.icon} size={20} color={m.color} />
                    </View>
                    <View style={styles.capsuleTextContainer}>
                      {m.topText ? (
                        <Text
                          style={styles.capsuleTopTextLight}
                          numberOfLines={1}
                        >
                          {m.topText}
                        </Text>
                      ) : null}
                      <Text style={styles.capsuleTitleLight} numberOfLines={1}>
                        {m.title}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // Regular Card Layout (Vertical)
                  <>
                    <View
                      style={[
                        styles.iconContainer,
                        styles.iconContainerLight,
                        {
                          shadowColor: m.color,
                        },
                      ]}
                    >
                      <IconComponent name={m.icon} size={22} color={m.color} />
                    </View>
                    <View style={styles.contentContainer}>
                      {m.topText ? (
                        <Text style={styles.topTextLight} numberOfLines={1}>
                          {m.topText}
                        </Text>
                      ) : null}
                      {m.value ? (
                        <Text style={styles.valueLight} numberOfLines={1}>
                          {m.value}
                        </Text>
                      ) : null}
                      <Text style={styles.titleLight} numberOfLines={2}>
                        {m.title}
                      </Text>
                    </View>
                  </>
                )}
              </LinearGradient>
            )}
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderRow(row1, false)}
      {renderRow(row2, true)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  scrollContainer: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: 160,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardLight: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  cardDark: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
    borderRadius: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerLight: {
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    gap: 4,
  },
  topTextLight: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  topTextDark: {
    fontSize: 12,
    fontWeight: "600",
  },
  valueLight: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  valueDark: {
    fontSize: 18,
    fontWeight: "700",
  },
  titleLight: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
    lineHeight: 14,
  },
  titleDark: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.8,
    lineHeight: 14,
  },
  // Capsule styles for second row
  capsuleWrapper: {
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  capsuleLight: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
  },
  capsuleDark: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    borderRadius: 35,
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
  },
  capsuleIconContainerLight: {
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  capsuleTextContainer: {
    flex: 1,
    gap: 2,
  },
  capsuleTopTextLight: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },
  capsuleTopTextDark: {
    fontSize: 14,
    fontWeight: "700",
  },
  capsuleTitleLight: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  capsuleTitleDark: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.8,
  },
});
