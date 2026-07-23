import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { useSignUp, useLogin } from "@/hooks/useAuth";
import { restApi } from "@/apis/config/axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { decodeJwt } from "@/lib/utils/utils";
import { signUpSchema, SignUpSchemaType } from "@/lib/validators/signup.schema";
import { COLORS } from "@/styles/theme/tokens";

const BRAND = COLORS.primary;

export default function SignUp() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    ref?: string | string[];
    c_name?: string | string[];
  }>();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const theme = useTheme();
  const isDark = theme.dark;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutateAsync: signUp, isPending } = useSignUp();
  const { mutateAsync: loginMutation, isPending: isLoginPending } = useLogin();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"error" | "success">("error");

  const showError = (msg: string) => {
    setSnackbarType("error");
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  const showSuccess = (msg: string) => {
    setSnackbarType("success");
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
    referralCode: "",
    parentCompanyName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const readParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] || "" : value || "";

  const referralCodeFromParams = readParam(params.ref).trim();
  const parentCompanyNameFromParams = readParam(params.c_name).trim();

  useEffect(() => {
    if (referralCodeFromParams) {
      setFormData((prev) => ({
        ...prev,
        referralCode: referralCodeFromParams,
        parentCompanyName: parentCompanyNameFromParams,
        companyName: parentCompanyNameFromParams || prev.companyName,
        role: "AGGREGATOR_MEMBER",
      }));
    }
  }, [referralCodeFromParams, parentCompanyNameFromParams]);

  const isReferralSignup = Boolean(formData.referralCode);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      role: isReferralSignup ? "AGGREGATOR_MEMBER" : "AGGREGATOR_ADMIN",
    }));
  }, [isReferralSignup]);

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
        role: isReferralSignup ? "AGGREGATOR_MEMBER" : "AGGREGATOR_ADMIN",
        companyName: formData.parentCompanyName || apiData.companyName,
        aggregatorType: "CHANNEL_PARTNER",
        isOmsEnabled: true,
        fixedCommissionPercent: 0.75,
        contact: apiData.contact,
        referralCode: isReferralSignup ? formData.referralCode : undefined,
        captchaToken,
      };

      const response = await signUp(payload);

      if (!response?.success) {
        showError(response?.message || "Signup failed");
        setCaptchaToken(null);
        setCaptchaRefreshKey((k) => k + 1);
        scrollRef.current?.scrollToEnd(true);
        return;
      }

      const companyId = response.companyId;

      if (!isReferralSignup && !companyId) {
        throw new Error("Aggregator profile not created");
      }

      // Create Company (REST Api) - Non-blocking (Skip if registering as member)
      if (!isReferralSignup) {
        try {
          const companyRes = await restApi.post("/companies", {
            name: apiData.companyName || `${apiData.fullName}'s Agency`,
            email: apiData.email,
            contactNumber: apiData.contact,
            companyId,
          });

          if (companyRes.status !== 200 && companyRes.status !== 201) {
            console.warn("Company creation failed:", companyRes.data);
            showError("Account created but company profile sync failed. Please contact support.");
          }
        } catch (companyError) {
          console.error("Company creation error:", companyError);
          showError("Secondary server unavailable. Account created locally.");
        }
      }

      if (isReferralSignup) {
        showSuccess("Agent created successfully!");
        setTimeout(() => {
          router.replace("/signin");
        }, 1200);
        return;
      }

      // Auto-login
      const loginResponse = await loginMutation({
        email: payload.email,
        password: payload.password,
        captchaToken: "", // Empty token signals auto-login
      });

      if (!loginResponse?.success) {
        showError(loginResponse?.message || "Unable to login. Please try logging in manually.");
        setTimeout(() => {
          router.replace("/signin");
        }, 1200);
        return;
      }

      const token = loginResponse?.access_token;
      if (token) {
        await AsyncStorage.setItem("token", token);
        setGraphqlAuthToken(token);

        const decoded = decodeJwt(token);
        const role = decoded?.role;

        const companyIdValue =
          decoded?.companyId ??
          decoded?.company_id ??
          decoded?.company?.id ??
          decoded?.company?.companyId ??
          decoded?.user?.companyId ??
          decoded?.data?.companyId ??
          decoded?.tenant?.companyId ??
          companyId; // Fallback to the one created during signup
          
        if (companyIdValue) {
          await AsyncStorage.setItem("companyId", String(companyIdValue));
          await AsyncStorage.setItem("selectedCompanyId", String(companyIdValue)); // Ensure it's selected
        }

        const userIdValue =
          decoded?.userId ??
          decoded?.id ??
          decoded?.sub ??
          decoded?.salesUserId ??
          decoded?.user_id;
        if (userIdValue) {
          await AsyncStorage.setItem("userId", String(userIdValue));
        }

        showSuccess("Account created successfully!");
        
        setTimeout(() => {
          if (role === "aggregator_admin" || role === "AGGREGATOR_ADMIN") {
            router.replace("/(tab)/dashboard");
          } else if (role === "aggregator_member" || role === "AGGREGATOR_MEMBER") {
            router.replace("/(tab)/applications");
          } else {
            router.replace("/(tab)/dashboard");
          }
        }, 1200);
      } else {
        throw new Error("No token returned from login");
      }

    } catch (error: any) {
      showError(error?.message || "Signup failed");
      setCaptchaToken(null);
      setCaptchaRefreshKey((k) => k + 1);
      scrollRef.current?.scrollToEnd(true);
    }
  };

  // ─── Dynamic theme colors ────────────────────────────────────────────────
  const bg = isDark ? "#0D1117" : "#F5F6FA";
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const inputBg = isDark ? "#1C2333" : "#F0F2F8";
  const inputBorder = isDark ? "#2D3748" : "#E2E6F0";
  const inputText = isDark ? "#E8EAF0" : "#1A1D2E";
  const placeholderText = isDark ? "#4A5568" : "#9DA3B4";
  const labelText = isDark ? "#8B95A9" : "#6B7280";

  const inputStyle = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    borderWidth: 1.5,
    borderRadius: 14,
    color: inputText,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={bg}
        translucent={false}
      />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 44,
          left: 20,
          zIndex: 9999,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          padding: 8,
        }}
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={isDark ? "#8B95A9" : "#6B7280"}
        />
        <Text style={{ color: isDark ? "#8B95A9" : "#6B7280", fontSize: 14, fontWeight: "600" }}>
          Back
        </Text>
      </TouchableOpacity>

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        extraHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 24, paddingTop: 96, paddingBottom: 32 }}>

          {/* ── Header ── */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                backgroundColor: isDark ? "#1C2333" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                shadowColor: BRAND,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Image
                source={
                  isDark
                    ? require("@/assets/images/logo.png")
                    : require("@/assets/images/logo_blue.png")
                }
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: isDark ? "#FFFFFF" : "#1A1D2E",
                letterSpacing: -0.5,
                marginBottom: 6,
              }}
            >
              Create Account
            </Text>
            <Text style={{ fontSize: 14, color: labelText }}>
              {isReferralSignup
                ? "You're joining via referral link"
                : "Start your journey with LendGrid"}
            </Text>
          </View>

          {/* ── Referral Banner ── */}
          {isReferralSignup && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "#1A2340" : "#EEF2FF",
                borderRadius: 14,
                padding: 14,
                marginBottom: 20,
                gap: 10,
                borderWidth: 1,
                borderColor: isDark ? "#2D3748" : "#C7D2FE",
              }}
            >
              <Ionicons name="gift-outline" size={18} color={BRAND} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: BRAND, fontSize: 13, fontWeight: "700" }}>
                  Referral Signup
                </Text>
                {formData.parentCompanyName ? (
                  <Text style={{ color: labelText, fontSize: 12, marginTop: 2 }}>
                    Referred by: {formData.parentCompanyName}
                  </Text>
                ) : null}
              </View>
            </View>
          )}

          {/* ── Form Card ── */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 24,
              padding: 22,
              shadowColor: isDark ? "#000000" : "#6366F1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.5 : 0.08,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#2D3748" : "transparent",
            }}
          >
            {/* ── Referral Code ── */}
            <FieldLabel label="Referral Code (Optional)" labelText={labelText} />
            <TextInput
              placeholder="Enter referral code"
              placeholderTextColor={placeholderText}
              style={inputStyle}
              value={formData.referralCode}
              onChangeText={(v) => handleChange("referralCode", v)}
            />

            <View style={{ height: 16 }} />

            {/* ── Company Name ── */}
            {isReferralSignup ? (
              formData.parentCompanyName ? (
                <>
                  <FieldLabel label="Referred By Company" labelText={labelText} />
                  <TextInput
                    editable={false}
                    style={[inputStyle, { opacity: 0.7, color: BRAND, fontWeight: "700" }]}
                    value={formData.parentCompanyName}
                  />
                  <View style={{ height: 16 }} />
                </>
              ) : null
            ) : (
              <>
                <FieldLabel label="Company Name" labelText={labelText} />
                <TextInput
                  placeholder="Your Company Ltd."
                  placeholderTextColor={placeholderText}
                  style={inputStyle}
                  value={formData.companyName}
                  onChangeText={(v) => handleChange("companyName", v)}
                />
                {errors.companyName ? (
                  <Text style={styles.errorText}>{errors.companyName}</Text>
                ) : null}
                <View style={{ height: 16 }} />
              </>
            )}

            {/* ── Full Name + Phone (2 cols) ── */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Full Name" labelText={labelText} />
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor={placeholderText}
                  style={inputStyle}
                  value={formData.fullName}
                  onChangeText={(v) => handleChange("fullName", v)}
                />
                {errors.fullName ? (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                ) : null}
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Phone" labelText={labelText} />
                <TextInput
                  placeholder="9876543210"
                  placeholderTextColor={placeholderText}
                  keyboardType="phone-pad"
                  style={inputStyle}
                  value={formData.contact}
                  onChangeText={(v) => handleChange("contact", v)}
                />
                {errors.contact ? (
                  <Text style={styles.errorText}>{errors.contact}</Text>
                ) : null}
              </View>
            </View>

            <View style={{ height: 16 }} />

            {/* ── Email ── */}
            <FieldLabel label="Email Address" labelText={labelText} />
            <TextInput
              placeholder="john@company.com"
              placeholderTextColor={placeholderText}
              keyboardType="email-address"
              style={inputStyle}
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <View style={{ height: 16 }} />

            {/* ── Password ── */}
            <FieldLabel label="Password" labelText={labelText} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1.5,
                borderRadius: 14,
              }}
            >
              <TextInput
                placeholder="Create password"
                placeholderTextColor={placeholderText}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: inputText,
                }}
                value={formData.password}
                onChangeText={(v) => handleChange("password", v)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ paddingHorizontal: 14, paddingVertical: 4 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={labelText}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <View style={{ height: 16 }} />

            {/* ── Confirm Password ── */}
            <FieldLabel label="Confirm Password" labelText={labelText} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: inputBg,
                borderColor: inputBorder,
                borderWidth: 1.5,
                borderRadius: 14,
              }}
            >
              <TextInput
                placeholder="Confirm password"
                placeholderTextColor={placeholderText}
                secureTextEntry={!showConfirmPassword}
                style={{
                  flex: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: inputText,
                }}
                value={formData.confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ paddingHorizontal: 14, paddingVertical: 4 }}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={labelText}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            {/* ── CAPTCHA ── */}
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <TurnstileCaptcha
                theme={isDark ? "dark" : "light"}
                refreshKey={captchaRefreshKey}
                onToken={(t) => setCaptchaToken(t)}
              />
              {!captchaToken ? (
                <Text style={{ color: labelText, fontSize: 12, marginTop: 6 }}>
                  Please complete verification to continue
                </Text>
              ) : null}
            </View>

            {/* ── Create Account Button ── */}
            <TouchableOpacity
              style={[
                {
                  backgroundColor: BRAND,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: 20,
                  shadowColor: BRAND,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 8,
                },
                (isPending || isLoginPending || !captchaToken) && { opacity: 0.6 },
              ]}
              disabled={isPending || isLoginPending || !captchaToken}
              onPress={handleSubmit}
            >
              {isPending || isLoginPending ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                    Creating account...
                  </Text>
                </View>
              ) : (
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* ── Sign In Link ── */}
            <TouchableOpacity
              onPress={() => router.push("/signin")}
              style={{ marginTop: 20, alignItems: "center" }}
            >
              <Text style={{ color: labelText, fontSize: 14 }}>
                Already have an account?{" "}
                <Text style={{ color: BRAND, fontWeight: "700" }}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* ── Snackbar ── */}
      <View
        style={{
          position: "absolute",
          top: 120,
          left: 20,
          right: 20,
          alignItems: "center",
          zIndex: 999,
        }}
      >
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2800}
          style={{
            backgroundColor:
              snackbarType === "success"
                ? isDark ? "#14532D" : "#F0FDF4"
                : isDark ? "#2D1B1B" : "#FEF2F2",
            borderRadius: 12,
            borderWidth: 1,
            borderColor:
              snackbarType === "success"
                ? isDark ? "#166534" : "#BBF7D0"
                : isDark ? "#7F1D1D" : "#FECACA",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name={snackbarType === "success" ? "checkmark-circle" : "alert-circle"}
              size={16}
              color={
                snackbarType === "success"
                  ? isDark ? "#4ADE80" : "#16A34A"
                  : isDark ? "#FC8181" : "#EF4444"
              }
            />
            <Text
              style={{
                color:
                  snackbarType === "success"
                    ? isDark ? "#4ADE80" : "#15803D"
                    : isDark ? "#FC8181" : "#DC2626",
                fontWeight: "600",
                fontSize: 13,
                flex: 1,
              }}
            >
              {snackbarMessage}
            </Text>
          </View>
        </Snackbar>
      </View>
    </View>
  );
}

function FieldLabel({ label, labelText }: { label: string; labelText: string }) {
  return (
    <Text
      style={{
        color: labelText,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 4,
  },
});
