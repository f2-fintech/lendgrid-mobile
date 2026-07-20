import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import CommissionHistoryItem from "./CommissionItem";

type Props = {
  data: any[];

  fetchNextPage?: () => Promise<any>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;

  totalCount?: number;
};

export default function CommissionHistoryList({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalCount,
}: Props) {
  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const statusOptions = ["all", "Paid", "Pending", "Calculated", "Approved"];

  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();

    return (data ?? []).filter((row) => {
      const rowStatus = String(row.status ?? "")
        .trim()
        .toLowerCase();

      const matchesSearch =
        !s ||
        String(row.ticketId ?? row.id ?? "")
          .toLowerCase()
          .includes(s) ||
        String(row.provider ?? row.lenderName ?? "")
          .toLowerCase()
          .includes(s) ||
        String(row.productType ?? row.loanType ?? "")
          .toLowerCase()
          .includes(s) ||
        rowStatus.includes(s);

      const matchesStatus =
        filterStatus === "all" || rowStatus === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, filterStatus]);

  const shown = filtered.length;
  const total = Number.isFinite(Number(totalCount))
    ? Number(totalCount)
    : shown;

  const canLoadMore =
    !!hasNextPage && !isFetchingNextPage && !btnLoading && !!fetchNextPage;

  const noMore = !hasNextPage && total > 0 && shown >= total;

  const handleLoadMore = async () => {
    if (!canLoadMore) return;
    try {
      setBtnLoading(true);
      await fetchNextPage?.();
    } finally {
      setBtnLoading(false);
    }
  };

  const loadingMore = !!isFetchingNextPage || btnLoading;

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
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
            placeholder="Search commission"
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
              marginHorizontal: 20,
              marginTop: 12,
              borderRadius: 24,
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
              Status
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={dashboardStyles.filterOptions}>
                {statusOptions.map((status) => {
                  const isActive = filterStatus === status;

                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        dashboardStyles.filterOption,
                        {
                          backgroundColor: isActive
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                          borderColor: isActive
                            ? theme.colors.primary
                            : theme.colors.outline,
                        },
                      ]}
                      onPress={() => setFilterStatus(status)}
                    >
                      <Text
                        style={{
                          color: isActive ? "#FFFFFF" : theme.colors.onSurface,
                          fontWeight: "600",
                        }}
                      >
                        {status === "all" ? "All Status" : status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
          Recent Activity
        </Text>

        <Text
          style={[
            dashboardStyles.resultsCount,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {shown}/{total} results
        </Text>
      </View>

      {/* List */}
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
            No recent activity found
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
        <>
          <FlatList
            data={filtered}
            renderItem={({ item }) => <CommissionHistoryItem item={item} />}
            keyExtractor={(item, idx) =>
              String(item.id ?? item.ticketId ?? idx)
            }
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />

          <View style={{ paddingTop: 12, alignItems: "center" }}>
            {loadingMore ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <ActivityIndicator color={theme.colors.primary} />
                <Text
                  style={{
                    marginLeft: 10,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "600",
                  }}
                >
                  Loading more...
                </Text>
              </View>
            ) : hasNextPage ? (
              <TouchableOpacity
                disabled={!canLoadMore}
                onPress={handleLoadMore}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  backgroundColor: theme.colors.surface,
                  opacity: canLoadMore ? 1 : 0.6,
                }}
              >
                <Text
                  style={{ fontWeight: "800", color: theme.colors.primary }}
                >
                  See more ( {Math.max(total - shown, 0)} left )
                </Text>
              </TouchableOpacity>
            ) : noMore ? (
              <Text
                style={{
                  paddingVertical: 10,
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: "700",
                }}
              >
                No more records
              </Text>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
}
