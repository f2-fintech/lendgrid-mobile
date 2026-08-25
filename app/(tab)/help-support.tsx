import { Feather } from "@expo/vector-icons";
import type { TextStyle, ViewStyle } from "react-native";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";
import { useAppConfig } from "@/contexts/ConfigContext";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CALL_OPTIONS = [
  {
    id: "primary",
    label: "Primary Support",
    number: "+91 8810600135",
    dialNumber: "+918810600135",
    hours: "Mon – Sat, 9:00 AM – 7:00 PM",
    tag: null,
  },
  {
    id: "secondary",
    label: "Alternate Helpline",
    number: "+91 8860600555",
    dialNumber: "+918860600555",
    hours: "Mon – Sat, 9:00 AM – 7:00 PM",
    tag: null,
  },
];

const UPCOMING_FEATURES = [
  {
    id: "chat",
    title: "Live Chat",
    subtitle:
      "Chat with a support agent in real time — no hold music, no wait.",
    icon: "message-circle",
    eta: "Coming Soon",
  },
  {
    id: "ticket",
    title: "Raise a Query",
    subtitle:
      "Submit application, payout, or document issues and track resolution.",
    icon: "edit-3",
    eta: "Coming Soon",
  },
];

const FAQS = [
  {
    q: "How long does loan disbursement take?",
    a: "Disbursement timelines vary by product — personal loans may be same-day, while home loans typically take 7–15 working days after document verification.",
  },
  {
    q: "What documents are generally required?",
    a: "Most lenders need KYC (Aadhaar + PAN), income proof (salary slips or ITR), and bank statements for the last 3–6 months.",
  },
  {
    q: "My application is stuck — what should I do?",
    a: "Call our support helpline with your Application ID handy. Our team will check the status with the lender and give you an update within 24 hours.",
  },
  {
    q: "Can I apply for multiple loan products?",
    a: "Yes, but multiple hard credit enquiries in a short period can affect your CIBIL score. We recommend applying for one product at a time.",
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function CallCard({
  item,
  colors,
}: {
  item: (typeof CALL_OPTIONS)[number];
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const handleCall = () => {
    Linking.openURL(`tel:${item.dialNumber}`);
  };

  return (
    <View
      style={[
        styles.callCard,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View style={styles.callCardLeft}>
        <View
          style={[
            styles.callIconWrap,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Feather name="phone" size={18} color={colors.onPrimaryContainer} />
        </View>
        <View style={styles.callCardBody}>
          <Text style={[styles.callLabel, { color: colors.onSurfaceVariant }]}>
            {item.label}
          </Text>
          <Text style={[styles.callNumber, { color: colors.onSurface }]}>
            {item.number}
          </Text>
          <View style={styles.hoursRow}>
            <Feather
              name="clock"
              size={11}
              color={colors.onSurfaceVariant}
              style={{ marginTop: 1 }}
            />
            <Text
              style={[styles.callHours, { color: colors.onSurfaceVariant }]}
            >
              {item.hours}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={handleCall}
        style={[styles.callBtn, { backgroundColor: colors.primary }]}
      >
        <Feather name="phone-call" size={15} color={colors.onPrimary} />
        <Text style={[styles.callBtnText, { color: colors.onPrimary }]}>
          Call
        </Text>
      </Pressable>
    </View>
  );
}

function UpcomingCard({
  item,
  colors,
}: {
  item: (typeof UPCOMING_FEATURES)[number];
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View
      style={[
        styles.upcomingCard,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View
        style={[
          styles.upcomingIcon,
          { backgroundColor: colors.surfaceVariant },
        ]}
      >
        <Feather
          name={item.icon as any}
          size={20}
          color={colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.upcomingBody}>
        <View style={styles.upcomingTitleRow}>
          <Text style={[styles.upcomingTitle, { color: colors.onSurface }]}>
            {item.title}
          </Text>
          <View
            style={[
              styles.etaBadge,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Text
              style={[styles.etaText, { color: colors.onSecondaryContainer }]}
            >
              {item.eta}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.upcomingSubtitle, { color: colors.onSurfaceVariant }]}
        >
          {item.subtitle}
        </Text>
      </View>
    </View>
  );
}

function FaqItem({
  item,
  isLast,
  colors,
}: {
  item: (typeof FAQS)[number];
  isLast: boolean;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View>
      <View style={styles.faqItem}>
        <Feather
          name="chevron-right"
          size={14}
          color={colors.primary}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <View style={styles.faqBody}>
          <Text style={[styles.faqQ, { color: colors.onSurface }]}>
            {item.q}
          </Text>
          <Text style={[styles.faqA, { color: colors.onSurfaceVariant }]}>
            {item.a}
          </Text>
        </View>
      </View>
      {!isLast && <Divider style={{ marginLeft: 22 }} />}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function HelpSupportScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const { config } = useAppConfig();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Feather
            name="help-circle"
            size={24}
            color={colors.onPrimaryContainer}
          />
        </View>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>
          We're Here to Help
        </Text>
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Help & Support
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Reach our team directly, or explore answers to common questions below.
        </Text>
      </View>

      {/* ── Call Support ── */}
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        📞 Call Us
      </Text>
      <View style={styles.sectionBlock}>
        {CALL_OPTIONS.map((item, i) => (
          <View key={item.id}>
            <CallCard item={item} colors={colors} />
            {i < CALL_OPTIONS.length - 1 && <View style={{ height: 10 }} />}
          </View>
        ))}
      </View>

      {/* ── Availability note ── */}
      <View
        style={[styles.availNote, { backgroundColor: colors.surfaceVariant }]}
      >
        <Feather name="info" size={13} color={colors.onSurfaceVariant} />
        <Text style={[styles.availText, { color: colors.onSurfaceVariant }]}>
          Support lines are active Monday to Saturday, 9 AM – 7 PM IST. Calls
          are not attended on public holidays.
        </Text>
      </View>

      {/* ── Upcoming Features ── */}
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.onSurface, marginTop: 28 },
        ]}
      >
        🚀 More Ways to Reach Us
      </Text>
      <Text style={[styles.sectionNote, { color: colors.onSurfaceVariant }]}>
        These features are under development and will be available soon.
      </Text>
      <View style={styles.sectionBlock}>
        {UPCOMING_FEATURES.map((item) => (
          <UpcomingCard key={item.id} item={item} colors={colors} />
        ))}
      </View>

      {/* ── FAQs — hidden in review mode (contains loan-specific Q&A) ── */}
      {!config.isReviewMode && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.onSurface, marginTop: 28 },
            ]}
          >
            💬 Frequently Asked Questions
          </Text>
          <View
            style={[
              styles.faqBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            {FAQS.map((faq, i) => (
              <FaqItem
                key={faq.q}
                item={faq}
                isLast={i === FAQS.length - 1}
                colors={colors}
              />
            ))}
          </View>
        </>
      )}

      {/* ── Footer note ── */}
      <Text style={[styles.footer, { color: colors.onSurfaceVariant }]}>
        For urgent escalations, please have your Application ID or Reference
        Number ready before calling.
      </Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },

  // Header
  header: { marginBottom: 24 },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eyebrow: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 6 },

  // Section labels
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  sectionNote: { fontSize: 13, marginTop: -6, marginBottom: 12 },
  sectionBlock: { gap: 0 },

  // Call card
  callCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  callCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  callIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  callCardBody: { flex: 1 },
  callLabel: { fontSize: 11, fontWeight: "500", marginBottom: 1 },
  callNumber: { fontSize: 16, fontWeight: "700" },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  callHours: { fontSize: 11 },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginLeft: 10,
  },
  callBtnText: { fontSize: 13, fontWeight: "700" },

  // Availability note
  availNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  availText: { fontSize: 12, lineHeight: 18, flex: 1 },

  // Upcoming card
  upcomingCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
    opacity: 0.72,
  },
  upcomingIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  upcomingBody: { flex: 1 },
  upcomingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 3,
  },
  upcomingTitle: { fontSize: 15, fontWeight: "700" },
  upcomingSubtitle: { fontSize: 13, lineHeight: 19 },
  etaBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  etaText: { fontSize: 10, fontWeight: "700" },

  // FAQ
  faqBox: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  faqItem: {
    flexDirection: "row",
    gap: 8,
    padding: 14,
  },
  faqBody: { flex: 1 },
  faqQ: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  faqA: { fontSize: 13, lineHeight: 19 },

  // Footer
  footer: { fontSize: 12, lineHeight: 18, marginTop: 24, textAlign: "center" },
} satisfies Record<string, ViewStyle | TextStyle>);
