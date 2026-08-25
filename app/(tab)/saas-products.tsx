import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Text, useTheme } from "react-native-paper";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];
type BadgeColor =
  | "blue"
  | "teal"
  | "green"
  | "purple"
  | "amber"
  | "coral"
  | "pink"
  | "gray";

interface Product {
  title: string;
  subtitle: string;
  description: string[];
  icon: FeatherIconName;
  badge: string;
  badgeColor: BadgeColor;
  image: string;
  exploreUrl?: string;
}

const CONTACT_PHONE = "+91 88106 00135";

const PRODUCTIVITY_SUITE: Product[] = [
  {
    title: "Operations Management System",
    subtitle: "Loan lifecycle tracking & approvals",
    description: [
      "Manages full loan lifecycle from submission to disbursement",
      "Real-time tracking & multi-level approval workflows",
      "Compliance reporting and detailed audit trails",
      "Reduces turnaround time across financial operations",
    ],
    icon: "layers",
    badge: "Productivity",
    badgeColor: "blue",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=70",
    exploreUrl: "https://admin-f2fintech.netlify.app",
  },
  {
    title: "Employee Management System",
    subtitle: "Attendance, shifts & leave tracking",
    description: [
      "Centralized attendance, shift scheduling & leave management",
      "Real-time HR dashboards for workforce visibility",
      "Automates routine HR workflows end-to-end",
      "Boosts overall team productivity and transparency",
    ],
    icon: "users",
    badge: "HR",
    badgeColor: "teal",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=70",
    exploreUrl: "https://f2-fintech-hrms.netlify.app",
  },
  {
    title: "Payroll Management System",
    subtitle: "Automate salaries, tax & reimbursements",
    description: [
      "Automates salary computation, bonuses & reimbursements",
      "Statutory deductions and income tax compliance built-in",
      "Accurate, on-time payroll processing every month",
      "Keeps your team audit-ready with zero manual errors",
    ],
    icon: "dollar-sign",
    badge: "Finance",
    badgeColor: "green",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=70",
  },
  {
    title: "Task Management System",
    subtitle: "Assign, track and monitor tasks",
    description: [
      "Assign tasks, set priorities and track deadlines easily",
      "Supports individual and team task management",
      "Status updates and comment threads per task",
      "Clean interface — no clutter, just clarity",
    ],
    icon: "check-square",
    badge: "Productivity",
    badgeColor: "purple",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop&q=70",
  },
];

const OTHER_PRODUCTS: Product[] = [
  {
    title: "Progressive Dialer",
    subtitle: "Smart routing & calling for agents",
    description: [
      "Auto-routes leads to available agents instantly",
      "Minimizes idle time and maximizes call volume",
      "Tracks call outcomes in real time",
      "Detailed calling analytics for sales managers",
    ],
    icon: "phone-call",
    badge: "Sales",
    badgeColor: "amber",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=70",
  },
  {
    title: "Qora.ai",
    subtitle: "AI marketing content at scale",
    description: [
      "Generates on-brand marketing content at scale",
      "Covers social posts, emails, ad copy & more",
      "Powered by advanced NLP & machine learning",
      "Cuts content creation time significantly",
    ],
    icon: "zap",
    badge: "AI",
    badgeColor: "pink",
    image:
      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&auto=format&fit=crop&q=70",
  },
  {
    title: "AI Tele Caller",
    subtitle: "Human-like AI voice agent 24/7",
    description: [
      "Natural, context-aware voice conversations with customers",
      "Handles inbound queries and outbound follow-ups 24/7",
      "Runs sales calls at scale without human intervention",
      "Escalates complex cases to human agents seamlessly",
    ],
    icon: "cpu",
    badge: "AI",
    badgeColor: "coral",
    image:
      "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&auto=format&fit=crop&q=70",
    exploreUrl: "https://f2f.tellyflow.com",
  },
  {
    title: "Galix.ai",
    subtitle: "All business tools in one AI workspace",
    description: [
      "Unifies all business tools into one AI workspace",
      "Automated reporting and intelligent search built-in",
      "Workflow suggestions powered by AI",
      "Empowers enterprises to work smarter with less overhead",
    ],
    icon: "grid",
    badge: "AI",
    badgeColor: "blue",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=70",
  },
  {
    title: "Learning Management System",
    subtitle: "Structured courses for upskilling",
    description: [
      "Structured course modules with assessments & quizzes",
      "Progress tracking and certification management",
      "Built for financial services and DSA teams",
      "Enables continuous upskilling and compliance training",
    ],
    icon: "book-open",
    badge: "Education",
    badgeColor: "teal",
    image:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop&q=70",
  },
  {
    title: "Applicant Tracking System",
    subtitle: "End-to-end hiring & onboarding",
    description: [
      "Streamlines job postings and candidate tracking",
      "Interview scheduling and offer management in one place",
      "Single dashboard for recruiters and hiring managers",
      "Smooth onboarding flow for new hires",
    ],
    icon: "user-check",
    badge: "Recruiting",
    badgeColor: "gray",
    image:
      "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&auto=format&fit=crop&q=70",
    exploreUrl: "https://f2fintech-ats.netlify.app",
  },
];

// ── Color maps ────────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<BadgeColor, { bg: string; text: string }> = {
  blue: { bg: "#E6F1FB", text: "#0C447C" },
  teal: { bg: "#E1F5EE", text: "#085041" },
  green: { bg: "#EAF3DE", text: "#27500A" },
  purple: { bg: "#EEEDFE", text: "#3C3489" },
  amber: { bg: "#FAEEDA", text: "#633806" },
  coral: { bg: "#FAECE7", text: "#712B13" },
  pink: { bg: "#FBEAF0", text: "#72243E" },
  gray: { bg: "#F1EFE8", text: "#444441" },
};

const ICON_COLORS: Record<BadgeColor, string> = {
  blue: "#185FA5",
  teal: "#0F6E56",
  green: "#3B6D11",
  purple: "#534AB7",
  amber: "#854F0B",
  coral: "#993C1D",
  pink: "#993356",
  gray: "#5F5E5A",
};

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({
  item,
  theme,
  onPress,
}: {
  item: Product;
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}) {
  const badge = BADGE_COLORS[item.badgeColor];
  const iconColor = ICON_COLORS[item.badgeColor];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      {/* Hero image */}
      <Image
        source={{ uri: item.image }}
        style={styles.cardHero}
        resizeMode="cover"
      />

      <View style={styles.cardBody}>
        {/* Title + badge row */}
        <View style={styles.cardTitleRow}>
          <Text
            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {item.badge}
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        <Text
          style={[
            styles.cardSubtitle,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {item.subtitle}
        </Text>

        {/* Divider */}
        <View
          style={[
            styles.cardDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />

        {/* Bullet points */}
        <View style={styles.bulletsContainer}>
          {item.description.map((point, i) => (
            <View key={i} style={styles.bulletRow}>
              <View
                style={[styles.bulletDot, { backgroundColor: iconColor }]}
              />
              <Text
                style={[
                  styles.bulletText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {point}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          {item.exploreUrl ? (
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: badge.bg }]}
              onPress={() => Linking.openURL(item.exploreUrl!)}
              activeOpacity={0.8}
            >
              <Feather name="external-link" size={12} color={iconColor} />
              <Text style={[styles.exploreBtnText, { color: iconColor }]}>
                Explore Product
              </Text>
            </TouchableOpacity>
          ) : (
            <Text
              style={[
                styles.contactHint,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Contact us to know more
            </Text>
          )}
          <View style={styles.seeMoreRow}>
            <Text style={[styles.seeMoreText, { color: theme.colors.primary }]}>
              Details
            </Text>
            <Feather
              name="arrow-right"
              size={11}
              color={theme.colors.primary}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function ProductModal({
  item,
  visible,
  onClose,
  theme,
}: {
  item: Product | null;
  visible: boolean;
  onClose: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  if (!item) return null;
  const badge = BADGE_COLORS[item.badgeColor];
  const iconColor = ICON_COLORS[item.badgeColor];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.colors.surface }]}>
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
          <ScrollView showsVerticalScrollIndicator={false} bounces>
            <Image
              source={{ uri: item.image }}
              style={styles.modalHero}
              resizeMode="cover"
            />
            <View style={styles.modalBody}>
              <View style={styles.modalTitleRow}>
                <View
                  style={[styles.modalIconBox, { backgroundColor: badge.bg }]}
                >
                  <Feather name={item.icon} size={20} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <View
                    style={[
                      styles.modalBadgePill,
                      { backgroundColor: badge.bg },
                    ]}
                  >
                    <Text
                      style={[styles.modalBadgeText, { color: badge.text }]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.bulletBox,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                {item.description.map((point, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bulletRow,
                      i < item.description.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.outlineVariant,
                        paddingBottom: 10,
                        marginBottom: 10,
                      },
                    ]}
                  >
                    <View
                      style={[styles.bulletDot, { backgroundColor: iconColor }]}
                    />
                    <Text
                      style={[
                        styles.bulletText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {point}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.outlineVariant,
                  },
                ]}
                onPress={() =>
                  Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s/g, "")}`)
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.contactIconBox,
                    { backgroundColor: theme.colors.onPrimaryContainer + "22" },
                  ]}
                >
                  <Feather
                    name="phone"
                    size={16}
                    color={theme.colors.onPrimaryContainer}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.contactLabel,
                      { color: theme.colors.onPrimaryContainer },
                    ]}
                  >
                    For enquiries, call us
                  </Text>
                  <Text
                    style={[
                      styles.contactPhone,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {CONTACT_PHONE}
                  </Text>
                </View>
                <Feather
                  name="chevron-right"
                  size={16}
                  color={theme.colors.onPrimaryContainer}
                />
              </TouchableOpacity>

              {item.exploreUrl && (
                <TouchableOpacity
                  style={[
                    styles.exploreModalBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL(item.exploreUrl!)}
                >
                  <Feather name="external-link" size={14} color="#fff" />
                  <Text style={styles.exploreModalBtnText}>
                    Explore Product
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.closeBtn,
                  { borderColor: theme.colors.outlineVariant },
                ]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.closeBtnText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SaasProductsScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text
              style={[styles.screenTitle, { color: theme.colors.onSurface }]}
            >
              SaaS Products
            </Text>
            <Text
              style={[
                styles.screenSub,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              F2 Fintech platform suite
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.callPill,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
            onPress={() =>
              Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s/g, "")}`)
            }
            activeOpacity={0.8}
          >
            <Feather
              name="phone"
              size={13}
              color={theme.colors.onPrimaryContainer}
            />
            <Text
              style={[
                styles.callPillText,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              Call us
            </Text>
          </TouchableOpacity>
        </View>

        {/* Productivity suite */}
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Productivity suite
        </Text>
        {PRODUCTIVITY_SUITE.map((p) => (
          <ProductCard
            key={p.title}
            item={p}
            theme={theme}
            onPress={() => setSelected(p)}
          />
        ))}

        {/* Divider */}
        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: theme.colors.outlineVariant },
          ]}
        />

        {/* Other products */}
        <Text
          style={[
            styles.sectionLabel,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Other products
        </Text>
        {OTHER_PRODUCTS.map((p) => (
          <ProductCard
            key={p.title}
            item={p}
            theme={theme}
            onPress={() => setSelected(p)}
          />
        ))}

        {/* Contact bar */}
        <TouchableOpacity
          style={[
            styles.contactBar,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          onPress={() =>
            Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s/g, "")}`)
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.contactBarIcon,
              { backgroundColor: theme.colors.onPrimaryContainer + "18" },
            ]}
          >
            <Feather
              name="phone-call"
              size={18}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.contactBarLabel,
                { color: theme.colors.onPrimaryContainer },
              ]}
            >
              For enquiries, call us
            </Text>
            <Text
              style={[styles.contactBarPhone, { color: theme.colors.primary }]}
            >
              {CONTACT_PHONE}
            </Text>
          </View>
          <Feather
            name="chevron-right"
            size={18}
            color={theme.colors.onPrimaryContainer}
          />
        </TouchableOpacity>
      </ScrollView>

      <ProductModal
        item={selected}
        visible={!!selected}
        onClose={() => setSelected(null)}
        theme={theme}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 } as ViewStyle,
  content: { paddingTop: 16, paddingBottom: 120 } as ViewStyle,

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 20,
  } as ViewStyle,
  screenTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  } as TextStyle,
  screenSub: { fontSize: 12, marginTop: 2 } as TextStyle,
  callPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  } as ViewStyle,
  callPillText: { fontSize: 13, fontWeight: "600" } as TextStyle,

  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.7,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    marginBottom: 12,
  } as TextStyle,
  sectionDivider: {
    height: 1,
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 24,
  } as ViewStyle,

  // Product card
  card: {
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  } as ViewStyle,
  cardHero: { width: "100%", height: 170 } as ImageStyle,
  cardBody: { padding: 16 } as ViewStyle,
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 6,
  } as ViewStyle,
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    flex: 1,
  } as TextStyle,
  badgePill: {
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexShrink: 0,
    alignSelf: "flex-start",
  } as ViewStyle,
  badgeText: { fontSize: 10, fontWeight: "700" } as TextStyle,
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  } as TextStyle,
  cardDivider: { height: 1, marginBottom: 12 } as ViewStyle,

  // Bullets
  bulletsContainer: { gap: 8, marginBottom: 14 } as ViewStyle,
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  } as ViewStyle,
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  } as ViewStyle,
  bulletText: { fontSize: 12, lineHeight: 18, flex: 1 } as TextStyle,

  // Card footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  } as ViewStyle,
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  } as ViewStyle,
  exploreBtnText: { fontSize: 12, fontWeight: "600" } as TextStyle,
  contactHint: { fontSize: 11 } as TextStyle,
  seeMoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  } as ViewStyle,
  seeMoreText: { fontSize: 12, fontWeight: "600" } as TextStyle,

  // Contact bar
  contactBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 18,
    marginTop: 4,
    borderRadius: 14,
    padding: 14,
  } as ViewStyle,
  contactBarIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  contactBarLabel: { fontSize: 11, marginBottom: 2 } as TextStyle,
  contactBarPhone: { fontSize: 15, fontWeight: "800" } as TextStyle,

  // Modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  } as ViewStyle,
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 16 },
    }),
  } as ViewStyle,
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 2,
  } as ViewStyle,
  modalHero: { width: "100%", height: 200 } as ImageStyle,
  modalBody: { padding: 20, gap: 14 } as ViewStyle,
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  } as ViewStyle,
  modalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } as ViewStyle,
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 6,
  } as TextStyle,
  modalBadgePill: {
    alignSelf: "flex-start",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  } as ViewStyle,
  modalBadgeText: { fontSize: 10, fontWeight: "700" } as TextStyle,
  bulletBox: { borderRadius: 12, borderWidth: 1, padding: 14 } as ViewStyle,
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  } as ViewStyle,
  contactIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  contactLabel: { fontSize: 11, marginBottom: 2 } as TextStyle,
  contactPhone: { fontSize: 15, fontWeight: "800" } as TextStyle,
  exploreModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  } as ViewStyle,
  exploreModalBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  } as TextStyle,
  closeBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  closeBtnText: { fontSize: 14, fontWeight: "600" } as TextStyle,
} satisfies Record<string, ViewStyle | TextStyle | ImageStyle>);
