import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

import { step2Schema } from "../applicationSchemas";

export type PickedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

type Props = {
  value: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  onValidityChange?: (valid: boolean) => void; // optional gating
  maxFiles?: number; // default 10
};

const MAX_MB = 10;

const formatMB = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "NA";
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

export default function Step2Statement({
  value,
  onChange,
  onValidityChange,
  maxFiles = 10,
}: Props) {
  const theme = useTheme();
  const [localFiles, setLocalFiles] = useState<PickedFile[]>(value || []);
  const [showStatementInfo, setShowStatementInfo] = useState(true);

  useEffect(() => setLocalFiles(value || []), [value]);

  // Step2 is optional per website schema => always valid
  const isValid = useMemo(() => {
    const parsed = step2Schema.safeParse({ files: localFiles });
    return parsed.success;
  }, [localFiles]);

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  const pickDocs = useCallback(async () => {
    if (localFiles.length >= maxFiles) return;

    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/*",
        "text/plain",
      ],
    });

    if (res.canceled) return;

    const incoming: PickedFile[] = (res.assets || []).map((a) => ({
      uri: a.uri,
      name: a.name || "file",
      size: a.size,
      mimeType: a.mimeType,
    }));

    const merged = [...localFiles, ...incoming];

    // cap count
    const capped = merged.slice(0, maxFiles);

    // validate size (<=10MB each)
    const valid = capped.filter((f) => {
      if (typeof f.size === "number" && f.size > MAX_MB * 1024 * 1024)
        return false;
      return true;
    });

    setLocalFiles(valid);
    onChange(valid);
  }, [localFiles, maxFiles, onChange]);

  const removeFile = (idx: number) => {
    const next = localFiles.filter((_, i) => i !== idx);
    setLocalFiles(next);
    onChange(next);
  };

  return (
    <View>
      {showStatementInfo && (
        <View
          style={{
            backgroundColor: theme.colors.tertiaryContainer,
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
            name="file-text"
            size={18}
            color={theme.colors.onTertiaryContainer}
            style={{ marginTop: 2 }}
          />

          {/* text */}
          <Text
            style={{
              flex: 1,
              fontSize: 13,
              color: theme.colors.onTertiaryContainer,
              lineHeight: 20,
            }}
          >
            Upload your recent 6 months bank statements. Max {maxFiles} files,{" "}
            {MAX_MB}MB each.
          </Text>

          {/* close */}
          <TouchableOpacity
            onPress={() => setShowStatementInfo(false)}
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
              color={theme.colors.onTertiaryContainer}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Upload box */}
      {localFiles.length < maxFiles && (
        <TouchableOpacity
          onPress={pickDocs}
          activeOpacity={0.8}
          style={{
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: theme.colors.outline,
            borderRadius: 16,
            padding: 24,
            alignItems: "center",
            backgroundColor: theme.colors.surfaceVariant,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.primaryContainer,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Feather
              name="upload-cloud"
              size={28}
              color={theme.colors.onPrimaryContainer}
            />
          </View>

          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: theme.colors.onSurface,
              marginBottom: 6,
            }}
          >
            Upload Statements
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              lineHeight: 18,
            }}
          >
            PDF / DOC / Images accepted{"\n"}Max {maxFiles} files
          </Text>
        </TouchableOpacity>
      )}

      {/* Selected files */}
      {localFiles.length > 0 && (
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: theme.colors.outlineVariant,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: theme.colors.onSurface,
              marginBottom: 10,
            }}
          >
            Selected Files ({localFiles.length}/{maxFiles})
          </Text>

          {localFiles.map((f, idx) => {
            const isImg = (f.mimeType || "").startsWith("image/");
            return (
              <View
                key={`${f.uri}-${idx}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  borderBottomWidth: idx === localFiles.length - 1 ? 0 : 1,
                  borderBottomColor: theme.colors.outlineVariant,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: theme.colors.surfaceVariant,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                    overflow: "hidden",
                  }}
                >
                  {isImg ? (
                    <Image
                      source={{ uri: f.uri }}
                      style={{ width: 44, height: 44 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Feather
                      name="file-text"
                      size={18}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: theme.colors.onSurface,
                    }}
                  >
                    {f.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 2,
                    }}
                  >
                    {formatMB(f.size)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => removeFile(idx)}
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
            );
          })}
        </View>
      )}

      {/* Hint */}
      <Text
        style={{
          marginTop: 10,
          fontSize: 12,
          color: theme.colors.onSurfaceVariant,
        }}
      >
        Tip: You can skip this step if not available.
      </Text>
    </View>
  );
}
