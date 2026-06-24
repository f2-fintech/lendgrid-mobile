import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar, useTheme } from "react-native-paper";
import { z } from "zod";

import { useRequestDeletion } from "@/hooks/useAuth";
import { signInStyles } from "@/styles/auth/signin.styles";
import { COLORS } from "@/styles/theme/tokens";
import { ThemeToggleBtn } from "@/components/common/AppHeader";

const BRAND = COLORS.primary;
const BRAND_BG = "#EEF0FD";
const BRAND_BORDER = "#B0B8F0";

const deleteAccountSchema = z.object({
  email: z
    .string()
    .min(1, "Registered email is required")
    .email("Enter a valid email address")
    .trim(),
  password: z.string().min(1, "Password is required to confirm identity"),
  reason: z.string().optional(),
});

type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

const getErrorMessage = (err: any) =>
  err?.response?.data?.message || err?.message || "Could not process request";

function BrandHeader({ isDark }: { isDark: boolean }) {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Image
        source={
          isDark
            ? require("@/assets/images/logo.png")
            : require("@/assets/images/logo_blue.png")
        }
        style={{ width: 110, height: 110 }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: BRAND,
          fontWeight: "800",
          fontSize: 30,
          marginTop: -20,
          marginBottom: 10,
        }}
      >
        LendGrid
      </Text>
    </View>
  );
}

export default function DeleteAccount() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const { mutateAsync: requestDeletion, isPending } = useRequestDeletion();

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { email: "", password: "", reason: "" },
  });

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: DeleteAccountForm) => {
    setSuccessMessage("");
    try {
      const response = await requestDeletion({
        email: data.email,
        password: data.password,
        reason: data.reason,
      });

      if (response?.success) {
        setSuccessMessage(
          response.message || "Deletion request submitted. We will review it within 7 business days."
        );
      } else {
        showError(response?.message || "Could not submit deletion request.");
      }
    } catch (err: any) {
      showError(getErrorMessage(err));
    }
  };

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
      >
        <View style={{ padding: 20, paddingBottom: 40 }}>
          {/* Theme Toggle */}
          <View style={{ position: "absolute", top: 50, right: 20, zIndex: 2 }}>
            <ThemeToggleBtn />
          </View>

          <BrandHeader isDark={isDark} />

          {/* Back to Login Link */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
              marginBottom: 15,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={isDark ? "#CBD5E1" : BRAND}
            />
            <Text
              style={{
                color: isDark ? "#CBD5E1" : BRAND,
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Back to login
            </Text>
          </TouchableOpacity>

          {/* Header Title Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#1A2340" : BRAND_BG,
              borderColor: isDark ? "#2A3A5C" : BRAND_BORDER,
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 5,
              alignSelf: "center",
              marginBottom: 18,
              gap: 6,
            }}
          >
            <Ionicons
              name="trash-outline"
              size={14}
              color={isDark ? "#FF6B6B" : "#D94F43"}
            />
            <Text
              style={{
                color: isDark ? "#FF6B6B" : "#D94F43",
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.4,
              }}
            >
              REQUEST ACCOUNT DELETION
            </Text>
          </View>

          {/* Policy Information Box */}
          <View
            style={{
              backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
              borderColor: isDark ? "#334155" : "#E2E8F0",
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
              marginBottom: 20,
              gap: 8,
            }}
          >
            <Text
              style={{
                color: isDark ? "#F1F5F9" : "#1E293B",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              Data Retention & Deletion Policy:
            </Text>
            <Text
              style={{
                color: isDark ? "#94A3B8" : "#475569",
                fontSize: 11,
                lineHeight: 16,
              }}
            >
              • <Text style={{ fontWeight: "700" }}>Deleted:</Text> KYC files, PAN/Aadhaar data, payout accounts, and contact details.{"\n"}
              • <Text style={{ fontWeight: "700" }}>Retained:</Text> ID/Email metadata & historical transaction records for financial audit audits.{"\n"}
              • Deletion is reviewed within 7 business days, and is blocked if there are active or pending applications.
            </Text>
          </View>

          {/* Email Address Field */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Ionicons name="mail-outline" size={13} color={BRAND} />
              <Text style={{ color: BRAND, fontSize: 12, fontWeight: "600" }}>Email Address</Text>
            </View>
            <TextInput
              placeholder="Enter your registered email"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              onChangeText={(text) => setValue("email", text)}
              style={[
                signInStyles.input,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#D1D5DB",
                  borderWidth: 1.5,
                  color: isDark ? "#F8FAFC" : "#111827",
                  borderRadius: 10,
                },
              ]}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={{ color: "#D94F43", marginTop: 4, fontSize: 12 }}>
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password Field */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Ionicons name="lock-closed-outline" size={13} color={BRAND} />
              <Text style={{ color: BRAND, fontSize: 12, fontWeight: "600" }}>Password</Text>
            </View>
            <View style={[signInStyles.passwordContainer, { marginBottom: 0 }]}>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                secureTextEntry={!showPassword}
                onChangeText={(text) => setValue("password", text)}
                style={[
                  signInStyles.input,
                  {
                    flex: 1,
                    marginBottom: 0,
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    borderColor: isDark ? "#334155" : "#D1D5DB",
                    borderWidth: 1.5,
                    color: isDark ? "#F8FAFC" : "#111827",
                    borderRadius: 10,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={signInStyles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={isDark ? "#888" : BRAND}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={{ color: "#D94F43", marginTop: 4, fontSize: 12 }}>
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Reason Field */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 }}>
              <Ionicons name="document-text-outline" size={13} color={BRAND} />
              <Text style={{ color: BRAND, fontSize: 12, fontWeight: "600" }}>Reason for Deletion (Optional)</Text>
            </View>
            <TextInput
              placeholder="Why are you requesting deletion?"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              onChangeText={(text) => setValue("reason", text)}
              multiline
              numberOfLines={3}
              style={[
                signInStyles.input,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#D1D5DB",
                  borderWidth: 1.5,
                  color: isDark ? "#F8FAFC" : "#111827",
                  borderRadius: 10,
                  height: 80,
                  textAlignVertical: "top",
                  paddingTop: 10,
                },
              ]}
            />
          </View>

          {/* Success Box */}
          {successMessage ? (
            <View
              style={{
                backgroundColor: isDark ? "#123224" : "#EAF8EF",
                borderColor: isDark ? "#245C3F" : "#BDE7C9",
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color="#22A55A" />
              <Text
                style={{
                  color: isDark ? "#BFE8CF" : "#246B3D",
                  fontSize: 12,
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                {successMessage}
              </Text>
            </View>
          ) : null}

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              signInStyles.signInButton,
              {
                backgroundColor: isDark ? "#B22222" : "#D94F43",
                borderRadius: 12,
                elevation: 6,
              },
              isPending && { opacity: 0.6 },
            ]}
            disabled={isPending}
            onPress={handleSubmit(onSubmit)}
          >
            {isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
                <Text
                  style={{
                    color: "#FFFFFF",
                    marginLeft: 8,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Submitting request...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  signInStyles.signInText,
                  { color: "#FFFFFF" },
                ]}
              >
                Confirm Request Deletion
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Snackbar Notifications */}
      <View
        style={{
          position: "absolute",
          top: 150,
          left: 20,
          right: 0,
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2800}
          style={{ backgroundColor: "#FFD600", width: "90%", borderRadius: 8 }}
        >
          <Text
            style={{ color: "#000", fontWeight: "600", textAlign: "center" }}
          >
            {snackbarMessage}
          </Text>
        </Snackbar>
      </View>
    </>
  );
}
