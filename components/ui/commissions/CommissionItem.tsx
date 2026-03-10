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
    loanType?: string | null;
    productType?: string | null;
    disbursedAmount: number;
    commissionRate: number;
    commissionAmount: number;
    status: string;
    disbursedDate: string;
    paidDate: string | null;
    utr?: string | null;
    utrNumber?: string | null;
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

  const loanType =
    item?.loanType?.trim?.() || item?.productType?.trim?.() || "N/A";

  const utr = item?.utr?.trim?.() || item?.utrNumber?.trim?.() || "-";
  const isPaid = String(item.status || "").toLowerCase() === "paid";

  return (
    <View
      style={[
        styles.commissionItem,
        {
          borderRadius: 18,
          padding: 14,
          marginBottom: 12,
        },
      ]}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Text
            style={[
              styles.detailLabel,
              {
                fontSize: 14,
                fontWeight: "600",
              },
            ]}
          >
            Ticket ID:{" "}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.applicationId,
              {
                fontSize: 14,
                fontWeight: "800",
                flexShrink: 1,
              },
            ]}
          >
            F2FIN-{item.applicationId}
          </Text>
        </View>

        {/* Status */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            Status:
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${statusColor}20`,
                borderWidth: 1,
                borderColor: `${statusColor}55`,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 999,
              },
            ]}
          >
            <MaterialIcons
              name={statusIcon as any}
              size={12}
              color={statusColor}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.statusText,
                {
                  color: statusColor,
                  fontSize: 11,
                  fontWeight: "700",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      {/* Highlight Section */}
      <View
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 14,
          backgroundColor: theme.dark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
          borderWidth: 1,
          borderColor: theme.colors.outline,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.detailLabel,
                {
                  fontSize: 12,
                  fontWeight: "600",
                },
              ]}
            >
              Loan Amount
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  marginTop: 2,
                  fontSize: 18,
                  fontWeight: "800",
                },
              ]}
            >
              {formatCurrency(item.disbursedAmount)}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text
              style={[
                styles.detailLabel,
                {
                  fontSize: 12,
                  fontWeight: "600",
                  textAlign: "right",
                },
              ]}
            >
              Commission Amount
            </Text>

            <Text
              style={[
                styles.commissionAmount,
                {
                  marginTop: 2,
                  fontSize: 18,
                  fontWeight: "800",
                  color: "#22C55E",
                  textAlign: "right",
                },
              ]}
            >
              {formatCurrency(item.commissionAmount)}
            </Text>

            <Text
              style={[
                styles.commissionRate,
                {
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#FBBF24",
                  textAlign: "right",
                },
              ]}
            >
              Rate - {item.commissionRate}%
            </Text>
          </View>
        </View>
      </View>

      {/* Details */}
      <View
        style={{
          marginTop: 14,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
        }}
      >
        {/* Calculated Date + Loan Type */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              minWidth: 0,
            }}
          >
            <MaterialIcons
              name="calendar-today"
              size={14}
              color={theme.colors.onSurfaceVariant}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.dateText,
                {
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 12,
                  fontWeight: "600",
                },
              ]}
            >
              Calculated Date:{" "}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.dateText,
                {
                  color: theme.colors.onSurface,
                  fontSize: 12,
                  fontWeight: "700",
                  flexShrink: 1,
                },
              ]}
            >
              {item.disbursedDate || "-"}
            </Text>
          </View>

          <View
            style={{
              marginLeft: 10,
              maxWidth: "45%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: theme.dark
                  ? "rgba(148,163,184,0.12)"
                  : "#F1F5F9",
                maxWidth: "100%",
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "capitalize",
                }}
              >
                {loanType}
              </Text>
            </View>
          </View>
        </View>

        {/* Lender */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <MaterialIcons
            name="business"
            size={14}
            color={theme.colors.onSurfaceVariant}
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.dateText,
              {
                color: theme.colors.onSurfaceVariant,
                fontSize: 12,
                fontWeight: "600",
              },
            ]}
          >
            Lender:{" "}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.dateText,
              {
                color: theme.colors.onSurface,
                fontSize: 12,
                fontWeight: "700",
                flexShrink: 1,
              },
            ]}
          >
            {item.lenderName || "N/A"}
          </Text>
        </View>

        {/* UTR + Paid Date only for paid status */}
        {isPaid && (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <MaterialIcons
                name="credit-card"
                size={14}
                color={theme.colors.onSurfaceVariant}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.dateText,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: "600",
                  },
                ]}
              >
                UTR:{" "}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.dateText,
                  {
                    color: theme.colors.onSurface,
                    fontSize: 12,
                    fontWeight: "700",
                    flexShrink: 1,
                  },
                ]}
              >
                {utr}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <MaterialIcons
                name="check-circle"
                size={14}
                color={theme.colors.onSurfaceVariant}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.dateText,
                  {
                    color: theme.colors.onSurfaceVariant,
                    fontSize: 12,
                    fontWeight: "600",
                  },
                ]}
              >
                Paid Date:{" "}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.dateText,
                  {
                    color: theme.colors.onSurface,
                    fontSize: 12,
                    fontWeight: "700",
                    flexShrink: 1,
                  },
                ]}
              >
                {item.paidDate || "-"}
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};
