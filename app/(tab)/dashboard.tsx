import { toggleTheme } from "@/redux/features/themeSlice";
import {
  chartConfig,
  dashboardStyles,
} from "@/styles/components/dashboard/dashboard.styles";
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const { width: screenWidth } = Dimensions.get("window");

const mockData = {
  metrics: {
    totalDisbursed: 12500000,
    totalCommission: 500000,
    pendingPayouts: 125000,
    activeLenders: 8,
  },
  chartData: [
    { value: 1200000, label: "Jan" },
    { value: 1800000, label: "Feb" },
    { value: 2200000, label: "Mar" },
    { value: 1900000, label: "Apr" },
    { value: 2500000, label: "May" },
    { value: 2800000, label: "Jun" },
  ],
  applications: [
    {
      id: "APP001",
      lenderName: "HDFC Bank",
      loanType: "Personal Loan",
      disbursedAmount: 500000,
      disbursedDate: "2025-01-15",
      commissionPercent: 4,
      calculatedCommission: 20000,
      payoutStatus: "Paid",
      payoutDate: "2025-01-20",
    },
    {
      id: "APP002",
      lenderName: "ICICI Bank",
      loanType: "Home Loan",
      disbursedAmount: 2500000,
      disbursedDate: "2025-01-18",
      commissionPercent: 3.5,
      calculatedCommission: 87500,
      payoutStatus: "Pending",
      payoutDate: null,
    },
    // ... rest of your mock data
  ],
};

// Format chart data for react-native-chart-kit
const chartData = {
  labels: mockData.chartData.map((item) => item.label),
  datasets: [
    {
      data: mockData.chartData.map((item) => item.value),
    },
  ],
};

export default function AggregatorDashboard() {
  const theme = useTheme();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const isDarkMode = mode === "dark";
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLender, setFilterLender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Dynamically adjust chart config based on theme
  const dynamicChartConfig = {
    ...chartConfig,
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surfaceVariant,
    decimalPlaces: 0,
    color: (opacity = 1) => theme.colors.primary,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: theme.colors.outline,
      strokeDasharray: "0",
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
      fill: theme.colors.onSurfaceVariant,
    },
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format chart values for display
  const formatChartValue = (value: number) => {
    if (value >= 1000000) {
      return `₹${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
  };

  const filteredApplications = mockData.applications.filter((app) => {
    const matchesSearch =
      app.lenderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLender =
      filterLender === "all" ||
      app.lenderName.toLowerCase().includes(filterLender.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      app.payoutStatus.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesLender && matchesStatus;
  });

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color,
    bgColor,
    iconName,
  }: any) => (
    <View
      style={[
        dashboardStyles.metricCard,
        {
          backgroundColor: isDarkMode
            ? theme.colors.surfaceVariant
            : theme.colors.surface, // FIX: Use theme surface color instead of transparent bgColor
          shadowColor: isDarkMode ? theme.colors.outline : "#000",
          elevation: isDarkMode ? 2 : 3,
          borderWidth: 1,
          borderColor: theme.colors.outline,
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
            {title}
          </Text>
          <Text
            style={[
              dashboardStyles.metricValue,
              { color: theme.colors.onSurface },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            minimumFontScale={0.8}
          >
            {value}
          </Text>
          {trend && (
            <View style={dashboardStyles.trendContainer}>
              <Feather name="arrow-up" size={12} color="#10B981" />
              <Text style={[dashboardStyles.trendText, { color: "#10B981" }]}>
                {trend}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[
            dashboardStyles.iconContainer,
            {
              backgroundColor: isDarkMode ? color : `${color}20`, // 20 = 12% opacity in hex
            },
          ]}
        >
          <Icon
            name={iconName}
            size={20}
            color={isDarkMode ? "#FFFFFF" : color}
          />
        </View>
      </View>
    </View>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const isPaid = status === "Paid";
    return (
      <View
        style={[
          dashboardStyles.badge,
          isPaid
            ? [
                dashboardStyles.paidBadge,
                {
                  backgroundColor: isDarkMode ? "#064E3B" : "#D1FAE5",
                  borderColor: isDarkMode ? "#34D399" : "#10B981",
                },
              ]
            : [
                dashboardStyles.pendingBadge,
                {
                  backgroundColor: isDarkMode ? "#7C2D12" : "#FEE2E2",
                  borderColor: isDarkMode ? "#F97316" : "#DC2626",
                },
              ],
        ]}
      >
        <Text
          style={[
            dashboardStyles.badgeText,
            isPaid
              ? [
                  dashboardStyles.paidBadgeText,
                  { color: isDarkMode ? "#34D399" : "#065F46" },
                ]
              : [
                  dashboardStyles.pendingBadgeText,
                  { color: isDarkMode ? "#F97316" : "#991B1B" },
                ],
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  const ApplicationItem = ({ item }: { item: any }) => (
    <View
      style={[
        dashboardStyles.applicationItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
        },
      ]}
    >
      <View style={dashboardStyles.applicationHeader}>
        <Text
          style={[dashboardStyles.appId, { color: theme.colors.onSurface }]}
        >
          {item.id}
        </Text>
        <StatusBadge status={item.payoutStatus} />
      </View>
      <Text
        style={[dashboardStyles.lenderName, { color: theme.colors.onSurface }]}
      >
        {item.lenderName}
      </Text>
      <Text
        style={[
          dashboardStyles.loanType,
          { color: theme.colors.onSurfaceVariant },
        ]}
      >
        {item.loanType}
      </Text>

      <View style={dashboardStyles.applicationDetails}>
        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Disbursed Amount
          </Text>
          <Text
            style={[
              dashboardStyles.detailValue,
              { color: theme.colors.onSurface },
            ]}
          >
            {formatCurrency(item.disbursedAmount)}
          </Text>
        </View>
        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Commission
          </Text>
          <Text
            style={[
              dashboardStyles.commissionValue,
              { color: theme.colors.primary },
            ]}
          >
            {item.commissionPercent}% •{" "}
            {formatCurrency(item.calculatedCommission)}
          </Text>
        </View>
        <View style={dashboardStyles.detailItem}>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Payout Date
          </Text>
          <Text
            style={[
              dashboardStyles.detailValue,
              { color: theme.colors.onSurface },
            ]}
          >
            {item.payoutDate || "Pending"}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[
          dashboardStyles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            dashboardStyles.loadingText,
            { color: theme.colors.onSurface },
          ]}
        >
          Loading Dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        dashboardStyles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <ScrollView
        style={dashboardStyles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={dashboardStyles.header}>
          <View>
            <Text
              style={[dashboardStyles.title, { color: theme.colors.onSurface }]}
            >
              Dashboard
            </Text>
            <Text
              style={[
                dashboardStyles.subtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Welcome back! Here's your performance overview.
            </Text>
          </View>
          <View style={dashboardStyles.headerActions}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              style={{
                padding: 10,
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceVariant,
                marginRight: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
              }}
              onPress={() => dispatch(toggleTheme())}
            >
              <Feather
                name={isDarkMode ? "sun" : "moon"}
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dashboardStyles.dateButton,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <Text
                style={[
                  dashboardStyles.dateButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Last 30 days
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                dashboardStyles.exportButton,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.outline,
                },
              ]}
            >
              <Feather name="download" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Metrics Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={dashboardStyles.metricsScroll}
          contentContainerStyle={dashboardStyles.metricsContainer}
        >
          <MetricCard
            title="Total Disbursed"
            value={formatCurrency(mockData.metrics.totalDisbursed)}
            icon={FontAwesome5}
            iconName="money-bill-wave"
            trend="+12.5%"
            color="#10B981"
            bgColor="rgba(16, 185, 129, 0.1)"
          />
          <MetricCard
            title="Commission Earned"
            value={formatCurrency(mockData.metrics.totalCommission)}
            icon={MaterialIcons}
            iconName="trending-up"
            trend="+8.2%"
            color="#F59E0B"
            bgColor="rgba(245, 158, 11, 0.1)"
          />
          <MetricCard
            title="Pending Payouts"
            value={formatCurrency(mockData.metrics.pendingPayouts)}
            icon={FontAwesome5}
            iconName="credit-card"
            color="#F97316"
            bgColor="rgba(249, 115, 22, 0.1)"
          />
          <MetricCard
            title="Active Lenders"
            value={mockData.metrics.activeLenders.toString()}
            icon={MaterialIcons}
            iconName="business"
            trend="+2 new"
            color="#3B82F6"
            bgColor="rgba(59, 130, 246, 0.1)"
          />
        </ScrollView>

        {/* Chart */}
        <View
          style={[
            dashboardStyles.chartCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <View style={dashboardStyles.chartHeader}>
            <Text
              style={[
                dashboardStyles.chartTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Monthly Disbursal Trend
            </Text>
            <Text
              style={[
                dashboardStyles.chartSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Track your loan disbursal performance
            </Text>
          </View>
          <BarChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={dynamicChartConfig}
            style={dashboardStyles.chart}
            yAxisLabel="₹"
            yAxisSuffix=""
            yAxisInterval={1}
            showValuesOnTopOfBars
            withInnerLines={false}
            fromZero
          />
          <View style={dashboardStyles.chartLegend}>
            <Text
              style={[
                dashboardStyles.chartLegendText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Amounts in Indian Rupees (₹)
            </Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={dashboardStyles.searchSection}>
          <View
            style={[
              dashboardStyles.searchContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <Feather
              name="search"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={dashboardStyles.searchIcon}
            />
            <TextInput
              style={[
                dashboardStyles.searchInput,
                { color: theme.colors.onSurface },
              ]}
              placeholder="Search applications..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <TouchableOpacity
            style={[
              dashboardStyles.filterButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name="filter" size={16} color="#FFFFFF" />
            <Text style={dashboardStyles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options - FIXED VERSION */}
        {showFilters && (
          <View
            style={[
              dashboardStyles.filterContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
          >
            <View style={dashboardStyles.filterSection}>
              <Text
                style={[
                  dashboardStyles.filterLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Lender
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={dashboardStyles.filterOptions}>
                  {["all", "HDFC", "ICICI", "Bajaj", "Axis", "SBI"].map(
                    (lender) => (
                      <TouchableOpacity
                        key={lender}
                        style={[
                          dashboardStyles.filterOption,
                          {
                            backgroundColor: isDarkMode
                              ? theme.colors.surfaceVariant
                              : "#F3F4F6",
                            borderColor: theme.colors.outline,
                          },
                          filterLender === lender && {
                            backgroundColor: theme.colors.primary,
                            borderColor: theme.colors.primary,
                          },
                        ]}
                        onPress={() => setFilterLender(lender)}
                      >
                        <Text
                          style={[
                            dashboardStyles.filterOptionText,
                            {
                              color:
                                filterLender === lender
                                  ? "#FFFFFF"
                                  : theme.colors.onSurface,
                            },
                          ]}
                        >
                          {lender === "all" ? "All" : lender}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </ScrollView>
            </View>

            <View style={dashboardStyles.filterSection}>
              <Text
                style={[
                  dashboardStyles.filterLabel,
                  { color: theme.colors.onSurface },
                ]}
              >
                Status
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={dashboardStyles.filterOptions}>
                  {["all", "paid", "pending"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        dashboardStyles.filterOption,
                        {
                          backgroundColor: isDarkMode
                            ? theme.colors.surfaceVariant
                            : "#F3F4F6",
                          borderColor: theme.colors.outline,
                        },
                        filterStatus === status && {
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.primary,
                        },
                      ]}
                      onPress={() => setFilterStatus(status)}
                    >
                      <Text
                        style={[
                          dashboardStyles.filterOptionText,
                          {
                            color:
                              filterStatus === status
                                ? "#FFFFFF"
                                : theme.colors.onSurface,
                          },
                        ]}
                      >
                        {status === "all"
                          ? "All"
                          : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Applications List */}
        <View style={dashboardStyles.applicationsSection}>
          <View style={dashboardStyles.sectionHeader}>
            <Text
              style={[
                dashboardStyles.sectionTitle,
                { color: theme.colors.onSurface },
              ]}
            >
              Disbursed Applications
            </Text>
            <Text
              style={[
                dashboardStyles.resultsCount,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {filteredApplications.length} results
            </Text>
          </View>

          {filteredApplications.length === 0 ? (
            <View style={dashboardStyles.emptyState}>
              <Feather
                name="inbox"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                style={[
                  dashboardStyles.emptyStateText,
                  { color: theme.colors.onSurface },
                ]}
              >
                No applications found
              </Text>
              <Text
                style={[
                  dashboardStyles.emptyStateSubtext,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Try adjusting your search or filters
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredApplications}
              renderItem={({ item }) => <ApplicationItem item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
