import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const commissionsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
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
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  dateFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  dateFilterText: {
    color: "white",
    fontSize: 14,
    marginRight: 4,
  },
  metricsScroll: {
    paddingHorizontal: 16,
  },
  metricsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  metricCard: {
    width: SCREEN_WIDTH * 0.85,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  metricGradient: {
    padding: 16,
    borderRadius: 12,
  },
  metricContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLeft: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    color: "#10B981",
    marginLeft: 4,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
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
    backgroundColor: "#1F2937",
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#FFD700",
  },
  tabText: {
    color: "#9CA3AF",
    fontWeight: "600",
    fontSize: 14,
  },
  activeTabText: {
    color: "#111827",
  },
  contentCard: {
    backgroundColor: "#1F2937",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
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
    backgroundColor: "#111827",
    borderRadius: 8,
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
    color: "#9CA3AF",
    fontSize: 12,
  },
  trendsContainer: {
    marginTop: 8,
  },
  trendBarContainer: {
    marginBottom: 16,
  },
  trendBarLabel: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    width: 30,
  },
  trendBar: {
    flexDirection: "row",
    height: 20,
    backgroundColor: "#111827",
    borderRadius: 4,
    overflow: "hidden",
  },
  trendBarSegment: {
    height: "100%",
  },
  trendBarValues: {
    marginTop: 4,
  },
  trendBarValue: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  lenderList: {
    marginTop: 8,
  },
  lenderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  lenderPercentage: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  lenderAmount: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 12,
  },
  searchIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: "white",
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#111827",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  activeFilterChip: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  filterChipText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  activeFilterChipText: {
    color: "#111827",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptyStateSubtext: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 4,
  },
  commissionItem: {
    backgroundColor: "#111827",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#374151",
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
    color: "white",
  },
  lenderName: {
    fontSize: 13,
    color: "#9CA3AF",
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
    borderTopColor: "#374151",
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
    color: "#9CA3AF",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  commissionInfo: {
    alignItems: "flex-end",
  },
  commissionRate: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "600",
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
    color: "#9CA3AF",
    marginLeft: 4,
  },
});
