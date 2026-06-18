import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator, Button, useTheme } from "react-native-paper";

import { useMyAggregatorProfile } from "@/hooks/useAggregator";
import { useDealLenders, useMyCommissionRule } from "@/hooks/useCommissions";
import { CustomMedalIcon } from "./CustomMedalIcon";

export const getTierIconFromBadgeLabel = (badgeLabel?: string | null, applicableFor?: string) => {
  if (badgeLabel) {
    const label = badgeLabel.toLowerCase();
    if (label.includes("spark")) return "BRONZE";
    if (label.includes("pulse")) return "SILVER";
    if (label.includes("momentum")) return "GOLD";
    if (label.includes("catalyst")) return "DIAMOND";
    if (label.includes("apex")) return "PLATINUM";
    if (label.includes("vanguard")) return "VANGUARD";
  }

  // Fallback to applicableFor
  if (applicableFor) {
    const tier = applicableFor.toUpperCase();
    if (tier.includes("BRONZE")) return "BRONZE";
    if (tier.includes("SILVER")) return "SILVER";
    if (tier.includes("GOLD")) return "GOLD";
    if (tier.includes("DIAMOND")) return "DIAMOND";
    if (tier.includes("PLATINUM")) return "PLATINUM";
    if (tier.includes("VANGUARD")) return "VANGUARD";
  }

  return "GOLD"; // default fallback
};

export function CommissionRates() {
  const theme = useTheme();
  const isDark = theme.dark;

  // ==================== QUERY HOOKS ====================
  const ruleQuery = useMyCommissionRule();
  const lendersQuery = useDealLenders();
  const profileQuery = useMyAggregatorProfile();

  const activeRule = ruleQuery.data?.data;
  const dealLenders = lendersQuery.data ?? [];
  const profile = profileQuery.data;

  // ==================== TIER COLORS ====================
  const tierColors = useMemo(() => {
    const computedIcon = getTierIconFromBadgeLabel(activeRule?.badgeLabel, activeRule?.applicableFor);
    const tier = activeRule?.icon || computedIcon || activeRule?.applicableFor || "";
    const t = tier.toUpperCase();
    if (t.includes("BRONZE")) {
      return {
        borderColor: "#d97706",
        bgColor: isDark ? "#451a03" : "#fffbeb",
        textColor: isDark ? "#fbbf24" : "#b45309",
        badgeBg: "rgba(217, 119, 6, 0.15)",
      };
    }
    if (t.includes("DIAMOND_GEM")) {
      return {
        borderColor: "#06b6d4",
        bgColor: isDark ? "#083344" : "#ecfeff",
        textColor: isDark ? "#22d3ee" : "#0891b2",
        badgeBg: "rgba(6, 182, 212, 0.15)",
      };
    }
    if (t.includes("SILVER")) {
      return {
        borderColor: "#0d9488",
        bgColor: isDark ? "#115e59" : "#f0fdfa",
        textColor: isDark ? "#2dd4bf" : "#0f766e",
        badgeBg: "rgba(13, 148, 136, 0.15)",
      };
    }
    if (t.includes("GOLD")) {
      return {
        borderColor: "#2563eb",
        bgColor: isDark ? "#172554" : "#eff6ff",
        textColor: isDark ? "#60a5fa" : "#1d4ed8",
        badgeBg: "rgba(37, 99, 235, 0.15)",
      };
    }
    if (t.includes("DIAMOND")) {
      return {
        borderColor: "#10b981",
        bgColor: isDark ? "#064e3b" : "#ecfdf5",
        textColor: isDark ? "#34d399" : "#047857",
        badgeBg: "rgba(16, 185, 129, 0.15)",
      };
    }
    if (t.includes("PLATINUM")) {
      return {
        borderColor: "#a855f7",
        bgColor: isDark ? "#3b0764" : "#faf5ff",
        textColor: isDark ? "#c084fc" : "#7e22ce",
        badgeBg: "rgba(168, 85, 247, 0.15)",
      };
    }
    if (t.includes("VANGUARD")) {
      return {
        borderColor: "#f43f5e",
        bgColor: isDark ? "#4c0519" : "#fff1f2",
        textColor: isDark ? "#fda4af" : "#e11d48",
        badgeBg: "rgba(244, 63, 94, 0.15)",
      };
    }
    return {
      borderColor: "#3b82f6",
      bgColor: isDark ? "#172554" : "#eff6ff",
      textColor: isDark ? "#60a5fa" : "#1d4ed8",
      badgeBg: "rgba(59, 130, 246, 0.15)",
    };
  }, [activeRule, isDark]);

  // ==================== FORMATTERS ====================
  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const getTierLabel = (tier: string) => {
    const clean = tier.replace(/_/g, " ").toLowerCase();
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // ==================== REFRESH/RETRY ====================
  const handleRetry = () => {
    ruleQuery.refetch();
    lendersQuery.refetch();
    profileQuery.refetch();
  };

  // ==================== RENDER LOADING ====================
  if (ruleQuery.isLoading || lendersQuery.isLoading || profileQuery.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
          Loading your commission structure...
        </Text>
      </View>
    );
  }

  // ==================== RENDER ERROR ====================
  if (ruleQuery.isError || lendersQuery.isError) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={48} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Failed to load commission rates.
        </Text>
        <Button mode="contained" onPress={handleRetry} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  // ==================== RENDER NO RULE FOUND ====================
  if (!activeRule) {
    return (
      <View style={styles.noRuleContainer}>
        <View
          style={[
            styles.alertCircleBg,
            { backgroundColor: "rgba(245, 158, 11, 0.15)" },
          ]}
        >
          <Feather name="alert-triangle" size={32} color="#F59E0B" />
        </View>
        <Text style={[styles.noRuleTitle, { color: theme.colors.onSurface }]}>
          No Commission Tier Found
        </Text>
        <Text
          style={[
            styles.noRuleDesc,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          There is no active commission tier structure mapped to your account rank (
          {profile?.rank || "N/A"}). Please contact system administration to
          configure your tier rates.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. HERO PLAN HEADER CARD */}
      <View
        style={[
          styles.heroCard,
          {
            borderColor: tierColors.borderColor,
            backgroundColor: tierColors.bgColor,
          },
        ]}
      >
        <View style={styles.heroHeader}>
          {/* Medal/Diamond Graphic */}
          <View style={styles.medalWrapper}>
            <CustomMedalIcon
              tier={getTierIconFromBadgeLabel(activeRule.badgeLabel, activeRule.applicableFor) || activeRule.icon || activeRule.applicableFor}
              width={65}
              height={80}
            />
          </View>

          {/* Title Info */}
          <View style={styles.heroTitleInfo}>
            <Text style={[styles.heroTitle, { color: theme.colors.onSurface }]}>
              {activeRule.badgeLabel || activeRule.ruleName}
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {activeRule.description ||
                "You are mapped to this rule-based tier rate chart for all automatic payouts."}
            </Text>
          </View>
        </View>

        {/* Badges Row */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
            <Feather name="check" size={12} color="#10B981" />
            <Text style={[styles.badgeText, { color: "#10B981" }]}>Active Plan</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: tierColors.badgeBg }]}>
            <Text style={[styles.badgeText, { color: tierColors.textColor }]}>
              {activeRule.badgeLabel || getTierLabel(getTierIconFromBadgeLabel(activeRule.badgeLabel, activeRule.applicableFor) || activeRule.icon || activeRule.applicableFor)}
            </Text>
          </View>
        </View>

        {/* Base rates details grid */}
        <View style={[styles.grid, { borderColor: theme.colors.outline }]}>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.colors.onSurfaceVariant }]}>
              Base Commission
            </Text>
            <Text style={[styles.gridVal, { color: tierColors.textColor }]}>
              {activeRule.commissionRate}%
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.colors.onSurfaceVariant }]}>
              Applicable Product
            </Text>
            <Text
              style={[
                styles.gridValText,
                { color: theme.colors.onSurface, textTransform: "capitalize" },
              ]}
            >
              {activeRule.productType
                ? activeRule.productType.replace(/_/g, " ").toLowerCase()
                : "All Products"}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.colors.onSurfaceVariant }]}>
              Min Ticket Size
            </Text>
            <Text style={[styles.gridValText, { color: theme.colors.onSurface }]}>
              {formatCurrency(activeRule.minAmount)}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={[styles.gridLabel, { color: theme.colors.onSurfaceVariant }]}>
              Max Ticket Size
            </Text>
            <Text style={[styles.gridValText, { color: theme.colors.onSurface }]}>
              {activeRule.maxAmount
                ? formatCurrency(activeRule.maxAmount)
                : "No Limit"}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. LENDER RATES TABLE */}
      <View style={[styles.tableCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.tableCardHeader}>
          <Text style={[styles.tableCardTitle, { color: theme.colors.onSurface }]}>
            Lender-wise Rates Chart
          </Text>
          <Text
            style={[
              styles.tableCardSubtitle,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Specific percentages resolved per lender for Secured and Unsecured loans.
            Rates default to the tier base percentage if not customized.
          </Text>
        </View>

        {/* Table representation */}
        <View style={[styles.table, { borderColor: theme.colors.outline }]}>
          {/* Header Row */}
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Text style={[styles.th, { color: theme.colors.onSurface, flex: 2 }]}>
              Lender Name
            </Text>
            <Text
              style={[
                styles.th,
                { color: theme.colors.onSurface, flex: 1.5, textAlign: "center" },
              ]}
            >
              Secured (%)
            </Text>
            <Text
              style={[
                styles.th,
                { color: theme.colors.onSurface, flex: 1.5, textAlign: "center" },
              ]}
            >
              Unsecured (%)
            </Text>
          </View>

          {/* Data Rows */}
          {dealLenders.length > 0 ? (
            dealLenders.map((lender) => {
              const matched = activeRule?.lenderCommissions?.find(
                (lc: any) =>
                  lc.lenderName.toLowerCase() === lender.name.toLowerCase(),
              );

              const securedDisplay =
                matched?.securedRate != null
                  ? { val: `${matched.securedRate}%`, isBase: false }
                  : { val: `${activeRule.commissionRate}%`, isBase: true };

              const unsecuredDisplay =
                matched?.unsecuredRate != null
                  ? { val: `${matched.unsecuredRate}%`, isBase: false }
                  : { val: `${activeRule.commissionRate}%`, isBase: true };

              return (
                <View
                  key={lender.id}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: theme.colors.outline },
                  ]}
                >
                  {/* Name & Type Category */}
                  <View style={{ flex: 2, justifyContent: "center" }}>
                    <Text
                      style={[styles.lenderNameText, { color: theme.colors.onSurface }]}
                    >
                      {lender.name}
                    </Text>
                    <Text
                      style={[
                        styles.lenderTypeText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {lender.type}
                    </Text>
                  </View>

                  {/* Secured Rate Badge / Label */}
                  <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                    {securedDisplay.isBase ? (
                      <Text
                        style={[
                          styles.baseRateText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {securedDisplay.val}{" "}
                        <Text style={styles.baseLabel}>(Base)</Text>
                      </Text>
                    ) : (
                      <View style={styles.customSecuredBadge}>
                        <Text style={styles.customSecuredText}>
                          {securedDisplay.val}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Unsecured Rate Badge / Label */}
                  <View style={{ flex: 1.5, alignItems: "center", justifyContent: "center" }}>
                    {unsecuredDisplay.isBase ? (
                      <Text
                        style={[
                          styles.baseRateText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        {unsecuredDisplay.val}{" "}
                        <Text style={styles.baseLabel}>(Base)</Text>
                      </Text>
                    ) : (
                      <View style={styles.customUnsecuredBadge}>
                        <Text style={styles.customUnsecuredText}>
                          {unsecuredDisplay.val}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyTable}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                No lenders configured.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "bold",
  },
  retryButton: {
    marginTop: 16,
  },
  noRuleContainer: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  alertCircleBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  noRuleTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noRuleDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // HERO CARD
  heroCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medalWrapper: {
    width: 65,
    height: 80,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitleInfo: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    marginLeft: 3,
    textTransform: "uppercase",
  },

  // Details Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  gridItem: {
    width: "50%",
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  gridValText: {
    fontSize: 14,
    fontWeight: "bold",
  },

  // TABLE
  tableCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableCardHeader: {
    marginBottom: 16,
  },
  tableCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tableCardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  tableHeader: {
    paddingVertical: 10,
    borderBottomWidth: 1.5,
  },
  th: {
    fontSize: 12,
    fontWeight: "bold",
  },
  lenderNameText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  lenderTypeText: {
    fontSize: 10,
    textTransform: "uppercase",
    marginTop: 2,
    fontWeight: "600",
  },
  baseRateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  baseLabel: {
    fontSize: 9,
    opacity: 0.6,
  },
  customSecuredBadge: {
    backgroundColor: "rgba(20, 184, 166, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(20, 184, 166, 0.25)",
  },
  customSecuredText: {
    color: "#0d9488",
    fontSize: 12,
    fontWeight: "bold",
  },
  customUnsecuredBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.25)",
  },
  customUnsecuredText: {
    color: "#ea580c",
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyTable: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
