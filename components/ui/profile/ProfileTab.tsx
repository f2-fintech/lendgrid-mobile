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
  const status = watch("user.status");

  const pickAvatar = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets) return;

    const asset = result.assets[0];

    setValue(
      "avatar",
      { uri: asset.uri, name: asset.name },
      {
        shouldValidate: true,
        shouldDirty: true,
      }
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
        name="firstName" // form field
        render={({ field }) => (
          <TextInput
            label="First Name"
            value={field.value}
            onChangeText={(txt) => field.onChange(txt)}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />

      <Controller
        control={control}
        name="lastName"
        render={({ field }) => (
          <TextInput
            label="Last Name"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />

      {/* ----------- EMAIL ----------- */}
      <Controller
        control={control}
        name="email" // mapped manually in ProfileScreen
        render={({ field }) => (
          <TextInput
            label="Email Address"
            keyboardType="email-address"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />

      {/* ----------- PHONE ----------- */}
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <TextInput
            label="Phone Number"
            keyboardType="phone-pad"
            value={field.value}
            onChangeText={field.onChange}
            mode="outlined"
            style={{ marginBottom: 4 }}
          />
        )}
      />
    </KeyboardAwareScrollView>
  );
}
