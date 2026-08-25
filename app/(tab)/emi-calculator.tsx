import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Circle, Svg } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TRACK_WIDTH = SCREEN_WIDTH - 64;

// ─── COLORS ───────────────────────────────────────────────────────────────────
const PRINCIPAL_COLOR = "#3B5BDB"; // deep blue — matches reference image
const INTEREST_COLOR = "#0FC7B0"; // teal/mint  — matches reference image

// ─── LOAN TYPES ───────────────────────────────────────────────────────────────
const LOAN_TYPES = [
  {
    id: "doctor",
    label: "Doctor",
    icon: "activity",
    minAmt: 100000,
    maxAmt: 50000000,
    minRate: 8.5,
    maxRate: 14,
    minTenure: 1,
    maxTenure: 7,
  },
  {
    id: "personal",
    label: "Personal",
    icon: "user",
    minAmt: 50000,
    maxAmt: 10000000,
    minRate: 9.99,
    maxRate: 24,
    minTenure: 1,
    maxTenure: 8,
  },
  {
    id: "home",
    label: "Home",
    icon: "home",
    minAmt: 500000,
    maxAmt: 100000000,
    minRate: 7.35,
    maxRate: 12,
    minTenure: 1,
    maxTenure: 36,
  },
  {
    id: "lap",
    label: "LAP",
    icon: "map-pin",
    minAmt: 500000,
    maxAmt: 200000000,
    minRate: 8.1,
    maxRate: 14,
    minTenure: 1,
    maxTenure: 25,
  },
  {
    id: "other",
    label: "Other",
    icon: "more-horizontal",
    minAmt: 50000,
    maxAmt: 10000000,
    minRate: 10,
    maxRate: 24,
    minTenure: 1,
    maxTenure: 10,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function calcEMI(p: number, r: number, n: number) {
  if (n === 0) return 0;
  if (r === 0) return p / n;
  const mr = r / 12 / 100;
  return (p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
}
function formatIndian(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}
function formatFull(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

// ─── THICK DONUT CHART (SVG – matches reference image exactly) ────────────────
function DonutChart({
  principal,
  interest,
  totalPayment,
  surfaceBg,
}: {
  principal: number;
  interest: number;
  totalPayment: number;
  surfaceBg: string;
}) {
  const SIZE = 210;
  const SW = 28; // thick stroke — just like the reference
  const R = (SIZE - SW) / 2;
  const CIRC = 2 * Math.PI * R;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const GAP = 3; // small gap between arcs in px

  const total = principal + interest;
  const pRatio = total > 0 ? principal / total : 0.5;
  const iRatio = 1 - pRatio;

  // arc lengths with a tiny gap carved out
  const pArc = Math.max(CIRC * pRatio - GAP, 0);
  const iArc = Math.max(CIRC * iRatio - GAP, 0);

  // start both arcs from top (offset = CIRC/4 rotates circle to start at 12 o'clock)
  const pOffset = CIRC * 0.25;
  const iOffset = -(CIRC * pRatio - CIRC * 0.25);

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {/* react-native-svg — works on iOS, Android, and Web */}
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* ghost track */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={surfaceBg}
          strokeWidth={SW}
        />
        {/* principal arc — blue */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={PRINCIPAL_COLOR}
          strokeWidth={SW}
          strokeLinecap="butt"
          strokeDasharray={`${pArc} ${CIRC - pArc}`}
          strokeDashoffset={pOffset}
        />
        {/* interest arc — teal */}
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={INTEREST_COLOR}
          strokeWidth={SW}
          strokeLinecap="butt"
          strokeDasharray={`${iArc} ${CIRC - iArc}`}
          strokeDashoffset={iOffset}
        />
      </Svg>

      {/* Center label absolutely positioned */}
      <View style={[donutStyles.centerLabel, { width: SIZE, height: SIZE }]}>
        <Text style={donutStyles.centerTitle}>Total Amount{"\n"}Payable</Text>
        <Text style={donutStyles.centerValue}>{formatFull(totalPayment)}</Text>
      </View>
    </View>
  );
}

const donutStyles = StyleSheet.create({
  centerLabel: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTitle: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 17,
  },
  centerValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222",
    marginTop: 4,
    letterSpacing: -0.5,
  },
});

// ─── CUSTOM SLIDER ────────────────────────────────────────────────────────────
function SliderTrack({
  value,
  min,
  max,
  onChange,
  primaryColor,
  surfaceVariantColor,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  primaryColor: string;
  surfaceVariantColor: string;
}) {
  const getPos = useCallback(
    (v: number) => ((clamp(v, min, max) - min) / (max - min)) * TRACK_WIDTH,
    [min, max],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const ratio = clamp(e.nativeEvent.locationX / TRACK_WIDTH, 0, 1);
          onChange(Math.round(min + ratio * (max - min)));
        },
        onPanResponderMove: (e) => {
          const ratio = clamp(e.nativeEvent.locationX / TRACK_WIDTH, 0, 1);
          onChange(Math.round(min + ratio * (max - min)));
        },
      }),
    [min, max, onChange],
  );

  const fillW = clamp(getPos(value), 0, TRACK_WIDTH);
  // Keep thumb fully visible at both edges
  const thumbX = clamp(fillW - 12, 0, TRACK_WIDTH - 24);

  return (
    <View style={sS.wrap} {...panResponder.panHandlers}>
      <View style={[sS.track, { backgroundColor: surfaceVariantColor }]}>
        <View
          style={[sS.fill, { width: fillW, backgroundColor: primaryColor }]}
        />
      </View>
      <View style={[sS.thumb, { left: thumbX, borderColor: primaryColor }]} />
    </View>
  );
}
const sS = StyleSheet.create({
  wrap: { height: 38, justifyContent: "center" },
  track: { height: 5, borderRadius: 3, width: TRACK_WIDTH, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  thumb: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    backgroundColor: "#fff",
    top: 7,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

// ─── LOAN CHIP ────────────────────────────────────────────────────────────────
function LoanChip({
  label,
  icon,
  selected,
  onPress,
  pc,
  sc,
  osc,
  opc,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
  pc: string;
  sc: string;
  osc: string;
  opc: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[cS.chip, { backgroundColor: selected ? pc : sc }]}
    >
      <Feather name={icon as any} size={13} color={selected ? opc : osc} />
      <Text style={[cS.label, { color: selected ? opc : osc }]}>{label}</Text>
    </Pressable>
  );
}
const cS = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
  },
  label: { fontSize: 12, fontWeight: "700" },
});

// ─── INPUT ROW (slider + manual input side by side) ───────────────────────────
function InputRow({
  label,
  unit,
  value,
  min,
  max,
  step,
  inputText,
  onInputChange,
  onInputBlur,
  onSliderChange,
  primaryColor,
  surfaceColor,
  surfaceVariantColor,
  outlineColor,
  onSurfaceVariant,
  onSurface,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  inputText: string;
  onInputChange: (t: string) => void;
  onInputBlur: () => void;
  onSliderChange: (v: number) => void;
  primaryColor: string;
  surfaceColor: string;
  surfaceVariantColor: string;
  outlineColor: string;
  onSurfaceVariant: string;
  onSurface: string;
}) {
  return (
    <View style={iS.section}>
      {/* Label row */}
      <View style={iS.labelRow}>
        <Text style={[iS.label, { color: onSurfaceVariant }]}>{label}</Text>
        {/* Editable input box */}
        <View
          style={[
            iS.inputWrap,
            { borderColor: primaryColor, backgroundColor: surfaceVariantColor },
          ]}
        >
          {unit === "₹" && (
            <Text style={[iS.unitText, { color: primaryColor }]}>₹</Text>
          )}
          <TextInput
            style={[iS.input, { color: onSurface }]}
            value={inputText}
            onChangeText={onInputChange}
            onBlur={onInputBlur}
            keyboardType="numeric"
            returnKeyType="done"
          />
          {unit !== "₹" && (
            <Text style={[iS.unitText, { color: primaryColor }]}>{unit}</Text>
          )}
        </View>
      </View>

      {/* Slider */}
      <SliderTrack
        value={value}
        min={min}
        max={max}
        onChange={onSliderChange}
        primaryColor={primaryColor}
        surfaceVariantColor={surfaceVariantColor}
      />

      {/* Min / Max hints */}
      <View style={iS.minMax}>
        <Text style={[iS.hint, { color: onSurfaceVariant }]}>
          {unit === "₹" ? formatIndian(min) : `${min}${unit}`}
        </Text>
        <Text style={[iS.hint, { color: onSurfaceVariant }]}>
          {unit === "₹" ? formatIndian(max) : `${max}${unit}`}
        </Text>
      </View>
    </View>
  );
}
const iS = StyleSheet.create({
  section: { paddingHorizontal: 16, paddingVertical: 14 },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  label: { fontSize: 13, fontWeight: "600" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 100,
  },
  unitText: { fontSize: 13, fontWeight: "700" },
  input: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 70,
    textAlign: "right",
    padding: 0,
  },
  minMax: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  hint: { fontSize: 10 },
});

// ─── BREAKDOWN ROW ────────────────────────────────────────────────────────────
function BRow({
  dot,
  label,
  value,
  lc,
  vc,
}: {
  dot: string;
  label: string;
  value: string;
  lc: string;
  vc: string;
}) {
  return (
    <View style={bS.row}>
      <View style={[bS.dot, { backgroundColor: dot }]} />
      <Text style={[bS.lbl, { color: lc }]}>{label}</Text>
      <Text style={[bS.val, { color: vc }]}>{value}</Text>
    </View>
  );
}
const bS = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 5,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lbl: { flex: 1, fontSize: 13 },
  val: { fontSize: 14, fontWeight: "700" },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function EMICalculatorScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const S = colors;

  const [selectedType, setSelectedType] = useState(LOAN_TYPES[0]);

  // ── Single source of truth: numeric values drive slider + EMI ──
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(LOAN_TYPES[0].minRate); // doctor = 8.5
  const [tenureYears, setTenureYears] = useState(5);

  // ── Raw text shown in the TextInput boxes (may be mid-typing) ──
  const [amtText, setAmtText] = useState("1000000");
  const [rateText, setRateText] = useState(String(LOAN_TYPES[0].minRate));
  const [tenText, setTenText] = useState("5");

  // ── Debounce timer refs ──
  const amtTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showAmort, setShowAmort] = useState(false);

  // ── Derived ──
  const tenureMonths = tenureYears * 12;
  const emi = calcEMI(loanAmount, interestRate, tenureMonths);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  // ── Loan type switch: reset everything to sane defaults ──
  const handleTypeChange = (t: (typeof LOAN_TYPES)[0]) => {
    setSelectedType(t);
    const amt = Math.round(t.minAmt + (t.maxAmt - t.minAmt) * 0.3);
    const rate = t.minRate;
    const ten = Math.round((t.maxTenure - t.minTenure) * 0.4) + t.minTenure;
    setLoanAmount(amt);
    setAmtText(String(amt));
    setInterestRate(rate);
    setRateText(String(rate));
    setTenureYears(ten);
    setTenText(String(ten));
  };

  // ────────────────────────────────────────────────────────────────
  // AMOUNT — slider moves numeric value + text in sync immediately.
  // Manual typing: update text instantly, debounce 400ms then parse
  // and move slider to the clamped position.
  // ────────────────────────────────────────────────────────────────
  const handleAmtSlider = useCallback((v: number) => {
    setLoanAmount(v);
    setAmtText(String(v));
  }, []);

  const handleAmtTextChange = useCallback(
    (text: string) => {
      const clean = text.replace(/[^0-9]/g, "");
      setAmtText(clean); // always show what user typed

      if (amtTimer.current) clearTimeout(amtTimer.current);
      amtTimer.current = setTimeout(() => {
        const n = parseInt(clean, 10);
        if (isNaN(n) || n <= 0) {
          // field cleared or invalid — reset slider to min
          setLoanAmount(selectedType.minAmt);
          return;
        }
        if (n > selectedType.maxAmt) {
          setLoanAmount(selectedType.maxAmt);
          setAmtText(String(selectedType.maxAmt));
        } else if (n >= selectedType.minAmt) {
          setLoanAmount(n);
        }
        // if n < minAmt user still typing — don't touch slider
      }, 500);
    },
    [selectedType.minAmt, selectedType.maxAmt],
  );

  const handleAmtBlur = useCallback(() => {
    if (amtTimer.current) clearTimeout(amtTimer.current);
    const n = parseInt(amtText.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(n) && n > 0) {
      const clamped = clamp(n, selectedType.minAmt, selectedType.maxAmt);
      setLoanAmount(clamped);
      setAmtText(String(clamped));
    } else {
      setAmtText(String(loanAmount)); // restore last valid
    }
  }, [amtText, loanAmount, selectedType.minAmt, selectedType.maxAmt]);

  // ────────────────────────────────────────────────────────────────
  // INTEREST RATE
  // ────────────────────────────────────────────────────────────────
  const handleRateSlider = useCallback((v: number) => {
    setInterestRate(v);
    setRateText(String(v));
  }, []);

  const handleRateTextChange = useCallback(
    (text: string) => {
      const clean = text.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
      setRateText(clean); // always show what user typed

      if (rateTimer.current) clearTimeout(rateTimer.current);
      rateTimer.current = setTimeout(() => {
        const n = parseFloat(clean);
        if (isNaN(n) || n <= 0) {
          // field cleared — reset slider to min
          setInterestRate(selectedType.minRate);
          return;
        }
        if (n > selectedType.maxRate) {
          const max = parseFloat(selectedType.maxRate.toFixed(2));
          setInterestRate(max);
          setRateText(String(max));
        } else if (n >= selectedType.minRate) {
          setInterestRate(parseFloat(n.toFixed(2)));
        }
        // if n < minRate still typing — don't touch slider
      }, 500);
    },
    [selectedType.minRate, selectedType.maxRate],
  );

  const handleRateBlur = useCallback(() => {
    if (rateTimer.current) clearTimeout(rateTimer.current);
    const n = parseFloat(rateText);
    if (!isNaN(n) && n > 0) {
      const clamped = parseFloat(
        clamp(n, selectedType.minRate, selectedType.maxRate).toFixed(2),
      );
      setInterestRate(clamped);
      setRateText(String(clamped));
    } else {
      setRateText(String(interestRate));
    }
  }, [rateText, interestRate, selectedType.minRate, selectedType.maxRate]);

  // ────────────────────────────────────────────────────────────────
  // TENURE
  // ────────────────────────────────────────────────────────────────
  const handleTenSlider = useCallback((v: number) => {
    setTenureYears(v);
    setTenText(String(v));
  }, []);

  const handleTenTextChange = useCallback(
    (text: string) => {
      const clean = text.replace(/[^0-9]/g, "");
      setTenText(clean); // always show what user typed

      if (tenTimer.current) clearTimeout(tenTimer.current);
      tenTimer.current = setTimeout(() => {
        const n = parseInt(clean, 10);
        if (isNaN(n) || n <= 0) {
          // field cleared — reset slider to min
          setTenureYears(selectedType.minTenure);
          return;
        }
        if (n > selectedType.maxTenure) {
          setTenureYears(selectedType.maxTenure);
          setTenText(String(selectedType.maxTenure));
        } else if (n >= selectedType.minTenure) {
          setTenureYears(n);
        }
        // if n < minTenure still typing — don't touch slider
      }, 500);
    },
    [selectedType.minTenure, selectedType.maxTenure],
  );

  const handleTenBlur = useCallback(() => {
    if (tenTimer.current) clearTimeout(tenTimer.current);
    const n = parseInt(tenText, 10);
    if (!isNaN(n) && n > 0) {
      const clamped = clamp(n, selectedType.minTenure, selectedType.maxTenure);
      setTenureYears(clamped);
      setTenText(String(clamped));
    } else {
      setTenText(String(tenureYears));
    }
  }, [tenText, tenureYears, selectedType.minTenure, selectedType.maxTenure]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (amtTimer.current) clearTimeout(amtTimer.current);
      if (rateTimer.current) clearTimeout(rateTimer.current);
      if (tenTimer.current) clearTimeout(tenTimer.current);
    };
  }, []);

  // ── amortization ──
  const amortSchedule = useMemo(() => {
    const rows = [];
    let bal = loanAmount;
    const r = interestRate / 12 / 100;
    for (let m = 1; m <= tenureMonths; m++) {
      const intPaid = bal * r;
      const prinPaid = emi - intPaid;
      bal = Math.max(bal - prinPaid, 0);
      rows.push({
        month: m,
        emi,
        principal: prinPaid,
        interest: intPaid,
        balance: bal,
      });
    }
    return rows;
  }, [loanAmount, interestRate, tenureMonths, emi]);

  // ── apply ──
  const handleApply = () => {
    const loanTypeMap: Record<string, string> = {
      doctor: "professional loan",
      personal: "personal loan",
      home: "home loan",
      lap: "lap",
      other: "personal loan",
    };
    router.push({
      pathname: "/create-application",
      params: {
        productId: selectedType.id,
        loanType: loanTypeMap[selectedType.id] ?? "personal loan",
        loanCategory: ["home", "lap"].includes(selectedType.id)
          ? "secured"
          : "unsecured",
        prefillAmount: Math.round(loanAmount).toString(),
        prefillTenure: tenureYears.toString(),
      },
    });
  };

  // ── surface bg for donut ghost ring ──
  const ghostRing = S.surfaceVariant;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: S.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: S.primary }]}>
            <Feather name="percent" size={18} color={S.onPrimary} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={[styles.headerTitle, { color: S.onSurface }]}>
              EMI Calculator
            </Text>
            <Text style={[styles.headerSub, { color: S.onSurfaceVariant }]}>
              Plan your loan repayment
            </Text>
          </View>
        </View>

        {/* ── Loan Type Chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {LOAN_TYPES.map((t) => (
            <LoanChip
              key={t.id}
              label={t.label}
              icon={t.icon}
              selected={selectedType.id === t.id}
              onPress={() => handleTypeChange(t)}
              pc={S.primary}
              sc={S.surfaceVariant}
              osc={S.onSurfaceVariant}
              opc={S.onPrimary}
            />
          ))}
        </ScrollView>

        {/* ── Input Card ── */}
        <View
          style={[
            styles.card,
            { backgroundColor: S.surface, borderColor: S.outlineVariant },
          ]}
        >
          <InputRow
            label="Loan Amount"
            unit="₹"
            value={loanAmount}
            min={selectedType.minAmt}
            max={selectedType.maxAmt}
            step={10000}
            inputText={amtText}
            onInputChange={handleAmtTextChange}
            onInputBlur={handleAmtBlur}
            onSliderChange={handleAmtSlider}
            primaryColor={S.primary}
            surfaceColor={S.surface}
            surfaceVariantColor={S.surfaceVariant}
            outlineColor={S.outlineVariant}
            onSurfaceVariant={S.onSurfaceVariant}
            onSurface={S.onSurface}
          />

          <View
            style={[styles.divider, { backgroundColor: S.outlineVariant }]}
          />

          <InputRow
            label="Interest Rate (p.a.)"
            unit="%"
            value={interestRate}
            min={selectedType.minRate}
            max={selectedType.maxRate}
            step={0.05}
            inputText={rateText}
            onInputChange={handleRateTextChange}
            onInputBlur={handleRateBlur}
            onSliderChange={handleRateSlider}
            primaryColor={S.primary}
            surfaceColor={S.surface}
            surfaceVariantColor={S.surfaceVariant}
            outlineColor={S.outlineVariant}
            onSurfaceVariant={S.onSurfaceVariant}
            onSurface={S.onSurface}
          />

          <View
            style={[styles.divider, { backgroundColor: S.outlineVariant }]}
          />

          <InputRow
            label="Tenure"
            unit=" Yr"
            value={tenureYears}
            min={selectedType.minTenure}
            max={selectedType.maxTenure}
            step={1}
            inputText={tenText}
            onInputChange={handleTenTextChange}
            onInputBlur={handleTenBlur}
            onSliderChange={handleTenSlider}
            primaryColor={S.primary}
            surfaceColor={S.surface}
            surfaceVariantColor={S.surfaceVariant}
            outlineColor={S.outlineVariant}
            onSurfaceVariant={S.onSurfaceVariant}
            onSurface={S.onSurface}
          />
        </View>

        {/* ── Result Card ── */}
        <View
          style={[
            styles.card,
            { backgroundColor: S.surface, borderColor: S.outlineVariant },
          ]}
        >
          {/* Monthly EMI banner */}
          <View
            style={[styles.emiBanner, { backgroundColor: S.primaryContainer }]}
          >
            <Text
              style={[styles.emiBannerLabel, { color: S.onPrimaryContainer }]}
            >
              Monthly EMI
            </Text>
            <Text style={[styles.emiBannerValue, { color: S.primary }]}>
              {formatFull(emi)}
            </Text>
            <Text
              style={[styles.emiBannerSub, { color: S.onPrimaryContainer }]}
            >
              for {tenureMonths} months · {tenureYears}{" "}
              {tenureYears === 1 ? "year" : "years"}
            </Text>
          </View>

          {/* Donut + legend */}
          <View style={styles.donutSection}>
            <DonutChart
              principal={loanAmount}
              interest={totalInterest}
              totalPayment={totalPayment}
              surfaceBg={ghostRing}
            />

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: PRINCIPAL_COLOR },
                  ]}
                />
                <View>
                  <Text
                    style={[styles.legendLabel, { color: S.onSurfaceVariant }]}
                  >
                    Principal Amount
                  </Text>
                  <Text style={[styles.legendValue, { color: S.onSurface }]}>
                    {formatFull(loanAmount)}
                  </Text>
                  <Text style={[styles.legendPct, { color: PRINCIPAL_COLOR }]}>
                    {totalPayment > 0
                      ? ((loanAmount / totalPayment) * 100).toFixed(1)
                      : 0}
                    %
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.legendDivider,
                  { backgroundColor: S.outlineVariant },
                ]}
              />

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: INTEREST_COLOR },
                  ]}
                />
                <View>
                  <Text
                    style={[styles.legendLabel, { color: S.onSurfaceVariant }]}
                  >
                    Total Interest
                  </Text>
                  <Text style={[styles.legendValue, { color: S.onSurface }]}>
                    {formatFull(totalInterest)}
                  </Text>
                  <Text style={[styles.legendPct, { color: INTEREST_COLOR }]}>
                    {totalPayment > 0
                      ? ((totalInterest / totalPayment) * 100).toFixed(1)
                      : 0}
                    %
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Savings note */}
          <View
            style={[styles.savingNote, { backgroundColor: S.surfaceVariant }]}
          >
            <Feather name="info" size={12} color={S.onSurfaceVariant} />
            <Text style={[styles.savingText, { color: S.onSurfaceVariant }]}>
              You pay{" "}
              {totalPayment > 0
                ? ((totalInterest / loanAmount) * 100).toFixed(1)
                : 0}
              % extra as interest over the tenure
            </Text>
          </View>

          {/* Amortization button */}
          <Pressable
            style={[styles.amortBtn, { borderColor: S.outlineVariant }]}
            onPress={() => setShowAmort(true)}
          >
            <Feather name="bar-chart-2" size={14} color={S.primary} />
            <Text style={[styles.amortBtnText, { color: S.primary }]}>
              View Amortization Schedule
            </Text>
            <Feather name="chevron-right" size={14} color={S.primary} />
          </Pressable>
        </View>

        {/* ── Apply Now Card ── */}
        <View
          style={[
            styles.applyCard,
            { backgroundColor: S.surface, borderColor: S.outlineVariant },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.applyCardTitle, { color: S.onSurface }]}>
              Ready to Apply?
            </Text>
            <Text style={[styles.applyCardSub, { color: S.onSurfaceVariant }]}>
              {selectedType.label} loan · {interestRate}% p.a. · EMI{" "}
              {formatFull(emi)}/mo
            </Text>
          </View>
          <Pressable
            style={[styles.applyBtn, { backgroundColor: S.primary }]}
            onPress={handleApply}
          >
            <Text style={[styles.applyBtnText, { color: S.onPrimary }]}>
              Apply Now
            </Text>
            <Feather name="arrow-right" size={14} color={S.onPrimary} />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Amortization Modal ── */}
      <Modal
        visible={showAmort}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAmort(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: S.surface }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: S.onSurface }]}>
                Amortization Schedule
              </Text>
              <Pressable
                onPress={() => setShowAmort(false)}
                style={[
                  styles.modalClose,
                  { backgroundColor: S.surfaceVariant },
                ]}
              >
                <Feather name="x" size={18} color={S.onSurface} />
              </Pressable>
            </View>

            <View
              style={[
                styles.tableHeader,
                { backgroundColor: S.surfaceVariant },
              ]}
            >
              {["Mo", "EMI", "Principal", "Interest", "Balance"].map((h) => (
                <Text
                  key={h}
                  style={[
                    styles.tableHeaderCell,
                    { color: S.onSurfaceVariant },
                  ]}
                >
                  {h}
                </Text>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {amortSchedule.map((row, idx) => (
                <View
                  key={row.month}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor:
                        idx % 2 === 0 ? S.surface : S.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tableCell, { color: S.onSurfaceVariant }]}
                  >
                    {row.month}
                  </Text>
                  <Text style={[styles.tableCell, { color: S.onSurface }]}>
                    {formatIndian(row.emi)}
                  </Text>
                  <Text style={[styles.tableCell, { color: PRINCIPAL_COLOR }]}>
                    {formatIndian(row.principal)}
                  </Text>
                  <Text style={[styles.tableCell, { color: INTEREST_COLOR }]}>
                    {formatIndian(row.interest)}
                  </Text>
                  <Text style={[styles.tableCell, { color: S.onSurface }]}>
                    {formatIndian(row.balance)}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={[styles.modalApplyBtn, { backgroundColor: S.primary }]}
              onPress={() => {
                setShowAmort(false);
                handleApply();
              }}
            >
              <Text style={[styles.applyBtnText, { color: S.onPrimary }]}>
                Apply for {selectedType.label} Loan
              </Text>
              <Feather name="arrow-right" size={14} color={S.onPrimary} />
            </Pressable>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 120 },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSub: { fontSize: 13, marginTop: 1 },

  chipsRow: { gap: 8, paddingBottom: 16 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  divider: { height: 1, marginHorizontal: 16 },

  // ── Result ──
  emiBanner: {
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  emiBannerLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  emiBannerValue: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  emiBannerSub: { fontSize: 12, marginTop: 4 },

  donutSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 20,
  },

  legend: { width: "100%", paddingHorizontal: 20, gap: 0 },
  legendItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
  },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginTop: 2 },
  legendLabel: { fontSize: 12, color: "#888" },
  legendValue: { fontSize: 15, fontWeight: "700", marginTop: 1 },
  legendPct: { fontSize: 12, fontWeight: "600", marginTop: 1 },
  legendDivider: { height: 1 },

  savingNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    padding: 10,
  },
  savingText: { fontSize: 12, flex: 1, lineHeight: 17 },

  amortBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
  },
  amortBtnText: { fontSize: 13, fontWeight: "700" },

  // ── Apply Card ──
  applyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  applyCardTitle: { fontSize: 15, fontWeight: "800" },
  applyCardSub: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  applyBtnText: { fontSize: 13, fontWeight: "800" },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: SCREEN_HEIGHT * 0.88,
    padding: 16,
    paddingBottom: 0,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(120,120,120,0.3)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: "800" },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 2,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  tableCell: { flex: 1, fontSize: 11, textAlign: "center", fontWeight: "500" },
  modalApplyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    margin: 16,
  },
}) satisfies Record<string, ViewStyle | TextStyle>;
