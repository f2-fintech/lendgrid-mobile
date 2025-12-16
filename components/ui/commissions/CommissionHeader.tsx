import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

export const CommissionHeader = () => {
  return (
    <View style={commissionsStyles.header}>
      <View>
        <Text style={commissionsStyles.headerTitle}>Commission Tracking</Text>
        <Text style={commissionsStyles.headerSubtitle}>
          Monitor your earnings and payout status
        </Text>
      </View>
      <TouchableOpacity style={commissionsStyles.dateFilter}>
        <Text style={commissionsStyles.dateFilterText}>30 Days</Text>
        <MaterialIcons name="keyboard-arrow-down" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );
};
