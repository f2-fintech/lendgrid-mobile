import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";
import { CommissionItem } from "./CommissionItem";

interface CommissionHistoryItem {
  id: string;
  applicationId: string;
  lenderName: string;
  loanType: string;
  disbursedAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: string;
  disbursedDate: string;
  paidDate: string | null;
}

interface CommissionHistoryProps {
  commissions: CommissionHistoryItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const CommissionHistory = ({
  commissions,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
}: CommissionHistoryProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const statusFilters = [
    "Paid",
    "Pending",
    "Calculated",
    "Approved",
    "Disputed",
    "Rejected",
    "Cancelled",
  ];

  return (
    <View style={styles.contentCard}>
      {/* ---------- HEADER ROW ---------- */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        {/* LEFT TEXT BLOCK: capped width so button always fits */}
        <View
          style={{
            flexShrink: 1,
            maxWidth: "68%",
            paddingRight: 8,
          }}
        >
          <Text style={styles.cardTitle}>Commission History</Text>
          {/* <Text
            style={[
              styles.cardSubtitle,
              {
                marginTop: 2,
              },
            ]}
          >
            Detailed record of all commission
          </Text> */}
        </View>

        {/* ---------- OUTLINE EXPORT BUTTON ---------- */}
        <TouchableOpacity
          style={{
            flexShrink: 0,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
            backgroundColor: "transparent",
          }}
          onPress={() => {
            console.log("📤 EXPORT REPORT CLICKED");
            console.log("🧾 Records:", commissions.length);
            console.log("Sample:", commissions.slice(0, 3));
          }}
        >
          <MaterialIcons
            name="file-download"
            size={18}
            color={theme.colors.primary}
            style={{ marginRight: 6 }}
          />

          <Text
            style={{
              fontWeight: "600",
              fontSize: 13,
              color: theme.colors.primary,
            }}
          >
            Export
          </Text>
        </TouchableOpacity>
      </View>

      {/* ---------- SEARCH BAR ---------- */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID or lender..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* ---------- FILTER CHIPS ---------- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterStatus === "all" && styles.activeFilterChip,
          ]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              filterStatus === "all" && styles.activeFilterChipText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {statusFilters.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.activeFilterChip,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatus === status && styles.activeFilterChipText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ---------- LIST OR EMPTY STATE ---------- */}
      {commissions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="search-off"
            size={48}
            color={theme.colors.onSurfaceVariant}
          />
          <Text style={styles.emptyStateText}>No commissions found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <FlashList
          data={commissions}
          renderItem={({ item }) => (
            <CommissionItem
              item={item}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={140}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};
