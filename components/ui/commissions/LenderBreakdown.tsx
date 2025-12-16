import { Text, View } from "react-native";
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
  return (
    <View style={commissionsStyles.contentCard}>
      <Text style={commissionsStyles.cardTitle}>Commission by Lender</Text>
      <Text style={commissionsStyles.cardSubtitle}>
        Breakdown of earnings from each lender partner
      </Text>

      <View style={commissionsStyles.lenderList}>
        {lenders.map((lender) => (
          <View key={lender.name} style={commissionsStyles.lenderItem}>
            <View style={commissionsStyles.lenderInfo}>
              <View
                style={[
                  commissionsStyles.lenderColor,
                  { backgroundColor: lender.color },
                ]}
              />
              <View>
                <Text style={commissionsStyles.lenderNameText}>
                  {lender.name}
                </Text>
                <Text style={commissionsStyles.lenderPercentage}>
                  {lender.percentage}% of total
                </Text>
              </View>
            </View>
            <Text style={commissionsStyles.lenderAmount}>
              {formatCurrency(lender.commission)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
