import { dashboardStyles } from "@/styles/components/dashboard/dashboard.styles";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "react-native-paper";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

function CalculatedBadge() {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View
      style={[
        dashboardStyles.badge,
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 4,
          paddingHorizontal: 8,
          backgroundColor: isDark ? "#2A2419" : "#FEF3C7",
          borderColor: isDark ? "#FBBF24" : "#F59E0B",
        },
      ]}
    >
      <Feather name="clock" size={12} color={isDark ? "#FBBF24" : "#B45309"} />
      <Text
        style={[
          dashboardStyles.badgeText,
          { color: isDark ? "#FBBF24" : "#B45309", fontSize: 11 },
        ]}
      >
        Calculated
      </Text>
    </View>
  );
}

export default function CommissionHistoryItem({ item }: { item: any }) {
  const theme = useTheme();

  //  IMPORTANT: Ticket number comes from ticketId, not id
  const ticketNo = item?.ticketId ?? item?.id;

  //  API gives commissionRate (we mapped to commissionPercent, but fallback safe)
  const rate = Number(item?.commissionPercent ?? item?.commissionRate ?? 0);

  return (
    <View
      style={[
        dashboardStyles.applicationItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          paddingVertical: 12,
        },
      ]}
    >
      {/* Header */}
      <View style={dashboardStyles.applicationHeader}>
        <Text
          style={[
            dashboardStyles.appId,
            { color: theme.colors.onSurface, fontSize: 14 },
          ]}
        >
          {`Ticket ID - F2FIN-${ticketNo}`}
        </Text>

        <CalculatedBadge />
      </View>

      {/* Lender line */}
      <Text
        style={[
          dashboardStyles.lenderName,
          { color: theme.colors.onSurface, fontSize: 14 },
        ]}
      >
        {item?.lenderName ?? item?.provider ?? "N/A"}
        <Text style={{ color: theme.colors.onSurfaceVariant }}> • </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 13 }}>
          {item?.loanType ?? item?.productType ?? "N/A"}
        </Text>
      </Text>

      {/* Amount Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <View>
          <Text
            style={[
              dashboardStyles.detailLabel,
              { color: theme.colors.onSurfaceVariant, fontSize: 12 },
            ]}
          >
            Disbursed Amount
          </Text>

          <Text
            style={[
              dashboardStyles.detailValue,
              {
                color: theme.colors.onSurface,
                fontSize: 18,
                fontWeight: "700",
                marginTop: 2,
              },
            ]}
          >
            {formatCurrency(Number(item?.disbursedAmount ?? 0))}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: "#FBBF24", fontSize: 13, fontWeight: "700" }}>
            {rate}%
          </Text>

          <Text
            style={{
              color: "#34D399",
              fontSize: 18,
              fontWeight: "800",
              marginTop: 2,
            }}
          >
            {formatCurrency(Number(item?.commissionAmount ?? 0))}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 10,
          gap: 6,
        }}
      >
        <Feather
          name="calendar"
          size={14}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={[
            dashboardStyles.loanType,
            { color: theme.colors.onSurfaceVariant, fontSize: 12 },
          ]}
        >
          Disbursed:{" "}
          {formatDate(
            String(
              item?.disbursedDate ??
                item?.calculatedAt ??
                item?.createdAt ??
                "",
            ),
          )}
        </Text>
      </View>
    </View>
  );
}
