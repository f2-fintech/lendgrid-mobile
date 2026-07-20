import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  submitted: number;
  approved: number;
  disbursed: number;
  rejected: number;
};

export default function QuickStats({
  submitted,
  approved,
  disbursed,
  rejected,
}: Props) {
  const theme = useTheme();

  const statItems = [
    {
      label: "Disbursed",
      value: disbursed,
      icon: "check-circle" as const,
      color: "#10B981", // Emerald
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Approved",
      value: approved,
      icon: "thumbs-up" as const,
      color: "#3B82F6", // Blue
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Submitted",
      value: submitted,
      icon: "file-text" as const,
      color: "#F59E0B", // Amber
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: "x-circle" as const,
      color: "#EF4444", // Red
      bg: "rgba(239, 68, 68, 0.1)",
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {statItems.map((item, index) => (
        <View
          key={index}
          style={[
            styles.chip,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.dark ? "rgba(255,255,255,0.05)" : theme.colors.outline,
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
            <Feather name={item.icon} size={16} color={item.color} />
          </View>
          <Text
            style={[styles.value, { color: theme.colors.onSurface }]}
          >
            {item.value}
          </Text>
          <Text
            style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 16,
    fontWeight: "900",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
