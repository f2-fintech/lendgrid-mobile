import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import {
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import ApplicationItem from "./ApplicationItem";

const mockApplications = [
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
  {
    id: "APP003",
    lenderName: "Axis Bank",
    loanType: "Car Loan",
    disbursedAmount: 800000,
    disbursedDate: "2025-01-22",
    commissionPercent: 5,
    calculatedCommission: 40000,
    payoutStatus: "Paid",
    payoutDate: "2025-01-25",
  },
  {
    id: "APP004",
    lenderName: "Bajaj Finserv",
    loanType: "Business Loan",
    disbursedAmount: 1500000,
    disbursedDate: "2025-02-01",
    commissionPercent: 6,
    calculatedCommission: 90000,
    payoutStatus: "Pending",
    payoutDate: null,
  },
  {
    id: "APP005",
    lenderName: "SBI",
    loanType: "Education Loan",
    disbursedAmount: 1200000,
    disbursedDate: "2025-02-05",
    commissionPercent: 2.5,
    calculatedCommission: 30000,
    payoutStatus: "Paid",
    payoutDate: "2025-02-10",
  },
];

export default function ApplicationsList() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLender, setFilterLender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = mockApplications.filter((app) => {
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

  return (
    <View style={dashboardStyles.applicationsSection}>
      {/* Search + Filter Button */}
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
            style={{
              flex: 1,
              color: theme.colors.onSurface,
              paddingVertical: 12,
              // ONLY THESE TWO LINES FIX THE BLINKING CURSOR
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
            placeholder="Search applications"
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchTerm}
            onChangeText={setSearchTerm}
            selectionColor={theme.colors.primary}
            autoCorrect={false}
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

      {/* Filter Options */}
      {showFilters && (
        <View
          style={[
            dashboardStyles.filterContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outline,
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 12,
              padding: 16,
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
                {["all", "HDFC", "ICICI", "Axis", "Bajaj", "SBI"].map(
                  (lender) => (
                    <TouchableOpacity
                      key={lender}
                      style={[
                        dashboardStyles.filterOption,
                        {
                          backgroundColor:
                            filterLender === lender
                              ? theme.colors.surfaceVariant
                              : theme.colors.surfaceVariant,
                          borderColor: theme.colors.outline,
                        },
                      ]}
                      onPress={() => setFilterLender(lender)}
                    >
                      <Text
                        style={{
                          color:
                            filterLender === lender
                              ? "#FFFFFF"
                              : theme.colors.onSurface,
                          fontWeight: "600",
                        }}
                      >
                        {lender === "all" ? "All Lenders" : lender}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </ScrollView>
          </View>

          <View style={[dashboardStyles.filterSection, { marginTop: 16 }]}>
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
                        backgroundColor:
                          filterStatus === status
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        borderColor: theme.colors.outline,
                      },
                    ]}
                    onPress={() => setFilterStatus(status)}
                  >
                    <Text
                      style={{
                        color:
                          filterStatus === status
                            ? "#FFFFFF"
                            : theme.colors.onSurface,
                        fontWeight: "600",
                      }}
                    >
                      {status === "all"
                        ? "All Status"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Results Header */}
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
          {filtered.length} results
        </Text>
      </View>

      {/* Empty State or List */}
      {filtered.length === 0 ? (
        <View style={dashboardStyles.emptyState}>
          <Feather
            name="inbox"
            size={56}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              dashboardStyles.emptyStateText,
              { color: theme.colors.onSurface, marginTop: 16 },
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
          data={filtered}
          renderItem={({ item }) => <ApplicationItem item={item} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
