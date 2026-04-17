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
  customerId?: string | null;
  onInstantUpload?: (file: PickedFile, docType: string) => Promise<void>;
};

const MAX_MB = 1;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function Step3IdProof({
  value,
  onChange,
  onValidityChange,
  customerId,
  onInstantUpload,
}: Props) {
  const theme = useTheme();
  const [showIdProofInfo, setShowIdProofInfo] = useState(true);
  const [touched, setTouched] = useState(false);
  const [fileError, setFileError] = useState<string>("");

  // Logic to handle setting the field and auto-upload
  const setField = useCallback(
    (k: keyof Step3Values, v: PickedFile | null) => {
      onChange({ ...value, [k]: v });

      // Auto Upload if file exists
      if (v && customerId && onInstantUpload) {
        const docMapping: Record<keyof Step3Values, string> = {
          aadharFront: "aadhaar front",
          aadharBack: "aadhaar back",
          pancard: "pancard",
          passportPhoto: "photo",
        };
        onInstantUpload(v, docMapping[k]);
      }
    },
    [value, onChange, customerId, onInstantUpload],
  );

  // 1. Pick from Files/Gallery
  const handlePickFile = useCallback(
    async (field: keyof Step3Values) => {
      setTouched(true);
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
      setTouched(true);
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
    isRequired: boolean = false,
    allowCamera: boolean = false,
  ) => {
    const file = value[field];
    const hasError = isRequired && touched && !file;

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
              borderColor: hasError
                ? theme.colors.error
                : theme.colors.outlineVariant,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.colors.surfaceVariant,
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
                borderColor: theme.colors.outlineVariant,
                borderRadius: 16,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.colors.primaryContainer,
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
        <Image
          source={{ uri: file.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => setField(field, null)}
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
          Aadhaar Card (Front & Back){" "}
          <Text style={{ color: theme.colors.error }}>*</Text>
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {renderFilePreview("aadharFront", "Front Side", true)}
          {renderFilePreview("aadharBack", "Back Side", false)}
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
          PAN Card <Text style={{ color: theme.colors.error }}>*</Text>
        </Text>
        {renderFilePreview("pancard", "Upload PAN", true)}
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
        {renderFilePreview("passportPhoto", "Upload File", false, true)}
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
