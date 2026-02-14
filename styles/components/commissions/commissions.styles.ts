// styles/components/commissions/commissions.styles.ts
import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const commissionsStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      paddingTop: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
    },

    dateFilter: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    dateFilterText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      marginRight: 4,
    },

    // better scroll padding handling
    metricsScroll: {
      // keep empty or minimal; real padding via contentContainerStyle
    },
    metricsScrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: "stretch",
    },

    // force single row and same baseline
    metricsContainer: {
      flexDirection: "row",
      flexWrap: "nowrap",
      alignItems: "stretch",
    },

    // premium card base (gradient comes from component)
    metricCard: {
      width: SCREEN_WIDTH * 0.85,
      marginRight: 12,
      borderRadius: 12,
      overflow: "hidden",
      flexShrink: 0, //  IMPORTANT: stops weird wrapping/stacking
      backgroundColor: "transparent",
    },

    // gradient wrapper
    metricGradient: {
      padding: 16,
      borderRadius: 12,
      overflow: "hidden",
    },

    // overlay border (used from component)
    metricBorderOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: 12,
      borderWidth: 1,
    },

    metricContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    metricLeft: {
      flex: 1,
      paddingRight: 8,
    },

    // WHITE texts for premium look (light + dark both)
    metricTitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
      marginBottom: 8,
      fontWeight: "700",
    },
    metricValue: {
      fontSize: 24,
      fontWeight: "900",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    metricSubtitle: {
      fontSize: 12,
      color: "rgba(255,255,255,0.80)",
      fontWeight: "600",
    },

    trendContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
    },
    // NOTE: keep this green as "success" accent
    trendText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.85)",
      marginLeft: 4,
      fontWeight: "600",
    },

    // icon container premium
    metricIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 16,
      borderWidth: 1,
    },

    tabsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    tabs: {
      flexDirection: "row",
    },
    tab: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    activeTab: {
      backgroundColor: theme.colors.tertiary,
      borderColor: theme.colors.tertiary,
    },
    tabText: {
      color: theme.colors.onSurfaceVariant,
      fontWeight: "600",
      fontSize: 14,
    },
    activeTabText: {
      color: theme.colors.onSurface,
      fontWeight: "700",
    },

    contentCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 16,
    },

    historyHeader: {
      marginBottom: 16,
    },

    legendContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 20,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 6,
    },
    legendText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },

    trendsContainer: {
      marginTop: 8,
    },
    trendBarContainer: {
      marginBottom: 16,
    },
    trendBarLabel: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 6,
      width: 30,
    },
    trendBar: {
      flexDirection: "row",
      height: 20,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    trendBarSegment: {
      height: "100%",
    },
    trendBarValues: {
      marginTop: 4,
    },
    trendBarValue: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 12,
    },

    lenderList: {
      marginTop: 8,
    },
    lenderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    lenderInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    lenderColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,
    },
    lenderNameText: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "500",
    },
    lenderPercentage: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    lenderAmount: {
      color: theme.colors.onSurface,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 12,
    },

    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginBottom: 12,
    },
    searchIcon: {
      paddingLeft: 12,
      paddingRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      color: theme.colors.onSurface,
      fontSize: 14,
    },

    filterContainer: {
      marginBottom: 16,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceVariant,
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    activeFilterChip: {
      backgroundColor: theme.colors.tertiary,
      borderColor: theme.colors.tertiary,
    },
    filterChipText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
    },
    activeFilterChipText: {
      color: theme.colors.onSurface,
      fontWeight: "700",
    },

    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyStateText: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 16,
      fontWeight: "600",
      marginTop: 12,
    },
    emptyStateSubtext: {
      color: theme.colors.onSurfaceVariant,
      fontSize: 14,
      marginTop: 4,
    },

    commissionItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
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
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    lenderName: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    commissionDetails: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
      paddingTop: 12,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    commissionInfo: {
      alignItems: "flex-end",
    },
    commissionRate: {
      fontSize: 14,
      color: theme.colors.tertiary,
      fontWeight: "700",
    },
    commissionAmount: {
      fontSize: 16,
      fontWeight: "bold",
      color: "#10B981",
      marginTop: 2,
    },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    dateItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginLeft: 4,
    },
  });
