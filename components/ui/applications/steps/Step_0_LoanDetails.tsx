import { useAppConfig } from "@/contexts/ConfigContext";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { z } from "zod";

import { step0Schema } from "../applicationSchemas";

type ProviderAmount = { provider: string; amount: string };

const LOAN_TYPES_BASE = {
  secured: [
    { value: "home loan", label: "Home Loan" },
    { value: "lap", label: "LAP (Loan Against Property)" },
    { value: "auto loan", label: "Auto Loan" },
    { value: "machinery loan", label: "Machinery Loan" },
  ],
  unsecured: [
    { value: "personal loan", label: "Personal Loan" },
    { value: "business loan", label: "Business Loan" },
    { value: "professional loan", label: "Professional Loan" },
    { value: "education loan", label: "Education Loan" },
    { value: "just inquiry", label: "Just Inquiry" },
  ],
};

const tenureOptions = {
  secured: [
    "5 Years",
    "8 Years",
    "10 Years",
    "15 Years",
    "20 Years",
    "25 Years",
    "30 Years",
  ],
  unsecured: [
    "1 Year",
    "2 Years",
    "3 Years",
    "4 Years",
    "5 Years",
    "6 Years",
    "7 Years",
    "8 Years",
  ],
};

const caseTypeOptions = [
  { value: "fresh", label: "Fresh" },
  { value: "top_up", label: "Top Up" },
];

const businessEntityOptions = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "private_limited", label: "Private Limited" },
  { value: "partnership", label: "Partnership Firm" },
];

const professionalTypeOptions = [
  { value: "Dr", label: "Doctor" },
  { value: "CA", label: "Chartered Accountant" },
  { value: "CS", label: "Company Secretary" },
  { value: "CMA", label: "Cost and Management Accountant" },
  { value: "Engineer", label: "Engineer" },
  { value: "Lawyer", label: "Lawyer" },
];

const propertyPurchaseTypeOptions = [
  { value: "fresh_purchase", label: "Fresh Purchase" },
  { value: "resale_purchase", label: "Resale Purchase" },
  { value: "builder_purchase", label: "Direct Builder Purchase" },
  { value: "balance_transfer", label: "Balance Transfer" },
];

const getLoanCategory = (type: string): "secured" | "unsecured" | "" => {
  const securedTypes = ["home loan", "lap", "auto loan", "machinery loan"];
  const unsecuredTypes = [
    "personal loan",
    "business loan",
    "professional loan",
    "education loan",
    "just inquiry",
  ];
  if (securedTypes.includes(type)) return "secured";
  if (unsecuredTypes.includes(type)) return "unsecured";
  return "";
};

const toTitleCase = (s: string) =>
  String(s || "")
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

const isBank = (name: string) => {
  const n = name.toLowerCase();
  return (
    n.includes("bank") ||
    n === "hdfc" ||
    n === "idfc" ||
    n === "icici" ||
    n === "indusind" ||
    n === "axis" ||
    n === "pnb" ||
    n === "canara" ||
    n === "kotak"
  );
};

export type ExistingLoan = {
  hasRunningLoans: "yes" | "no" | "";
  whichLoan: string;
  loanAmount: string;
  runningEmi: string;
};

export type Step0Values = {
  loanAmount: string;
  loanType: string;
  loanCategory: "secured" | "unsecured" | "";
  tenure: string;
  selectedProviders: string[];
  providerAmounts: ProviderAmount[];
  existingLoans: ExistingLoan[];
  caseType: "fresh" | "top_up" | "";
  businessEntityType:
  | ""
  | "sole_proprietorship"
  | "private_limited"
  | "partnership";
  professionalType?: "" | "Dr" | "CA" | "CS" | "CMA";
  propertyPurchaseType?: string;
  referralCode?: string;
};

type Props = {
  value: Step0Values;
  onChange: (next: Step0Values) => void;
  providers?: string[];
  onValidityChange?: (isValid: boolean) => void;
  disabled?: boolean;
};

function zodFirstErrorMap(err: z.ZodError) {
  const map: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!map[key]) map[key] = issue.message;
  }
  return map;
}

export default function Step0LoanDetails({
  value,
  onChange,
  providers,
  onValidityChange,
  disabled,
}: Props) {
  const theme = useTheme();
  const { config } = useAppConfig();
  const loanWord = config.isReviewMode ? config.terminology.loanWord : "Loan";
  // Dynamic loan type labels – swap "Loan" with loanWord when in review mode
  const loanTypeOptions = useMemo(() => ({
    secured: LOAN_TYPES_BASE.secured.map((x) => ({
      ...x,
      label: x.label.replace(/Loan/g, loanWord),
    })),
    unsecured: LOAN_TYPES_BASE.unsecured.map((x) => ({
      ...x,
      label: x.label.replace(/Loan/g, loanWord),
    })),
  }), [loanWord]);


  const [keyboardSpace, setKeyboardSpace] = useState(0);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, (e) => {
      setKeyboardSpace(Math.max(0, e.endCoordinates?.height ?? 0));
    });

    const subHide = Keyboard.addListener(hideEvt, () => setKeyboardSpace(0));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  // Providers + Others
  const PROVIDERS = useMemo(() => {
    const base = providers?.length
      ? providers
      : [
        "Let F2 Fintech decide.",
        "ABFL",
        "Bajaj Finance",
        "Bajaj Market",
        "L&T Finance",
        "Tata Capital",
        "Godrej Capital",
        "Cholamandalam",
        "HDFC",
        "IDFC",
        "ICICI",
        "Incred",
        "Indusind",
        "Credit Saison",
        "Paysense",
        "Shriram",
        "HSBC Bank",
        "STANDARD Chartered Bank",
        "YES Bank",
        "Kotak Bank",
        "Poonawala",
        "Canara Bank",
        "Bank of Baroda",
        "PNB",
        "Axis",
        "Lending Kart",
      ];

    const uniq = Array.from(new Set(base.map((x) => String(x).trim()))).filter(
      Boolean,
    );
    return [...uniq, "Others"];
  }, [providers]);

  // Existing modals
  const [loanTypeModalOpen, setLoanTypeModalOpen] = useState(false);
  const [tenureModalOpen, setTenureModalOpen] = useState(false);

  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  const [showInfo, setShowInfo] = useState(true);

  // Others provider support
  const [otherProviderText, setOtherProviderText] = useState("");
  const isOthersSelected = value.selectedProviders.includes("Others");

  const { BANKS, NBFCS } = useMemo(() => {
    const banksList: string[] = [];
    const nbfcsList: string[] = [];

    PROVIDERS.forEach((p) => {
      if (p === "Let F2 Fintech decide." || p === "Others") return;
      if (isBank(p)) {
        banksList.push(p);
      } else {
        nbfcsList.push(p);
      }
    });

    return { BANKS: banksList, NBFCS: nbfcsList };
  }, [PROVIDERS]);

  const [bankSectionExpanded, setBankSectionExpanded] = useState(false);
  const [nbfcSectionExpanded, setNbfcSectionExpanded] = useState(false);

  const [leadTypeModalOpen, setLeadTypeModalOpen] = useState(false);
  const [runningLoanModalOpen, setRunningLoanModalOpen] = useState(false);
  const [whichLoanModalOpen, setWhichLoanModalOpen] = useState(false);
  const [caseTypeModalOpen, setCaseTypeModalOpen] = useState(false);
  const [businessEntityModalOpen, setBusinessEntityModalOpen] = useState(false);
  const [professionalTypeModalOpen, setProfessionalTypeModalOpen] = useState(false);

  // validation errors
  const [allErrors, setAllErrors] = useState<Record<string, string>>({});

  // touched state
  const [touched, setTouched] = useState<Record<string, boolean>>({
    amount: false,
    loanType: false,
    tenure: false,
    providers: false,
    providerAmounts: false,
    otherProvider: false,

    leadType: false,
    caseType: false,
    businessEntityType: false,
    professionalType: false,
  });

  const [activeExistingLoanIndex, setActiveExistingLoanIndex] = useState<number | null>(null);

  const canAddAnotherLoan = useMemo(() => {
    return (value.existingLoans || []).every(
      (loan) =>
        loan.hasRunningLoans === "yes" &&
        loan.whichLoan &&
        loan.loanAmount,
    );
  }, [value.existingLoans]);

  const tenureList = useMemo(() => {
    return value.loanCategory ? tenureOptions[value.loanCategory] : [];
  }, [value.loanCategory]);

  // Validation
  useEffect(() => {
    const payload = {
      amount: value.loanAmount,
      loanType: value.loanType,
      tenure: value.tenure,
      providers: value.selectedProviders.filter((p) => p !== "Others"),
      providerAmounts: value.providerAmounts.filter(
        (x) => x.provider !== "Others",
      ),
      existingLoans: (value.existingLoans || []).map((loan) => ({
        hasRunningLoans: loan.hasRunningLoans,
        whichLoan: loan.whichLoan,
        loanAmount: loan.loanAmount,
        runningEmi: loan.runningEmi,
      })),
      caseType: "fresh" as any,
      businessEntityType: value.businessEntityType || "",
      professionalType: value.professionalType || "",
      propertyPurchaseType: value.propertyPurchaseType || "",
    };

    const res = step0Schema.safeParse(payload);
    if (res.success) {
      setAllErrors({});
      onValidityChange?.(true);
    } else {
      setAllErrors(zodFirstErrorMap(res.error));
      onValidityChange?.(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    value.loanAmount,
    value.loanType,
    value.tenure,
    value.selectedProviders,
    value.providerAmounts,
    value.existingLoans,
    value.caseType,
    value.businessEntityType,
    value.professionalType,
  ]);

  // Show errors only when touched
  const showAmountError = touched.amount ? allErrors["amount"] : "";
  const showLoanTypeError = touched.loanType ? allErrors["loanType"] : "";
  const showTenureError = touched.tenure ? allErrors["tenure"] : "";
  const showProvidersError = touched.providers ? allErrors["providers"] : "";
  const showCaseTypeError = touched.caseType ? allErrors["caseType"] : "";
  const showBusinessEntityError = touched.businessEntityType
    ? allErrors["businessEntityType"]
    : "";
  const showProfessionalTypeError = touched.professionalType
    ? allErrors["professionalType"]
    : "";
  const showPropertyPurchaseTypeError = touched.propertyPurchaseType
    ? allErrors["propertyPurchaseType"]
    : "";

  const providerAmountErrorFor = (provider: string) => {
    if (!touched.providerAmounts) return "";
    const idx = value.providerAmounts.findIndex((x) => x.provider === provider);
    if (idx === -1) return "";
    return allErrors[`providerAmounts.${idx}.amount`] || "";
  };

  // Handlers
  const setLoanAmount = (amt: string) => {
    const next: Step0Values = {
      ...value,
      loanAmount: amt,
      providerAmounts: value.providerAmounts.map((pa) =>
        pa.amount ? pa : { ...pa, amount: amt },
      ),
    };
    onChange(next);
  };

  const handleLoanType = (lt: string) => {
    const cat = getLoanCategory(lt);
    const loanType = String(lt).toLowerCase();
    onChange({
      ...value,
      loanType,
      loanCategory: cat,
      tenure: "",
      businessEntityType:
        loanType === "business loan" ? value.businessEntityType : "",
      professionalType:
        loanType === "professional loan" ? value.professionalType : "",
      propertyPurchaseType:
        loanType === "home loan" ? value.propertyPurchaseType : "",
    });
  };

  const addCustomProviderAndSelect = () => {
    const custom = otherProviderText.trim();
    setTouched((t) => ({ ...t, otherProvider: true }));
    if (!custom) return;

    const selectedProviders = Array.from(
      new Set(
        value.selectedProviders.filter((x) => x !== "Others").concat([custom]),
      ),
    );
    const exists = value.providerAmounts.some((x) => x.provider === custom);

    const providerAmounts = exists
      ? value.providerAmounts
      : [
        ...value.providerAmounts.filter((x) => x.provider !== "Others"),
        { provider: custom, amount: value.loanAmount || "" },
      ];

    onChange({ ...value, selectedProviders, providerAmounts });
    setOtherProviderText("");
    Keyboard.dismiss();
  };

  const toggleProvider = (p: string) => {
    const isSelected = value.selectedProviders.includes(p);

    if (p === "Others" && isSelected) {
      setOtherProviderText("");
      setTouched((t) => ({ ...t, otherProvider: false }));
    }

    const selectedProviders = isSelected
      ? value.selectedProviders.filter((x) => x !== p)
      : [...value.selectedProviders, p];

    const providerAmounts = isSelected
      ? value.providerAmounts.filter((x) => x.provider !== p)
      : [
        ...value.providerAmounts,
        { provider: p, amount: value.loanAmount || "" },
      ];

    onChange({ ...value, selectedProviders, providerAmounts });
    setTouched((t) => ({ ...t, providers: true }));
  };

  const updateProviderAmount = (provider: string, amt: string) => {
    onChange({
      ...value,
      providerAmounts: value.providerAmounts.map((x) =>
        x.provider === provider ? { ...x, amount: amt } : x,
      ),
    });
  };

  const setHasRunningLoans = (v: "yes" | "no") => {
    if (activeExistingLoanIndex === null) return;
    updateLoanRecordField(activeExistingLoanIndex, "hasRunningLoans", v);
  };

  const setWhichLoan = (v: string) => {
    if (activeExistingLoanIndex === null) return;
    updateLoanRecordField(activeExistingLoanIndex, "whichLoan", v);
  };

  const setRunningLoanAmount = (amt: string) => {
    if (activeExistingLoanIndex === null) return;
    updateLoanRecordField(activeExistingLoanIndex, "loanAmount", amt);
  };

  const appendLoanRecord = () => {
    const nextList = [
      ...(value.existingLoans || []),
      { hasRunningLoans: "yes" as const, whichLoan: "", loanAmount: "", runningEmi: "" },
    ];
    onChange({ ...value, existingLoans: nextList });
  };

  const removeLoanRecord = (index: number) => {
    const nextList = (value.existingLoans || []).filter((_, idx) => idx !== index);
    onChange({ ...value, existingLoans: nextList });
  };

  const updateLoanRecordField = (index: number, field: keyof ExistingLoan, val: string) => {
    const nextList = (value.existingLoans || []).map((loan, idx) => {
      if (idx !== index) return loan;
      const updated = { ...loan, [field]: val };
      if (field === "hasRunningLoans" && val === "no") {
        updated.whichLoan = "";
        updated.loanAmount = "";
        updated.runningEmi = "";
      }
      return updated;
    });
    onChange({ ...value, existingLoans: nextList });
  };

  const setCaseType = (v: "fresh" | "top_up") =>
    onChange({ ...value, caseType: v });
  const setBusinessEntityType = (
    v: "sole_proprietorship" | "private_limited" | "partnership",
  ) => onChange({ ...value, businessEntityType: v });

  const loanTypeDisplay = value.loanType
    ? toTitleCase(value.loanType).replace(/Loan/g, loanWord)
    : "";
  const businessEntityDisplay =
    businessEntityOptions.find((x) => x.value === value.businessEntityType)
      ?.label || "";
  const professionalTypeDisplay =
    professionalTypeOptions.find((x) => x.value === value.professionalType)
      ?.label || "";

  return (
    <View
      style={[{ paddingBottom: keyboardSpace ? keyboardSpace - 40 : 0 }, disabled && { opacity: 0.7 }]}
      pointerEvents={disabled ? "none" : "auto"}
    >
      {/* Info Card */}
      {showInfo && (
        <View
          style={{
            backgroundColor: theme.colors.primaryContainer,
            padding: 14,
            borderRadius: 16,
            marginBottom: 24,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Feather
            name="info"
            size={18}
            color={theme.colors.onPrimaryContainer}
            style={{ marginTop: 2 }}
          />
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.colors.onPrimaryContainer,
              lineHeight: 20,
            }}
          >
            {`Enter ${loanWord.toLowerCase()} details`}, choose {`${loanWord.toLowerCase()}`} type/tenure and providers. You can
            customize amount per provider.
          </Text>
          <TouchableOpacity
            onPress={() => setShowInfo(false)}
            activeOpacity={0.7}
            style={{ padding: 4, borderRadius: 999, marginTop: -2 }}
          >
            <Feather
              name="x"
              size={18}
              color={theme.colors.onPrimaryContainer}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Loan Amount */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.onSurface,
          marginBottom: 8,
        }}
      >{`${loanWord} Amount*`}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
          paddingHorizontal: 12,
          marginBottom: 8,
        }}
      >
        <FontAwesome5
          name="rupee-sign"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <TextInput
          value={value.loanAmount}
          onChangeText={setLoanAmount}
          onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
          placeholder={`Base ${loanWord.toLowerCase()} amount (e.g. 500000)`}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          keyboardType="numeric"
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 10,
            color: theme.colors.onSurface,
            fontSize: 15,
          }}
        />
      </View>
      {!!showAmountError && (
        <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
          {showAmountError}
        </Text>
      )}

      {/* Loan Type */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.onSurface,
          marginBottom: 8,
        }}
      >{`${loanWord} Type*`}</Text>
      <TouchableOpacity
        onPress={() => setLoanTypeModalOpen(true)}
        activeOpacity={0.8}
        style={{
          padding: 14,
          borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Feather
          name="briefcase"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            marginLeft: 10,
            color: loanTypeDisplay
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
          }}
        >
          {loanTypeDisplay ? loanTypeDisplay : `Choose ${loanWord.toLowerCase()} type`}
        </Text>
        <View style={{ marginLeft: "auto" }}>
          <Feather
            name="chevron-down"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableOpacity>
      {!!showLoanTypeError && (
        <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
          {showLoanTypeError}
        </Text>
      )}

      {value.loanType === "business loan" && (
        <>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: theme.colors.onSurface,
              marginBottom: 8,
            }}
          >
            Type of Business Entity*
          </Text>
          <TouchableOpacity
            onPress={() => setBusinessEntityModalOpen(true)}
            activeOpacity={0.8}
            style={{
              padding: 14,
              borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather
              name="briefcase"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                marginLeft: 10,
                color: businessEntityDisplay
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
                fontSize: 15,
              }}
            >
              {businessEntityDisplay || "Select entity type"}
            </Text>
            <View style={{ marginLeft: "auto" }}>
              <Feather
                name="chevron-down"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>
          {!!showBusinessEntityError && (
            <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
              {showBusinessEntityError}
            </Text>
          )}
        </>
      )}

      {value.loanType === "professional loan" && (
        <>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: theme.colors.onSurface,
              marginBottom: 8,
            }}
          >
            Type of Professional*
          </Text>
          <TouchableOpacity
            onPress={() => setProfessionalTypeModalOpen(true)}
            activeOpacity={0.8}
            style={{
              padding: 14,
              borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Feather
              name="user"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                marginLeft: 10,
                color: professionalTypeDisplay
                  ? theme.colors.onSurface
                  : theme.colors.onSurfaceVariant,
                fontSize: 15,
              }}
            >
              {professionalTypeDisplay || "Select professional type"}
            </Text>
            <View style={{ marginLeft: "auto" }}>
              <Feather
                name="chevron-down"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>
          {!!showProfessionalTypeError && (
            <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
              {showProfessionalTypeError}
            </Text>
          )}
        </>
      )}

      {value.loanType === "home loan" && (
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              color: theme.colors.onSurface,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            Property Purchase Type <Text style={{ color: theme.colors.error }}>*</Text>
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {propertyPurchaseTypeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  onChange({ ...value, propertyPurchaseType: opt.value as any });
                  setTouched((t) => ({ ...t, propertyPurchaseType: true }));
                }}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor:
                    value.propertyPurchaseType === opt.value
                      ? theme.colors.primary
                      : theme.colors.outlineVariant,
                  backgroundColor:
                    value.propertyPurchaseType === opt.value
                      ? `${theme.colors.primary}15`
                      : theme.colors.surface,
                }}
              >
                <Text
                  style={{
                    color:
                      value.propertyPurchaseType === opt.value
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                    fontWeight: value.propertyPurchaseType === opt.value ? "800" : "600",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {!!showPropertyPurchaseTypeError && (
            <Text style={{ color: "#EF4444", marginTop: 4, fontSize: 12 }}>
              {showPropertyPurchaseTypeError}
            </Text>
          )}
        </View>
      )}

      {/* Tenure */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.onSurface,
          marginBottom: 8,
        }}
      >
        {value.loanCategory
          ? `Tenure (${value.loanCategory === "secured" ? "Long Term" : "Short Term"})*`
          : "Select Tenure*"}
      </Text>
      <TouchableOpacity
        onPress={() => value.loanCategory && setTenureModalOpen(true)}
        disabled={!value.loanCategory}
        style={{
          padding: 14,
          borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
          flexDirection: "row",
          alignItems: "center",
          opacity: value.loanCategory ? 1 : 0.5,
          marginBottom: 8,
        }}
      >
        <Feather name="clock" size={18} color={theme.colors.onSurfaceVariant} />
        <Text
          style={{
            marginLeft: 10,
            color: value.tenure
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
          }}
        >
          {value.tenure ||
            (value.loanCategory ? "Choose tenure" : `Select ${loanWord.toLowerCase()} type first`)}
        </Text>
        <View style={{ marginLeft: "auto" }}>
          <Feather
            name="chevron-down"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableOpacity>
      {!!showTenureError && (
        <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
          {showTenureError}
        </Text>
      )}

      {/* Existing Loans Section */}
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Feather name="credit-card" size={18} color={theme.colors.primary} />
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.colors.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {`Existing ${loanWord}s`}
          </Text>
        </View>

        {(value.existingLoans || []).map((loan, index) => {
          const loanErrPrefix = `existingLoans.${index}`;
          const showHasRunningLoansError = touched[`${loanErrPrefix}.hasRunningLoans`] ? allErrors[`${loanErrPrefix}.hasRunningLoans`] : "";
          const showWhichLoanError = touched[`${loanErrPrefix}.whichLoan`] ? allErrors[`${loanErrPrefix}.whichLoan`] : "";
          const showLoanAmountError = touched[`${loanErrPrefix}.loanAmount`] ? allErrors[`${loanErrPrefix}.loanAmount`] : "";
          const showRunningEmiError = touched[`${loanErrPrefix}.runningEmi`] ? allErrors[`${loanErrPrefix}.runningEmi`] : "";

          return (
            <View
              key={index}
              style={{
                borderWidth: 1.5,
                borderColor: theme.colors.outlineVariant || theme.colors.outline,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                backgroundColor: theme.colors.surfaceVariant || theme.colors.surface,
              }}
            >
              {/* Card Header: Loan Record #1, and Remove button if length > 1 */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <View style={{ backgroundColor: theme.colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.onPrimaryContainer, fontWeight: "600", fontSize: 12 }}>
                    {`${loanWord} Record #${index + 1}`}
                  </Text>
                </View>
                {(value.existingLoans || []).length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeLoanRecord(index)}
                    style={{ padding: 4 }}
                  >
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Has Running Loans Dropdown */}
              <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.onSurface, marginBottom: 8 }}>{config.isReviewMode ? `Running Customer ${loanWord}s*` : `Running Customer ${loanWord}s*`}</Text>
              <TouchableOpacity
                onPress={() => {
                  setActiveExistingLoanIndex(index);
                  setRunningLoanModalOpen(true);
                }}
                activeOpacity={0.8}
                style={{
                  padding: 14,
                  borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Feather name="credit-card" size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={{
                  marginLeft: 10,
                  color: loan.hasRunningLoans ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                  fontSize: 15,
                }}>
                  {loan.hasRunningLoans ? (loan.hasRunningLoans === "yes" ? "Yes" : "No") : "Select option"}
                </Text>
                <View style={{ marginLeft: "auto" }}>
                  <Feather name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
                </View>
              </TouchableOpacity>
              {!!showHasRunningLoansError && (
                <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
                  {showHasRunningLoansError}
                </Text>
              )}

              {/* Conditional Fields: If Yes */}
              {loan.hasRunningLoans === "yes" && (
                <>
                  {/* Which Loan */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.onSurface, marginBottom: 8, marginTop: 8 }}>
                    {`Which ${loanWord}*`}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setActiveExistingLoanIndex(index);
                      setWhichLoanModalOpen(true);
                    }}
                    activeOpacity={0.8}
                    style={{
                      padding: 14,
                      borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Feather name="briefcase" size={18} color={theme.colors.onSurfaceVariant} />
                    <Text style={{
                      marginLeft: 10,
                      color: loan.whichLoan ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                      fontSize: 15,
                    }}>
                      {loan.whichLoan ? toTitleCase(loan.whichLoan).replace(/Loan/g, loanWord) : `Choose ${loanWord.toLowerCase()} type`}
                    </Text>
                    <View style={{ marginLeft: "auto" }}>
                      <Feather name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
                    </View>
                  </TouchableOpacity>
                  {!!showWhichLoanError && (
                    <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
                      {showWhichLoanError}
                    </Text>
                  )}

                  {/* Running Loan Amount */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.onSurface, marginBottom: 8, marginTop: 8 }}>{`Running ${loanWord} Amount*`}</Text>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                  }}>
                    <FontAwesome5 name="rupee-sign" size={18} color={theme.colors.onSurfaceVariant} />
                    <TextInput
                      value={loan.loanAmount || ""}
                      onChangeText={(amt) => updateLoanRecordField(index, "loanAmount", amt)}
                      onBlur={() => setTouched((t) => ({ ...t, [`${loanErrPrefix}.loanAmount`]: true }))}
                      placeholder={`Enter running ${loanWord.toLowerCase()} amount`}
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        color: theme.colors.onSurface,
                        fontSize: 15,
                      }}
                    />
                  </View>
                  {!!showLoanAmountError && (
                    <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
                      {showLoanAmountError}
                    </Text>
                  )}

                  {/* Running EMI */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.colors.onSurface, marginBottom: 8, marginTop: 8 }}>
                    Running EMI (Optional)
                  </Text>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                  }}>
                    <FontAwesome5 name="rupee-sign" size={18} color={theme.colors.onSurfaceVariant} />
                    <TextInput
                      value={loan.runningEmi || ""}
                      onChangeText={(emi) => updateLoanRecordField(index, "runningEmi", emi)}
                      onBlur={() => setTouched((t) => ({ ...t, [`${loanErrPrefix}.runningEmi`]: true }))}
                      placeholder="Enter running EMI"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 10,
                        color: theme.colors.onSurface,
                        fontSize: 15,
                      }}
                    />
                  </View>
                  {!!showRunningEmiError && (
                    <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
                      {showRunningEmiError}
                    </Text>
                  )}
                </>
              )}
            </View>
          );
        })}

        {/* Add Another Loan Record Button */}
        {canAddAnotherLoan && (
          <TouchableOpacity
            onPress={appendLoanRecord}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: theme.colors.primary,
              borderStyle: "dashed",
              backgroundColor: theme.colors.primaryContainer + "10",
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            <Feather name="plus" size={16} color={theme.dark ? "#FFFFFF" : theme.colors.primary} style={{ marginRight: 6 }} />
            <Text style={{ color: theme.dark ? "#FFFFFF" : theme.colors.primary, fontWeight: "700", fontSize: 14 }}>{`Add Another ${loanWord} Record`}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ✅ NEW: Case Type */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.onSurface,
          marginBottom: 8,
        }}
      >
        Case Type*
      </Text>

      <TouchableOpacity
        onPress={() => setCaseTypeModalOpen(true)}
        activeOpacity={0.8}
        style={{
          padding: 14,
          borderRadius: 16, backgroundColor: theme.colors.surfaceVariant,
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Feather
          name="folder"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            marginLeft: 10,
            color: value.caseType
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
          }}
        >
          {value.caseType
            ? value.caseType === "fresh"
              ? "Fresh"
              : "Top Up"
            : "Select case type"}
        </Text>
        <View style={{ marginLeft: "auto" }}>
          <Feather
            name="chevron-down"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
        </View>
      </TouchableOpacity>

      {!!showCaseTypeError && (
        <Text style={{ color: "#EF4444", marginBottom: 12, fontSize: 12 }}>
          {showCaseTypeError}
        </Text>
      )}

      {/* Providers */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "600",
          color: theme.colors.onSurface,
          marginBottom: 8,
          marginTop: 6,
        }}
      >
        {config.isReviewMode ? "Select Partners* (Multiple)" : "Select Providers* (Multiple)"}
      </Text>

      <View
        style={{
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          padding: 12,
          backgroundColor: theme.colors.surface,
        }}
      >
        {/* Let F2 Fintech decide */}
        <TouchableOpacity
          onPress={() => toggleProvider("Let F2 Fintech decide.")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outlineVariant,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: value.selectedProviders.includes("Let F2 Fintech decide.")
                ? theme.colors.primary
                : theme.colors.outline,
              backgroundColor: value.selectedProviders.includes("Let F2 Fintech decide.")
                ? theme.colors.primary
                : "transparent",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            {value.selectedProviders.includes("Let F2 Fintech decide.") && (
              <Feather name="check" size={14} color="#000" />
            )}
          </View>
          <Text style={{ color: theme.colors.onSurface, flex: 1, fontWeight: "600" }}>
            Let F2 Fintech decide.
          </Text>
        </TouchableOpacity>

        {/* Bank / Finance Partner Category — hidden in review mode to avoid bank brand names */}
        {!config.isReviewMode && (
          <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}>
            <TouchableOpacity
              onPress={() => setBankSectionExpanded(!bankSectionExpanded)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="home" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: theme.colors.onSurface, fontWeight: "700" }}>{config.isReviewMode ? "Partner (Bank)" : "Bank"}</Text>
              </View>
              <Feather
                name={bankSectionExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {bankSectionExpanded && (
              <View style={{ paddingLeft: 12, paddingBottom: 10, gap: 10 }}>
                {BANKS.map((p) => {
                  const checked = value.selectedProviders.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => toggleProvider(p)}
                      activeOpacity={0.8}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1.5,
                          borderColor: checked
                            ? theme.colors.primary
                            : theme.colors.outline,
                          backgroundColor: checked
                            ? theme.colors.primary
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 10,
                        }}
                      >
                        {checked && <Feather name="check" size={14} color="#000" />}
                      </View>
                      <Text style={{ color: theme.colors.onSurface }}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

        )}

        {/* NBFC / Finance Company Category — hidden in review mode */}
        {!config.isReviewMode && (
          <View style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}>
            <TouchableOpacity
              onPress={() => setNbfcSectionExpanded(!nbfcSectionExpanded)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="shield" size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: theme.colors.onSurface, fontWeight: "700" }}>{config.isReviewMode ? "Finance Partner" : "NBFC"}</Text>
              </View>
              <Feather
                name={nbfcSectionExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>

            {nbfcSectionExpanded && (
              <View style={{ paddingLeft: 12, paddingBottom: 10, gap: 10 }}>
                {NBFCS.map((p) => {
                  const checked = value.selectedProviders.includes(p);
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => toggleProvider(p)}
                      activeOpacity={0.8}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}
                    >
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          borderWidth: 1.5,
                          borderColor: checked
                            ? theme.colors.primary
                            : theme.colors.outline,
                          backgroundColor: checked
                            ? theme.colors.primary
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 10,
                        }}
                      >
                        {checked && <Feather name="check" size={14} color="#000" />}
                      </View>
                      <Text style={{ color: theme.colors.onSurface }}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

        )}

        {/* Review Mode: Simple generic partner text input instead of bank/NBFC lists */}
        {config.isReviewMode && (
          <View style={{ paddingTop: 10, gap: 12 }}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12, fontStyle: "italic" }}>
              Enter partner name(s) — e.g. Company A, Partner B
            </Text>
          </View>
        )}

        {/* Others */}
        <TouchableOpacity
          onPress={() => toggleProvider("Others")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1.5,
              borderColor: value.selectedProviders.includes("Others")
                ? theme.colors.primary
                : theme.colors.outline,
              backgroundColor: value.selectedProviders.includes("Others")
                ? theme.colors.primary
                : "transparent",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            {value.selectedProviders.includes("Others") && (
              <Feather name="check" size={14} color="#000" />
            )}
          </View>
          <Text style={{ color: theme.colors.onSurface, flex: 1, fontWeight: "600" }}>
            Others
          </Text>
        </TouchableOpacity>
      </View>

      {!!showProvidersError && (
        <Text style={{ color: "#EF4444", marginTop: 8, fontSize: 12 }}>
          {showProvidersError}
        </Text>
      )}

      {/* Others input */}
      {isOthersSelected && (
        <View
          style={{
            marginTop: 12,
            borderWidth: 1.5,
            borderColor: theme.colors.outline,
            borderRadius: 12,
            padding: 12,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text style={{ color: theme.colors.onSurface, fontWeight: "800" }}>
            Specify Provider
          </Text>

          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.outline,
              borderRadius: 12,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <Feather
              name="edit-3"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <TextInput
              value={otherProviderText}
              onChangeText={setOtherProviderText}
              onBlur={() => setTouched((t) => ({ ...t, otherProvider: true }))}
              placeholder="Type provider name"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 10,
                color: theme.colors.onSurface,
                fontSize: 14,
              }}
              returnKeyType="done"
              onSubmitEditing={addCustomProviderAndSelect}
              blurOnSubmit
            />
          </View>

          <TouchableOpacity
            onPress={addCustomProviderAndSelect}
            activeOpacity={0.85}
            style={{
              marginTop: 10,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              opacity: otherProviderText.trim() ? 1 : 0.6,
            }}
            disabled={!otherProviderText.trim()}
          >
            <Text style={{ color: "#000", fontWeight: "900" }}>
              Add Provider
            </Text>
          </TouchableOpacity>

          {touched.otherProvider && !otherProviderText.trim() ? (
            <Text style={{ color: "#EF4444", marginTop: 8, fontSize: 12 }}>
              Please enter provider name.
            </Text>
          ) : null}
        </View>
      )}

      {/* Provider Amounts */}
      {value.selectedProviders.length > 0 && (
        <View
          style={{
            marginTop: 16,
            borderWidth: 1.5,
            borderColor: theme.colors.outline,
            borderRadius: 12,
            padding: 12,
            backgroundColor: theme.colors.surface,
          }}
        >
          <Text
            style={{
              color: theme.colors.onSurface,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Customize Amounts per Provider
          </Text>

          <View style={{ gap: 10 }}>
            {value.selectedProviders
              .filter((p) => p !== "Others")
              .map((provider) => {
                const amt =
                  value.providerAmounts.find((x) => x.provider === provider)
                    ?.amount || value.loanAmount;
                const perErr = providerAmountErrorFor(provider);

                return (
                  <View key={provider}>
                    <View
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        backgroundColor: theme.colors.surfaceVariant,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.onSurface,
                          fontWeight: "700",
                        }}
                      >
                        {provider}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: theme.colors.primary,
                          }}
                        >
                          <Text
                            style={{
                              color: theme.colors.primary,
                              fontWeight: "800",
                            }}
                          >
                            ₹{amt || "Not set"}
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => {
                            setEditingProvider(provider);
                            setAmountDialogOpen(true);
                            setTouched((t) => ({
                              ...t,
                              providerAmounts: true,
                            }));
                          }}
                          style={{ padding: 6 }}
                        >
                          <Feather
                            name="edit-2"
                            size={16}
                            color={theme.colors.onSurface}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {!!perErr && (
                      <Text
                        style={{ color: "#EF4444", marginTop: 6, fontSize: 12 }}
                      >
                        {perErr}
                      </Text>
                    )}
                  </View>
                );
              })}
          </View>
        </View>
      )}

      {/* ------------------- MODALS ------------------- */}

      {/* Loan Type Modal */}
      <Modal visible={loanTypeModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >{`Choose ${loanWord} Type`}</Text>
              <TouchableOpacity
                onPress={() => {
                  setLoanTypeModalOpen(false);
                  setTouched((t) => ({ ...t, loanType: true }));
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ✅ Unsecured Loans (TOP) */}
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginBottom: 6,
                }}
              >{`Unsecured ${loanWord}s`}</Text>

              {loanTypeOptions.unsecured.map((x) => (
                <TouchableOpacity
                  key={x.value}
                  onPress={() => {
                    handleLoanType(x.value);
                    setLoanTypeModalOpen(false);
                    setTouched((t) => ({ ...t, loanType: true }));
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>
                    {x.label}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* ✅ Secured Loans (BOTTOM) */}
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginTop: 16,
                  marginBottom: 6,
                }}
              >{`Secured ${loanWord}s`}</Text>

              {loanTypeOptions.secured.map((x) => (
                <TouchableOpacity
                  key={x.value}
                  onPress={() => {
                    handleLoanType(x.value);
                    setLoanTypeModalOpen(false);
                    setTouched((t) => ({ ...t, loanType: true }));
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>
                    {x.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Business Entity Modal */}
      <Modal
        visible={businessEntityModalOpen}
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "45%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Type of Business Entity
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setBusinessEntityModalOpen(false);
                  setTouched((t) => ({ ...t, businessEntityType: true }));
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            {businessEntityOptions.map((x) => (
              <TouchableOpacity
                key={x.value}
                onPress={() => {
                  setBusinessEntityType(x.value as any);
                  setBusinessEntityModalOpen(false);
                  setTouched((t) => ({ ...t, businessEntityType: true }));
                }}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outlineVariant,
                }}
              >
                <Text style={{ color: theme.colors.onSurface }}>{x.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Tenure Modal */}
      <Modal visible={tenureModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "60%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Choose Tenure
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTenureModalOpen(false);
                  setTouched((t) => ({ ...t, tenure: true }));
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {tenureList.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    onChange({ ...value, tenure: t });
                    setTenureModalOpen(false);
                    setTouched((tx) => ({ ...tx, tenure: true }));
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Provider Amount Edit Modal */}
      <Modal visible={amountDialogOpen} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.65)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: theme.colors.onSurface,
                fontWeight: "900",
                fontSize: 16,
              }}
            >
              Set Amount for {editingProvider || ""}
            </Text>

            <View
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderRadius: 12,
                paddingHorizontal: 12,
              }}
            >
              <FontAwesome5
                name="rupee-sign"
                size={18}
                color={theme.colors.onSurfaceVariant}
              />
              <TextInput
                value={
                  value.providerAmounts.find(
                    (x) => x.provider === editingProvider,
                  )?.amount || value.loanAmount
                }
                onChangeText={(v) => {
                  if (!editingProvider) return;
                  updateProviderAmount(editingProvider, v);
                }}
                onBlur={() =>
                  setTouched((t) => ({ ...t, providerAmounts: true }))
                }
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  color: theme.colors.onSurface,
                  fontSize: 15,
                }}
              />
            </View>

            {!!editingProvider && !!providerAmountErrorFor(editingProvider) && (
              <Text style={{ color: "#EF4444", marginTop: 8, fontSize: 12 }}>
                {providerAmountErrorFor(editingProvider)}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => setAmountDialogOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: theme.colors.onSurface, fontWeight: "800" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAmountDialogOpen(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primary,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "900" }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW: Lead Type Modal */}
      <Modal visible={leadTypeModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "60%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Select Lead Type
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setLeadTypeModalOpen(false);
                  setTouched((t) => ({ ...t, leadType: true }));
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NEW: Running Loan Yes/No Modal */}
      <Modal visible={runningLoanModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "40%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                {`Running Customer ${loanWord}s`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setRunningLoanModalOpen(false);
                  if (activeExistingLoanIndex !== null) {
                    setTouched((t) => ({ ...t, [`existingLoans.${activeExistingLoanIndex}.hasRunningLoans`]: true }));
                  }
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            {(["yes", "no"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setHasRunningLoans(opt);
                  setRunningLoanModalOpen(false);
                  if (activeExistingLoanIndex !== null) {
                    setTouched((t) => ({ ...t, [`existingLoans.${activeExistingLoanIndex}.hasRunningLoans`]: true }));
                  }
                }}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outlineVariant,
                }}
              >
                <Text style={{ color: theme.colors.onSurface }}>
                  {opt === "yes" ? "Yes" : "No"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ✅ NEW: Which Loan Modal */}
      <Modal visible={whichLoanModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >{`Choose ${loanWord} Type`}</Text>
              <TouchableOpacity
                onPress={() => {
                  setWhichLoanModalOpen(false);
                  if (activeExistingLoanIndex !== null) {
                    setTouched((t) => ({ ...t, [`existingLoans.${activeExistingLoanIndex}.whichLoan`]: true }));
                  }
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginBottom: 6,
                }}
              >{`Secured ${loanWord}s`}</Text>
              {loanTypeOptions.secured.map((x) => (
                <TouchableOpacity
                  key={x.value}
                  onPress={() => {
                    setWhichLoan(x.value);
                    setWhichLoanModalOpen(false);
                    if (activeExistingLoanIndex !== null) {
                      setTouched((t) => ({ ...t, [`existingLoans.${activeExistingLoanIndex}.whichLoan`]: true }));
                    }
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>
                    {x.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginTop: 16,
                  marginBottom: 6,
                }}
              >{`Unsecured ${loanWord}s`}</Text>
              {loanTypeOptions.unsecured.map((x) => (
                <TouchableOpacity
                  key={x.value}
                  onPress={() => {
                    setWhichLoan(x.value);
                    setWhichLoanModalOpen(false);
                    if (activeExistingLoanIndex !== null) {
                      setTouched((t) => ({ ...t, [`existingLoans.${activeExistingLoanIndex}.whichLoan`]: true }));
                    }
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text style={{ color: theme.colors.onSurface }}>
                    {x.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NEW: Case Type Modal */}
      <Modal visible={caseTypeModalOpen} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              maxHeight: "40%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Select Case Type
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCaseTypeModalOpen(false);
                  setTouched((t) => ({ ...t, caseType: true }));
                }}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            {caseTypeOptions.map((x) => (
              <TouchableOpacity
                key={x.value}
                onPress={() => {
                  setCaseType(x.value as any);
                  setCaseTypeModalOpen(false);
                  setTouched((t) => ({ ...t, caseType: true }));
                }}
                style={{
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.outlineVariant,
                }}
              >
                <Text style={{ color: theme.colors.onSurface }}>{x.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      {/* NEW: Professional Type Modal */}
      <Modal visible={professionalTypeModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: theme.colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: "40%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: theme.colors.onSurface, fontWeight: "900", fontSize: 16 }}>
                Select Professional Type
              </Text>
              <TouchableOpacity onPress={() => { setProfessionalTypeModalOpen(false); setTouched(t => ({ ...t, professionalType: true })); }} style={{ padding: 6 }}>
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
            {professionalTypeOptions.map((x) => (
              <TouchableOpacity key={x.value} onPress={() => {
                onChange({ ...value, professionalType: x.value as any });
                setProfessionalTypeModalOpen(false);
                setTouched(t => ({ ...t, professionalType: true }));
              }} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.colors.outlineVariant }}>
                <Text style={{ color: theme.colors.onSurface }}>{x.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
