import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Expanded premium Zepto Card Dimensions
const ZEPTO_CARD_WIDTH = SCREEN_WIDTH * 0.65;
const CAROUSEL_WIDTH = ZEPTO_CARD_WIDTH;
const CAROUSEL_HEIGHT = 150;

// Public brochure files are served from /public/brochures on the web app.
const WEB_BASE_URL =
  process.env.EXPO_PUBLIC_WEB_BASE_URL ?? "https://lendgrid.in";
const BROCHURE_BASE_URL = `${WEB_BASE_URL.replace(/\/$/, "")}/brochures/`;

// ─── TYPES ───────────────────────────────────────────────────────────────────

type LoanFeature = { label: string; value: string };

type LoanProduct = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  interestRate: string;
  maxAmount: string;
  tenure: string;
  processingFee: string;
  tags: string[];
  features: LoanFeature[];
  eligibility: string[];
  brochureFile?: string;
  images: string[];
  type: "unsecured" | "secured" | "professional";
};

// ─── VERIFIED F2 DATASET (MINIMUM 2 IMAGES PER CARD) ─────────────────────────

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "business",
    title: "Business Term Loan",
    subtitle:
      "Secure rapid working capital infusions and term lending setups across 40+ premier lending institutions.",
    icon: "briefcase",
    badge: "Collateral Free",
    interestRate: "Starting 12% p.a.",
    maxAmount: "Up to ₹1 Cr",
    tenure: "Up to 7 years",
    processingFee: "Up to 3% - 4%",
    type: "unsecured",
    tags: ["Unsecured", "MSME", "Proprietorship"],
    features: [
      {
        label: "Lending Group",
        value: "HDFC, Bajaj Finserv, ICICI, IDFC, Tata",
      },
      { label: "Rate Configurations", value: "12% – 22% p.a." },
      {
        label: "Collateral Status",
        value: "No asset security required up to ₹1 Crore",
      },
      { label: "Average Disbursal", value: "2 – 7 Business Days" },
    ],
    eligibility: [
      "Minimum Business Vintage: ≥ 1 to 3 Years",
      "Minimum CIBIL Score: 650+",
      "Annual Business Revenue ≥ ₹50 Lakh",
      "GST Registration certificate required",
    ],
    brochureFile: "business-loan-proposal.pdf",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "personal",
    title: "Personal Loan",
    subtitle:
      "Acquire fast, unsecured capital matching high-tier lifestyles with zero-fee options via preferred portals.",
    icon: "user",
    interestRate: "Starting 9.99% p.a.",
    maxAmount: "Up to ₹1 Cr",
    tenure: "Up to 8 years",
    processingFee: "Up to 2% - 3%",
    type: "unsecured",
    tags: ["Unsecured", "Salaried", "Instant Funds"],
    features: [
      {
        label: "Preferred Lenders",
        value: "HDFC, ICICI, Axis, IDFC First, Tata Capital",
      },
      { label: "HDFC/ICICI Rates", value: "9.99% – 12.50% p.a." },
      {
        label: "Disbursal Speed",
        value: "2 – 5 days standard approval cycles",
      },
    ],
    eligibility: [
      "Age Window criteria: 21 – 60 years",
      "Minimum net monthly paycheck: ₹25,000+",
      "Active employment across Corporate or Government channels",
      "CIBIL Target Score: 685+",
    ],
    brochureFile: "personal-loan-proposal.pdf",
    images: [
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "overdraft",
    title: "Overdraft / Cash Credit Limit",
    subtitle:
      "Optimize corporate cash flow mechanics with high credit lines. Interest charges apply only to drawn volumes.",
    icon: "refresh-cw",
    badge: "Flexible Credit",
    interestRate: "Starting 13.75% p.a.",
    maxAmount: "Up to ₹75 Lakhs",
    tenure: "Flexible Tiers",
    processingFee: "Up to 2% - 3%",
    type: "unsecured",
    tags: ["Working Capital", "CC Limit", "Unsecured"],
    features: [
      {
        label: "Partner Providers",
        value: "Bajaj Finserv, Tata Capital, L&T Finance",
      },
      {
        label: "Interest Mechanics",
        value: "Accrues strictly on utilized volumes",
      },
      { label: "L&T Finance Rate", value: "13.75% – 16.50% range" },
      { label: "Tata Capital Rate", value: "14% – 16% range" },
    ],
    eligibility: [
      "Active business profile with clear banking turnovers",
      "Requires operational cash management transparency",
      "Available for Medical, CA, and general entrepreneurs",
    ],
    brochureFile: "business-loan-proposal.pdf",
    images: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "home",
    title: "Home Loan",
    subtitle:
      "Turn your dream home into reality with low interest rate structures through India's leading banks.",
    icon: "home",
    badge: "Popular",
    interestRate: "Starting 7.35% p.a.",
    maxAmount: "Up to ₹10 Cr",
    tenure: "Up to 36 years",
    processingFee: "Zero if loan > ₹1 Cr",
    type: "secured",
    tags: ["Salaried", "Self-Employed", "Fresh Purchase", "Balance Transfer"],
    features: [
      {
        label: "Partner Lenders",
        value: "SBI, PNB, Baroda, HDFC, ICICI, Axis",
      },
      { label: "Interest Rate Range", value: "7.35% – 9.40% p.a." },
      { label: "Min. EMI Per Lakh", value: "₹1,205 onwards" },
      { label: "Waiver Benefit", value: "0 Processing Fee if loan > ₹1 Crore" },
      { label: "Turnaround Time", value: "10 – 15 Working Days" },
    ],
    eligibility: [
      "Salaried Professionals (Form 16 required)",
      "Self-Employed Proprietors & Partnerships",
      "CIBIL Score Target: 700+",
      "Valid property chain with continuous 13-year clear title",
    ],
    brochureFile: "home-loan-full-proposal.pdf",
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "lap",
    title: "Loan Against Property (LAP)",
    subtitle:
      "Unlock robust long-term funding using residential, commercial, or institutional properties as security.",
    icon: "map-pin",
    interestRate: "Starting 8.10% p.a.",
    maxAmount: "Up to ₹20 Cr",
    tenure: "Up to 25 years",
    processingFee: "Up to 0.75%",
    type: "secured",
    tags: ["Secured Loan", "Residential Asset", "Commercial Asset"],
    features: [
      {
        label: "Asset Lenders",
        value: "HDFC Bank, ICICI Bank, Axis Bank, Bajaj Finserv",
      },
      { label: "HDFC Interest Track", value: "8.10% – 9.75% p.a." },
      {
        label: "Loan to Value (LTV)",
        value: "Scales up to 75% - 80% of asset value",
      },
    ],
    eligibility: [
      "Clear, marketable property title without existing legal disputes",
      "Available for Salaried and Self-Employed profiles",
      "Clean financial records with 12 months bank statements",
    ],
    brochureFile: "loan-against-property.pdf",
    images: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "ca-professional",
    title: "Exclusive CA Professional Loan",
    subtitle:
      "Custom-tailored financial offerings built exclusively for practicing Chartered Accountants to optimize work practices.",
    icon: "file-text",
    badge: "Specialized Rate",
    interestRate: "Starting 13.50% p.a.",
    maxAmount: "Up to ₹50 Lakhs",
    tenure: "Up to 5 years",
    processingFee: "1.50% - 2%",
    type: "professional",
    tags: ["Chartered Accountant", "Professional Loan", "Practice Setup"],
    features: [
      {
        label: "Special Providers",
        value: "Bajaj Finserv, Tata Capital, Aditya Birla",
      },
      {
        label: "Income Verification",
        value: "No heavy upfront financial proof on pre-approved offers",
      },
      { label: "Collateral Rule", value: "100% Unsecured professional setup" },
    ],
    eligibility: [
      "Valid Certificate of Practice (COP) required",
      "Valid, current ICAI membership validation rules apply",
      "Clean KYC documentation + clear 12-month operating statements",
    ],
    brochureFile: "ca-proposal-F2.pdf",
    images: [
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop",
    ],
  },
  {
    id: "doctor-professional",
    title: "Doctor Professional Loan",
    subtitle:
      "Specialized capitalization architectures for healthcare experts, clinical center setup, and high-tier equipment acquisitions.",
    icon: "activity",
    badge: "Medical Elite",
    interestRate: "Starting 8.50% p.a.",
    maxAmount: "Up to ₹5 Cr",
    tenure: "Up to 7 years",
    processingFee: "Up to 1.00%",
    type: "professional",
    tags: ["Doctor Special", "Equipment Financing", "Clinic Expansion"],
    features: [
      {
        label: "Orchestration Group",
        value: "HDFC Bank, Axis Bank, Chola Finance",
      },
      { label: "Equipment Interest", value: "8.50% – 10.00% margins" },
      {
        label: "Asset LTV Ratio",
        value: "Funds up to 65% – 70% of machinery cost",
      },
    ],
    eligibility: [
      "Valid Post-Qualification degree confirmations (MBBS, BDS, MD, etc.)",
      "Valid current Medical Registration Certificates verified with boards",
      "Clean post-qualification experience metrics",
    ],
    brochureFile: "doctor-loan-proposal.pdf",
    images: [
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop", // Real Indian medical professional smiling
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop", // Indian doctor analyzing patient healthcare parameters
    ],
  },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function CardImageSlider({ images }: { images: string[] }) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const isAutoScrolling = useRef(false);
  const timerRef = useRef<number | null>(null);

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    if (images.length <= 1) return;

    timerRef.current = setInterval(() => {
      if (!scrollViewRef.current) return;

      let nextIndex = activeIndex + 1;
      if (nextIndex >= images.length) {
        nextIndex = 0;
      }

      isAutoScrolling.current = true;
      scrollViewRef.current.scrollTo({
        x: nextIndex * CAROUSEL_WIDTH,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3200) as unknown as number;
  }, [activeIndex, images.length, stopAutoScroll]);

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll, stopAutoScroll]);

  if (!images || images.length === 0) return null;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isAutoScrolling.current) {
      isAutoScrolling.current = false;
      return;
    }
    const contentOffset = event.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(contentOffset / CAROUSEL_WIDTH);
    if (
      computedIndex !== activeIndex &&
      computedIndex >= 0 &&
      computedIndex < images.length
    ) {
      setActiveIndex(computedIndex);
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={stopAutoScroll}
        onScrollEndDrag={startAutoScroll}
        style={styles.imageScrollTrack}
      >
        {images.map((imgUrl, idx) => (
          <Image
            key={`${imgUrl}-${idx}`}
            source={{ uri: imgUrl }}
            style={[styles.sliderImage, { width: CAROUSEL_WIDTH }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.indicatorTrack}>
          {images.map((_, idx) => (
            <View
              key={`dot-${idx}`}
              style={[
                styles.indicatorDot,
                {
                  backgroundColor:
                    idx === activeIndex
                      ? theme.colors.primary
                      : "rgba(255,255,255,0.6)",
                  width: idx === activeIndex ? 12 : 5,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function ZeptoProductCard({
  product,
  onSelect,
  onApply,
}: {
  product: LoanProduct;
  onSelect: (p: LoanProduct) => void;
  onApply: (p: LoanProduct) => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.zeptoCard,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <CardImageSlider images={product.images} />

      {product.badge && (
        <View
          style={[
            styles.zeptoBadge,
            { backgroundColor: colors.errorContainer },
          ]}
        >
          <Text
            style={[styles.zeptoBadgeText, { color: colors.onErrorContainer }]}
          >
            {product.badge}
          </Text>
        </View>
      )}

      <View style={styles.cardInfoPadding}>
        <Text
          numberOfLines={1}
          style={[styles.zeptoCardTitle, { color: colors.onSurface }]}
        >
          {product.title}
        </Text>
        <Text
          numberOfLines={2}
          style={[styles.zeptoCardSubtitle, { color: colors.onSurfaceVariant }]}
        >
          {product.subtitle}
        </Text>

        <View style={styles.zeptoPricingRow}>
          <View>
            <Text style={[styles.zeptoRateText, { color: colors.primary }]}>
              {product.interestRate.replace("Starting ", "")}
            </Text>
            <Text
              style={[
                styles.zeptoRateLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Rate Base
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.zeptoLimitText, { color: colors.onSurface }]}>
              {product.maxAmount}
            </Text>
            <Text
              style={[
                styles.zeptoRateLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Max Line
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRowContainer}>
        <Pressable
          onPress={() => onSelect(product)}
          style={styles.detailsToggleBtn}
        >
          <Text style={[styles.detailsToggleText, { color: colors.primary }]}>
            See Details
          </Text>
          <Feather name="info" size={12} color={colors.primary} />
        </Pressable>

        <Pressable
          onPress={() => onApply(product)}
          style={[styles.zeptoAddBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.zeptoAddBtnText, { color: colors.onPrimary }]}>
            Apply
          </Text>
          <Feather name="arrow-right" size={12} color={colors.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ARCHITECTURE ──────────────────────────────────────────────

export default function LoanProductsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(
    null,
  );

  const unsecuredProducts = LOAN_PRODUCTS.filter((p) => p.type === "unsecured");
  const securedProducts = LOAN_PRODUCTS.filter((p) => p.type === "secured");
  const professionalProducts = LOAN_PRODUCTS.filter(
    (p) => p.type === "professional",
  );

  const triggerWebDownload = async (url: string, fileName: string) => {
    if (typeof document === "undefined") {
      await Linking.openURL(url);
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const saveBrochureOnAndroid = async (url: string, fileName: string) => {
    if (!FileSystem.cacheDirectory) {
      await Linking.openURL(url);
      return;
    }

    const downloadsUri =
      FileSystem.StorageAccessFramework.getUriForDirectoryInRoot("Download");
    const permissions =
      await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        downloadsUri,
      );

    if (!permissions.granted) {
      Alert.alert(
        "Folder not selected",
        "Please choose a folder to save the brochure.",
      );
      return;
    }

    const localUri = `${FileSystem.cacheDirectory}${fileName}`;
    const downloaded = await FileSystem.downloadAsync(url, localUri);
    const pdfBase64 = await FileSystem.readAsStringAsync(downloaded.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const baseFileName = fileName.replace(/\.pdf$/i, "");
    let savedFileUri: string;

    try {
      savedFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        baseFileName,
        "application/pdf",
      );
    } catch {
      savedFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        `${baseFileName}-${Date.now()}`,
        "application/pdf",
      );
    }

    await FileSystem.StorageAccessFramework.writeAsStringAsync(
      savedFileUri,
      pdfBase64,
      { encoding: FileSystem.EncodingType.Base64 },
    );

    Alert.alert("Downloaded", `${fileName} has been saved.`);
  };

  const saveBrochureInAppDocuments = async (url: string, fileName: string) => {
    if (!FileSystem.documentDirectory) {
      await Linking.openURL(url);
      return;
    }

    const localUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.downloadAsync(url, localUri);

    Alert.alert(
      "Downloaded",
      `${fileName} has been saved inside the app documents folder.`,
    );
  };

  const handleDownloadBrochure = async (file?: string) => {
    if (!file) return;

    const brochureUrl = `${BROCHURE_BASE_URL}${encodeURIComponent(file)}`;

    try {
      if (Platform.OS === "web") {
        await triggerWebDownload(brochureUrl, file);
        return;
      }

      if (Platform.OS === "android") {
        await saveBrochureOnAndroid(brochureUrl, file);
        return;
      }

      await saveBrochureInAppDocuments(brochureUrl, file);
    } catch (error) {
      console.error("[LoanProducts] brochure download failed", error);
      Alert.alert(
        "Download failed",
        "We could not download this brochure right now. Please try again.",
      );
    }
  };

  const showComingSoon = () => {
    Alert.alert("Coming soon", "Eligibility check will be available soon.");
  };

  const getApplicationLoanType = (product: LoanProduct) => {
    switch (product.id) {
      case "business":
      case "overdraft":
        return "business loan";
      case "personal":
        return "personal loan";
      case "home":
        return "home loan";
      case "lap":
        return "lap";
      case "ca-professional":
      case "doctor-professional":
        return "professional loan";
      default:
        return "";
    }
  };

  const handleApplyProduct = (product: LoanProduct) => {
    const loanType = getApplicationLoanType(product);

    setSelectedProduct(null);
    router.push({
      pathname: "/create-application",
      params: {
        productId: product.id,
        loanType,
        loanCategory: product.type === "secured" ? "secured" : "unsecured",
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Header Section */}
      <View style={styles.zeptoHeader}>
        <View style={styles.headerTopLine}>
          <View
            style={[
              styles.headerIconContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <Feather name="zap" size={20} color={colors.onPrimary} />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.zeptoBrandText, { color: colors.primary }]}>
              F2 FINTECH
            </Text>
            <Text style={[styles.zeptoTimeText, { color: colors.onSurface }]}>
              Instant Loan Matrix
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.zeptoHeaderSubtitle,
            { color: colors.onSurfaceVariant },
          ]}
        >
          Direct parameter matching displaying exact guidelines mapped across
          our 40+ premier institutional partnerships.
        </Text>
      </View>

      {/* LANE 1: UNSECURED TIERS */}
      <View style={styles.laneContainer}>
        <View style={styles.laneHeader}>
          <Text style={[styles.laneTitle, { color: colors.onSurface }]}>
            ⚡ Unsecured Quick Capital
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.laneScrollTrack}
        >
          {unsecuredProducts.map((p) => (
            <ZeptoProductCard
              key={p.id}
              product={p}
              onSelect={setSelectedProduct}
              onApply={handleApplyProduct}
            />
          ))}
        </ScrollView>
      </View>

      {/* LANE 2: SECURED TIERS */}
      <View style={styles.laneContainer}>
        <View style={styles.laneHeader}>
          <Text style={[styles.laneTitle, { color: colors.onSurface }]}>
            🏠 High Volume Secured Assets
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.laneScrollTrack}
        >
          {securedProducts.map((p) => (
            <ZeptoProductCard
              key={p.id}
              product={p}
              onSelect={setSelectedProduct}
              onApply={handleApplyProduct}
            />
          ))}
        </ScrollView>
      </View>

      {/* LANE 3: PROFESSIONAL TIERS */}
      <View style={styles.laneContainer}>
        <View style={styles.laneHeader}>
          <Text style={[styles.laneTitle, { color: colors.onSurface }]}>
            🎓 Specialized Professional Lines
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.laneScrollTrack}
        >
          {professionalProducts.map((p) => (
            <ZeptoProductCard
              key={p.id}
              product={p}
              onSelect={setSelectedProduct}
              onApply={handleApplyProduct}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.footerContainer}>
        <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}>
          * Lending allocations, interest tracks, and approval parameters scale
          basis credit validation scores and final matching definitions governed
          by partner institutions.
        </Text>
      </View>

      {/* ── DETAIL DEEP DIVE MODAL SHEET ── */}
      <Modal
        visible={selectedProduct !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContentSheet,
              { backgroundColor: colors.surface },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalTitleBlock}>
                <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                  {selectedProduct?.title}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {selectedProduct?.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedProduct(null)}
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <Feather name="x" size={18} color={colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* Quick Stats Matrix */}
              <View
                style={[
                  styles.modalStatsRow,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <View style={styles.modalStatItem}>
                  <Text
                    style={[styles.modalStatValue, { color: colors.primary }]}
                  >
                    {selectedProduct?.interestRate}
                  </Text>
                  <Text
                    style={[
                      styles.modalStatLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Interest Rate
                  </Text>
                </View>
                <View
                  style={[
                    styles.modalStatDivider,
                    { backgroundColor: colors.outlineVariant },
                  ]}
                />
                <View style={styles.modalStatItem}>
                  <Text
                    style={[styles.modalStatValue, { color: colors.onSurface }]}
                  >
                    {selectedProduct?.maxAmount}
                  </Text>
                  <Text
                    style={[
                      styles.modalStatLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Max Amount
                  </Text>
                </View>
                <View
                  style={[
                    styles.modalStatDivider,
                    { backgroundColor: colors.outlineVariant },
                  ]}
                />
                <View style={styles.modalStatItem}>
                  <Text
                    style={[styles.modalStatValue, { color: colors.onSurface }]}
                  >
                    {selectedProduct?.tenure}
                  </Text>
                  <Text
                    style={[
                      styles.modalStatLabel,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    Tenure
                  </Text>
                </View>
              </View>

              {/* Comparative Matrix Details Grid */}
              <Text
                style={[styles.sectionHeading, { color: colors.onSurface }]}
              >
                Comparative Matrix Details
              </Text>
              <View
                style={[
                  styles.featureTable,
                  { borderColor: colors.outlineVariant },
                ]}
              >
                {selectedProduct?.features.map((f, idx) => (
                  <View key={`feat-${idx}`}>
                    <View style={styles.featureRow}>
                      <Text
                        style={[
                          styles.featureLabel,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {f.label}
                      </Text>
                      <Text
                        style={[
                          styles.featureValue,
                          { color: colors.onSurface },
                        ]}
                      >
                        {f.value}
                      </Text>
                    </View>
                    {idx < selectedProduct.features.length - 1 && <Divider />}
                  </View>
                ))}
              </View>

              {/* Eligibility Criteria Requirements */}
              <Text
                style={[
                  styles.sectionHeading,
                  { color: colors.onSurface, marginTop: 20 },
                ]}
              >
                Orchestration Criteria Metrics
              </Text>
              <View style={styles.eligibilityList}>
                {selectedProduct?.eligibility.map((e, idx) => (
                  <View key={`elig-${idx}`} style={styles.eligibilityItem}>
                    <Feather
                      name="check-circle"
                      size={14}
                      color={colors.primary}
                      style={{ marginTop: 2 }}
                    />
                    <Text
                      style={[
                        styles.eligibilityText,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {e}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Processing Fees Info Note */}
              <View
                style={[
                  styles.feeNote,
                  { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <Feather
                  name="info"
                  size={13}
                  color={colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.feeNoteText,
                    { color: colors.onSurfaceVariant, flex: 1 },
                  ]}
                >
                  Standard Pricing Notes: {selectedProduct?.processingFee}
                </Text>
              </View>

              {/* Document Brochure Download Action Trigger */}
              {selectedProduct?.brochureFile && (
                <Pressable
                  style={[
                    styles.brochureBtn,
                    {
                      backgroundColor: colors.secondaryContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                  onPress={() =>
                    handleDownloadBrochure(selectedProduct?.brochureFile)
                  }
                >
                  <Feather
                    name="download"
                    size={15}
                    color={colors.onSecondaryContainer}
                  />
                  <Text
                    style={[
                      styles.brochureBtnText,
                      { color: colors.onSecondaryContainer },
                    ]}
                  >
                    Download Brochure (PDF)
                  </Text>
                </Pressable>
              )}

              {/* Main Call to Action Flow */}
              <Pressable
                onPress={showComingSoon}
                style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[styles.applyBtnText, { color: colors.onPrimary }]}
                >
                  Verify Eligibility Instantly
                </Text>
                <Feather
                  name="arrow-right"
                  size={16}
                  color={colors.onPrimary}
                />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── STYLING ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  zeptoHeader: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  headerTopLine: { flexDirection: "row", alignItems: "center" },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  zeptoBrandText: { fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  zeptoTimeText: { fontSize: 18, fontWeight: "800" },
  zeptoHeaderSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 8 },
  laneContainer: { marginBottom: 24 },
  laneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  laneTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  laneScrollTrack: { paddingLeft: 16, paddingRight: 16, gap: 16 },

  // Zepto Grid Layout Configuration
  zeptoCard: {
    width: ZEPTO_CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sliderContainer: {
    width: "100%",
    height: CAROUSEL_HEIGHT,
    position: "relative",
  },
  imageScrollTrack: { flex: 1 },
  sliderImage: { height: CAROUSEL_HEIGHT },
  indicatorTrack: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  indicatorDot: { height: 5, borderRadius: 2.5 },
  zeptoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
  },
  zeptoBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cardInfoPadding: { padding: 12, flex: 1 },
  zeptoCardTitle: { fontSize: 16, fontWeight: "700", lineHeight: 20 },
  zeptoCardSubtitle: { fontSize: 12, lineHeight: 16, marginTop: 4, height: 32 },
  zeptoPricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  zeptoRateText: { fontSize: 13, fontWeight: "800" },
  zeptoLimitText: { fontSize: 13, fontWeight: "800" },
  zeptoRateLabel: { fontSize: 10, marginTop: 1 },

  // Action Elements Row
  actionRowContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginTop: 8,
    gap: 8,
    alignItems: "center",
  },
  detailsToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 34,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  detailsToggleText: { fontSize: 11, fontWeight: "700" },
  zeptoAddBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 34,
    borderRadius: 6,
    gap: 4,
  },
  zeptoAddBtnText: { fontSize: 12, fontWeight: "700" },

  footerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  disclaimer: { fontSize: 11, lineHeight: 16, textAlign: "center" },

  // Modal Sheet Architecture
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContentSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  modalTitleBlock: { flex: 1, paddingRight: 12 },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalSubtitle: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalStatsRow: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  modalStatItem: { flex: 1, alignItems: "center" },
  modalStatValue: { fontSize: 14, fontWeight: "700" },
  modalStatLabel: { fontSize: 11, marginTop: 2 },
  modalStatDivider: { width: 1, marginVertical: 2 },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  featureTable: { borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  featureLabel: { fontSize: 13 },
  featureValue: { fontSize: 13, fontWeight: "600" },
  eligibilityList: { gap: 8, marginBottom: 14 },
  eligibilityItem: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  eligibilityText: { fontSize: 13, lineHeight: 19, flex: 1 },
  feeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  feeNoteText: { fontSize: 12 },
  brochureBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    marginBottom: 10,
  },
  brochureBtnText: { fontSize: 14, fontWeight: "600" },
  applyBtn: {
    borderRadius: 8,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyBtnText: { fontSize: 15, fontWeight: "700" },
}) satisfies Record<string, ViewStyle | TextStyle>;
