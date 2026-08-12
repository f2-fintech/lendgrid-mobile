import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker"; // Add this
import { useCallback, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "react-native-paper";

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
  onUploadFile?: (field: keyof Step3Values) => void;
  uploadingFileKey?: string | null;
  customerId?: string | null;
};

const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function Step3IdProof({
  value,
  onChange,
  onValidityChange,
  onUploadFile,
  uploadingFileKey,
}: Props) {
  const theme = useTheme();
  const [fileError, setFileError] = useState<string>("");

  // Logic to handle setting the field and auto-upload
  const setField = useCallback(
    (k: keyof Step3Values, v: PickedFile | null) => {
      onChange({ ...value, [k]: v });
    },
    [value, onChange],
  );

  // 1. Pick from Files/Gallery
  const handlePickFile = useCallback(
    async (field: keyof Step3Values) => {
      setFileError("");
      const res = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
        type: ["application/pdf", "image/*"],
      });

      if (res.canceled) return;
      const a = res.assets?.[0];
      if (!a) return;

      if (a.size && a.size > MAX_BYTES) {
        setFileError(`File too large: Max ${MAX_MB}MB allowed.`);
        return;
      }

      setField(field, {
        uri: a.uri,
        name: a.name || "file",
        size: a.size,
        mimeType: a.mimeType,
      });
    },
    [setField],
  );

  // 2. Capture from Camera
  const handleTakePhoto = useCallback(
    async (field: keyof Step3Values) => {
      setFileError("");

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "We need camera access to take a photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setField(field, {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: "image/jpeg",
        });
      }
    },
    [setField],
  );

  const renderFilePreview = (
    field: keyof Step3Values,
    label: string,
    allowCamera: boolean = false,
  ) => {
    const file = value[field];
    const isPending = !!file?.uri && !file.uri.startsWith("http") && !file.uploaded;
    const isUploadingThis = uploadingFileKey === field;

    if (!file) {
      return (
        <View style={{ flex: 1, flexDirection: "row", gap: 12 }}>
          {/* Main Upload Button */}
          <TouchableOpacity
            onPress={() => handlePickFile(field)}
            style={{
              flex: 1,
              height: 120,
              borderWidth: 2,
              borderStyle: "dashed",
              borderColor: theme.colors.primary,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: `${theme.colors.primary}10`,
            }}
          >
            <Feather
              name="upload"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              style={{
                fontSize: 12,
                marginTop: 8,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>

          {/* Camera Button (Only for Passport Photo) */}
          {allowCamera && (
            <TouchableOpacity
              onPress={() => handleTakePhoto(field)}
              style={{
                width: 100,
                height: 120,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: theme.colors.primary,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: `${theme.colors.primary}15`,
              }}
            >
              <Feather
                name="camera"
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
              <Text
                style={{
                  fontSize: 11,
                  marginTop: 8,
                  color: theme.colors.onPrimaryContainer,
                  textAlign: "center",
                }}
              >
                Take Photo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          height: 140,
          borderRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.surface,
        }}
      >
        {file.uri.toLowerCase().endsWith(".pdf") || file.mimeType === "application/pdf" ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: `${theme.colors.error}10` }}>
            <Feather name="file-text" size={48} color={theme.colors.error} />
            <Text style={{ marginTop: 8, fontSize: 12, fontWeight: "600", color: theme.colors.error }}>PDF Document</Text>
          </View>
        ) : (
          <Image
            source={{ uri: file.uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        )}
        <TouchableOpacity
          onPress={() => setField(field, null)}
          disabled={isUploadingThis}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: theme.colors.error,
            borderRadius: 20,
            padding: 6,
          }}
        >
          <Feather name="trash-2" size={16} color={theme.colors.onError} />
        </TouchableOpacity>
        {isPending && onUploadFile && (
          <TouchableOpacity
            onPress={() => onUploadFile(field)}
            disabled={isUploadingThis}
            activeOpacity={0.85}
            style={{
              position: "absolute",
              left: 8,
              bottom: 8,
              paddingHorizontal: 10,
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: isUploadingThis
                ? theme.colors.surfaceVariant
                : theme.colors.secondary,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Feather
              name="upload"
              size={14}
              color={isUploadingThis ? theme.colors.onSurfaceVariant : "#FFFFFF"}
            />
            <Text
              style={{
                color: isUploadingThis ? theme.colors.onSurfaceVariant : "#FFFFFF",
                fontSize: 12,
                fontWeight: "900",
              }}
            >
              {isUploadingThis ? "Uploading" : "Upload"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View>
      {/* Aadhaar Section */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            marginBottom: 12,
            color: theme.colors.onSurface,
          }}
        >
          Aadhaar Card (Front & Back)
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {renderFilePreview("aadharFront", "Front Side")}
          {renderFilePreview("aadharBack", "Back Side")}
        </View>
      </View>

      {/* PAN Card Section */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            marginBottom: 12,
            color: theme.colors.onSurface,
          }}
        >
          PAN Card
        </Text>
        {renderFilePreview("pancard", "Upload PAN")}
      </View>

      {/* Passport Photo Section with Camera */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            marginBottom: 12,
            color: theme.colors.onSurface,
          }}
        >
          Passport Size Photo
        </Text>
        {renderFilePreview("passportPhoto", "Upload File", true)}
      </View>

      {/* Error Banner */}
      {!!fileError && (
        <View
          style={{
            backgroundColor: theme.colors.errorContainer,
            padding: 12,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: theme.colors.onErrorContainer,
              textAlign: "center",
              fontSize: 12,
            }}
          >
            {fileError}
          </Text>
        </View>
      )}
    </View>
  );
}
