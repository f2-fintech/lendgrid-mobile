import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function BankerListScreen() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>
        Banker Lists
      </Text>
      <Text style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        This screen is a placeholder for Banker Lists. We will implement the
        full dynamic banker list soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});
