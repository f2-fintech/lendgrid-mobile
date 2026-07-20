import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

type Props = {
  earned: number;
  paid: number;
  pending: number;
};

export default function HeroCard({ earned, paid, pending }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        {/* Abstract Background Shapes for Premium Look */}
        <View style={[styles.bgShape, styles.bgShape1]} />
        <View style={[styles.bgShape, styles.bgShape2]} />
        <View style={[styles.bgShape, styles.bgShape3]} />

        {/* Top Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Feather name="award" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Total Commission</Text>
          </View>
          <Feather name="trending-up" size={24} color="rgba(255,255,255,0.8)" />
        </View>

        {/* Main Earnings */}
        <View style={styles.topSection}>
          <Text style={styles.earnedValue}>{formatCurrency(earned)}</Text>
          <Text style={styles.subtitle}>Lifetime earnings generated</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Sub-metrics */}
        <View style={styles.bottomSection}>
          <View style={styles.subMetric}>
            <View style={[styles.subIconBox, { backgroundColor: "rgba(34, 197, 94, 0.2)" }]}>
              <Feather name="arrow-down-left" size={18} color="#4ADE80" />
            </View>
            <View>
              <Text style={styles.subLabel}>Paid Out</Text>
              <Text style={styles.subValue}>{formatCurrency(paid)}</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          <View style={styles.subMetric}>
            <View style={[styles.subIconBox, { backgroundColor: "rgba(251, 191, 36, 0.2)" }]}>
              <Feather name="clock" size={18} color="#FCD34D" />
            </View>
            <View>
              <Text style={styles.subLabel}>Pending</Text>
              <Text style={styles.subValue}>{formatCurrency(pending)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
    marginTop: 8,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden", // clip the background shapes
    position: "relative",
  },
  bgShape: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 999,
  },
  bgShape1: {
    width: 200,
    height: 200,
    top: -80,
    right: -60,
  },
  bgShape2: {
    width: 150,
    height: 150,
    bottom: -60,
    left: -40,
  },
  bgShape3: {
    width: 100,
    height: 100,
    top: 40,
    right: 80,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  iconContainer: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  topSection: {
    marginBottom: 24,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  earnedValue: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 20,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subMetric: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  subIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 16,
  },
  subLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
