import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const metrics = [
  {
    title: "Total Disbursed",
    value: "₹1,25,00,000",
    icon: "money-bill-wave",
    library: FontAwesome5,
    trend: "+12.5%",
    color: "#10B981",
  },
  {
    title: "Commission Earned",
    value: "₹5,00,000",
    icon: "trending-up",
    library: MaterialIcons,
    trend: "+8.2%",
    color: "#F59E0B",
  },
  {
    title: "Pending Payouts",
    value: "₹1,25,000",
    icon: "credit-card",
    library: FontAwesome5,
    color: "#F97316",
  },
  {
    title: "Active Lenders",
    value: "8",
    icon: "business",
    library: MaterialIcons,
    trend: "+2 new",
    color: "#3B82F6",
  },
];

export default function MetricsGrid() {
  const theme = useTheme();
  const isDarkMode = theme.dark;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16, 
        paddingVertical: 0, 
      }}
      style={{
        marginTop: 0, 
        marginBottom: 8,
      }}
    >
      {metrics.map((m, i) => (
        <View
          key={i}
          style={[
            dashboardStyles.metricCard,
            {
              backgroundColor: isDarkMode
                ? theme.colors.surfaceVariant
                : theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.outline,
              marginRight: i === metrics.length - 1 ? 0 : 12,
            },
          ]}
        >
          <View style={dashboardStyles.metricContent}>
            <View style={dashboardStyles.metricTextContainer}>
              <Text
                style={[
                  dashboardStyles.metricTitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {m.title}
              </Text>
              <Text
                style={[
                  dashboardStyles.metricValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {m.value}
              </Text>
              {m.trend && (
                <View style={dashboardStyles.trendContainer}>
                  <Feather name="arrow-up" size={12} color="#10B981" />
                  <Text
                    style={[dashboardStyles.trendText, { color: "#10B981" }]}
                  >
                    {m.trend}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                dashboardStyles.iconContainer,
                {
                  backgroundColor: isDarkMode ? m.color : `${m.color}20`,
                },
              ]}
            >
              <m.library
                name={m.icon}
                size={20}
                color={isDarkMode ? "#FFFFFF" : m.color}
              />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
