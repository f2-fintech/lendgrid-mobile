import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { step4Schema } from "../applicationSchemas";
import type { PickedFile } from "./Step_2_Statement";

export type Step4Values = {
  salary: string;
  existingEmi: string;
  existingLiability: string;
  certificates: PickedFile[];
};

type Props = {
  value: Step4Values;
  onChange: (v: Step4Values) => void;
  onValidityChange?: (valid: boolean) => void;
};

const MAX_CERT_FILES = 4;
const MAX_CERT_MB = 5;

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
}: Props) {
  const theme = useTheme();
  const [local, setLocal] = useState<Step4Values>(value);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(true);

  // touched fields (no initial errors)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: string) =>
    setTouched((prev) => (prev[k] ? prev : { ...prev, [k]: true }));

  useEffect(() => setLocal(value), [value]);

  // map local -> schema keys (same names as website schema)
  const schemaInput = useMemo(() => {
    return {
      salary: local.salary ?? "",
      existing_emi: local.existingEmi || undefined,
      existing_liability: local.existingLiability || undefined,
      certificates: local.certificates?.length ? local.certificates : undefined,
    };
  }, [local]);

  const parsed = useMemo(
    () => step4Schema.safeParse(schemaInput),
    [schemaInput],
  );
  const errors = useMemo(
    () => (parsed.success ? {} : toFieldErrors(parsed.error.issues)),
    [parsed],
  );

  const valid = parsed.success;

  useEffect(() => {
    onValidityChange?.(valid);
  }, [valid, onValidityChange]);

  const errorFor = (k: string) => (touched[k] ? (errors as any)[k] : "");

  const setField = (k: keyof Step4Values, v: any) => {
    const next = { ...local, [k]: v };
    setLocal(next);
    onChange(next);
  };

  const pickCertificates = async () => {
    markTouched("certificates");

    if (local.certificates.length >= MAX_CERT_FILES) return;

    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "image/*",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    if (res.canceled) return;

    const incoming: PickedFile[] = (res.assets || []).map((a) => ({
      uri: a.uri,
      name: a.name || "file",
      size: a.size,
      mimeType: a.mimeType,
    }));

    const merged = [...local.certificates, ...incoming];
    const capped = merged.slice(0, MAX_CERT_FILES);

    const validFiles = capped.filter((f) => {
      if (typeof f.size === "number" && f.size > MAX_CERT_MB * 1024 * 1024)
        return false;
      return true;
    });

    setField("certificates", validFiles);
  };

  const removeCert = (idx: number) => {
    markTouched("certificates");
    const next = local.certificates.filter((_, i) => i !== idx);
    setField("certificates", next);
  };

  const input = (
    key: "salary" | "existing_emi" | "existing_liability",
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
        {required ? <Text style={{ color: theme.colors.error }}>*</Text> : null}
      </Text>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: errorFor(key) ? "#EF4444" : theme.colors.outline,
          borderRadius: 12,
          backgroundColor: theme.colors.surface,
          paddingHorizontal: 12,
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
    <View>
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
          {/* icon */}
          <Feather
            name="edit-3"
            size={18}
            color={theme.colors.onPrimaryContainer}
            style={{ marginTop: 2 }}
          />

          {/* text */}
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

          {/* close */}
          <TouchableOpacity
            onPress={() => setShowAdditionalInfo(false)}
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

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontWeight: "900",
            marginBottom: 10,
          }}
        >
          Certificates (Optional)
        </Text>

        <TouchableOpacity
          onPress={pickCertificates}
          disabled={local.certificates.length >= MAX_CERT_FILES}
          style={{
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor:
              local.certificates.length >= MAX_CERT_FILES
                ? theme.colors.surfaceVariant
                : theme.colors.primary,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              color:
                local.certificates.length >= MAX_CERT_FILES
                  ? theme.colors.onSurfaceVariant
                  : "#FFFFFF",
              fontWeight: "900",
            }}
          >
            Upload Certificates ({local.certificates.length}/{MAX_CERT_FILES})
          </Text>
        </TouchableOpacity>

        {local.certificates.map((f, idx) => (
          <View
            key={`${f.uri}-${idx}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: idx === local.certificates.length - 1 ? 0 : 1,
              borderBottomColor: theme.colors.outlineVariant,
            }}
          >
            <Feather
              name="file-text"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                style={{ color: theme.colors.onSurface, fontWeight: "800" }}
              >
                {f.name}
              </Text>
              <Text
                style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
              >
                {f.size ? `${(f.size / 1024 / 1024).toFixed(2)} MB` : "NA"} (max{" "}
                {MAX_CERT_MB}MB)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeCert(idx)}
              style={{
                padding: 8,
                borderRadius: 10,
                backgroundColor: theme.colors.errorContainer,
              }}
            >
              <Feather
                name="x"
                size={18}
                color={theme.colors.onErrorContainer}
              />
            </TouchableOpacity>
          </View>
        ))}

        <Text
          style={{
            marginTop: 10,
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
          }}
        >
          Max {MAX_CERT_FILES} files • {MAX_CERT_MB}MB each
        </Text>
      </View>
    </View>
  );
}
