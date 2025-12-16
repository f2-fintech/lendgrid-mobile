import { MaterialIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

interface CommissionItemProps {
  item: {
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
  };
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const CommissionItem = ({
  item,
  formatCurrency,
  getStatusColor,
  getStatusIcon,
}: CommissionItemProps) => {
  const statusColor = getStatusColor(item.status);
  const statusIcon = getStatusIcon(item.status);

  return (
    <View style={commissionsStyles.commissionItem}>
      <View style={commissionsStyles.commissionHeader}>
        <View>
          <Text style={commissionsStyles.applicationId}>
            {item.applicationId}
          </Text>
          <Text style={commissionsStyles.lenderName}>
            {item.lenderName} • {item.loanType}
          </Text>
        </View>
        <View
          style={[
            commissionsStyles.statusBadge,
            { backgroundColor: statusColor + "20" },
          ]}
        >
          <MaterialIcons name={statusIcon} size={14} color={statusColor} />
          <Text style={[commissionsStyles.statusText, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={commissionsStyles.commissionDetails}>
        <View style={commissionsStyles.detailRow}>
          <View>
            <Text style={commissionsStyles.detailLabel}>Disbursed Amount</Text>
            <Text style={commissionsStyles.detailValue}>
              {formatCurrency(item.disbursedAmount)}
            </Text>
          </View>
          <View style={commissionsStyles.commissionInfo}>
            <Text style={commissionsStyles.commissionRate}>
              {item.commissionRate}%
            </Text>
            <Text style={commissionsStyles.commissionAmount}>
              {formatCurrency(item.commissionAmount)}
            </Text>
          </View>
        </View>

        <View style={commissionsStyles.dateRow}>
          <View style={commissionsStyles.dateItem}>
            <MaterialIcons name="calendar-today" size={14} color="#9CA3AF" />
            <Text style={commissionsStyles.dateText}>
              Disbursed: {item.disbursedDate}
            </Text>
          </View>
          {item.paidDate && (
            <View style={commissionsStyles.dateItem}>
              <MaterialIcons name="check-circle" size={14} color="#9CA3AF" />
              <Text style={commissionsStyles.dateText}>
                Paid: {item.paidDate}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
