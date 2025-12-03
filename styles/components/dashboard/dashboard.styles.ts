import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    maxWidth: 200,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggleButton: {
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  exportButton: {
    backgroundColor: "#374151",
    padding: 8,
    borderRadius: 8,
  },
  metricsScroll: {
    marginHorizontal: 20,
  },
  metricsContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  metricCard: {
    borderRadius: 12,
    padding: 16,
    width: 160,
    borderWidth: 1,
    borderColor: "#374151",
    minHeight: 100,
  },
  metricContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  metricTextContainer: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    flexShrink: 1,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 10,
    color: "#10B981",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  chartCard: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    margin: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    alignItems: "center",
  },
  chartHeader: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLegend: {
    marginTop: 8,
  },
  chartLegendText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    paddingVertical: 10,
    fontSize: 14,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  filterContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 12,
    gap: 12,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  filterOptions: {
    flexDirection: "row",
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#374151",
  },
  filterOptionActive: {
    backgroundColor: "#F59E0B",
  },
  filterOptionText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  filterOptionTextActive: {
    color: "#1F2937",
    fontWeight: "500",
  },
  applicationsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  resultsCount: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  applicationItem: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    marginBottom: 12,
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  lenderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  loanType: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  applicationDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  detailValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  commissionValue: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  pendingBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.2)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  paidBadgeText: {
    color: "#10B981",
  },
  pendingBadgeText: {
    color: "#F97316",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

// Chart config
export const chartConfig = {
  // Remove hardcoded colors here, they'll be set dynamically
  decimalPlaces: 0,
  style: {
    borderRadius: 16,
  },
};
