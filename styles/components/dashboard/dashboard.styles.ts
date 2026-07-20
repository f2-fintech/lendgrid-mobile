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
    alignItems: "center", // Align center for new avatar/greeting layout
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  themeToggleButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Full circle for mobile
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, // Softer shadow
    shadowRadius: 8,
    elevation: 2,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 12, // Taller touch target
    borderRadius: 20, // More rounded
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  exportButton: {
    backgroundColor: "#374151",
    padding: 8,
    borderRadius: 8,
  },
  metricsScroll: {
    marginHorizontal: 16, // slightly less margin for more scrolling space
  },
  metricsContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  metricCard: {
    borderRadius: 24, // Softer edges
    padding: 20,
    width: 160,
    borderWidth: 1, // Will be overridden in component conditionally
    borderColor: "#374151",
    minHeight: 110,
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
    marginHorizontal: 0,
    marginVertical: 16,
    borderRadius: 24, // Softer edges
    borderWidth: 1,
    borderColor: "#374151",
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05, // Softer shadows
    shadowRadius: 16,
    elevation: 3,
  },
  chartHeader: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    fontWeight: "500",
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
    paddingHorizontal: 0,
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F2937",
    borderRadius: 24, // Pill shape
    borderWidth: 1,
    borderColor: "#374151",
    paddingHorizontal: 16,
    height: 52, // Taller touch target
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
    height: 52, // Match search input height
    borderRadius: 26, // Pill shape
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  filterContainer: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
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
    gap: 10,
    paddingVertical: 4,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Pill shape
    backgroundColor: "#374151",
    borderWidth: 1,
    borderColor: "transparent",
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
    fontWeight: "700",
  },
  applicationsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: "#FFFFFF",
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  applicationItem: {
    backgroundColor: "rgba(31, 41, 55, 0.5)",
    borderRadius: 20,
    borderWidth: 1, // Will be overridden in component conditionally
    borderColor: "#374151",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, // Extra soft shadow
    shadowRadius: 10,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  applicationHeader: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  appId: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  lenderName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  loanType: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  applicationRight: {
    alignItems: "flex-end",
    gap: 6,
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
    fontSize: 16,
    color: "#10B981", // More positive color
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
