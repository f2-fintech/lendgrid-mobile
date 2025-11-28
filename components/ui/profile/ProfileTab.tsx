import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Controller, useFormContext } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text, TextInput, useTheme } from "react-native-paper";

export default function ProfileTab() {
  const theme = useTheme();

  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const avatar = watch("avatar");

  const pickAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const asset = result.assets[0];

    setValue(
      "avatar",
      { name: asset.name ?? "profile_photo", uri: asset.uri },
      { shouldValidate: true, shouldDirty: true }
    );
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ paddingVertical: 10, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={20}
    >
      {/* ----------- HEADER ----------- */}
      <Text
        variant="headlineSmall"
        style={{ fontWeight: "700", marginBottom: 6 }}
      >
        Profile Information
      </Text>

      {/* ----------- AVATAR SECTION (EXACT UI) ----------- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 26,
        }}
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
          <TouchableOpacity onPress={pickAvatar}>
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              <Ionicons name="cloud-upload-outline" size={20} /> Upload Photo
            </Text>
          </TouchableOpacity>

          {errors.avatar?.uri && (
            <Text style={{ color: theme.colors.error, fontSize: 12 }}>
              {errors.avatar.uri.message}
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

      {/* ----------- ACCOUNT STATUS BADGE (unchanged UI) ----------- */}
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
            backgroundColor:
              watch("status") === "ACTIVE" ? "#4CAF50" : "#E53935",
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            {watch("status")}
          </Text>
        </View>
      </View>

      {/* ----------- FIRST NAME ----------- */}
      <Controller
        control={control}
        name="firstName"
        render={({ field }) => (
          <TextInput
            label="First Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.firstName && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.firstName.message}
        </Text>
      )}

      {/* ----------- LAST NAME ----------- */}
      <Controller
        control={control}
        name="lastName"
        render={({ field }) => (
          <TextInput
            label="Last Name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.lastName && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.lastName.message}
        </Text>
      )}

      {/* ----------- EMAIL ----------- */}
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            label="Email Address"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.email && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 16, fontSize: 12 }}
        >
          {errors.email.message}
        </Text>
      )}

      {/* ----------- PHONE ----------- */}
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextInput
            label="Phone Number"
            value={field.value}
            keyboardType="phone-pad"
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
      {errors.phone && (
        <Text
          style={{ color: theme.colors.error, marginBottom: 30, fontSize: 12 }}
        >
          {errors.phone.message}
        </Text>
      )}
    </KeyboardAwareScrollView>
  );
}
