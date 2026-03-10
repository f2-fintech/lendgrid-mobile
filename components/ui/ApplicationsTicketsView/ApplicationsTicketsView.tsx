import { useTicketHistory } from "@/hooks/use-ticket-history_rest";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import PagerView from "react-native-pager-view";
import { ActivityIndicator } from "react-native-paper";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  theme: any;
  styles: any;
  router: any;
  pagerRef: React.RefObject<PagerView>;

  activeTab: "applications" | "tickets";
  setTab: (t: "applications" | "tickets") => void;
  setActiveTab: (t: "applications" | "tickets") => void;

  search: string;
  setSearch: (v: string) => void;

  appsData: any;
  appsLoading: boolean;
  appsError: boolean;
  refetchApps: any;
  appsPage: number;
  setAppsPage: (n: any) => void;
  appsRowsPerPage: number;
  appsRowsPerPageInput: string;
  setAppsRowsPerPageInput: (v: string) => void;

  ticketsData: any;
  ticketsLoading: boolean;
  ticketsError: boolean;
  refetchTickets: any;
  ticketsPage: number;
  setTicketsPage: (n: any) => void;
  ticketsRowsPerPage: number;
  ticketsRowsPerPageInput: string;
  setTicketsRowsPerPageInput: (v: string) => void;
};

// -------------------- Helpers --------------------
const clamp = (n: number, min = 0, max = 255) =>
  Math.max(min, Math.min(max, n));

const hexToRgb = (hex: string) => {
  const h = (hex || "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: parseInt(full.substring(0, 2) || "00", 16),
    g: parseInt(full.substring(2, 4) || "00", 16),
    b: parseInt(full.substring(4, 6) || "00", 16),
  };
};

const hexToRgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${alpha})`;
};

const SECTION_GAP = 12;
const HISTORY_CARD_MAX_HEIGHT = 250;

// Theme-aware palette: light stays light, dark becomes dark
const getHistoryPalette = (accent: string, isDark: boolean) => {
  if (isDark) {
    const cardBg = "#0B0F1A";
    return {
      cardBg,
      headerBg: "#111827",
      border: hexToRgba(accent, 0.35),
      titleText: "#FFFFFF",
      mutedText: "rgba(255,255,255,0.75)",
      softText: "rgba(255,255,255,0.90)",
      surface: "rgba(255,255,255,0.06)",
      surface2: "rgba(255,255,255,0.10)",
      icon: "#FFFFFF",
      dot: "#FFFFFF",
      divider: "rgba(255,255,255,0.12)",
    };
  }

  const base = "#FFFFFF";
  const soft = "#F8FAFC";
  return {
    cardBg: base,
    headerBg: soft,
    border: hexToRgba(accent, 0.22),
    titleText: "#0B0F1A",
    mutedText: "rgba(15,23,41,0.70)",
    softText: "rgba(15,23,41,0.85)",
    surface: "rgba(15,23,41,0.04)",
    surface2: "rgba(15,23,41,0.08)",
    icon: "#0B0F1A",
    dot: accent,
    divider: "rgba(15,23,41,0.10)",
  };
};

const getStatsCardColors = (theme: any) => {
  const isDark = !!theme?.dark;

  return {
    applicationsTotal: {
      bg: isDark ? "#0F172A" : "#EFF6FF",
      border: isDark ? "rgba(59,130,246,0.30)" : "rgba(59,130,246,0.18)",
      icon: isDark ? "#60A5FA" : "#2563EB",
      value: isDark ? "#DBEAFE" : "#1D4ED8",
    },
    applicationsPicked: {
      bg: isDark ? "#0F1A14" : "#ECFDF5",
      border: isDark ? "rgba(16,185,129,0.30)" : "rgba(16,185,129,0.18)",
      icon: isDark ? "#34D399" : "#059669",
      value: isDark ? "#D1FAE5" : "#047857",
    },
    ticketsTotal: {
      bg: isDark ? "#111827" : "#F8FAFC",
      border: isDark ? "rgba(148,163,184,0.25)" : "rgba(148,163,184,0.18)",
      icon: isDark ? "#CBD5E1" : "#334155",
      value: isDark ? "#F8FAFC" : "#0F172A",
    },
    ticketsReview: {
      bg: isDark ? "#1A1408" : "#FFFBEB",
      border: isDark ? "rgba(245,158,11,0.30)" : "rgba(245,158,11,0.18)",
      icon: "#F59E0B",
      value: "#F59E0B",
    },
    ticketsApproved: {
      bg: isDark ? "#0F1A14" : "#ECFDF5",
      border: isDark ? "rgba(16,185,129,0.30)" : "rgba(16,185,129,0.18)",
      icon: "#10B981",
      value: "#10B981",
    },
    ticketsDisbursed: {
      bg: isDark ? "#171028" : "#F5F3FF",
      border: isDark ? "rgba(139,92,246,0.30)" : "rgba(139,92,246,0.18)",
      icon: "#8B5CF6",
      value: "#8B5CF6",
    },
  };
};

function AppTicketCard({
  styles,
  theme,
  title,
  subtitle,
  status,
  statusColor,
  lender,
  amount,
  dateLabel,
  showHistoryIcon,
  ticketId,
}: any) {
  const [openHistory, setOpenHistory] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const {
    data: historyList = [],
    isFetching: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useTicketHistory(ticketId ?? null, openHistory);

  const handleToggleHistory = () => {
    const newValue = !openHistory;

    if (newValue) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          friction: 7,
        }),
      ]).start(() => {
        setOpenHistory(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
          }),
        ]).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          friction: 7,
        }),
      ]).start(() => {
        setOpenHistory(false);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
          }),
        ]).start();
      });
    }
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return "NA";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const cleanText = (t?: string | null) =>
    (t || "").replace(/<\/?[^>]+(>|$)/g, "").trim();

  const accent = statusColor || theme.colors?.primary || "#0EA5E9";
  const isDark = !!theme?.dark;
  const p = getHistoryPalette(accent, isDark);

  return (
    <Animated.View
      style={[
        styles.commissionItem,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {!openHistory ? (
        <TouchableOpacity activeOpacity={0.7} onPress={handleToggleHistory}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.commissionHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.applicationId}>{title}</Text>
                {!!subtitle && (
                  <Text style={styles.lenderName}>{subtitle}</Text>
                )}
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${statusColor}22` },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusColor }]}
                    numberOfLines={1}
                  >
                    {status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lender</Text>
              <Text style={styles.detailValue}>{lender || "NA"}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Loan Amount</Text>
              <Text style={styles.detailValue}>{amount || "NA"}</Text>
            </View>

            {!!dateLabel && (
              <View
                style={[
                  styles.dateRow,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
              >
                <Text style={styles.dateText}>{dateLabel}</Text>

                {showHistoryIcon && (
                  <Pressable onPress={handleToggleHistory}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: theme.colors.primary,
                        backgroundColor: theme.colors.surface,
                        gap: 6,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "700",
                          color: theme.colors.primary,
                        }}
                      >
                        History
                      </Text>

                      <Feather
                        name="clock"
                        size={14}
                        color={theme.colors.primary}
                      />
                    </View>
                  </Pressable>
                )}
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View
            style={{
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: p.cardBg,
              borderWidth: 1,
              borderColor: p.border,
            }}
          >
            <Pressable onPress={handleToggleHistory}>
              <View
                style={{
                  padding: 16,
                  backgroundColor: p.headerBg,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? p.divider : p.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Feather name="clock" size={16} color={p.icon} />

                  <Text
                    style={{
                      fontSize: 15,
                      marginLeft: 8,
                      fontWeight: "800",
                      color: p.titleText,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Ticket History
                  </Text>

                  {historyError && (
                    <TouchableOpacity
                      onPress={() => refetchHistory()}
                      style={{
                        marginRight: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: p.border,
                        backgroundColor: p.surface,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: p.titleText,
                          fontWeight: "700",
                        }}
                      >
                        Retry
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Pressable onPress={handleToggleHistory} hitSlop={10}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: p.border,
                        backgroundColor: p.surface,
                      }}
                    >
                      <Feather name="x" size={16} color={p.icon} />
                    </View>
                  </Pressable>
                </View>

                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: p.titleText,
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {title}
                </Text>

                {!!subtitle && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: p.mutedText,
                      fontWeight: "600",
                    }}
                    numberOfLines={2}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
            </Pressable>

            <View style={{ maxHeight: HISTORY_CARD_MAX_HEIGHT }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{ padding: 16, paddingBottom: 18 }}
                onStartShouldSetResponderCapture={() => true}
              >
                {historyLoading ? (
                  <View style={[styles.emptyState, { paddingVertical: 10 }]}>
                    <ActivityIndicator
                      animating
                      size="small"
                      color={p.titleText}
                    />
                    <Text
                      style={{
                        marginTop: 8,
                        color: p.softText,
                        fontWeight: "700",
                      }}
                    >
                      Loading history...
                    </Text>
                  </View>
                ) : historyError ? (
                  <View style={[styles.emptyState, { paddingVertical: 10 }]}>
                    <Feather
                      name="alert-circle"
                      size={28}
                      color="#EF4444"
                      style={{ marginBottom: 8 }}
                    />
                    <Text
                      style={{
                        color: p.titleText,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      Failed to load history
                    </Text>
                    <Text
                      style={{
                        color: p.mutedText,
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      Tap retry or check connection.
                    </Text>
                  </View>
                ) : historyList.length === 0 ? (
                  <View style={[styles.emptyState, { paddingVertical: 10 }]}>
                    <Feather
                      name="inbox"
                      size={32}
                      color={p.mutedText}
                      style={{ marginBottom: 8 }}
                    />
                    <Text
                      style={{
                        color: p.titleText,
                        fontSize: 14,
                        fontWeight: "800",
                      }}
                    >
                      No history found
                    </Text>
                    <Text
                      style={{
                        color: p.mutedText,
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      History will appear once status updates happen.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 14 }}>
                    {historyList.map((h: any, idx: number) => {
                      const action = cleanText(h.action) || "Updated";
                      return (
                        <View
                          key={String(h.id ?? idx)}
                          style={{ flexDirection: "row", gap: 12 }}
                        >
                          <View style={{ alignItems: "center", width: 12 }}>
                            <View
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                backgroundColor: p.dot,
                                borderWidth: 2,
                                borderColor: p.surface2,
                              }}
                            />
                            {idx !== historyList.length - 1 && (
                              <View
                                style={{
                                  width: 2,
                                  flex: 1,
                                  backgroundColor: isDark
                                    ? p.divider
                                    : p.border,
                                  marginTop: 6,
                                  minHeight: 30,
                                }}
                              />
                            )}
                          </View>

                          <View style={{ flex: 1, paddingBottom: 4 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "900",
                                color: p.titleText,
                                marginBottom: 4,
                              }}
                              numberOfLines={2}
                            >
                              {action}
                            </Text>

                            <Text
                              style={{
                                fontSize: 12,
                                color: p.mutedText,
                                fontWeight: "600",
                              }}
                              numberOfLines={1}
                            >
                              {formatDateTime(h.created_at)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function ApplicationsTicketsView(props: Props) {
  const {
    theme,
    styles,
    router,
    pagerRef,
    activeTab,
    setTab,
    setActiveTab,
    search,
    setSearch,

    appsData,
    appsLoading,
    appsError,
    refetchApps,
    appsPage,
    setAppsPage,
    appsRowsPerPage,
    appsRowsPerPageInput,
    setAppsRowsPerPageInput,

    ticketsData,
    ticketsLoading,
    ticketsError,
    refetchTickets,
    ticketsPage,
    setTicketsPage,
    ticketsRowsPerPage,
    ticketsRowsPerPageInput,
    setTicketsRowsPerPageInput,
  } = props;

  const statColors = getStatsCardColors(theme);

  const applications = appsData?.results ?? [];
  const tickets = ticketsData?.results ?? [];

  const totalApplications = appsData?.count ?? 0;
  const totalTickets = ticketsData?.count ?? 0;

  const appsTotalPages =
    appsData?.pages ??
    Math.max(1, Math.ceil(totalApplications / appsRowsPerPage));

  const ticketsTotalPages =
    ticketsData?.pages ??
    Math.max(1, Math.ceil(totalTickets / ticketsRowsPerPage));

  const pickedApplications = totalTickets;

  const ticketsSummary = useMemo(() => {
    const summary = { underCreditReview: 0, approved: 0, disbursed: 0 };
    tickets.forEach((t: any) => {
      const status = (t.ticketStatus || "").toLowerCase();
      if (status === "under credit review") summary.underCreditReview++;
      if (status === "approved") summary.approved++;
      if (status === "disbursed") summary.disbursed++;
    });
    return summary;
  }, [tickets]);

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt || 0);

  const formatDate = (iso?: string) => {
    if (!iso) return "NA";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "approved":
      case "disbursed":
        return "#10B981";
      case "pending":
      case "under credit review":
      case "in-progress":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      case "Submitted":
        return theme.colors.primary;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const filteredApps = useMemo(() => {
    const q = search.toLowerCase();
    return applications.filter((a: any) => {
      return (
        a.customerName?.toLowerCase().includes(q) ||
        String(a.applicationNumber ?? a.applicationId)
          .toLowerCase()
          .includes(q)
      );
    });
  }, [applications, search]);

  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((t: any) => {
      return (
        t.customerName?.toLowerCase().includes(q) ||
        String(t.ticketId).toLowerCase().includes(q)
      );
    });
  }, [tickets, search]);

  const renderLoading = () => (
    <View style={styles.emptyState}>
      <ActivityIndicator animating size="small" />
      <Text style={styles.emptyStateText}>Loading...</Text>
    </View>
  );

  const renderError = (onRetry?: () => void) => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>Something went wrong</Text>
      <Text style={styles.emptyStateSubtext}>
        Please check your connection and try again.
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const getRangeLabel = (page: number, rowsPerPage: number, total: number) => {
    if (!total) return "0 of 0";
    const start = (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, total);
    return `${start}–${end} of ${total}`;
  };

  const handleApplyPress = () => router.push("/create-application");

  const handleAppsPrev = () =>
    appsPage > 1 && !appsLoading && setAppsPage((p: number) => p - 1);
  const handleAppsNext = () =>
    appsPage < appsTotalPages &&
    !appsLoading &&
    setAppsPage((p: number) => p + 1);

  const handleTicketsPrev = () =>
    ticketsPage > 1 && !ticketsLoading && setTicketsPage((p: number) => p - 1);
  const handleTicketsNext = () =>
    ticketsPage < ticketsTotalPages &&
    !ticketsLoading &&
    setTicketsPage((p: number) => p + 1);

  const renderApplicationsTab = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <View
        style={{
          marginBottom: SECTION_GAP,
          marginHorizontal: -2, // little wider only for application stats
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 8,
          }}
        >
          <View
            style={[
              styles.metricCard,
              {
                flex: 1,
                backgroundColor: statColors.applicationsTotal.bg,
                borderWidth: 1,
                borderColor: statColors.applicationsTotal.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Total Applications</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.applicationsTotal.value },
                ]}
              >
                {totalApplications}
              </Text>
              <Feather
                name="file-text"
                size={24}
                color={statColors.applicationsTotal.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                flex: 1,
                backgroundColor: statColors.applicationsPicked.bg,
                borderWidth: 1,
                borderColor: statColors.applicationsPicked.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Picked Applications</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.applicationsPicked.value },
                ]}
              >
                {pickedApplications}
              </Text>
              <Feather
                name="check-circle"
                size={24}
                color={statColors.applicationsPicked.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: SECTION_GAP }}>
        <View
          style={[
            styles.searchContainer,
            {
              marginTop: 0,
              marginBottom: 0,
            },
          ]}
        >
          <Feather
            name="search"
            size={18}
            color={theme.colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by Name or App ID..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View
        style={[
          styles.contentCard,
          {
            marginTop: 0,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={styles.cardTitle}>Fresh Applications</Text>

          <TouchableOpacity
            onPress={handleApplyPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.primary,
              backgroundColor: hexToRgba(
                theme.colors.primary,
                theme.dark ? 0.18 : 0.08,
              ),
            }}
          >
            <Feather
              name="plus-circle"
              size={15}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.primary,
                fontWeight: "700",
              }}
            >
              Create
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardSubtitle}>Recent submissions</Text>

        {appsLoading && renderLoading()}
        {appsError && !appsData && renderError(refetchApps)}

        {filteredApps.map((app: any) => {
          const status = "Submitted";
          const statusColor = getStatusColor(status);

          return (
            <AppTicketCard
              key={String(app.applicationId)}
              styles={styles}
              theme={theme}
              title={`Application No - ${String(
                app.applicationNumber || app.applicationId,
              )}`}
              subtitle={`${app.customerName} • ${app.loanType}`}
              status={status}
              statusColor={statusColor}
              lender={app.applicationProvider}
              amount={formatCurrency(app.applicationAmount)}
              dateLabel={`Submitted: ${formatDate(app.applicationDate)}`}
            />
          );
        })}

        {!appsLoading && !appsError && filteredApps.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No applications found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try different search keywords
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
            >
              Rows per page
            </Text>

            <TextInput
              value={appsRowsPerPageInput}
              keyboardType="numeric"
              onChangeText={setAppsRowsPerPageInput}
              onEndEditing={() => {
                const n = parseInt(appsRowsPerPageInput.trim(), 10);
                if (isNaN(n) || n <= 0)
                  setAppsRowsPerPageInput(String(appsRowsPerPage));
              }}
              style={{
                minWidth: 48,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderRadius: 6,
                color: theme.colors.onSurface,
                textAlign: "center",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text
              style={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
            >
              {getRangeLabel(appsPage, appsRowsPerPage, totalApplications)}
            </Text>

            <TouchableOpacity
              onPress={handleAppsPrev}
              disabled={appsPage === 1 || appsLoading}
              style={{
                paddingHorizontal: 4,
                opacity: appsPage === 1 || appsLoading ? 0.4 : 1,
              }}
            >
              <Feather
                name="chevron-left"
                size={18}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAppsNext}
              disabled={appsPage === appsTotalPages || appsLoading}
              style={{
                paddingHorizontal: 4,
                opacity: appsPage === appsTotalPages || appsLoading ? 0.4 : 1,
              }}
            >
              <Feather
                name="chevron-right"
                size={18}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTicketsTab = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{ marginBottom: SECTION_GAP }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsScrollContainer}
          style={[
            styles.metricsScrollView,
            {
              marginTop: 0,
              marginBottom: 0,
            },
          ]}
        >
          <View
            style={[
              styles.ticketMetricCard,
              {
                backgroundColor: statColors.ticketsTotal.bg,
                borderWidth: 1,
                borderColor: statColors.ticketsTotal.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Total Tickets</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.ticketsTotal.value },
                ]}
              >
                {totalTickets}
              </Text>
              <Feather
                name="clipboard"
                size={24}
                color={statColors.ticketsTotal.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>

          <View
            style={[
              styles.ticketMetricCard,
              {
                backgroundColor: statColors.ticketsReview.bg,
                borderWidth: 1,
                borderColor: statColors.ticketsReview.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Under Credit Review</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.ticketsReview.value },
                ]}
              >
                {ticketsSummary.underCreditReview}
              </Text>
              <Feather
                name="clock"
                size={24}
                color={statColors.ticketsReview.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>

          <View
            style={[
              styles.ticketMetricCard,
              {
                backgroundColor: statColors.ticketsApproved.bg,
                borderWidth: 1,
                borderColor: statColors.ticketsApproved.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Approved</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.ticketsApproved.value },
                ]}
              >
                {ticketsSummary.approved}
              </Text>
              <Feather
                name="check-circle"
                size={24}
                color={statColors.ticketsApproved.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>

          <View
            style={[
              styles.ticketMetricCard,
              {
                backgroundColor: statColors.ticketsDisbursed.bg,
                borderWidth: 1,
                borderColor: statColors.ticketsDisbursed.border,
              },
            ]}
          >
            <Text style={styles.metricTitle}>Disbursed</Text>
            <View style={styles.metricValueRow}>
              <Text
                style={[
                  styles.metricValue,
                  { color: statColors.ticketsDisbursed.value },
                ]}
              >
                {ticketsSummary.disbursed}
              </Text>
              <FontAwesome5
                name="rupee-sign"
                size={22}
                color={statColors.ticketsDisbursed.icon}
                style={styles.metricIcon}
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={{ marginBottom: SECTION_GAP }}>
        <View
          style={[
            styles.searchContainer,
            {
              marginTop: 0,
              marginBottom: 0,
            },
          ]}
        >
          <Feather
            name="search"
            size={18}
            color={theme.colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tickets..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View
        style={[
          styles.contentCard,
          {
            marginTop: 0,
          },
        ]}
      >
        <Text style={styles.cardTitle}>Tickets Overview</Text>
        <Text style={styles.cardSubtitle}>
          Track and manage all loan tickets
        </Text>

        {ticketsLoading && renderLoading()}
        {ticketsError && !ticketsData && renderError(refetchTickets)}

        {filteredTickets.map((ticket: any) => {
          const status = ticket.ticketStatus || "No status";
          const statusColor = getStatusColor(status);

          return (
            <AppTicketCard
              key={String(ticket.ticketId)}
              styles={styles}
              theme={theme}
              title={`ID - F2FIN-${String(ticket.ticketId)}`}
              subtitle={`${ticket.customerName}`}
              status={status}
              statusColor={statusColor}
              lender={ticket.applicationProvider}
              amount={formatCurrency(ticket.applicationAmount)}
              dateLabel={`Created: ${formatDate(ticket.created_at || ticket.createdAt)}`}
              showHistoryIcon
              ticketId={ticket.ticketId}
            />
          );
        })}

        {!ticketsLoading && !ticketsError && filteredTickets.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tickets found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try different search keywords
            </Text>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
            >
              Rows per page
            </Text>

            <TextInput
              value={ticketsRowsPerPageInput}
              keyboardType="numeric"
              onChangeText={setTicketsRowsPerPageInput}
              onEndEditing={() => {
                const n = parseInt(ticketsRowsPerPageInput.trim(), 10);
                if (isNaN(n) || n <= 0)
                  setTicketsRowsPerPageInput(String(ticketsRowsPerPage));
              }}
              style={{
                minWidth: 48,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderRadius: 6,
                color: theme.colors.onSurface,
                textAlign: "center",
              }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Text
              style={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
            >
              {getRangeLabel(ticketsPage, ticketsRowsPerPage, totalTickets)}
            </Text>

            <TouchableOpacity
              onPress={handleTicketsPrev}
              disabled={ticketsPage === 1 || ticketsLoading}
              style={{
                paddingHorizontal: 4,
                opacity: ticketsPage === 1 || ticketsLoading ? 0.4 : 1,
              }}
            >
              <Feather
                name="chevron-left"
                size={18}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTicketsNext}
              disabled={ticketsPage === ticketsTotalPages || ticketsLoading}
              style={{
                paddingHorizontal: 4,
                opacity:
                  ticketsPage === ticketsTotalPages || ticketsLoading ? 0.4 : 1,
              }}
            >
              <Feather
                name="chevron-right"
                size={18}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <View
        style={[
          styles.tabContainer,
          {
            marginBottom: SECTION_GAP,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.tab, activeTab === "applications" && styles.activeTab]}
          onPress={() => setTab("applications")}
        >
          <Feather
            name="file-text"
            size={18}
            color={
              activeTab === "applications"
                ? "#000"
                : theme.colors.onSurfaceVariant
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "applications" && styles.activeTabText,
            ]}
          >
            Applications
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "tickets" && styles.activeTab]}
          onPress={() => setTab("tickets")}
        >
          <Feather
            name="clipboard"
            size={18}
            color={
              activeTab === "tickets" ? "#000" : theme.colors.onSurfaceVariant
            }
            style={{ marginRight: 8 }}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "tickets" && styles.activeTabText,
            ]}
          >
            Tickets
          </Text>
        </TouchableOpacity>
      </View>

      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          setActiveTab(index === 0 ? "applications" : "tickets");
        }}
      >
        <View key="applications">
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderApplicationsTab()}
          </ScrollView>
        </View>

        <View key="tickets">
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {renderTicketsTab()}
          </ScrollView>
        </View>
      </PagerView>
    </>
  );
}
