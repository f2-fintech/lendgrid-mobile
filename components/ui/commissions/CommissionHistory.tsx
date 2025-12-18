import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  return (
    <View style={styles.contentCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.cardTitle}>Commission History</Text>
        <Text style={styles.cardSubtitle}>
          Detailed record of all commission transactions
        </Text>
      </View>

      {/* Search */}
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

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, filterStatus === "all" && styles.activeFilterChip]}
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

        {["Paid", "Pending", "Processing", "Disputed"].map((status) => (
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

      {/* List */}
      {commissions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="search-off" size={48} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.emptyStateText}>No commissions found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
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
