import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { step4Schema } from "../applicationSchemas";
import type { PickedFile } from "./Step_2_Statement";

export type Step4Values = {
  salary: string;
  totalExperience: string;
  existingEmi: string;
  existingLiability: string;
};

type Props = {
  value: Step4Values;
  onChange: (v: Step4Values) => void;
  onValidityChange?: (valid: boolean) => void;
  customerId?: string | null;
  disabled?: boolean;
};



const toFieldErrors = (issues: any[]) => {
  const out: Record<string, string> = {};
  for (const issue of issues || []) {
    const key = String(issue?.path?.[0] ?? "");
    if (!key) continue;
    if (!out[key]) out[key] = issue.message;
  }
  return out;
};

export default function Step4AdditionalDetails({
  value,
  onChange,
  onValidityChange,
  disabled,
}: Props) {
  const theme = useTheme();
  const [local, setLocal] = useState<Step4Values>(value);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: string) =>
    setTouched((prev) => (prev[k] ? prev : { ...prev, [k]: true }));

  useEffect(() => setLocal(value), [value]);

  const schemaInput = useMemo(
    () => ({
      salary: local.salary ?? "",
      total_experience: local.totalExperience ?? "",
      existing_emi: local.existingEmi || undefined,
      existing_liability: local.existingLiability || undefined,
    }),
    [local],
  );

  const parsed = useMemo(
    () => step4Schema.safeParse(schemaInput),
    [schemaInput],
  );
  const errors = useMemo(
    () => (parsed.success ? {} : toFieldErrors(parsed.error.issues)),
    [parsed],
  );
  const valid = parsed.success;

  useEffect(() => onValidityChange?.(valid), [valid, onValidityChange]);

  const errorFor = (k: string) => (touched[k] ? (errors as any)[k] : "");

  const setField = (k: keyof Step4Values, v: any) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onChange(next);
  };

  const input = (
    key: "salary" | "existing_emi" | "existing_liability" | "totalExperience",
    label: string,
    val: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    required?: boolean,
  ) => (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          color: theme.colors.onSurface,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {label}{" "}
        {required && <Text style={{ color: theme.colors.error }}>*</Text>}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          borderWidth: errorFor(key) ? 1 : 0,
          borderColor: errorFor(key) ? "#EF4444" : "transparent",
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceVariant,
        }}
      >
        <Text style={{ color: theme.colors.onSurfaceVariant, marginRight: 8 }}>
          ₹
        </Text>
        <TextInput
          value={val}
          onChangeText={onChangeText}
          onBlur={() => markTouched(key)}
          keyboardType="numeric"
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          style={{
            flex: 1,
            paddingVertical: 12,
            color: theme.colors.onSurface,
          }}
        />
      </View>
      {!!errorFor(key) && (
        <Text style={{ color: "#EF4444", marginTop: 6, fontSize: 12 }}>
          {errorFor(key)}
        </Text>
      )}
    </View>
  );

  return (
    <View pointerEvents={disabled ? "none" : "auto"} style={{ opacity: disabled ? 0.7 : 1 }}>
      {showAdditionalInfo && (
        <View
          style={{
            backgroundColor: theme.colors.primaryContainer,
            padding: 14,
            borderRadius: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Feather
            name="edit-3"
            size={18}
            color={theme.colors.onPrimaryContainer}
            style={{ marginTop: 2 }}
          />
          <Text
            style={{
              flex: 1,
              color: theme.colors.onPrimaryContainer,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Fill additional details (salary/turnover is required). Certificates
            are optional.
          </Text>
          <TouchableOpacity
            onPress={() => setShowAdditionalInfo(false)}
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

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontWeight: "900",
            marginBottom: 12,
          }}
        >
          Additional Details
        </Text>
        {input(
          "salary",
          "Salary/Turnover (p.a)",
          local.salary,
          (t) => setField("salary", t),
          "Enter amount",
          true,
        )}
        {input(
          "totalExperience",
          "Total Experience (Years)",
          local.totalExperience,
          (t) => setField("totalExperience", t),
          "Enter total experience",
          true,
        )}
        {input(
          "existing_emi",
          "Existing EMI Amount (optional)",
          local.existingEmi,
          (t) => setField("existingEmi", t),
          "Enter EMI",
        )}
        {input(
          "existing_liability",
          "Existing Credit Card Liability (optional)",
          local.existingLiability,
          (t) => setField("existingLiability", t),
          "Enter liability",
        )}
      </View>
    </View>
  );
}
