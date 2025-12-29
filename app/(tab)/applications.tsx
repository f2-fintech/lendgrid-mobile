import { commissionsStyles } from "@/styles/components/applications/applicationsstyles";
import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, useTheme } from "react-native-paper";

import { useCustomerApplications } from "@/hooks/use-customer-applications_rest";
import { useTickets } from "@/hooks/use-tickets_rest";

// 🔗 CHANGE THIS to your actual web/apply URL
const APPLY_URL = "https://admin-f2fintech.netlify.app/login";

export default function ApplicationsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => commissionsStyles(theme), [theme]);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"applications" | "tickets">(
    "applications"
  );

  // ✅ PAGE STATES
  const [appsPage, setAppsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);

  // ----------------- API HOOKS -----------------
  const appsQuery = useCustomerApplications({
    page: appsPage,
    limit: 10,
    search: search || undefined,
    enabled: activeTab === "applications",
  });

  const ticketsQuery = useTickets({
    page: ticketsPage,
    limit: 10,
    search: search || undefined,
    enabled: activeTab === "tickets",
  });

  const {
    data: appsData,
    isLoading: appsLoading,
    isError: appsError,
    refetch: refetchApps,
  } = appsQuery;

  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    isError: ticketsError,
    refetch: refetchTickets,
  } = ticketsQuery;

  // ------------- DERIVED DATA ----------------
  const applications = appsData?.results ?? [];
  const tickets = ticketsData?.results ?? [];

  const totalApplications = appsData?.count ?? 0;
  const totalTickets = ticketsData?.count ?? 0;

  // If backend sends `pages`, use it; otherwise derive from count/limit=10
  const appsTotalPages =
    appsData?.pages ?? Math.max(1, Math.ceil((appsData?.count ?? 0) / 10));

  const ticketsTotalPages =
    ticketsData?.pages ??
    Math.max(1, Math.ceil((ticketsData?.count ?? 0) / 10));

  // ✅ Picked Applications = Total Tickets (as you requested)
  const pickedApplications = totalTickets;

  // ✅ STATUS-WISE SUMMARY FOR TICKETS
  const ticketsSummary = useMemo(() => {
    const summary = {
      underCreditReview: 0,
      approved: 0,
      disbursed: 0,
    };

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
    switch (status.toLowerCase()) {
      case "approved":
      case "disbursed":
        return "#10B981";
      case "pending":
      case "under credit review":
      case "in-progress":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      case "applied":
        return theme.colors.primary;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const filteredApps = applications.filter((a: any) => {
    const q = search.toLowerCase();
    return (
      a.customerName?.toLowerCase().includes(q) ||
      String(a.applicationNumber ?? a.applicationId)
        .toLowerCase()
        .includes(q)
    );
  });

  const filteredTickets = tickets.filter((t: any) => {
    const q = search.toLowerCase();
    return (
      t.customerName?.toLowerCase().includes(q) ||
      String(t.ticketId).toLowerCase().includes(q)
    );
  });

  // ---------- REUSABLE STATES (LOADING / ERROR) ----------
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

  // 🔗 OPEN WEB FORM FROM APP
  const handleApplyPress = () => {
    Linking.openURL(APPLY_URL).catch((err) => {
      console.warn("Failed to open URL:", err);
    });
  };

  // ✅ PAGINATION HANDLERS
  const handleAppsPrev = () => {
    if (appsPage > 1 && !appsLoading) {
      setAppsPage((p) => p - 1);
    }
  };

  const handleAppsNext = () => {
    if (appsPage < appsTotalPages && !appsLoading) {
      setAppsPage((p) => p + 1);
    }
  };

  const handleTicketsPrev = () => {
    if (ticketsPage > 1 && !ticketsLoading) {
      setTicketsPage((p) => p - 1);
    }
  };

  const handleTicketsNext = () => {
    if (ticketsPage < ticketsTotalPages && !ticketsLoading) {
      setTicketsPage((p) => p + 1);
    }
  };

  // ----------------- APPLICATIONS TAB -----------------
  const renderApplicationsTab = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Summary Cards - Sliding */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsScrollContainer}
        style={styles.metricsScrollView}
      >
        {/* Total Applications */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Total Applications</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{totalApplications}</Text>
            <Feather
              name="file-text"
              size={24}
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
          </View>
        </View>

        {/* Picked Applications = Total Tickets */}
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Picked Applications</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{pickedApplications}</Text>
            <Feather
              name="check-circle"
              size={24}
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
          </View>
        </View>
      </ScrollView>

      {/* Search Box */}
      <View style={styles.searchContainer}>
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

      {/* Applications List */}
      <View style={styles.contentCard}>
        {/* Header row: Title + Apply button */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={styles.cardTitle}>Applications</Text>

          <TouchableOpacity
            onPress={handleApplyPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            }}
          >
            <Feather
              name="external-link"
              size={14}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.primary,
                fontWeight: "600",
              }}
            >
              Apply
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardSubtitle}>
          Recent submissions and status updates
        </Text>

        {appsLoading && renderLoading()}
        {appsError && !appsData && renderError(refetchApps)}

        {filteredApps.map((app: any) => {
          const status = "Applied";
          const statusColor = getStatusColor(status);

          return (
            <View key={app.applicationId} style={styles.commissionItem}>
              <View style={styles.commissionHeader}>
                <View>
                  <Text style={styles.applicationId}>
                    {String(app.applicationNumber || app.applicationId)}
                  </Text>
                  <Text style={styles.lenderName}>
                    {app.customerName} • {app.loanType}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + "22" },
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

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lender</Text>
                <Text style={styles.detailValue}>
                  {app.applicationProvider}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Amount</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(app.applicationAmount)}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  Submitted: {formatDate(app.applicationDate)}
                </Text>
              </View>
            </View>
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

        {/* Pagination Controls - Applications */}
        {appsTotalPages > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleAppsPrev}
              disabled={appsPage === 1 || appsLoading}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                opacity: appsPage === 1 || appsLoading ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.onSurface,
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 13,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Page {appsPage} of {appsTotalPages}
            </Text>

            <TouchableOpacity
              onPress={handleAppsNext}
              disabled={appsPage === appsTotalPages || appsLoading}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                opacity: appsPage === appsTotalPages || appsLoading ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.onSurface,
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  // ----------------- TICKETS TAB -----------------
  const renderTicketsTab = () => (
    <View style={{ paddingHorizontal: 16 }}>
      {/* Summary Cards - Sliding */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsScrollContainer}
        style={styles.metricsScrollView}
      >
        <View style={styles.ticketMetricCard}>
          <Text style={styles.metricTitle}>Total Tickets</Text>
          <View style={styles.metricValueRow}>
            <Text style={styles.metricValue}>{totalTickets}</Text>
            <Feather
              name="clipboard"
              size={24}
              color={theme.colors.primary}
              style={styles.metricIcon}
            />
          </View>
          <Text style={[styles.metricChange, { color: "#10B981" }]}>
            +12% from last month
          </Text>
        </View>

        <View style={styles.ticketMetricCard}>
          <Text style={styles.metricTitle}>Under Credit Review</Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: "#F59E0B" }]}>
              {ticketsSummary.underCreditReview}
            </Text>
            <Feather
              name="clock"
              size={24}
              color="#F59E0B"
              style={styles.metricIcon}
            />
          </View>
          <Text style={[styles.metricChange, { color: "#10B981" }]}>
            +5% from last month
          </Text>
        </View>

        <View style={styles.ticketMetricCard}>
          <Text style={styles.metricTitle}>Approved</Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: "#10B981" }]}>
              {ticketsSummary.approved}
            </Text>
            <Feather
              name="check-circle"
              size={24}
              color="#10B981"
              style={styles.metricIcon}
            />
          </View>
          <Text style={[styles.metricChange, { color: "#10B981" }]}>
            +18% from last month
          </Text>
        </View>

        <View style={styles.ticketMetricCard}>
          <Text style={styles.metricTitle}>Disbursed</Text>
          <View style={styles.metricValueRow}>
            <Text style={[styles.metricValue, { color: "#8B5CF6" }]}>
              {ticketsSummary.disbursed}
            </Text>
            <Feather
              name="dollar-sign"
              size={24}
              color="#8B5CF6"
              style={styles.metricIcon}
            />
          </View>
          <Text style={[styles.metricChange, { color: "#10B981" }]}>
            +22% from last month
          </Text>
        </View>
      </ScrollView>

      {/* Search Box */}
      <View style={styles.searchContainer}>
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

      {/* Tickets List */}
      <View style={styles.contentCard}>
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
            <View key={ticket.ticketId} style={styles.commissionItem}>
              <View style={styles.commissionHeader}>
                <View>
                  <Text style={styles.applicationId}>
                    {String(ticket.ticketId)}
                  </Text>
                  <Text style={styles.lenderName}>{ticket.customerName}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + "22" },
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

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lender</Text>
                <Text style={styles.detailValue}>
                  {ticket.applicationProvider}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Amount</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(ticket.applicationAmount)}
                </Text>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateText}>
                  Created: {formatDate(ticket.created_at || ticket.createdAt)}
                </Text>
              </View>
            </View>
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

        {/* Pagination Controls - Tickets */}
        {ticketsTotalPages > 1 && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleTicketsPrev}
              disabled={ticketsPage === 1 || ticketsLoading}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                opacity: ticketsPage === 1 || ticketsLoading ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.onSurface,
                }}
              >
                Previous
              </Text>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 13,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Page {ticketsPage} of {ticketsTotalPages}
            </Text>

            <TouchableOpacity
              onPress={handleTicketsNext}
              disabled={ticketsPage === ticketsTotalPages || ticketsLoading}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                opacity:
                  ticketsPage === ticketsTotalPages || ticketsLoading ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.onSurface,
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  // ----------------- MAIN RENDER -----------------
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "applications" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("applications")}
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
            onPress={() => setActiveTab("tickets")}
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

        {activeTab === "applications"
          ? renderApplicationsTab()
          : renderTicketsTab()}
      </ScrollView>
    </View>
  );
}
