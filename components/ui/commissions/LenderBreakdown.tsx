import { useMemo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

import { commissionsStyles } from "../../../styles/components/commissions/commissions.styles";

interface LenderItem {
  name: string;
  commission: number;
  percentage: number;
  color: string;
}

interface LenderBreakdownProps {
  lenders: LenderItem[];
  formatCurrency: (amount: number) => string;
}

export const LenderBreakdown = ({
  lenders,
  formatCurrency,
}: LenderBreakdownProps) => {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  return (
    <View style={styles.contentCard}>
      <Text style={styles.cardTitle}>Commission by Lender</Text>
      <Text style={styles.cardSubtitle}>
        Breakdown of earnings from each lender partner
      </Text>

      <View style={styles.lenderList}>
        {lenders.map((lender) => (
          <View key={lender.name} style={styles.lenderItem}>
            <View style={styles.lenderInfo}>
              <View
                style={[styles.lenderColor, { backgroundColor: lender.color }]}
              />
              <View>
                <Text style={styles.lenderNameText}>{lender.name}</Text>
                <Text style={styles.lenderPercentage}>
                  {lender.percentage}% of total
                </Text>
              </View>
            </View>

            <Text style={styles.lenderAmount}>
              {formatCurrency(lender.commission)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
