import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, useTheme } from "react-native-paper";

type Props = {
  uiState?: { isEditMode: boolean; activeTab: string };
};

export default function ProfileTab({ uiState }: Props) {
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

  useEffect(() => {
    if (isEditMode && isActive) {
      setTimeout(() => firstNameRef.current?.focus?.(), 250);
    }
  }, [isEditMode, isActive]);

  const pickAvatar = async () => {
    if (!isEditMode) return;

    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const asset = result.assets[0];

    setValue(
      "avatar",
      { uri: asset.uri, name: asset.name },
      { shouldValidate: true, shouldDirty: true }
    );
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

      {/* AVATAR */}
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
          }}
        >
          {avatar?.uri ? (
            <Text style={{ fontSize: 10, textAlign: "center" }}>
              Avatar Loaded
            </Text>
          ) : (
            <Ionicons
              name="person"
              size={48}
              color={theme.colors.onSurfaceVariant}
            />
          )}
        </View>

        <View>
          <TouchableOpacity onPress={pickAvatar} disabled={!isEditMode}>
            <Text
              style={{
                color: isEditMode
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} /> Upload Photo
            </Text>
          </TouchableOpacity>

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

      {/* STATUS */}
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

      {/* FIRST NAME */}
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
            error={!!errors.firstName}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.firstName && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors.firstName as any)?.message}
        </Text>
      )}

      {/* LAST NAME */}
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
            error={!!errors.lastName}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.lastName && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors.lastName as any)?.message}
        </Text>
      )}

      {/* EMAIL */}
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
            error={!!errors.email}
            autoCapitalize="none"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.email && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors.email as any)?.message}
        </Text>
      )}

      {/* PHONE (digits only, max 10) */}
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
            error={!!errors.phone}
            maxLength={10} 
            onChangeText={(txt) => {
              const onlyDigits = txt.replace(/[^0-9]/g, "").slice(0, 10); // ✅ digits only + max 10
              field.onChange(onlyDigits);
            }}
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.phone && (
        <Text
          style={{ color: theme.colors.error, fontSize: 12, marginBottom: 14 }}
        >
          {(errors.phone as any)?.message}
        </Text>
      )}
    </KeyboardAwareScrollView>
  );
}
