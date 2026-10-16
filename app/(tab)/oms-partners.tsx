import { getOmsPartnersApi, getOmsReferralCodeApi, OmsPartnerItem } from "@/apis/modules/OmsAuth.api";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

const KYC_STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  approved: { color: "#22C55E", icon: "checkmark-circle", label: "KYC Approved" },
  pending: { color: "#F59E0B", icon: "time", label: "KYC Pending" },
  rejected: { color: "#EF4444", icon: "close-circle", label: "KYC Rejected" },
  under_review: { color: "#3B82F6", icon: "eye", label: "Under Review" },
};

function PartnerCard({ partner, isDark, router }: { partner: OmsPartnerItem; isDark: boolean; router: any }) {
  const kycConfig = KYC_STATUS_CONFIG[partner.kycStatus?.toLowerCase() ?? "pending"] ?? KYC_STATUS_CONFIG.pending;
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const borderColor = isDark ? "#2D3748" : "#E8EDF5";
  const labelColor = isDark ? "#8B95A9" : "#6B7280";
  const textColor = isDark ? "#E8EAF0" : "#1A1D2E";

  const initial = (partner.companyName || "?").charAt(0).toUpperCase();

  const joinedDate = partner.createdAt
    ? new Date(partner.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/(tab)/oms-partner-detail",
          params: {
            aggregatorProfileId: partner._id,
            companyId: partner.companyId,
            companyName: partner.companyName,
            kycStatus: partner.kycStatus
          }
        });
      }}
      style={({ pressed }) => [
        {
          backgroundColor: cardBg,
          borderRadius: 18,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
      ]}
    >
      {/* Top Row */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        {/* Avatar */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: isDark ? "#1C2D50" : "#EEF2FF",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Text style={{ color: "#6366F1", fontSize: 18, fontWeight: "800" }}>{initial}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: textColor, fontSize: 15, fontWeight: "700" }} numberOfLines={1}>
            {partner.companyName}
          </Text>
          {partner.companyId ? (
            <Text style={{ color: labelColor, fontSize: 12, marginTop: 1 }}>
              ID: {partner.companyId}
            </Text>
          ) : null}
        </View>

        {/* KYC Badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${kycConfig.color}18`,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            gap: 4,
          }}
        >
          <Ionicons name={kycConfig.icon} size={12} color={kycConfig.color} />
          <Text style={{ color: kycConfig.color, fontSize: 11, fontWeight: "600" }}>
            {kycConfig.label}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: isDark ? "#0D1117" : "#F8FAFF",
          borderRadius: 12,
          padding: 12,
          gap: 0,
        }}
      >
        <StatItem label="Applications" value={String(partner.totalApplicationsSubmitted ?? 0)} color="#6366F1" />
        <Divider isDark={isDark} />
        <StatItem label="Approved" value={String(partner.totalApplicationsApproved ?? 0)} color="#22C55E" />
        <Divider isDark={isDark} />
        <StatItem
          label="Disbursed"
          value={
            partner.totalDisbursedAmount
              ? `₹${(partner.totalDisbursedAmount / 100000).toFixed(1)}L`
              : "₹0"
          }
          color="#F59E0B"
        />
      </View>

      {/* Joined Date */}
      <Text style={{ color: labelColor, fontSize: 11, marginTop: 10, textAlign: "right" }}>
        Joined {joinedDate}
      </Text>
    </Pressable>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color, fontSize: 16, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Divider({ isDark }: { isDark: boolean }) {
  return (
    <View
      style={{
        width: 1,
        height: 32,
        backgroundColor: isDark ? "#2D3748" : "#E2E8F0",
        alignSelf: "center",
      }}
    />
  );
}

export default function OmsPartnersScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();

  const [codeCopied, setCodeCopied] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch referral code
  const {
    data: referralData,
    isLoading: isCodeLoading,
  } = useQuery({
    queryKey: ["omsReferralCode"],
    queryFn: getOmsReferralCodeApi,
    retry: 1,
  });

  // Fetch partners
  const {
    data: partnersData,
    isLoading: isPartnersLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["omsPartners"],
    queryFn: getOmsPartnersApi,
    retry: 1,
  });

  useEffect(() => {
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const bg = isDark ? "#0D1117" : "#F5F7FF";
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const borderColor = isDark ? "#2D3748" : "#E8EDF5";
  const textColor = isDark ? "#E8EAF0" : "#1A1D2E";
  const labelColor = isDark ? "#8B95A9" : "#6B7280";

  const copyCode = async () => {
    if (!referralData?.referralCode) return;
    await Clipboard.setStringAsync(referralData.referralCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2200);
  };

  const shareWhatsApp = () => {
    if (!referralData?.signupLink) return;
    const msg = `Hi! I'd like to onboard you as a Channel Partner on LendGrid.\n\nSign up using my referral link:\n${referralData.signupLink}\n\nReferral Code: ${referralData.referralCode}`;
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(msg)}`).catch(() => {})
    );
  };

  const openAddPartner = async () => {
    console.log("---- openAddPartner CLICKED ----");
    console.log("Referral Data:", referralData);
    
    if (!referralData?.referralCode) {
      alert("Referral Code is not ready yet. Please wait.");
      return;
    }
    
    console.log("Attempting to route to /(tab)/oms-add-partner with code:", referralData.referralCode);
    
    try {
      router.push({
        pathname: "/(tab)/oms-add-partner",
        params: { referralCode: referralData.referralCode },
      });
      console.log("router.push executed successfully");
    } catch (error) {
      console.error("Router push failed:", error);
    }
  };

  const partners = partnersData?.partners ?? [];
  const totalCount = partnersData?.totalCount ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <LinearGradient
        colors={isDark ? ["#060818", "#0D1117"] : ["#EEF2FF", "#F5F7FF"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ── Referral Code Card ── */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={isDark ? ["rgba(99,102,241,0.12)", "transparent"] : ["rgba(99,102,241,0.06)", "transparent"]}
              style={StyleSheet.absoluteFillObject}
            />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: "rgba(99,102,241,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Ionicons name="qr-code-outline" size={18} color="#6366F1" />
              </View>
              <View>
                <Text style={{ color: textColor, fontWeight: "700", fontSize: 15 }}>
                  Your OMS Referral Code
                </Text>
                <Text style={{ color: labelColor, fontSize: 12 }}>
                  Share to onboard Channel Partners
                </Text>
              </View>
            </View>

            {/* Code Box */}
            <Pressable
              onPress={copyCode}
              style={{
                backgroundColor: isDark ? "#0D1117" : "#F0F2FF",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: isDark ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.2)",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <Text style={{ color: "#6366F1", fontSize: 22, fontWeight: "800", letterSpacing: 3 }}>
                {isCodeLoading ? "Loading..." : referralData?.referralCode ?? "—"}
              </Text>
              <Ionicons
                name={codeCopied ? "checkmark-circle" : "copy-outline"}
                size={20}
                color={codeCopied ? "#22C55E" : "#6366F1"}
              />
            </Pressable>

            {/* Action Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={shareWhatsApp}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#22C55E",
                  borderRadius: 12,
                  paddingVertical: 12,
                  gap: 6,
                }}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 13 }}>WhatsApp</Text>
              </Pressable>
              <Pressable
                onPress={copyCode}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDark ? "#1C2333" : "#EEF2FF",
                  borderRadius: 12,
                  paddingVertical: 12,
                  gap: 6,
                  borderWidth: 1,
                  borderColor: "rgba(99,102,241,0.2)",
                }}
              >
                <Ionicons
                  name={codeCopied ? "checkmark" : "copy-outline"}
                  size={16}
                  color="#6366F1"
                />
                <Text style={{ color: "#6366F1", fontWeight: "700", fontSize: 13 }}>
                  {codeCopied ? "Copied!" : "Copy Code"}
                </Text>
              </Pressable>
            </View>

            {/* Add Partner Direct Button */}
            <Pressable
              onPress={openAddPartner}
              style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#6366F1",
                borderRadius: 12,
                paddingVertical: 14,
                gap: 8,
              }}
            >
              <Ionicons name="person-add" size={18} color="#FFF" />
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 14 }}>
                Add Partner Now
              </Text>
            </Pressable>
          </View>

          {/* ── Partners Section Header ── */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: "rgba(99,102,241,0.15)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <Ionicons name="people" size={16} color="#6366F1" />
            </View>
            <Text style={{ color: textColor, fontWeight: "700", fontSize: 16, flex: 1 }}>
              Your Partners
            </Text>
            {!isPartnersLoading && (
              <View
                style={{
                  backgroundColor: "rgba(99,102,241,0.15)",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: "#6366F1", fontWeight: "700", fontSize: 12 }}>
                  {totalCount} Total
                </Text>
              </View>
            )}
          </View>

          {/* ── Partners List ── */}
          {isPartnersLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ionicons name="hourglass-outline" size={32} color={labelColor} />
              <Text style={{ color: labelColor, marginTop: 10 }}>Loading partners...</Text>
            </View>
          ) : partners.length === 0 ? (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 18,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor,
              }}
            >
              <Ionicons name="people-outline" size={48} color={labelColor} />
              <Text style={{ color: textColor, fontWeight: "700", fontSize: 16, marginTop: 12 }}>
                No Partners Yet
              </Text>
              <Text style={{ color: labelColor, fontSize: 13, textAlign: "center", marginTop: 6 }}>
                Share your referral code above to onboard Channel Partners.
              </Text>
            </View>
          ) : (
            partners.map((partner) => (
              <PartnerCard key={partner._id} partner={partner} isDark={isDark} router={router} />
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
