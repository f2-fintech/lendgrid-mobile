import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { step3Schema } from "../applicationSchemas";
import type { PickedFile } from "./Step_2_Statement";

export type Step3Values = {
  aadharFront: PickedFile | null;
  aadharBack: PickedFile | null;
  pancard: PickedFile | null;
  passportPhoto: PickedFile | null;
};

type Props = {
  value: Step3Values;
  onChange: (v: Step3Values) => void;
  onValidityChange?: (valid: boolean) => void;
};

const MAX_MB = 10;

const pickOne = async () => {
  const res = await DocumentPicker.getDocumentAsync({
    multiple: false,
    copyToCacheDirectory: true,
    type: [
      "application/pdf",
      "image/*",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  });
  if (res.canceled) return null;
  const a = res.assets?.[0];
  if (!a) return null;

  return {
    uri: a.uri,
    name: a.name || "file",
    size: a.size,
    mimeType: a.mimeType,
  } as PickedFile;
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

export default function Step3IdProof({
  value,
  onChange,
  onValidityChange,
}: Props) {
  const theme = useTheme();
  const [showIdProofInfo, setShowIdProofInfo] = useState(true);

  // touched - don't show error initially
  const [touched, setTouched] = useState(false);
  const markTouched = () => setTouched(true);

  // map value -> schema keys (passportSizePhoto key must match schema)
  const schemaInput = useMemo(() => {
    return {
      aadharFront: value.aadharFront ?? undefined,
      aadharBack: value.aadharBack ?? undefined,
      pancard: value.pancard ?? undefined,
      passportSizePhoto: value.passportPhoto ?? undefined,
    };
  }, [value]);

  const parsed = useMemo(
    () => step3Schema.safeParse(schemaInput),
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

  const setField = (k: keyof Step3Values, v: PickedFile | null) => {
    const next = { ...value, [k]: v };
    onChange(next);
  };

  const handlePick = useCallback(
    async (field: keyof Step3Values) => {
      markTouched();

      const f = await pickOne();
      if (!f) return;

      if (typeof f.size === "number" && f.size > MAX_MB * 1024 * 1024) return;

      setField(field, f);
    },
    [value],
  );

  const showAadharFrontError = touched && !value.aadharFront;

  const renderBox = (
    label: string,
    field: keyof Step3Values,
    required?: boolean,
  ) => {
    const file = value[field];
    const isImg = (file?.mimeType || "").startsWith("image/");

    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: theme.colors.onSurface,
            marginBottom: 8,
          }}
        >
          {label}{" "}
          {required ? (
            <Text style={{ color: theme.colors.error }}>*</Text>
          ) : null}
        </Text>

        {!file ? (
          <TouchableOpacity
            onPress={() => handlePick(field)}
            activeOpacity={0.85}
            style={{
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor:
                field === "aadharFront" && showAadharFrontError
                  ? "#EF4444"
                  : theme.colors.outline,
              borderRadius: 16,
              padding: 18,
              backgroundColor: theme.colors.surfaceVariant,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: theme.colors.primaryContainer,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Feather
                  name="upload"
                  size={18}
                  color={theme.colors.onPrimaryContainer}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: theme.colors.onSurface, fontWeight: "800" }}
                >
                  Upload
                </Text>
                <Text
                  style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
                >
                  PDF / Image (max 10MB)
                </Text>
              </View>
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.colors.outlineVariant,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  backgroundColor: theme.colors.surfaceVariant,
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  marginRight: 12,
                }}
              >
                {isImg ? (
                  <Image
                    source={{ uri: file.uri }}
                    style={{ width: 64, height: 64 }}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather
                    name="file-text"
                    size={22}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: theme.colors.onSurface, fontWeight: "800" }}
                >
                  {file.name}
                </Text>
                <Text
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {file.size
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "NA"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  markTouched();
                  setField(field, null);
                }}
                style={{
                  padding: 10,
                  borderRadius: 12,
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
          </View>
        )}

        {/* only show error after touched */}
        {field === "aadharFront" && showAadharFrontError ? (
          <Text style={{ color: "#EF4444", marginTop: 6, fontSize: 12 }}>
            {(errors as any).aadharFront || "Aadhar front is required"}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <View>
      {showIdProofInfo && (
        <View
          style={{
            backgroundColor: theme.colors.errorContainer,
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
            name="alert-circle"
            size={18}
            color={theme.colors.onErrorContainer}
            style={{ marginTop: 2 }}
          />

          {/* text */}
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.colors.onErrorContainer,
              lineHeight: 20,
            }}
          >
            Upload ID proof documents. Aadhaar Front is mandatory.
          </Text>

          {/* close */}
          <TouchableOpacity
            onPress={() => setShowIdProofInfo(false)}
            activeOpacity={0.7}
            style={{
              padding: 4,
              borderRadius: 999,
              marginTop: -2,
            }}
          >
            <Feather name="x" size={18} color={theme.colors.onErrorContainer} />
          </TouchableOpacity>
        </View>
      )}

      {renderBox("Aadhaar Card (Front)", "aadharFront", true)}
      {renderBox("Aadhaar Card (Back)", "aadharBack")}
      {renderBox("PAN Card", "pancard")}
      {renderBox("Passport Size Photo", "passportPhoto")}
    </View>
  );
}
