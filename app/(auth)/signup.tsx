import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar, useTheme } from "react-native-paper";

import TurnstileCaptcha from "@/components/login_Signup/TurnstileCaptcha";
import { useSignUp } from "@/hooks/useAuth";
import { signUpSchema, SignUpSchemaType } from "@/lib/validators/signup.schema";

// ─── Brand colors for light mode ──────────────────────────────────────────────
const BRAND = "#2D42D8";
const BRAND_BG = "#EEF0FD";
const BRAND_BORDER = "#B0B8F0";

export default function SignUp() {
  const router = useRouter();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const theme = useTheme();
  const isDark = theme.dark;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: signUp, isPending } = useSignUp();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showError = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  const [formData, setFormData] = useState<SignUpSchemaType>({
    role: "AGGREGATOR_ADMIN",
    fullName: "",
    email: "",
    companyName: "",
    userType: "aggregator",
    password: "",
    confirmPassword: "",
    contact: "",
    agreeToTerms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const handleChange = <K extends keyof SignUpSchemaType>(
    key: K,
    value: SignUpSchemaType[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key as string]: "" }));
  };

  const handleSubmit = async () => {
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const errObj: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errObj[issue.path[0] as string] = issue.message;
      });
      setErrors(errObj);
      scrollRef.current?.scrollToPosition(0, 0, true);
      return;
    }

    if (!captchaToken) {
      showError("Please verify that you are not a bot.");
      scrollRef.current?.scrollToEnd(true);
      return;
    }

    try {
      const { confirmPassword, ...apiData } = result.data;

      const payload = {
        username: apiData.fullName,
        email: apiData.email.toLowerCase(),
        password: apiData.password,
        role: "AGGREGATOR_ADMIN",
        companyName: apiData.companyName,
        aggregatorType: "CHANNEL_PARTNER",
        contact: apiData.contact,
        captchaToken,
      };

      const response = await signUp(payload);

      if (response?.success) {
        setSnackbarMessage("Account created successfully!");
        setSnackbarVisible(true);

        setTimeout(() => {
          router.replace("/signin");
        }, 1200);
      } else {
        showError(response?.message || "Signup failed");
        setCaptchaToken(null);
        setCaptchaRefreshKey((k) => k + 1);
        scrollRef.current?.scrollToEnd(true);
      }
    } catch (error: any) {
      showError(error?.message || "Signup failed");
      setCaptchaToken(null);
      setCaptchaRefreshKey((k) => k + 1);
      scrollRef.current?.scrollToEnd(true);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        !isDark && { backgroundColor: theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#0F1729" : theme.colors.background}
        translucent={false}
      />

      {/* Back button in foreground (overlay) */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backOverlay}
      >
        <Text style={[styles.backText, !isDark && { color: BRAND }]}>
          ← Back
        </Text>
      </TouchableOpacity>

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={[
          styles.screen,
          !isDark && { backgroundColor: theme.colors.background },
        ]}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        extraHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>
          {/* ── Logo ── */}
          <View style={styles.brandWrap}>
            <Image
              source={
                isDark
                  ? require("@/assets/images/logo.png")
                  : require("@/assets/images/logo_blue.png")
              }
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={[styles.brandText, !isDark && { color: BRAND }]}>
              LendGrid
            </Text>
          </View>

          <Text style={[styles.subtitle, !isDark && { color: "#5A6A8A" }]}>
            Create your account to get started
          </Text>

          {/*  Company Name */}
          <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
            Company Name
          </Text>
          <TextInput
            placeholder="Your Company Ltd."
            placeholderTextColor={isDark ? "#999" : "#AABACF"}
            style={[
              styles.input,
              !isDark && {
                backgroundColor: "#F5F7FF",
                borderColor: BRAND_BORDER,
                borderWidth: 1.5,
                color: "#0D1B3E",
                borderRadius: 10,
              },
            ]}
            value={formData.companyName}
            onChangeText={(v) => handleChange("companyName", v)}
          />
          {errors.companyName ? (
            <Text style={styles.error}>{errors.companyName}</Text>
          ) : null}

          {/*  Full Name + Phone */}
          <View style={styles.row}>
            <View style={styles.colLeft}>
              <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
                Full Name
              </Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor={isDark ? "#999" : "#AABACF"}
                style={[
                  styles.input,
                  !isDark && {
                    backgroundColor: "#F5F7FF",
                    borderColor: BRAND_BORDER,
                    borderWidth: 1.5,
                    color: "#0D1B3E",
                    borderRadius: 10,
                  },
                ]}
                value={formData.fullName}
                onChangeText={(v) => handleChange("fullName", v)}
              />
              {errors.fullName ? (
                <Text style={styles.error}>{errors.fullName}</Text>
              ) : null}
            </View>

            <View style={styles.colRight}>
              <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
                Phone Number
              </Text>
              <TextInput
                placeholder="9876543210"
                placeholderTextColor={isDark ? "#999" : "#AABACF"}
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  !isDark && {
                    backgroundColor: "#F5F7FF",
                    borderColor: BRAND_BORDER,
                    borderWidth: 1.5,
                    color: "#0D1B3E",
                    borderRadius: 10,
                  },
                ]}
                value={formData.contact}
                onChangeText={(v) => handleChange("contact", v)}
              />
              {errors.contact ? (
                <Text style={styles.error}>{errors.contact}</Text>
              ) : null}
            </View>
          </View>

          {/*  Email */}
          <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
            Email Address
          </Text>
          <TextInput
            placeholder="john@company.com"
            placeholderTextColor={isDark ? "#999" : "#AABACF"}
            keyboardType="email-address"
            style={[
              styles.input,
              !isDark && {
                backgroundColor: "#F5F7FF",
                borderColor: BRAND_BORDER,
                borderWidth: 1.5,
                color: "#0D1B3E",
                borderRadius: 10,
              },
            ]}
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.error}>{errors.email}</Text>
          ) : null}

          {/*  Password */}
          <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
            Password
          </Text>
          <View
            style={[
              styles.passwordContainer,
              !isDark && {
                backgroundColor: "#F5F7FF",
                borderColor: BRAND_BORDER,
                borderWidth: 1.5,
                borderRadius: 14,
              },
            ]}
          >
            <TextInput
              placeholder="Create password"
              placeholderTextColor={isDark ? "#999" : "#AABACF"}
              secureTextEntry={!showPassword}
              style={[styles.passwordInput, !isDark && { color: "#0D1B3E" }]}
              value={formData.password}
              onChangeText={(v) => handleChange("password", v)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isDark ? "#999" : BRAND}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          {/*  Confirm Password */}
          <Text style={[styles.label, !isDark && { color: "#0D1B3E" }]}>
            Confirm Password
          </Text>
          <View
            style={[
              styles.passwordContainer,
              !isDark && {
                backgroundColor: "#F5F7FF",
                borderColor: BRAND_BORDER,
                borderWidth: 1.5,
                borderRadius: 14,
              },
            ]}
          >
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={isDark ? "#999" : "#AABACF"}
              secureTextEntry={!showConfirmPassword}
              style={[styles.passwordInput, !isDark && { color: "#0D1B3E" }]}
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange("confirmPassword", v)}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isDark ? "#999" : BRAND}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          ) : null}

          {/*  CAPTCHA */}
          <View style={styles.captchaWrap}>
            <TurnstileCaptcha
              theme={isDark ? "dark" : "light"}
              refreshKey={captchaRefreshKey}
              onToken={(t) => setCaptchaToken(t)}
            />
            {!captchaToken ? (
              <Text
                style={[styles.captchaHint, !isDark && { color: "#8A9EC0" }]}
              >
                Please complete verification to continue
              </Text>
            ) : null}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              !isDark && {
                backgroundColor: BRAND,
                borderRadius: 12,
                shadowColor: BRAND,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              },
              (isPending || !captchaToken) && { opacity: 0.6 },
            ]}
            disabled={isPending || !captchaToken}
            onPress={handleSubmit}
          >
            {isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#FFD600" : "#FFFFFF"}
                />
                <Text
                  style={[styles.loadingText, !isDark && { color: "#FFFFFF" }]}
                >
                  Creating account...
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.signUpButtonText,
                  !isDark && { color: "#FFFFFF" },
                ]}
              >
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text style={[styles.footerText, !isDark && { color: "#5A6A8A" }]}>
              Already have an account?{" "}
              <Text
                style={[
                  styles.signInLink,
                  !isDark && { color: BRAND, fontWeight: "700" },
                ]}
              >
                Sign in
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Snackbar */}
      <View style={styles.snackbarWrap}>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2800}
          style={styles.snackbar}
        >
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </Snackbar>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — original dark-mode styles preserved exactly, light overrides inline
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0F1729" },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },
  inner: { padding: 20, paddingTop: 18 },

  backOverlay: {
    position: "absolute",
    top: 35,
    left: 10,
    zIndex: 9999,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backText: { color: "#FFD600", fontSize: 14, fontWeight: "700" },

  brandWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  brandLogo: { width: 120, height: 120, marginBottom: 0 },
  brandText: {
    color: "#4c7dff",
    fontWeight: "800",
    fontSize: 34,
    marginTop: -24,
  },

  subtitle: {
    color: "#A7B3C7",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },

  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "700",
    marginTop: 10,
  },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  colLeft: { flex: 1 },
  colRight: { flex: 1 },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    color: "#000",
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 11,
    color: "#000",
    fontSize: 14,
  },
  eyeIcon: { paddingLeft: 8, paddingVertical: 6 },

  error: { color: "#ff4d4d", fontSize: 12, marginTop: 4 },

  captchaWrap: { marginTop: 12, alignItems: "center" },
  captchaHint: { color: "#888", fontSize: 12, marginTop: 6 },

  signUpButton: { paddingVertical: 12, alignItems: "center", marginTop: 12 },
  signUpButtonText: { color: "#FFD600", fontWeight: "800", fontSize: 16 },
  loadingText: {
    color: "#FFD600",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "700",
  },

  footerText: {
    textAlign: "center",
    color: "#ccc",
    marginTop: 8,
    fontSize: 14,
  },
  signInLink: { color: "#FFD600", fontWeight: "700" },

  snackbarWrap: {
    position: "absolute",
    top: 130,
    left: 20,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  snackbar: { backgroundColor: "#FFD600", width: "90%", borderRadius: 8 },
  snackbarText: { color: "#000", fontWeight: "700", textAlign: "center" },
});
