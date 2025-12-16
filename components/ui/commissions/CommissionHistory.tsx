import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
  return (
    <View style={commissionsStyles.contentCard}>
      <View style={commissionsStyles.historyHeader}>
        <Text style={commissionsStyles.cardTitle}>Commission History</Text>
        <Text style={commissionsStyles.cardSubtitle}>
          Detailed record of all commission transactions
        </Text>
      </View>

      {/* Search and Filters */}
      <View style={commissionsStyles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#9CA3AF"
          style={commissionsStyles.searchIcon}
        />
        <TextInput
          style={commissionsStyles.searchInput}
          placeholder="Search by ID or lender..."
          placeholderTextColor="#6B7280"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={commissionsStyles.filterContainer}
      >
        <TouchableOpacity
          style={[
            commissionsStyles.filterChip,
            filterStatus === "all" && commissionsStyles.activeFilterChip,
          ]}
          onPress={() => setFilterStatus("all")}
        >
          <Text
            style={[
              commissionsStyles.filterChipText,
              filterStatus === "all" && commissionsStyles.activeFilterChipText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {["Paid", "Pending", "Processing", "Disputed"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              commissionsStyles.filterChip,
              filterStatus === status && commissionsStyles.activeFilterChip,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                commissionsStyles.filterChipText,
                filterStatus === status &&
                  commissionsStyles.activeFilterChipText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Commission List */}
      {commissions.length === 0 ? (
        <View style={commissionsStyles.emptyState}>
          <MaterialIcons name="search-off" size={48} color="#374151" />
          <Text style={commissionsStyles.emptyStateText}>
            No commissions found
          </Text>
          <Text style={commissionsStyles.emptyStateSubtext}>
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
