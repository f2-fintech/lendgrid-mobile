import { useTicketHistory } from "@/hooks/use-ticket-history_rest";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
  pagerRef: React.RefObject<PagerView | null>;

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

  isOmsSales?: boolean;
  lockedTab?: "applications" | "tickets";
  hasSelectedCompany?: boolean;
  notificationTicketId?: string;
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
      bg: isDark
        ? ["rgba(99,102,241,0.24)", "rgba(99,102,241,0.08)"]
        : ["#EEF2FF", "#E0E7FF"],
      border: isDark ? "rgba(129,140,248,0.30)" : "rgba(99,102,241,0.20)",
      icon: isDark ? "#818CF8" : "#4F46E5",
      value: isDark ? "#A5B4FC" : "#4F46E5",
    },
    applicationsPicked: {
      bg: isDark
        ? ["rgba(16,185,129,0.20)", "rgba(16,185,129,0.07)"]
        : ["#D1FAE5", "#A7F3D0"],
      border: isDark ? "rgba(52,211,153,0.28)" : "rgba(16,185,129,0.24)",
      icon: isDark ? "#34D399" : "#059669",
      value: isDark ? "#34D399" : "#059669",
    },
    ticketsTotal: {
      bg: isDark
        ? ["rgba(99,102,241,0.24)", "rgba(99,102,241,0.08)"]
        : ["#EEF2FF", "#E0E7FF"],
      border: isDark ? "rgba(129,140,248,0.30)" : "rgba(99,102,241,0.20)",
      icon: isDark ? "#818CF8" : "#4F46E5",
      value: isDark ? "#A5B4FC" : "#4F46E5",
    },
    ticketsReview: {
      bg: isDark
        ? ["rgba(245,158,11,0.20)", "rgba(245,158,11,0.07)"]
        : ["#FFFBEB", "#FEF3C7"],
      border: isDark ? "rgba(245,158,11,0.28)" : "rgba(245,158,11,0.24)",
      icon: isDark ? "#FBBF24" : "#D97706",
      value: isDark ? "#FBBF24" : "#D97706",
    },
    ticketsApproved: {
      bg: isDark
        ? ["rgba(16,185,129,0.20)", "rgba(16,185,129,0.07)"]
        : ["#ECFDF5", "#D1FAE5"],
      border: isDark ? "rgba(52,211,153,0.28)" : "rgba(16,185,129,0.22)",
      icon: isDark ? "#34D399" : "#059669",
      value: isDark ? "#34D399" : "#059669",
    },
    ticketsDisbursed: {
      bg: isDark
        ? ["rgba(139,92,246,0.22)", "rgba(139,92,246,0.08)"]
        : ["#F5F3FF", "#EDE9FE"],
      border: isDark ? "rgba(167,139,250,0.30)" : "rgba(139,92,246,0.20)",
      icon: isDark ? "#A78BFA" : "#7C3AED",
      value: isDark ? "#A78BFA" : "#7C3AED",
    },
  };
};

const getSurfacePalette = (theme: any) => {
  const isDark = !!theme?.dark;

  return {
    cardTopAccent: isDark ? "rgba(129,140,248,0.42)" : "rgba(99,102,241,0.30)",
    control: isDark ? "rgba(255,255,255,0.05)" : "#FFFFFF",
    controlBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
    divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)",
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
  initiallyOpenHistory = false,
}: any) {
  const [openHistory, setOpenHistory] = useState(!!initiallyOpenHistory);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const {
    data: historyList = [],
    isFetching: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useTicketHistory(ticketId ?? null, openHistory);

  useEffect(() => {
    if (initiallyOpenHistory && showHistoryIcon && ticketId) {
      setOpenHistory(true);
    }
  }, [initiallyOpenHistory, showHistoryIcon, ticketId]);

  const handleToggleHistory = () => {
    if (!showHistoryIcon || !ticketId) return;

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
        <TouchableOpacity
          activeOpacity={showHistoryIcon ? 0.75 : 1}
          disabled={!showHistoryIcon}
          onPress={handleToggleHistory}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <LinearGradient
              colors={[
                "transparent",
                getSurfacePalette(theme).cardTopAccent,
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.cardTopAccent, { paddingTop: 1 }]}
            />
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
                    {
                      backgroundColor: `${statusColor}22`,
                      borderColor: `${statusColor}44`,
                    },
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
                        borderColor: `${theme.colors.primary}44`,
                        backgroundColor: `${theme.colors.primary}18`,
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
                                lineHeight: 20,
                                fontWeight: "900",
                                color: p.titleText,
                                marginBottom: 6,
                              }}
                            >
                              {action}
                            </Text>

                            <Text
                              style={{
                                fontSize: 12,
                                lineHeight: 17,
                                color: p.mutedText,
                                fontWeight: "600",
                              }}
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
    isOmsSales = false,
    lockedTab,
    hasSelectedCompany = false,
    notificationTicketId,
  } = props;
  const [createWarning, setCreateWarning] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const fabPulse = useRef(new Animated.Value(0)).current;

  const statColors = getStatsCardColors(theme);
  const surfacePalette = getSurfacePalette(theme);

  const applications = useMemo(
    () => appsData?.results ?? [],
    [appsData?.results],
  );
  const tickets = useMemo(
    () => ticketsData?.results ?? [],
    [ticketsData?.results],
  );

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
      case "submitted":
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

  useEffect(() => {
    if (!searchOpen) return;
    const focusTimer = setTimeout(() => searchInputRef.current?.focus(), 120);

    // Instantly close the modal when the keyboard is dismissed (via back button)
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setSearchOpen(false);
      },
    );

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (searchOpen) {
          setSearchOpen(false);
          return true;
        }

        return false;
      },
    );

    return () => {
      clearTimeout(focusTimer);
      keyboardDidHideListener.remove();
      backHandler.remove();
    };
  }, [searchOpen]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (activeTab === "applications") {
      setAppsPage(1);
    } else {
      setTicketsPage(1);
    }
  };

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

  const handleApplyPress = () => {
    if (isOmsSales && !hasSelectedCompany) {
      setCreateWarning("First select the company name.");
      return;
    }
    setCreateWarning("");
    router.push("/create-application");
  };

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [fabPulse]);

  // Scroll handler for auto-hiding tabs
  const lastScrollY = useRef(0);
  const tabsVisibleRef = useRef(true);
  const tabHeightAnim = useRef(new Animated.Value(54)).current;
  const tabOpacityAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    if (currentY < 0) return; // Ignore iOS bounce

    const diff = currentY - lastScrollY.current;

    if (diff > 8 && currentY > 50) {
      if (tabsVisibleRef.current) {
        tabsVisibleRef.current = false;
        Animated.parallel([
          Animated.timing(tabHeightAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(tabOpacityAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }),
        ]).start();
      }
    } else if (diff < -12 || currentY <= 50) {
      if (!tabsVisibleRef.current) {
        tabsVisibleRef.current = true;
        Animated.parallel([
          Animated.timing(tabHeightAnim, {
            toValue: 54,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(tabOpacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }
    lastScrollY.current = currentY;
  };

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

  const renderMetricCard = ({
    label,
    value,
    icon,
    colors,
    style,
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    colors: { bg: string[]; border: string; value: string };
    style?: any;
  }) => (
    <LinearGradient
      colors={colors.bg as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.metricCard,
        {
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={styles.metricTitle}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={[styles.metricValue, { color: colors.value }]}>
          {value}
        </Text>
        {icon}
      </View>
    </LinearGradient>
  );

  const renderCreateFab = () => {
    const scale = fabPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04],
    });
    const ringScale = fabPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.45],
    });
    const ringOpacity = fabPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.28, 0],
    });

    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.createFabWrap,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.createFabPulse,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
              backgroundColor: theme.colors.primary,
            },
          ]}
        />

        <TouchableOpacity
          onPress={handleApplyPress}
          activeOpacity={0.86}
          style={[
            styles.createFab,
            {
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
          ]}
        >
          <Feather name="plus" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.createFabText}>Create</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSearchFab = (withCreateButton: boolean) => {
    const hasSearch = !!search;
    return (
      <TouchableOpacity
        onPress={() => {
          if (hasSearch) {
            handleSearchChange("");
          } else {
            setSearchOpen(true);
          }
        }}
        activeOpacity={0.86}
        accessibilityLabel={hasSearch ? "Clear search" : "Open search"}
        style={[
          styles.searchFab,
          {
            bottom: withCreateButton ? 82 : 22,
            backgroundColor: theme.dark ? "#111827" : "#FFFFFF",
            borderColor: surfacePalette.controlBorder,
            shadowColor: theme.colors.primary,
          },
        ]}
      >
        {hasSearch ? (
          <Feather name="x" size={24} color="#EF4444" />
        ) : (
          <Feather name="search" size={21} color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSearchPanel = () => {
    const placeholder =
      activeTab === "applications"
        ? "Search by Name or App ID..."
        : "Search tickets...";

    const suggestions =
      activeTab === "applications" ? filteredApps : filteredTickets;
    const showSuggestions = search.trim().length > 0 && suggestions.length > 0;

    return (
      <Modal
        visible={searchOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSearchOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
          style={styles.searchModalRoot}
        >
          <Pressable
            style={styles.searchBackdrop}
            onPress={() => setSearchOpen(false)}
          />

          {/* Search Suggestions Box (Samsung UI Style) */}
          {showSuggestions && (
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 8,
                backgroundColor: theme.dark ? "#1E293B" : "#FFFFFF",
                borderRadius: 18,
                borderWidth: 1,
                borderColor: surfacePalette.controlBorder,
                maxHeight: 240,
                shadowColor: theme.dark ? "#000000" : "#6366F1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: theme.dark ? 0.28 : 0.12,
                shadowRadius: 12,
                elevation: 8,
                overflow: "hidden",
                zIndex: 20,
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {suggestions.slice(0, 10).map((item: any, index: number) => {
                  const id =
                    activeTab === "applications"
                      ? String(item.applicationNumber || item.applicationId)
                      : String(item.ticketId);
                  const name = item.customerName || "Unknown Customer";
                  const isLast = index === Math.min(suggestions.length, 10) - 1;

                  return (
                    <TouchableOpacity
                      key={`${id}-${index}`}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: surfacePalette.divider,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        handleSearchChange(id);
                        setSearchOpen(false);
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: theme.dark
                            ? "rgba(255,255,255,0.05)"
                            : "#F1F5F9",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Feather
                          name={
                            activeTab === "applications"
                              ? "file-text"
                              : "clipboard"
                          }
                          size={16}
                          color={theme.colors.onSurfaceVariant}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: theme.colors.onSurface,
                          }}
                          numberOfLines={1}
                        >
                          {name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: theme.colors.onSurfaceVariant,
                            marginTop: 2,
                          }}
                        >
                          {activeTab === "applications"
                            ? "App No:"
                            : "Ticket ID:"}{" "}
                          {id}
                        </Text>
                      </View>
                      <Feather
                        name="arrow-up-left"
                        size={16}
                        color={theme.colors.onSurfaceVariant}
                        style={{ opacity: 0.5 }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View
            style={[
              styles.searchPanel,
              {
                backgroundColor: theme.dark ? "#111827" : "#FFFFFF",
                borderColor: surfacePalette.controlBorder,
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
              ref={searchInputRef}
              value={search}
              onChangeText={handleSearchChange}
              placeholder={placeholder}
              placeholderTextColor={theme.colors.onSurfaceVariant}
              returnKeyType="search"
              onSubmitEditing={() => setSearchOpen(false)}
              style={styles.searchInput}
            />
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() =>
                search ? handleSearchChange("") : setSearchOpen(false)
              }
              style={[
                styles.searchPanelAction,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(15,23,42,0.06)",
                },
              ]}
            >
              <Feather
                name={search ? "x" : "check"}
                size={18}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  const renderPagination = ({
    value,
    onChangeText,
    onEndEditing,
    rangeLabel,
    onPrev,
    prevDisabled,
    onNext,
    nextDisabled,
  }: {
    value: string;
    onChangeText: (value: string) => void;
    onEndEditing: () => void;
    rangeLabel: string;
    onPrev: () => void;
    prevDisabled: boolean;
    onNext: () => void;
    nextDisabled: boolean;
  }) => (
    <View
      style={[styles.paginationRow, { borderTopColor: surfacePalette.divider }]}
    >
      <View style={styles.rowsControl}>
        <Text style={styles.rowsLabel}>Rows per page</Text>
        <TextInput
          value={value}
          keyboardType="numeric"
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          style={[
            styles.rowsInput,
            {
              borderColor: surfacePalette.controlBorder,
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(15,23,42,0.05)",
              color: theme.colors.onSurface,
            },
          ]}
        />
      </View>

      <View style={styles.pageControl}>
        <Text style={styles.rowsLabel}>{rangeLabel}</Text>

        <TouchableOpacity
          onPress={onPrev}
          disabled={prevDisabled}
          style={[
            styles.pageButton,
            {
              opacity: prevDisabled ? 0.4 : 1,
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(15,23,42,0.05)",
            },
          ]}
        >
          <Feather
            name="chevron-left"
            size={16}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={nextDisabled}
          style={[
            styles.pageButton,
            {
              opacity: nextDisabled ? 0.4 : 1,
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.07)"
                : "rgba(15,23,42,0.05)",
            },
          ]}
        >
          <Feather
            name="chevron-right"
            size={16}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApplicationsTab = () => (
    <>
      <View
        style={{
          marginBottom: SECTION_GAP,
          paddingTop: 14,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
          }}
        >
          {renderMetricCard({
            label: "Total Applications",
            value: totalApplications,
            colors: statColors.applicationsTotal,
            style: { flex: 1 },
            icon: (
              <Feather
                name="file-text"
                size={24}
                color={statColors.applicationsTotal.icon}
                style={styles.metricIcon}
              />
            ),
          })}

          {renderMetricCard({
            label: "Picked Applications",
            value: pickedApplications,
            colors: statColors.applicationsPicked,
            style: { flex: 1 },
            icon: (
              <Feather
                name="check-circle"
                size={24}
                color={statColors.applicationsPicked.icon}
                style={styles.metricIcon}
              />
            ),
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingVertical: 8,
          zIndex: 10,
        }}
      >
        <Text style={styles.cardTitle}>Fresh Applications</Text>
        {!!createWarning && (
          <View
            style={{
              marginBottom: 10,
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.error,
              backgroundColor: theme.dark
                ? "rgba(239,68,68,0.12)"
                : "rgba(239,68,68,0.08)",
            }}
          >
            <Text
              style={{
                color: theme.colors.error,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              {createWarning}
            </Text>
          </View>
        )}
        <Text style={styles.cardSubtitle}>Recent submissions</Text>
      </View>

      <View
        style={[
          styles.contentCard,
          {
            marginTop: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 0,
          },
        ]}
      >
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
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 15,
              paddingVertical: 15,
              marginTop: 0,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F1F5F9",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="folder-open-outline" size={56} color="#94A3B8" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#334155",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 0.3,
              }}
            >
              No applications found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              You do not have any applications yet. Click the create button below
              to get started.
            </Text>
          </View>
        )}

        {renderPagination({
          value: appsRowsPerPageInput,
          onChangeText: setAppsRowsPerPageInput,
          onEndEditing: () => {
            const n = parseInt(appsRowsPerPageInput.trim(), 10);
            if (isNaN(n) || n <= 0)
              setAppsRowsPerPageInput(String(appsRowsPerPage));
          },
          rangeLabel: getRangeLabel(
            appsPage,
            appsRowsPerPage,
            totalApplications,
          ),
          onPrev: handleAppsPrev,
          prevDisabled: appsPage === 1 || appsLoading,
          onNext: handleAppsNext,
          nextDisabled: appsPage === appsTotalPages || appsLoading,
        })}
      </View>
    </>
  );

  const renderTicketsTab = () => (
    <>
      <View style={{ marginBottom: SECTION_GAP, paddingTop: 14 }}>
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
          {renderMetricCard({
            label: "Total Tickets",
            value: totalTickets,
            colors: statColors.ticketsTotal,
            style: styles.ticketMetricCard,
            icon: (
              <Feather
                name="clipboard"
                size={24}
                color={statColors.ticketsTotal.icon}
                style={styles.metricIcon}
              />
            ),
          })}

          {renderMetricCard({
            label: "Credit Review",
            value: ticketsSummary.underCreditReview,
            colors: statColors.ticketsReview,
            style: styles.ticketMetricCard,
            icon: (
              <Feather
                name="clock"
                size={24}
                color={statColors.ticketsReview.icon}
                style={styles.metricIcon}
              />
            ),
          })}

          {renderMetricCard({
            label: "Approved",
            value: ticketsSummary.approved,
            colors: statColors.ticketsApproved,
            style: styles.ticketMetricCard,
            icon: (
              <Feather
                name="check-circle"
                size={24}
                color={statColors.ticketsApproved.icon}
                style={styles.metricIcon}
              />
            ),
          })}

          {renderMetricCard({
            label: "Disbursed",
            value: ticketsSummary.disbursed,
            colors: statColors.ticketsDisbursed,
            style: styles.ticketMetricCard,
            icon: (
              <Feather
                name="credit-card"
                size={24}
                color={statColors.ticketsDisbursed.icon}
                style={styles.metricIcon}
              />
            ),
          })}
        </ScrollView>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.background,
          paddingVertical: 8,
          zIndex: 10,
        }}
      >
        <Text style={styles.cardTitle}>Tickets Overview</Text>
        <Text style={styles.cardSubtitle}>
          Track and manage all loan tickets
        </Text>
      </View>

      <View
        style={[
          styles.contentCard,
          {
            marginTop: 0,
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 0,
          },
        ]}
      >
        {ticketsLoading && renderLoading()}
        {ticketsError && !ticketsData && renderError(refetchTickets)}

        {filteredTickets.map((ticket: any) => {
          const status = ticket.ticketStatus || "No status";
          const statusColor = getStatusColor(status);
          const shouldOpenHistory =
            !!notificationTicketId &&
            String(ticket.ticketId) === String(notificationTicketId);

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
              initiallyOpenHistory={shouldOpenHistory}
            />
          );
        })}

        {!ticketsLoading && !ticketsError && filteredTickets.length === 0 && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 15,
              paddingVertical: 15,
              marginTop: 0,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#F1F5F9",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Ionicons name="folder-open-outline" size={56} color="#94A3B8" />
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#334155",
                marginBottom: 8,
                textAlign: "center",
                letterSpacing: 0.3,
              }}
            >
              No Tickets found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#64748B",
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              You do not have any tickets yet. Click the create button below to
              get started.
            </Text>
          </View>
        )}

        {renderPagination({
          value: ticketsRowsPerPageInput,
          onChangeText: setTicketsRowsPerPageInput,
          onEndEditing: () => {
            const n = parseInt(ticketsRowsPerPageInput.trim(), 10);
            if (isNaN(n) || n <= 0)
              setTicketsRowsPerPageInput(String(ticketsRowsPerPage));
          },
          rangeLabel: getRangeLabel(
            ticketsPage,
            ticketsRowsPerPage,
            totalTickets,
          ),
          onPrev: handleTicketsPrev,
          prevDisabled: ticketsPage === 1 || ticketsLoading,
          onNext: handleTicketsNext,
          nextDisabled: ticketsPage === ticketsTotalPages || ticketsLoading,
        })}
      </View>
    </>
  );

  if (lockedTab) {
    const showCreateButton = lockedTab === "applications";
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{
            paddingBottom: lockedTab === "applications" ? 160 : 100,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {lockedTab === "applications"
            ? renderApplicationsTab()
            : renderTicketsTab()}
        </ScrollView>
        {renderSearchFab(showCreateButton)}
        {showCreateButton ? renderCreateFab() : null}
        {renderSearchPanel()}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={{
          height: tabHeightAnim,
          opacity: tabOpacityAnim,
          overflow: "hidden",
        }}
      >
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "applications" && styles.activeTab,
            ]}
            onPress={() => setTab("applications")}
          >
            <Feather
              name="file-text"
              size={18}
              color={
                activeTab === "applications"
                  ? theme.colors.primary
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
                activeTab === "tickets"
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
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
      </Animated.View>

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
            contentContainerStyle={{
              paddingBottom: 160,
              paddingHorizontal: 16,
            }}
            stickyHeaderIndices={[1]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderApplicationsTab()}
          </ScrollView>
        </View>

        <View key="tickets">
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 100,
              paddingHorizontal: 16,
            }}
            stickyHeaderIndices={[1]}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderTicketsTab()}
          </ScrollView>
        </View>
      </PagerView>
      {renderSearchFab(activeTab === "applications")}
      {activeTab === "applications" ? renderCreateFab() : null}
      {renderSearchPanel()}
    </View>
  );
}
