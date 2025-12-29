import { StyleSheet } from "react-native";
import { MD3Theme } from "react-native-paper";

export const commissionsStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    // Tab Container Styles
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 8,
      paddingTop: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
      marginBottom: 8,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: "transparent",
    },
    activeTab: {
      backgroundColor: "#0EA5E9",
    },
    tabText: {
      fontSize: 15,
      fontWeight: "500",
      color: theme.colors.onSurfaceVariant,
    },
    activeTabText: {
      color: "#000",
      fontWeight: "600",
    },
    // Metrics Container
    metricsScrollView: {
      marginVertical: 16,
    },
    metricsScrollContainer: {
      paddingLeft: 0,
      paddingRight: 16,
      gap: 12,
    },
    metricsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginVertical: 16,
    },
    // 🔹 WIDER CARD FOR TOTAL & PICKED APPLICATIONS
    metricCard: {
      width: 165, // ⬅️ increased from 140
      backgroundColor: theme.colors.surface,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginRight: 10,
    },
    ticketMetricCard: {
      width: 180,
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginRight: 12,
    },
    metricTitle: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 8,
    },
    metricValueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    metricIcon: {
      marginLeft: 8,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    metricChange: {
      fontSize: 12,
      marginTop: 4,
    },
    // Search Container
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    // Content Card
    contentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },
    // Commission Item (Application/Ticket Card)
    commissionItem: {
      backgroundColor: theme.colors.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    commissionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    applicationId: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    lenderName: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    // Detail Rows
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.surfaceVariant,
    },
    detailLabel: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    dateRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surfaceVariant,
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    // Empty State
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyStateText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    emptyStateSubtext: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
  });
