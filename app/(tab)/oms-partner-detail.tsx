import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

import {
  getOmsPartnerApplicationsApi,
  OmsPartnerApplicationItem,
} from "@/apis/modules/OmsAuth.api";
import { fetchTickets, TicketItem } from "@/apis/modules/tickets.api_rest";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#3B82F6",
  processing: "#F59E0B",
  approved: "#22C55E",
  rejected: "#EF4444",
  disbursed: "#8B5CF6",
};

export default function OmsPartnerDetailScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams<{
    aggregatorProfileId: string;
    companyId: string;
    companyName: string;
    kycStatus: string;
  }>();

  const [activeTab, setActiveTab] = useState<"apps" | "tickets">("apps");

  // Fetch applications
  const {
    data: appsData,
    isLoading: isAppsLoading,
    refetch: refetchApps,
  } = useQuery({
    queryKey: ["omsPartnerApps", params.aggregatorProfileId],
    queryFn: () => getOmsPartnerApplicationsApi(params.aggregatorProfileId),
    enabled: !!params.aggregatorProfileId && activeTab === "apps",
  });

  // Fetch tickets
  const {
    data: ticketsData,
    isLoading: isTicketsLoading,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["omsPartnerTickets", params.companyId],
    queryFn: () => fetchTickets({ companyId: params.companyId }),
    enabled: !!params.companyId && activeTab === "tickets",
  });

  const isLoading = activeTab === "apps" ? isAppsLoading : isTicketsLoading;
  const onRefresh = activeTab === "apps" ? refetchApps : refetchTickets;

  const bg = isDark ? "#0D1117" : "#F5F7FF";
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const borderColor = isDark ? "#2D3748" : "#E8EDF5";
  const textColor = isDark ? "#E8EAF0" : "#1A1D2E";
  const labelColor = isDark ? "#8B95A9" : "#6B7280";

  const renderAppCard = ({ item }: { item: OmsPartnerApplicationItem }) => {
    const statusColor = STATUS_COLORS[item.status?.toLowerCase() ?? ""] ?? "#9CA3AF";
    return (
      <View
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ color: textColor, fontWeight: "700", fontSize: 16 }}>
            {item.applicantName || "Unknown Applicant"}
          </Text>
          <View style={{ backgroundColor: `${statusColor}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
              {item.status || "Pending"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <View>
            <Text style={{ color: labelColor, fontSize: 12 }}>Application ID</Text>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>{item.applicationId || "—"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: labelColor, fontSize: 12 }}>Loan Amount</Text>
            <Text style={{ color: "#6366F1", fontSize: 14, fontWeight: "700" }}>
              {item.loanAmount ? `₹${item.loanAmount.toLocaleString("en-IN")}` : "—"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTicketCard = ({ item }: { item: TicketItem }) => {
    const statusColor = STATUS_COLORS[item.ticketStatus?.toLowerCase() ?? ""] ?? "#9CA3AF";
    return (
      <View
        style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ color: textColor, fontWeight: "700", fontSize: 16 }}>
            {item.customerName || "Unknown"}
          </Text>
          <View style={{ backgroundColor: `${statusColor}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: statusColor, fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
              {item.ticketStatus || "Pending"}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
          <View>
            <Text style={{ color: labelColor, fontSize: 12 }}>Ticket ID</Text>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>#{item.ticketId}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: labelColor, fontSize: 12 }}>Provider</Text>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: "600" }}>{item.applicationProvider || "—"}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <LinearGradient
        colors={isDark ? ["#060818", "#0D1117"] : ["#EEF2FF", "#F5F7FF"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
          <Pressable onPress={() => router.back()} style={{ paddingRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
          <Text style={{ color: textColor, fontSize: 20, fontWeight: "800" }}>
            Partner Details
          </Text>
        </View>
        
        <View style={{ backgroundColor: cardBg, padding: 20, borderRadius: 16, borderWidth: 1, borderColor }}>
          <Text style={{ color: textColor, fontSize: 18, fontWeight: "700" }}>
            {params.companyName}
          </Text>
          <View style={{ flexDirection: "row", marginTop: 8, gap: 12 }}>
            <Text style={{ color: labelColor, fontSize: 13 }}>
              ID: {params.companyId}
            </Text>
            <Text style={{ color: labelColor, fontSize: 13 }}>•</Text>
            <Text style={{ color: "#22C55E", fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>
              KYC: {params.kycStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, marginBottom: 16 }}>
        <Pressable
          onPress={() => setActiveTab("apps")}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: activeTab === "apps" ? "#6366F1" : "transparent",
          }}
        >
          <Text style={{ color: activeTab === "apps" ? "#6366F1" : labelColor, fontWeight: "700" }}>
            Applications
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("tickets")}
          style={{
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            borderBottomWidth: 2,
            borderBottomColor: activeTab === "tickets" ? "#6366F1" : "transparent",
          }}
        >
          <Text style={{ color: activeTab === "tickets" ? "#6366F1" : labelColor, fontWeight: "700" }}>
            Tickets
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : activeTab === "apps" ? (
          <FlatList
            data={appsData?.applications || []}
            keyExtractor={(i) => i._id}
            renderItem={renderAppCard}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={{ color: labelColor, textAlign: "center", marginTop: 40 }}>
                No applications found for this partner.
              </Text>
            }
          />
        ) : (
          <FlatList
            data={ticketsData?.data?.results || []}
            keyExtractor={(i) => String(i.ticketId)}
            renderItem={renderTicketCard}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={{ color: labelColor, textAlign: "center", marginTop: 40 }}>
                No tickets found for this partner.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}
