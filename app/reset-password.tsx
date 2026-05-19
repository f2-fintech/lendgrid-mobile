import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar, useTheme } from "react-native-paper";
import { z } from "zod";

import { omsAuthApi } from "@/apis/modules/OmsAuth.api";
import { ThemeToggleBtn } from "@/components/common/AppHeader";
import { signInStyles } from "@/styles/auth/signin.styles";
import { COLORS } from "@/styles/theme/tokens";

const BRAND = COLORS.primary;
const BRAND_BG = "#EEF0FD";
const BRAND_BORDER = "#B0B8F0";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const getErrorMessage = (err: any) =>
  err?.response?.data?.message ||
  err?.message ||
  "Could not reset password. Please request a new link.";

function BrandHeader({ isDark }: { isDark: boolean }) {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <Image
        source={
          isDark
            ? require("@/assets/images/logo.png")
            : require("@/assets/images/logo_blue.png")
        }
        style={{ width: 130, height: 130 }}
        resizeMode="contain"
      />
      <Text
        style={{
          color: BRAND,
          fontWeight: "800",
          fontSize: 36,
          marginTop: -25,
        }}
      >
        LendGrid
      </Text>
    </View>
  );
}

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(() => {
    const value = params.token;
    return Array.isArray(value) ? value[0] : value;
  }, [params.token]);
  const theme = useTheme();
  const isDark = theme.dark;
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async ({ password }: ResetPasswordForm) => {
    if (!token) {
      showError("Reset token is missing. Please request a new link.");
      return;
    }

    setIsPending(true);
    setSuccessMessage("");
    try {
      const response = await omsAuthApi.resetPassword(token, password);
      setSuccessMessage(response.message || "Password updated successfully.");
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setIsPending(false);
    }
  };

  const inputStyle = [
    signInStyles.input,
    { flex: 1, marginBottom: 0 },
    {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderColor: isDark ? "#334155" : "#D1D5DB",
      borderWidth: 1.5,
      color: isDark ? "#F8FAFC" : "#111827",
      borderRadius: 10,
    },
  ];

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
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
      >
        <View style={signInStyles.inner}>
          <View style={{ position: "absolute", top: 50, right: 20, zIndex: 2 }}>
            <ThemeToggleBtn />
          </View>

          <BrandHeader isDark={isDark} />

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
              marginTop: 20,
              marginBottom: 20,
              gap: 6,
            }}
          >
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={isDark ? "#FFD600" : BRAND}
            />
            <Text
              style={{
                color: isDark ? "#FFD600" : BRAND,
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.4,
              }}
            >
              SET NEW PASSWORD
            </Text>
          </View>

          {!token ? (
            <View
              style={{
                backgroundColor: isDark ? "#3A241F" : "#FFF1EF",
                borderColor: isDark ? "#70443B" : "#F5C4BD",
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="alert-circle" size={18} color="#D94F43" />
              <Text
                style={{
                  color: isDark ? "#F8C9C3" : "#8D3329",
                  fontSize: 12,
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                This reset link is missing its token. Please request a new OMS
                password reset link.
              </Text>
            </View>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
              marginTop: 4,
            }}
          >
            <Ionicons name="lock-closed-outline" size={13} color={BRAND} />
            <Text
              style={{
                color: BRAND,
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              New Password
            </Text>
          </View>
          <View style={signInStyles.passwordContainer}>
            <TextInput
              placeholder="Enter new password"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              secureTextEntry={!showPassword}
              onChangeText={(text) => setValue("password", text)}
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((value) => !value)}
              style={signInStyles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color={isDark ? "#888" : BRAND}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={{ color: "#D94F43", marginBottom: 10, fontSize: 12 }}>
              {errors.password.message}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
              marginTop: 4,
            }}
          >
            <Ionicons name="lock-closed-outline" size={13} color={BRAND} />
            <Text
              style={{
                color: BRAND,
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Confirm Password
            </Text>
          </View>
          <View style={signInStyles.passwordContainer}>
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
              secureTextEntry={!showConfirmPassword}
              onChangeText={(text) => setValue("confirmPassword", text)}
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((value) => !value)}
              style={signInStyles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off" : "eye"}
                size={22}
                color={isDark ? "#888" : BRAND}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={{ color: "#D94F43", marginBottom: 10, fontSize: 12 }}>
              {errors.confirmPassword.message}
            </Text>
          )}

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

          <TouchableOpacity
            style={[
              signInStyles.signInButton,
              !isDark && {
                backgroundColor: BRAND,
                borderRadius: 12,
                shadowColor: BRAND,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              },
              (isPending || !token || !!successMessage) && { opacity: 0.6 },
            ]}
            disabled={isPending || !token || !!successMessage}
            onPress={handleSubmit(onSubmit)}
          >
            {isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#FFD600" : "#FFFFFF"}
                />
                <Text
                  style={{
                    color: isDark ? "#FFD600" : "#FFFFFF",
                    marginLeft: 8,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Updating password...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  signInStyles.signInText,
                  !isDark && { color: "#FFFFFF" },
                ]}
              >
                Update Password
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/signin")}>
            <Text
              style={[
                signInStyles.footerText,
                !isDark && { color: "#5A6A8A" },
              ]}
            >
              Back to login
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

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
