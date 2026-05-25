import { Feather } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import type { TextStyle, ViewStyle } from "react-native";
import { Text, useTheme } from "react-native-paper";

const RESOURCES = [
  {
    title: "Loan Product Basics",
    subtitle: "Eligibility, required documents, and lender matching flow.",
    icon: "book-open",
  },
  {
    title: "Customer Conversation Guide",
    subtitle: "Quick talking points for application discovery calls.",
    icon: "message-circle",
  },
  {
    title: "Document Checklist",
    subtitle: "A dummy checklist area for training attachments.",
    icon: "check-square",
  },
];

export default function TrainingResourcesScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
        >
          <Feather
            name="book-open"
            size={24}
            color={theme.colors.onPrimaryContainer}
          />
        </View>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Training and Resources
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Dummy screen for training material, playbooks, and onboarding content.
        </Text>
      </View>

      <View style={styles.list}>
        {RESOURCES.map((item) => (
          <View
            key={item.title}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <Feather
                name={item.icon as any}
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View style={styles.cardBody}>
              <Text
                style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 22,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
} satisfies Record<string, ViewStyle | TextStyle>);
