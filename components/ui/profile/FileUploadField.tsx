import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";

interface FileObject {
  name: string;
  uri: string;
  mimeType?: string;
}

interface FileUploadFieldProps {
  label: string;
  file: FileObject | null;
  onPick: (file: FileObject) => void;
  onRemove: () => void;
  error?: string;
}

export default function FileUploadField({
  label,
  file,
  onPick,
  onRemove,
  error,
}: FileUploadFieldProps) {
  const theme = useTheme();

  const [localFile, setLocalFile] = useState(file);

  useEffect(() => {
    setLocalFile(file);
  }, [file]);

  const [previewVisible, setPreviewVisible] = useState(false);

  // -------------------------------
  // PICK FILE HANDLER
  // -------------------------------
  const pickFile = async () => {
    try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
    });

      if (!result || result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    const newFile = {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
    };

      setLocalFile(newFile); // UI update
      onPick(newFile); // Update RHF
    } catch (err) {
      console.log("File selection cancelled");
    }
  };

  const removeFile = () => {
    setLocalFile(null); // instant UI update
    onRemove(); // update RHF
  };

  // -------------------------------
  // FILE TYPE DETECTORS
  // -------------------------------
  const isImage =
    localFile?.mimeType?.startsWith("image") ||
    /\.(jpg|jpeg|png|gif)$/i.test(localFile?.uri || "");

  const isPDF =
    localFile?.mimeType === "application/pdf" ||
    (localFile?.uri || "").toLowerCase().endsWith(".pdf");

  const openPreview = () => {
    if (!localFile) return;

    if (isPDF) {
      Linking.openURL(localFile.uri);
    } else {
      setPreviewVisible(true);
    }
  };

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ marginBottom: 6, fontWeight: "600" }}>{label}</Text>

      {/* If NO file */}
      {!localFile ? (
        <Button
          mode="outlined"
          icon="upload"
          onPress={pickFile}
          style={{ borderRadius: 10 }}
        >
          Upload File
        </Button>
      ) : (
        // If FILE EXISTS
        <View
          style={{
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? theme.colors.error : theme.colors.outline,
            backgroundColor: theme.colors.surface,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* FILE NAME + ICON */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={isPDF ? "document" : "image"}
              size={22}
              color={theme.colors.primary} 
            />

            <Text numberOfLines={1} style={{ marginLeft: 10, maxWidth: 150 }}>
              {localFile?.name}
            </Text>
          </View>

          {/* PREVIEW + REMOVE */}
          <View style={{ flexDirection: "row", gap: 16 }}>
            {/* Preview */}
            <TouchableOpacity onPress={openPreview}>
              <Ionicons
                name="eye-outline"
                size={24}
                color={theme.colors.primary} 
              />
            </TouchableOpacity>

            {/* Remove */}
            <TouchableOpacity onPress={removeFile}>
              <Ionicons
                name="close-circle"
                size={26}
                color="red"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ERROR TEXT */}
      {error && (
        <Text style={{ color: theme.colors.error, marginTop: 4, fontSize: 12 }}>
          {error}
        </Text>
      )}

      {/* IMAGE PREVIEW MODAL */}
      <Modal visible={previewVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => setPreviewVisible(false)}
            style={{ position: "absolute", top: 40, right: 20 }}
          >
            <Ionicons name="close" size={40} color="white" />
          </TouchableOpacity>

          {isImage && (
            <Image
              source={{ uri: localFile?.uri }}
              style={{
                width: Dimensions.get("window").width * 0.9,
                height: Dimensions.get("window").height * 0.7,
                resizeMode: "contain",
                borderRadius: 10,
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
