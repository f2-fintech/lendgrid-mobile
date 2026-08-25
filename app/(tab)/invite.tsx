import { getReferralCodeApi } from "@/apis/modules/auth.api";
import { FontAwesome } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_BASE_URL?.replace(/\/$/, "") ||
  "https://lendgrid.in";

const NETWORK_ILLUSTRATION =
  "https://cdn.pixabay.com/photo/2020/08/22/11/21/network-5508173_1280.png";
const LogoDark = require("@/assets/images/logo.png");
const LogoLight = require("@/assets/images/logo_blue.png");

// Pulsing ring around the stamp icon
function PulsingRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: "#FFB547",
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

export default function InviteScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const isDark = theme.dark;
  const logoSource = theme.dark ? LogoDark : LogoLight;
  const invitePalette = {
    screenGradient: isDark
      ? (["#060818", "#0B0F2A", "#080D20"] as const)
      : (["#F8FAFF", "#EDF4FF", "#FFFFFF"] as const),
    cardGradient: isDark
      ? (["rgba(255,255,255,0.09)", "rgba(255,255,255,0.03)"] as const)
      : (["rgba(255,255,255,0.96)", "rgba(239,246,255,0.84)"] as const),
    softCardGradient: isDark
      ? (["rgba(255,255,255,0.07)", "rgba(255,255,255,0.02)"] as const)
      : (["rgba(255,255,255,0.98)", "rgba(241,245,249,0.9)"] as const),
    logoGlass: isDark
      ? (["rgba(255,255,255,0.1)", "rgba(255,255,255,0.04)"] as const)
      : (["rgba(255,255,255,0.98)", "rgba(232,240,255,0.92)"] as const),
    floatGradient: isDark
      ? (["#1A2A4A", "#0D1826"] as const)
      : (["#FFFFFF", "#EAF1FF"] as const),
    codeBoxGradient: isDark
      ? (["rgba(255,215,0,0.07)", "rgba(255,215,0,0.02)"] as const)
      : (["rgba(255,215,0,0.17)", "rgba(255,215,0,0.05)"] as const),
    cardBorder: isDark ? "rgba(255,255,255,0.1)" : colors.outlineVariant,
    text: colors.onSurface,
    mutedText: colors.onSurfaceVariant,
    faintText: isDark ? "rgba(255,255,255,0.45)" : "rgba(51,65,85,0.65)",
    divider: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.12)",
    grid: isDark ? "rgba(50,56,243,0.07)" : "rgba(50,56,243,0.08)",
    footerText: isDark ? "rgba(255,255,255,0.22)" : "rgba(51,65,85,0.45)",
    brandGlowTop: isDark ? "rgba(50,56,243,0.18)" : "rgba(50,56,243,0.1)",
    brandGlowBottom: isDark ? "rgba(50,56,243,0.1)" : "rgba(50,56,243,0.07)",
    accentGlow: isDark ? "rgba(255,215,0,0.06)" : "rgba(255,215,0,0.1)",
  };

  const { data, isError, isLoading } = useQuery({
    queryKey: ["referralCode"],
    queryFn: getReferralCodeApi,
  });
  const inviteCode = data?.referralCode?.trim() || "";
  const canShareInvite = Boolean(inviteCode) && !isLoading && !isError;

  const appSignupLink = canShareInvite
    ? `${WEB_BASE_URL}/signup?ref=${encodeURIComponent(inviteCode)}&c_name=${encodeURIComponent(data?.companyName || "")}&source=mobile`
    : "";
  const onboardingLink = appSignupLink;

  const [copied, setCopied] = useState(false);

  // Entry animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const codeCardAnim = useRef(new Animated.Value(0)).current;
  const stepsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.spring(heroAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(codeCardAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(stepsAnim, {
        toValue: 1,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const makeAnimStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [28, 0],
        }),
      },
    ],
  });

  const inviteMessage = `Hey! Interested in becoming a loan agent? Join the LendGrid Agent Network today.\n\nRegister using this onboarding link:\n${onboardingLink}\n\nReferral code: ${inviteCode}`;

  const shareOnWhatsApp = () => {
    if (!canShareInvite) return;
    const text = encodeURIComponent(inviteMessage);
    Linking.openURL(`whatsapp://send?text=${text}`).catch(() => {
      Linking.openURL(`https://wa.me/?text=${text}`).catch(() => {});
    });
  };

  const copyInviteCode = async () => {
    if (!canShareInvite) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Step items
  const steps = [
    {
      icon: "send",
      label: "Share the code",
      desc: "Send via WhatsApp or copy it",
    },
    {
      icon: "user-plus",
      label: "Agent signs up",
      desc: "They register using your invite",
    },
    {
      icon: "star",
      label: "Earn together",
      desc: "Grow your network & commissions",
    },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Deep navy base gradient */}
      <LinearGradient
        colors={invitePalette.screenGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Brand blue radial glow top-right */}
      <View
        style={[
          styles.glowBrandTopRight,
          { backgroundColor: invitePalette.brandGlowTop },
        ]}
        pointerEvents="none"
      />
      {/* Soft brand glow bottom-left */}
      <View
        style={[
          styles.glowBrandBottomLeft,
          { backgroundColor: invitePalette.brandGlowBottom },
        ]}
        pointerEvents="none"
      />
      {/* Accent glow mid-right */}
      <View
        style={[
          styles.glowAccentMid,
          { backgroundColor: invitePalette.accentGlow },
        ]}
        pointerEvents="none"
      />
      {/* Subtle grid lines overlay */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={`h${i}`}
            style={[
              styles.gridLineH,
              {
                top: `${i * 11}%` as any,
                backgroundColor: invitePalette.grid,
              },
            ]}
          />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <View
            key={`v${i}`}
            style={[
              styles.gridLineV,
              {
                left: `${i * 17}%` as any,
                backgroundColor: invitePalette.grid,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO CARD ── */}
        <Animated.View
          style={[
            styles.heroCard,
            { borderColor: invitePalette.cardBorder },
            makeAnimStyle(heroAnim),
          ]}
        >
          {/* Glass surface */}
          <LinearGradient
            colors={invitePalette.cardGradient}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Accent top border */}
          <View style={styles.heroTopAccent} />

          {/* Logo lockup */}
          <View
            style={[
              styles.logoLockup,
              {
                borderColor: isDark
                  ? "rgba(50,56,243,0.3)"
                  : "rgba(50,56,243,0.18)",
              },
            ]}
          >
            <LinearGradient
              colors={invitePalette.logoGlass}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.logoBorderAccent} />
            <Image
              source={logoSource}
              style={styles.logoImg}
              contentFit="contain"
            />
            <View
              style={[
                styles.logoDivider,
                { backgroundColor: invitePalette.divider },
              ]}
            />
            <View style={styles.logoTextGroup}>
              <Text style={styles.logoWordmark}>
                <Text style={styles.logoWordmarkLend}>Lend</Text>
                <Text style={styles.logoWordmarkGrid}>Grid</Text>
              </Text>
              <Text
                style={[styles.logoTagline, { color: invitePalette.faintText }]}
              >
                Agent Network
              </Text>
            </View>
          </View>

          {/* Live badge */}
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>AGENT INVITE</Text>
          </View>

          {/* Hero copy */}
          <View style={styles.heroBody}>
            <Text style={styles.heroEyebrow}>Partner Invitation</Text>
            <Text style={[styles.heroTitle, { color: invitePalette.text }]}>
              Expand your{"\n"}network.
            </Text>
            <Text style={[styles.heroSub, { color: invitePalette.mutedText }]}>
              Send this exclusive invite to a trusted agent and earn together on
              the LendGrid platform.
            </Text>
          </View>

          {/* Decorative floating card */}
          <View style={styles.networkImageCard}>
            <LinearGradient
              colors={invitePalette.floatGradient}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Image
              source={{ uri: NETWORK_ILLUSTRATION }}
              style={styles.networkImage}
              contentFit="contain"
            />
            <View style={styles.networkStamp}>
              <View style={styles.floatIconWrap}>
                <PulsingRing />
                <FontAwesome name="paper-plane" size={16} color="#FFB547" />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── CODE CARD ── */}
        <Animated.View
          style={[
            styles.codeCard,
            { borderColor: invitePalette.cardBorder },
            makeAnimStyle(codeCardAnim),
          ]}
        >
          <LinearGradient
            colors={invitePalette.softCardGradient}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.codeTopAccent} />

          <View style={styles.codeHeader}>
            <View style={styles.codeIconWrap}>
              <LinearGradient
                colors={["#FFB547", "#E6932E"]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <FontAwesome name="ticket" size={18} color="#0D1826" />
            </View>
            <View>
              <Text
                style={[
                  styles.codeLabelSmall,
                  { color: invitePalette.faintText },
                ]}
              >
                YOUR INVITE CODE
              </Text>
              <Text
                style={[styles.codeStatusText, { color: invitePalette.text }]}
              >
                {isLoading
                  ? "Loading referral"
                  : canShareInvite
                    ? "Ready to share"
                    : "Referral unavailable"}
              </Text>
            </View>
          </View>

          {/* Code display box */}
          <View style={styles.codeBox}>
            <LinearGradient
              colors={invitePalette.codeBoxGradient}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.codeBoxBorder} />
            <Text
              style={[styles.codeText, !canShareInvite && { opacity: 0.5 }]}
              selectable
            >
              {isLoading
                ? "Loading..."
                : isError
                  ? "Unable to load"
                  : inviteCode || "No referral code"}
            </Text>
            <Pressable
              onPress={copyInviteCode}
              style={({ pressed }) => [
                styles.copyBtn,
                !canShareInvite && { opacity: 0.45 },
                pressed && { opacity: 0.75 },
              ]}
            >
              <LinearGradient
                colors={
                  copied ? ["#22C55E", "#16A34A"] : ["#FFB547", "#E6932E"]
                }
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <FontAwesome
                name={copied ? "check" : "copy"}
                size={16}
                color="#0D1826"
              />
            </Pressable>
          </View>
          {copied && (
            <Text style={styles.copiedHint}>✓ Copied to clipboard</Text>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: invitePalette.divider },
              ]}
            />
            <Text
              style={[styles.dividerText, { color: invitePalette.faintText }]}
            >
              or share directly
            </Text>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: invitePalette.divider },
              ]}
            />
          </View>

          {/* WhatsApp CTA */}
          <Pressable
            onPress={shareOnWhatsApp}
            style={({ pressed }) => [
              styles.whatsappBtn,
              !canShareInvite && { opacity: 0.55 },
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={["#25D366", "#1DA851"]}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.whatsappIconWrap}>
              <FontAwesome name="whatsapp" size={22} color="#ffffff" />
            </View>
            <Text style={styles.whatsappText}>Share via WhatsApp</Text>
            <FontAwesome
              name="chevron-right"
              size={12}
              color="rgba(255,255,255,0.7)"
            />
          </Pressable>
        </Animated.View>

        {/* ── HOW IT WORKS ── */}
        <Animated.View
          style={[
            styles.stepsCard,
            { borderColor: invitePalette.cardBorder },
            makeAnimStyle(stepsAnim),
          ]}
        >
          <LinearGradient
            colors={invitePalette.softCardGradient}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={[styles.stepsTitle, { color: invitePalette.text }]}>
            How it works
          </Text>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{i + 1}</Text>
                </View>
                {i < steps.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconWrap}>
                  <FontAwesome
                    name={step.icon as any}
                    size={14}
                    color="#FFB547"
                  />
                </View>
                <View style={styles.stepText}>
                  <Text
                    style={[styles.stepLabel, { color: invitePalette.text }]}
                  >
                    {step.label}
                  </Text>
                  <Text
                    style={[
                      styles.stepDesc,
                      { color: invitePalette.mutedText },
                    ]}
                  >
                    {step.desc}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Footer note */}
        <Text style={[styles.footerNote, { color: invitePalette.footerText }]}>
          Invite codes are personal and non-transferable.{"\n"}LendGrid © 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const CARD_RADIUS = 18;
const ACCENT = "#FFB547";
const ACCENT_DIM = "rgba(255,181,71,0.18)";
const BRAND = "#6366F1";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111113",
  },
  glowBrandTopRight: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(50,56,243,0.18)",
  },
  glowBrandBottomLeft: {
    position: "absolute",
    bottom: 60,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,215,0,0.06)",
  },
  glowAccentMid: {
    position: "absolute",
    top: "40%",
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(50,56,243,0.1)",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(50,56,243,0.07)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(50,56,243,0.07)",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingTop: 44,
    paddingBottom: 120,
    gap: 10,
  },

  // ── HERO
  heroCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    minHeight: 280,
    padding: 16,
  },
  heroTopAccent: {
    position: "absolute",
    top: 0,
    left: 30,
    right: 30,
    height: 2,
    borderRadius: 99,
    backgroundColor: ACCENT,
    opacity: 0.8,
  },
  logoLockup: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  logoBorderAccent: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: "rgba(50,56,243,0.5)",
    borderRadius: 99,
  },
  logoImg: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  logoDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 99,
  },
  logoTextGroup: {
    gap: 0,
  },
  logoWordmark: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
  },
  logoWordmarkLend: {
    color: BRAND,
  },
  logoWordmarkGrid: {
    color: BRAND,
  },
  logoTagline: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  liveBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: "rgba(50,56,243,0.3)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ACCENT,
  },
  liveBadgeText: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  heroBody: {
    marginTop: "auto" as any,
    paddingTop: 48,
  },
  heroEyebrow: {
    color: "rgba(255,215,0,0.8)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: 240,
  },
  networkImageCard: {
    position: "absolute",
    right: -6,
    top: 72,
    width: 132,
    height: 112,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    overflow: "hidden",
    transform: [{ rotate: "8deg" }],
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  networkImage: {
    width: "100%",
    height: "100%",
  },
  networkStamp: {
    position: "absolute",
    right: 8,
    bottom: 8,
  },
  floatIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── CODE CARD
  codeCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    padding: 14,
  },
  codeTopAccent: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1.5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  codeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  codeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  codeLabelSmall: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
  },
  codeStatusText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 1,
  },
  codeBox: {
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    marginBottom: 4,
  },
  codeBoxBorder: {
    position: "absolute",
    inset: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.22)",
  },
  codeText: {
    flex: 1,
    color: ACCENT,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  copyBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  copiedHint: {
    color: "#22C55E",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    marginTop: 3,
    marginBottom: 4,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  whatsappBtn: {
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
  },
  whatsappIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappText: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },

  // ── STEPS
  stepsCard: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    padding: 14,
  },
  stepsTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 2,
  },
  stepLeft: {
    alignItems: "center",
    width: 24,
  },
  stepNumWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: ACCENT,
    fontSize: 10,
    fontWeight: "900",
  },
  stepLine: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(255,215,0,0.12)",
    marginVertical: 3,
    minHeight: 12,
  },
  stepContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingBottom: 12,
  },
  stepIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -1,
  },
  stepText: {
    flex: 1,
  },
  stepLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 1,
  },
  stepDesc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    lineHeight: 15,
  },

  // ── FOOTER
  footerNote: {
    color: "rgba(255,255,255,0.22)",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 15,
    marginTop: 2,
  },
});
