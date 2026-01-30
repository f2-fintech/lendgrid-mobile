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

const loanTypes = {
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

// helper: "home loan" => "Home Loan"
const toTitleCase = (s: string) =>
  String(s || "")
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");

export type Step0Values = {
  loanAmount: string;
  loanType: string;
  loanCategory: "secured" | "unsecured" | "";
  tenure: string;
  selectedProviders: string[];
  providerAmounts: ProviderAmount[];
};

type Props = {
  value: Step0Values;
  onChange: (next: Step0Values) => void;
  providers?: string[];
  onValidityChange?: (isValid: boolean) => void;
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
}: Props) {
  const theme = useTheme();

  // keyboard padding fix
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

  // add Others
  const PROVIDERS = useMemo(() => {
    const base = providers?.length
      ? providers
      : [
          "ABFL",
          "Bajaj Finance",
          "Bajaj Market",
          "L&T",
          "Tata",
          "Godrej",
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

  const [loanTypeModalOpen, setLoanTypeModalOpen] = useState(false);
  const [tenureModalOpen, setTenureModalOpen] = useState(false);

  const [amountDialogOpen, setAmountDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  const [showInfo, setShowInfo] = useState(true);

  // Others provider support
  const [otherProviderText, setOtherProviderText] = useState("");
  const isOthersSelected = value.selectedProviders.includes("Others");

  // store all validation errors (BUT show only after blur/touch)
  const [allErrors, setAllErrors] = useState<Record<string, string>>({});

  // touched state
  const [touched, setTouched] = useState({
    amount: false,
    loanType: false,
    tenure: false,
    providers: false,
    providerAmounts: false,
    otherProvider: false,
  });

  const tenureList = useMemo(() => {
    return value.loanCategory ? tenureOptions[value.loanCategory] : [];
  }, [value.loanCategory]);

  // validate whenever value changes (rules from imported step0Schema)
  useEffect(() => {
    const payload = {
      amount: value.loanAmount,
      loanType: value.loanType,
      tenure: value.tenure,
      providers: value.selectedProviders,
      providerAmounts: value.providerAmounts,
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
  ]);

  // show errors only when touched
  const showAmountError = touched.amount ? allErrors["amount"] : "";
  const showLoanTypeError = touched.loanType ? allErrors["loanType"] : "";
  const showTenureError = touched.tenure ? allErrors["tenure"] : "";
  const showProvidersError = touched.providers ? allErrors["providers"] : "";

  const providerAmountErrorFor = (provider: string) => {
    if (!touched.providerAmounts) return "";
    const idx = value.providerAmounts.findIndex((x) => x.provider === provider);
    if (idx === -1) return "";
    return allErrors[`providerAmounts.${idx}.amount`] || "";
  };

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
    onChange({
      ...value,
      loanType: String(lt).toLowerCase(),
      loanCategory: cat,
      tenure: "",
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

  const loanTypeDisplay = value.loanType ? toTitleCase(value.loanType) : "";

  return (
    <View style={{ paddingBottom: keyboardSpace ? keyboardSpace - 40 : 0 }}>
      {/* info card */}
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
            Enter loan details, choose loan type/tenure and providers. You can
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
      >
        Loan Amount*
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
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
          placeholder="Base loan amount (e.g. 500000)"
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
      >
        Loan Type*
      </Text>

      <TouchableOpacity
        onPress={() => setLoanTypeModalOpen(true)}
        activeOpacity={0.8}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
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
          {loanTypeDisplay ? loanTypeDisplay : "Choose loan type"}
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
        activeOpacity={0.8}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
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
          {value.tenure
            ? value.tenure
            : value.loanCategory
              ? "Choose tenure"
              : "Select loan type first"}
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
        Select Providers* (Multiple)
      </Text>

      <View
        style={{
          borderWidth: 1.5,
          borderColor: theme.colors.outline,
          borderRadius: 12,
          padding: 12,
          backgroundColor: theme.colors.surface,
          gap: 10,
        }}
      >
        {PROVIDERS.map((p) => {
          const checked = value.selectedProviders.includes(p);
          return (
            <TouchableOpacity
              key={p}
              onPress={() => toggleProvider(p)}
              activeOpacity={0.8}
              style={{ flexDirection: "row", alignItems: "center" }}
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
              <Text style={{ color: theme.colors.onSurface, flex: 1 }}>
                {p}
              </Text>
            </TouchableOpacity>
          );
        })}
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
              placeholder="Type provider name (e.g. SBI, AU Small Finance...)"
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
              //  helps on iOS a bit
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
              .filter((p) => p !== "Others") // don't show amounts for placeholder "Others"
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
              >
                Choose Loan Type
              </Text>
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

            <ScrollView>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginBottom: 6,
                }}
              >
                Secured Loans
              </Text>

              {loanTypes.secured.map((x) => (
                <TouchableOpacity
                  key={x.value}
                  onPress={() => {
                    handleLoanType(x.value); // stored lowercase
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

              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: "900",
                  marginTop: 16,
                  marginBottom: 6,
                }}
              >
                Unsecured Loans
              </Text>

              {loanTypes.unsecured.map((x) => (
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
    </View>
  );
}
