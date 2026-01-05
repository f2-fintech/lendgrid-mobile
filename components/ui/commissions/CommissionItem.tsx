// components/ui/commissions/CommissionItem.tsx

import { MaterialIcons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

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
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const statusColor = getStatusColor(item.status);
  const statusIcon = getStatusIcon(item.status);

  return (
    <View style={styles.commissionItem}>
      {/* ---------- TOP ROW: ID + STATUS BADGE ---------- */}
      <View style={styles.commissionHeader}>
        <Text style={styles.applicationId}>{item.applicationId}</Text>

        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <MaterialIcons
            name={statusIcon as any}
            size={14}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* ---------- SECOND ROW: LENDER + LOAN TYPE ---------- */}
      <Text
        style={[styles.lenderName, { marginTop: 4 }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.lenderName} • {item.loanType}
      </Text>

      {/* ---------- DETAILS SECTION ---------- */}
      <View style={styles.commissionDetails}>
        <View style={styles.detailRow}>
          <View>
            <Text style={styles.detailLabel}>Disbursed Amount</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(item.disbursedAmount)}
            </Text>
          </View>

          <View style={styles.commissionInfo}>
            <Text style={styles.commissionRate}>{item.commissionRate}%</Text>
            <Text style={styles.commissionAmount}>
              {formatCurrency(item.commissionAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <MaterialIcons
              name="calendar-today"
              size={14}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.dateText}>Disbursed: {item.disbursedDate}</Text>
          </View>

          {!!item.paidDate && (
            <View style={styles.dateItem}>
              <MaterialIcons
                name="check-circle"
                size={14}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.dateText}>Paid: {item.paidDate}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
