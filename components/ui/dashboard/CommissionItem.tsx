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

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

function StatusBadge({ label = "Calculated" }: { label?: string }) {
  const theme = useTheme();
  const isDark = theme.dark;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 999,
        backgroundColor: isDark ? "rgba(251,191,36,0.12)" : "#FFF7ED",
        borderWidth: 1,
        borderColor: isDark ? "rgba(251,191,36,0.35)" : "#FB923C",
        alignSelf: "center",
      }}
    >
      <Feather name="clock" size={10} color={isDark ? "#FBBF24" : "#C2410C"} />
      <Text
        numberOfLines={1}
        style={{
          color: isDark ? "#FBBF24" : "#C2410C",
          fontSize: 11,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function InfoBlock({
  label,
  value,
  subValue,
  valueColor,
  subValueColor,
  align = "left",
}: {
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
  subValueColor?: string;
  align?: "left" | "right";
}) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          color: theme.colors.onSurfaceVariant,
          fontSize: 12,
          fontWeight: "600",
          textAlign: align,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>

      <Text
        style={{
          color: valueColor ?? theme.colors.onSurface,
          fontSize: 18,
          fontWeight: "800",
          textAlign: align,
          marginTop: 2,
        }}
      >
        {value}
      </Text>

      {!!subValue && (
        <Text
          style={{
            color: subValueColor ?? theme.colors.onSurfaceVariant,
            fontSize: 13,
            fontWeight: "700",
            textAlign: align,
            marginTop: 4,
          }}
        >
          {subValue}
        </Text>
      )}
    </View>
  );
}

function BottomRow({
  icon,
  label,
  value,
  rightContent,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  rightContent?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
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
        <Feather
          name={icon}
          size={14}
          color={theme.colors.onSurfaceVariant}
          style={{ marginRight: 8 }}
        />

        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {label}{" "}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            color: theme.colors.onSurface,
            fontSize: 12,
            fontWeight: "700",
            flexShrink: 1,
          }}
        >
          {value || "-"}
        </Text>
      </View>

      {rightContent ? (
        <View style={{ marginLeft: 10 }}>{rightContent}</View>
      ) : null}
    </View>
  );
}

function LoanTypePill({ value }: { value: string }) {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: theme.dark ? "rgba(148,163,184,0.12)" : "#F1F5F9",
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
        {value}
      </Text>
    </View>
  );
}

export default function CommissionHistoryItem({ item }: { item: any }) {
  const theme = useTheme();

  const ticketNo = item?.ticketId ?? item?.id ?? "-";
  const lenderName = item?.lenderName ?? item?.provider ?? "N/A";
  const loanType = item?.loanType ?? item?.productType ?? "N/A";

  const loanAmount = formatCurrency(
    Number(item?.disbursedAmount ?? item?.loanAmount ?? 0),
  );

  const rate = Number(item?.commissionPercent ?? item?.commissionRate ?? 0);

  const commissionAmount = formatCurrency(
    Number(item?.finalCommission ?? item?.commissionAmount ?? 0),
  );

  const status = item?.status ?? "Calculated";
  const normalizedStatus = String(status).trim().toLowerCase();
  const isPaid = normalizedStatus === "paid";

  const calculatedDate = formatDate(
    item?.calculatedAt ?? item?.createdAt ?? item?.disbursedDate,
  );

  const paidDate = formatDate(item?.paidDate ?? item?.utrPaidDate);
  const utr = item?.utr ?? item?.utrNumber ?? "-";

  return (
    <View
      style={[
        dashboardStyles.applicationItem,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline,
          borderWidth: 1,
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
            flex: 1.4,
            flexDirection: "row",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Ticket ID:{" "}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.onSurface,
              fontSize: 14,
              fontWeight: "800",
              flexShrink: 1,
            }}
          >
            F2FIN-{ticketNo}
          </Text>
        </View>

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
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            Status:
          </Text>
          <StatusBadge label={status} />
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
        <View style={{ flexDirection: "row", gap: 12 }}>
          <InfoBlock label="Loan Amount" value={loanAmount} />

          <InfoBlock
            label="Commission Amount"
            value={commissionAmount}
            subValue={`Rate - ${rate}%`}
            subValueColor="#FBBF24"
            valueColor="#22C55E"
            align="right"
          />
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
        <BottomRow
          icon="calendar"
          label="Calculated Date:"
          value={calculatedDate}
          rightContent={<LoanTypePill value={loanType} />}
        />

        {/* Lender always visible */}
        <BottomRow icon="briefcase" label="Lender:" value={lenderName} />

        {/* UTR only when paid */}
        {isPaid && <BottomRow icon="credit-card" label="UTR:" value={utr} />}

        {/* Paid Date only when paid */}
        {isPaid && (
          <BottomRow icon="check-circle" label="Paid Date:" value={paidDate} />
        )}
      </View>
    </View>
  );
}
