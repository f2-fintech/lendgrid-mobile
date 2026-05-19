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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid work email"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

const getErrorMessage = (err: any) =>
  err?.response?.data?.message || err?.message || "Could not send reset link";

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

export default function OmsForgotPassword() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.dark;
  const [isPending, setIsPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    setIsPending(true);
    setSuccessMessage("");
    try {
      const response = await omsAuthApi.forgotPassword(email.trim());
      setSuccessMessage(
        response.message ||
          "Password reset link sent. Please check your work email.",
      );
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setIsPending(false);
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
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={20}
      >
        <View style={signInStyles.inner}>
          <View style={{ position: "absolute", top: 50, right: 20, zIndex: 2 }}>
            <ThemeToggleBtn />
          </View>

          <BrandHeader isDark={isDark} />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginTop: 20,
              marginBottom: 20,
              alignSelf: "flex-start",
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
              Back to OMS login
            </Text>
          </TouchableOpacity>

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
              marginBottom: 20,
              gap: 6,
            }}
          >
            <Ionicons
              name="key-outline"
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
              OMS PASSWORD RESET
            </Text>
          </View>

          <Text
            style={{
              color: isDark ? "#CBD5E1" : "#3A4A6A",
              fontSize: 14,
              lineHeight: 21,
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            Enter your OMS work email and we will send a reset link.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 7,
              marginTop: 4,
            }}
          >
            <Ionicons name="mail-outline" size={13} color={BRAND} />
            <Text
              style={{
                color: BRAND,
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              Work Email
            </Text>
          </View>

          <TextInput
            placeholder="Enter your work email"
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
            <Text style={{ color: "#D94F43", marginBottom: 10, fontSize: 12 }}>
              {errors.email.message}
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
              isPending && { opacity: 0.6 },
            ]}
            disabled={isPending}
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
                  Sending link...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  signInStyles.signInText,
                  !isDark && { color: "#FFFFFF" },
                ]}
              >
                Send Reset Link
              </Text>
            )}
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
