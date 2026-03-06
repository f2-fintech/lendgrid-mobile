import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ActivityIndicator, Image, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { IconButton, Text, TextInput, useTheme } from "react-native-paper";

import { uploadToS3 } from "@/lib/utils/utils";

type Props = {
  uiState?: { isEditMode: boolean; activeTab: string };
  onSnack?: (msg: string) => void;
};

export default function ProfileTab({ uiState, onSnack }: Props) {
  const theme = useTheme();
  const isEditMode = !!uiState?.isEditMode;
  const isActive = uiState?.activeTab === "profile";

  const firstNameRef = useRef<any>(null);

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const avatar = watch("avatar");
  const status = watch("status");

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const displayUri = localPreview || avatar?.uri || null;

  useEffect(() => {
    if (isEditMode && isActive) {
      setTimeout(() => firstNameRef.current?.focus?.(), 250);
    }
  }, [isEditMode, isActive]);

  const pickAvatar = async () => {
    if (!isEditMode || uploading) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    //  robust 2MB check + toast
    let fileSize = asset.size;
    if (typeof fileSize !== "number") {
      const info = await FileSystem.getInfoAsync(asset.uri);
      if (info.exists && "size" in info) {
        fileSize = info.size;
      }
    }

    if (typeof fileSize === "number" && fileSize > 2 * 1024 * 1024) {
      onSnack?.("Image size should be less than 2MB.");
      return;
    }

    setLocalPreview(asset.uri);

    try {
      setUploading(true);

      const uploadedUrl = await uploadToS3(
        {
          uri: asset.uri,
          name: asset.name || `profile-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        },
        `profile-photos/${Date.now()}-${asset.name || "profile"}.jpg`,
      );

      //  save uploaded URL into RHF so tab change won't remove it
      setValue(
        "avatar",
        { uri: uploadedUrl, name: asset.name || "profile-photo" },
        { shouldValidate: true, shouldDirty: true },
      );

      setLocalPreview(null);
      onSnack?.("Photo uploaded successfully");
    } catch (e: any) {
      onSnack?.(e?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = () => {
    if (!isEditMode || uploading) return;

    setLocalPreview(null);
    setValue("avatar", null, { shouldValidate: true, shouldDirty: true });
    onSnack?.("Photo removed");
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6 }}
      >
        Profile Information
      </Text>

      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 26 }}
      >
        <View
          style={{
            height: 90,
            width: 90,
            borderRadius: 45,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 20,
            opacity: isEditMode ? 1 : 0.9,
            overflow: "hidden",
          }}
        >
          {displayUri ? (
            <Image
              source={{ uri: displayUri }}
              style={{ height: 90, width: 90 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name="person"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
          )}

          {isEditMode && !!displayUri ? (
            <View style={{ position: "absolute", top: -6, right: -6 }}>
              <IconButton
                icon="close"
                size={18}
                onPress={removeAvatar}
                style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                iconColor="#fff"
              />
            </View>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={pickAvatar}
            disabled={!isEditMode || uploading}
          >
            <Text
              style={{
                color: isEditMode
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} />{" "}
              {uploading ? "Uploading..." : "Upload Photo"}
            </Text>
          </TouchableOpacity>

          {uploading ? (
            <View
              style={{
                marginTop: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text
                style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}
              >
                Uploading to server…
              </Text>
            </View>
          ) : null}

          {(errors as any)?.avatar?.uri && (
            <Text
              style={{ color: theme.colors.error, fontSize: 12, marginTop: 6 }}
            >
              {(errors as any)?.avatar?.uri?.message}
            </Text>
          )}

          <Text
            style={{
              fontSize: 12.5,
              color: theme.colors.onSurfaceVariant,
              marginTop: 4,
            }}
          >
            JPG / PNG / GIF — Max 2MB
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 26,
        }}
      >
        <Text variant="titleMedium" style={{ fontWeight: "600" }}>
          Account Status
        </Text>

        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: status === "ACTIVE" ? "#4CAF50" : "#E53935",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>{status}</Text>
        </View>
      </View>

      <Controller
        control={control}
        name="firstName"
        render={({ field }) => (
          <TextInput
            ref={firstNameRef}
            label="First Name"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            editable={isEditMode}
            error={!!(errors as any).firstName}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {(errors as any).firstName && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors as any).firstName?.message}
        </Text>
      )}

      <Controller
        control={control}
        name="lastName"
        render={({ field }) => (
          <TextInput
            label="Last Name"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            editable={isEditMode}
            error={!!(errors as any).lastName}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {(errors as any).lastName && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors as any).lastName?.message}
        </Text>
      )}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            label="Email Address"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            editable={isEditMode}
            error={!!(errors as any).email}
            autoCapitalize="none"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {(errors as any).email && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors as any).email?.message}
        </Text>
      )}

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextInput
            label="Phone Number"
            keyboardType="number-pad"
            value={field.value}
            mode="outlined"
            editable={isEditMode}
            error={!!(errors as any).phone}
            maxLength={10}
            onChangeText={(txt) =>
              field.onChange(txt.replace(/[^0-9]/g, "").slice(0, 10))
            }
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {(errors as any).phone && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors as any).phone?.message}
        </Text>
      )}
    </KeyboardAwareScrollView>
  );
}
