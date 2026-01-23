import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useMemo, useState } from "react";

import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";

import { step1Schema } from "../applicationSchemas";

export type Step1Values = {
  title: "" | "Mr" | "Mrs" | "Miss" | "Dr" | "Ca";
  name: string;
  contact: string;
  email: string;
  pan: string;

  father_name: string;
  mother_name: string;

  working_address: string;
  permanent_address: string;
  current_address: string;

  city: string;
  state: string;

  employment_type: "" | "salaried" | "business" | "professional";

  dob?: string; // ISO string
  consent_tc: boolean;
  consent_marketing: boolean;
};

type Props = {
  value: Step1Values;
  onChange: (next: Step1Values) => void;
  onValidityChange?: (isValid: boolean) => void;
};

const TITLE_OPTIONS: Step1Values["title"][] = ["Mr", "Mrs", "Miss", "Dr", "Ca"];
const EMPLOYMENT_OPTIONS: Step1Values["employment_type"][] = [
  "salaried",
  "business",
  "professional",
];

const formatDateLabel = (dobISO?: string) => {
  if (!dobISO) return "Select date";
  const d = new Date(dobISO);
  if (Number.isNaN(d.getTime())) return "Select date";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// RN-friendly error mapping (zod -> { field: message })
const toFieldErrors = (issues: any[]) => {
  const out: Record<string, string> = {};
  for (const issue of issues || []) {
    const key = String(issue?.path?.[0] ?? "");
    if (!key) continue;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

export default function Step1BasicDetails({
  value,
  onChange,
  onValidityChange,
}: Props) {
  const theme = useTheme();

  const [titleModal, setTitleModal] = useState(false);
  const [empModal, setEmpModal] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  //  touched flags (so error doesn't show initially)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  //  all raw errors from zod (always computed, but shown only if touched)
  const [rawErrors, setRawErrors] = useState<Record<string, string>>({});

  const markTouched = (key: string) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  //  Convert current Step1Values -> schema input (website rules)
  const schemaInput = useMemo(() => {
    return {
      title: value.title || undefined,
      name: value.name ?? "",
      email: value.email ?? "",
      contact: value.contact ?? "",
      pan: (value.pan ?? "").toUpperCase(),
      father_name: value.father_name ?? "",
      mother_name: value.mother_name ?? "",
      working_address: value.working_address ?? "",
      permanent_address: value.permanent_address ?? "",
      current_address: value.current_address ?? "",
      city: value.city ?? "",
      state: value.state ?? "",
      employment_type: value.employment_type || undefined,
      dob: value.dob ? new Date(value.dob) : undefined, //  schema expects Date
      // NOTE: website schema doesn't include consent fields, so we don't validate them here.
    };
  }, [value]);

  //  Validate using global schema
  useEffect(() => {
    const res = step1Schema.safeParse(schemaInput);

    if (res.success) {
      setRawErrors({});
      onValidityChange?.(true);
      return;
    }

    const fieldErrors = toFieldErrors(res.error.issues);
    setRawErrors(fieldErrors);
    onValidityChange?.(false);
  }, [schemaInput, onValidityChange]);

  // Only show errors if that field is touched
  const errorFor = (key: string) => (touched[key] ? rawErrors[key] : "");

  const fieldLabel = (txt: string) => (
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: theme.colors.onSurface,
        marginBottom: 8,
      }}
    >
      {txt}
    </Text>
  );

  const errorText = (msg?: string) =>
    msg ? (
      <Text style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>
        {msg}
      </Text>
    ) : null;

  const input = (
    key: string,
    label: string,
    val: string,
    onText: (v: string) => void,
    placeholder: string,
    opts?: {
      keyboardType?: any;
      autoCapitalize?: any;
      maxLength?: number;
    },
  ) => (
    <View style={{ marginBottom: 16 }}>
      {fieldLabel(label)}
      <TextInput
        value={val}
        onChangeText={onText}
        onBlur={() => markTouched(key)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        keyboardType={opts?.keyboardType}
        autoCapitalize={opts?.autoCapitalize}
        maxLength={opts?.maxLength}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: errorFor(key) ? "#EF4444" : theme.colors.outline,
          borderRadius: 12,
          fontSize: 15,
          color: theme.colors.onSurface,
          backgroundColor: theme.colors.surface,
        }}
      />
      {errorText(errorFor(key))}
    </View>
  );

  const pickRow = (
    key: string,
    label: string,
    valueLabel: string,
    onPress: () => void,
  ) => (
    <View style={{ marginBottom: 16 }}>
      {fieldLabel(label)}
      <TouchableOpacity
        onPress={() => {
          markTouched(key);
          onPress();
        }}
        activeOpacity={0.85}
        style={{
          padding: 14,
          borderWidth: 1.5,
          borderColor: errorFor(key) ? "#EF4444" : theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            flex: 1,
            color: valueLabel
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
            fontWeight: "600",
          }}
        >
          {valueLabel || "Select"}
        </Text>
        <Feather
          name="chevron-down"
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
      </TouchableOpacity>
      {errorText(errorFor(key))}
    </View>
  );

  const checkboxRow = (
    key: string,
    checked: boolean,
    onToggle: () => void,
    text: string,
  ) => (
    <View style={{ marginTop: 10 }}>
      <TouchableOpacity
        onPress={() => {
          markTouched(key);
          onToggle();
        }}
        activeOpacity={0.85}
        style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            borderWidth: 1.5,
            borderColor: checked ? theme.colors.primary : theme.colors.outline,
            backgroundColor: checked ? theme.colors.primary : "transparent",
            marginTop: 2,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {checked && <Feather name="check" size={14} color="#000" />}
        </View>

        <Text
          style={{
            flex: 1,
            color: theme.colors.onSurface,
            fontSize: 12.5,
            lineHeight: 18,
          }}
        >
          {text}
        </Text>
      </TouchableOpacity>

      {/* currently website schema doesn't validate these two.
          If you later add them to zod, error will auto show via errorFor(key). */}
      {errorText(errorFor(key))}
    </View>
  );

  const set = (patch: Partial<Step1Values>) => onChange({ ...value, ...patch });
  const [showUserInfo, setShowUserInfo] = useState(true);

  const onDobChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowDobPicker(false);
    if (event?.type === "dismissed") return;

    if (selectedDate) {
      set({ dob: selectedDate.toISOString() });
      markTouched("dob");
    }
  };

  return (
    <View>
      {showUserInfo && (
        <View
          style={{
            backgroundColor: theme.colors.secondaryContainer,
            padding: 14,
            borderRadius: 16,
            marginBottom: 24,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* icon */}
          <Feather
            name="user"
            size={18}
            color={theme.colors.onSecondaryContainer}
            style={{ marginTop: 2 }}
          />

          {/* text */}
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.colors.onSecondaryContainer,
              lineHeight: 20,
            }}
          >
            Fill customer personal & contact details. Minimum age: 20 years.
          </Text>

          {/* close button */}
          <TouchableOpacity
            onPress={() => setShowUserInfo(false)}
            activeOpacity={0.7}
            style={{
              padding: 4,
              borderRadius: 999,
              marginTop: -2,
            }}
          >
            <Feather
              name="x"
              size={18}
              color={theme.colors.onSecondaryContainer}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Title + Name */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          {pickRow("title", "Title*", value.title, () => setTitleModal(true))}
        </View>

        <View style={{ flex: 2 }}>
          {input(
            "name",
            "Full Name*",
            value.name,
            (v) => set({ name: v }),
            "Enter full name",
            { autoCapitalize: "words" },
          )}
        </View>
      </View>

      {/* Contact + Email */}
      {input(
        "contact",
        "Contact Number*",
        value.contact,
        (v) => set({ contact: v }),
        "Enter contact number",
        { keyboardType: "phone-pad" },
      )}

      {input(
        "email",
        "Email*",
        value.email,
        (v) => set({ email: v }),
        "Enter email address",
        { keyboardType: "email-address", autoCapitalize: "none" },
      )}

      {/* PAN */}
      {input(
        "pan",
        "PAN Card*",
        value.pan,
        (v) => set({ pan: v.toUpperCase() }),
        "ABCDE1234F",
        { autoCapitalize: "characters", maxLength: 10 },
      )}

      {/* Father + Mother */}
      {input(
        "father_name",
        "Father's Name*",
        value.father_name,
        (v) => set({ father_name: v }),
        "Enter father's name",
        { autoCapitalize: "words" },
      )}

      {input(
        "mother_name",
        "Mother's Name*",
        value.mother_name,
        (v) => set({ mother_name: v }),
        "Enter mother's name",
        { autoCapitalize: "words" },
      )}

      {/* Addresses */}
      {input(
        "working_address",
        "Working Address*",
        value.working_address,
        (v) => set({ working_address: v }),
        "Enter working address",
        { autoCapitalize: "sentences" },
      )}

      {input(
        "permanent_address",
        "Permanent Address*",
        value.permanent_address,
        (v) => set({ permanent_address: v }),
        "Enter permanent address",
        { autoCapitalize: "sentences" },
      )}

      {input(
        "current_address",
        "Current Address*",
        value.current_address,
        (v) => set({ current_address: v }),
        "Enter current address",
        { autoCapitalize: "sentences" },
      )}

      {/* City + State */}
      {input(
        "city",
        "City*",
        value.city,
        (v) => set({ city: v }),
        "Enter city",
        {
          autoCapitalize: "words",
        },
      )}

      {input(
        "state",
        "State*",
        value.state,
        (v) => set({ state: v }),
        "Enter state",
        { autoCapitalize: "words" },
      )}

      {/* Employment Type */}
      {pickRow(
        "employment_type",
        "Employment Type*",
        value.employment_type ? value.employment_type : "",
        () => setEmpModal(true),
      )}

      {/* DOB */}
      <View style={{ marginBottom: 16 }}>
        {fieldLabel("Date of Birth*")}
        <TouchableOpacity
          onPress={() => {
            markTouched("dob");
            setShowDobPicker(true);
          }}
          activeOpacity={0.85}
          style={{
            padding: 14,
            borderWidth: 1.5,
            borderColor: errorFor("dob") ? "#EF4444" : theme.colors.outline,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Feather
            name="calendar"
            size={18}
            color={theme.colors.onSurfaceVariant}
          />
          <Text
            style={{
              color: value.dob
                ? theme.colors.onSurface
                : theme.colors.onSurfaceVariant,
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {formatDateLabel(value.dob)}
          </Text>
        </TouchableOpacity>

        {errorText(errorFor("dob"))}

        <Text
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 11,
            marginTop: 6,
          }}
        >
          Minimum age 20 required
        </Text>

        {showDobPicker && (
          <DateTimePicker
            value={value.dob ? new Date(value.dob) : new Date(2000, 0, 1)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={new Date()}
            onChange={onDobChange}
          />
        )}

        {Platform.OS === "ios" && showDobPicker && (
          <TouchableOpacity
            onPress={() => setShowDobPicker(false)}
            style={{
              marginTop: 10,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#000", fontWeight: "900" }}>Done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Terms (not in web schema; kept as-is) */}
      <View style={{ marginTop: 8 }}>
        {checkboxRow(
          "consent_tc",
          value.consent_tc,
          () => set({ consent_tc: !value.consent_tc }),
          "I agree to opt for the product and service of F2fintech. By opting for F2fintech, I agree to have read, understood and explicitly consent to the T&C, Privacy Policy and F2fintech Credit Terms.",
        )}

        {checkboxRow(
          "consent_marketing",
          value.consent_marketing,
          () => set({ consent_marketing: !value.consent_marketing }),
          "I further consent to receive the loan and product updates of F2fintech on WhatsApp and allow F2fintech and/or their authorized third party service providers to contact me for marketing purposes via SMS, Call, WhatsApp, and Email.",
        )}
      </View>

      {/* Title Modal */}
      <Modal visible={titleModal} transparent animationType="slide">
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
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Select Title
              </Text>
              <TouchableOpacity
                onPress={() => setTitleModal(false)}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 10 }}>
              {TITLE_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    set({ title: t });
                    markTouched("title");
                    setTitleModal(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text
                    style={{ color: theme.colors.onSurface, fontWeight: "700" }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Employment Modal */}
      <Modal visible={empModal} transparent animationType="slide">
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
              }}
            >
              <Text
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: "900",
                  fontSize: 16,
                }}
              >
                Select Employment Type
              </Text>
              <TouchableOpacity
                onPress={() => setEmpModal(false)}
                style={{ padding: 6 }}
              >
                <Feather name="x" size={20} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ marginTop: 10 }}>
              {EMPLOYMENT_OPTIONS.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    set({ employment_type: t });
                    markTouched("employment_type");
                    setEmpModal(false);
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.outlineVariant,
                  }}
                >
                  <Text
                    style={{ color: theme.colors.onSurface, fontWeight: "700" }}
                  >
                    {t === "salaried"
                      ? "Salaried"
                      : t === "business"
                        ? "Business"
                        : "Professional"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
