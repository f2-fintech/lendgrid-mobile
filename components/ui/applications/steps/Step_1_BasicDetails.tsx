import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Constants from "expo-constants";
import { useEffect, useMemo, useState } from "react";
import {
  Linking,
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
import IndianStatePicker from "./CommonDetails";

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

  dob?: string;
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

//  DOB max date = today - 20 years
const getMaxDobDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 20);
  // keep time stable
  d.setHours(0, 0, 0, 0);
  return d;
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

  //  pressed states for fade effect on link buttons
  const [privacyPressed, setPrivacyPressed] = useState(false);
  const [termsPressed, setTermsPressed] = useState(false);

  // touched flags (so error doesn't show initially)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // all raw errors from zod (always computed, but shown only if touched)
  const [rawErrors, setRawErrors] = useState<Record<string, string>>({});

  const markTouched = (key: string) =>
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));

  // Convert current Step1Values -> schema input (website rules)
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
      dob: value.dob ? new Date(value.dob) : undefined, // schema expects Date
    };
  }, [value]);

  // Validate using global schema
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
    iconName: any,
    opts?: {
      keyboardType?: any;
      autoCapitalize?: any;
      maxLength?: number;
    },
  ) => (
    <View style={{ marginBottom: 16 }}>
      {fieldLabel(label)}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 16,
          borderWidth: errorFor(key) ? 1 : 0,
          borderColor: errorFor(key) ? "#EF4444" : "transparent",
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceVariant,
        }}
      >
        <Feather
          name={iconName}
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
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
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 4,
            fontSize: 15,
            color: theme.colors.onSurface,
            backgroundColor: "transparent",
          }}
        />
      </View>
      {errorText(errorFor(key))}
    </View>
  );

  const pickRow = (
    key: string,
    label: string,
    valueLabel: string,
    onPress: () => void,
    iconName: any,
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
          padding: 16,
          borderWidth: errorFor(key) ? 1 : 0,
          borderColor: errorFor(key) ? "#EF4444" : "transparent",
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceVariant,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Feather
          name={iconName}
          size={18}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          style={{
            flex: 1,
            color: valueLabel
              ? theme.colors.onSurface
              : theme.colors.onSurfaceVariant,
            fontSize: 15,
            fontWeight: "600",
          }}
          numberOfLines={1}
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
    rightLinkLabel: string,
    onLinkPress: () => void,
    pressed: boolean,
    setPressed: (v: boolean) => void,
  ) => (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <TouchableOpacity
          onPress={() => {
            markTouched(key);
            onToggle();
          }}
          activeOpacity={0.85}
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
              backgroundColor: checked ? theme.colors.primary : "transparent",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {checked && <Feather name="check" size={14} color="#000" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            setPressed(true);
            onLinkPress();
            setTimeout(() => setPressed(false), 350);
          }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: "900",
              textDecorationLine: "underline",
              opacity: pressed ? 0.65 : 1,
            }}
          >
            {rightLinkLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {errorText(errorFor(key))}
    </View>
  );

  const set = (patch: Partial<Step1Values>) => onChange({ ...value, ...patch });

  const [showUserInfo, setShowUserInfo] = useState(true);

  const onDobChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowDobPicker(false);
    if (event?.type === "dismissed") return;

    if (selectedDate) {
      const maxDob = getMaxDobDate();
      const finalDate = selectedDate > maxDob ? maxDob : selectedDate; // ✅ clamp

      set({ dob: finalDate.toISOString() });
      markTouched("dob");
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      // ignore
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
          <Feather
            name="user"
            size={18}
            color={theme.colors.onSecondaryContainer}
            style={{ marginTop: 2 }}
          />

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
          {pickRow(
            "title",
            "Title*",
            value.title,
            () => setTitleModal(true),
            "user",
          )}
        </View>

        <View style={{ flex: 2 }}>
          {input(
            "name",
            "Full Name*",
            value.name,
            (v) => set({ name: v }),
            "Enter full name",
            "user",
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
        "phone",
        { keyboardType: "phone-pad" },
      )}

      {input(
        "email",
        "Email*",
        value.email,
        (v) => set({ email: v }),
        "Enter email address",
        "mail",
        { keyboardType: "email-address", autoCapitalize: "none" },
      )}

      {/* PAN */}
      {input(
        "pan",
        "PAN Card*",
        value.pan,
        (v) => set({ pan: v.toUpperCase() }),
        "ABCDE1234F",
        "credit-card",
        { autoCapitalize: "characters", maxLength: 10 },
      )}

      {/* Father + Mother */}
      {input(
        "father_name",
        "Father's Name*",
        value.father_name,
        (v) => set({ father_name: v }),
        "Enter father's name",
        "users",
        { autoCapitalize: "words" },
      )}

      {input(
        "mother_name",
        "Mother's Name*",
        value.mother_name,
        (v) => set({ mother_name: v }),
        "Enter mother's name",
        "users",
        { autoCapitalize: "words" },
      )}

      {/* Addresses */}
      {input(
        "working_address",
        "Working Address*",
        value.working_address,
        (v) => set({ working_address: v }),
        "Enter working address",
        "briefcase",
        { autoCapitalize: "sentences" },
      )}

      {input(
        "permanent_address",
        "Permanent Address*",
        value.permanent_address,
        (v) => set({ permanent_address: v }),
        "Enter permanent address",
        "home",
        { autoCapitalize: "sentences" },
      )}

      {input(
        "current_address",
        "Current Address*",
        value.current_address,
        (v) => set({ current_address: v }),
        "Enter current address",
        "map-pin",
        { autoCapitalize: "sentences" },
      )}

      {/* City */}
      {input(
        "city",
        "City*",
        value.city,
        (v) => set({ city: v }),
        "Enter city",
        "map",
        { autoCapitalize: "words" },
      )}

      {/* State dropdown (rendered ONLY ONCE) */}
      <IndianStatePicker
        label="State*"
        value={value.state}
        placeholder="Search and select state"
        error={errorFor("state")}
        onTouched={() => markTouched("state")}
        onSelect={(s) => set({ state: s })}
      />

      {/* Employment Type */}
      {pickRow(
        "employment_type",
        "Employment Type*",
        value.employment_type ? value.employment_type : "",
        () => setEmpModal(true),
        "activity",
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
            value={value.dob ? new Date(value.dob) : getMaxDobDate()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            maximumDate={getMaxDobDate()} // ✅ blocks selecting < 20
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

      {/* ONLY link buttons next to checkboxes (no long text) */}
      {checkboxRow(
        "consent_tc",
        value.consent_tc,
        () => set({ consent_tc: !value.consent_tc }),
        "Privacy Policy",
        () =>
          openLink(
            Constants.expoConfig?.extra?.PRIVACY_URL ||
              "https://lendgrid.in/privacy-policy",
          ),
        privacyPressed,
        setPrivacyPressed,
      )}

      {checkboxRow(
        "consent_marketing",
        value.consent_marketing,
        () => set({ consent_marketing: !value.consent_marketing }),
        "Terms of Service",
        () =>
          openLink(
            Constants.expoConfig?.extra?.TERMS_URL ||
              "https://lendgrid.in/terms-of-service",
          ),
        termsPressed,
        setTermsPressed,
      )}

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
