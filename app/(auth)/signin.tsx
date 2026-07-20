import { ThemeToggleBtn } from "@/components/common/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { z } from "zod";

import {
  apolloClient,
  setGraphqlAuthToken,
} from "@/apis/config/graphql_Notification_Client";
import { ROUTES } from "@/assets/constants/routes";
import TurnstileCaptcha from "@/components/login_Signup/TurnstileCaptcha";
import { useLogin } from "@/hooks/useAuth";
import { useOmsLogin } from "@/hooks/useOMSauth";
import {
  clearLocalNotifications,
  syncPushTokenForCurrentUser,
  unregisterPushTokenForCurrentUser,
} from "@/lib/utils/pushSession";
import { signInSchema, SignInSchemaType } from "@/lib/validators/signin.schema";
import { COLORS } from "@/styles/theme/tokens";

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const BRAND = COLORS.primary;

// ─── OMS Staff Schema ─────────────────────────────────────────────────────────
const omsSignInSchema = z.object({
  workEmail: z
    .string()
    .min(1, "Work email is required")
    .email("Enter a valid work email"),
  password: z.string().min(1, "Password is required"),
});
type OmsSignInSchemaType = z.infer<typeof omsSignInSchema>;

// ─── JWT Parser ───────────────────────────────────────────────────────────────
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "user" | "oms";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SignIn() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("user");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const theme = useTheme();
  const isDark = theme.dark;

  const showError = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  // ─── Dynamic colors based on mode ─────────────────────────────────────────
  const bg = isDark ? "#0D1117" : "#F5F6FA";
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const inputBg = isDark ? "#1C2333" : "#F0F2F8";
  const inputBorder = isDark ? "#2D3748" : "#E2E6F0";
  const inputText = isDark ? "#E8EAF0" : "#1A1D2E";
  const placeholderText = isDark ? "#4A5568" : "#9DA3B4";
  const labelText = isDark ? "#8B95A9" : "#6B7280";
  const dividerColor = isDark ? "#2D3748" : "#E5E7EB";
  // Soft accent for dark mode text links — avoids harsh electric blue on dark bg
  const accent = isDark ? "#818CF8" : BRAND;

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={bg}
        translucent={false}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={120}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40, justifyContent: "center" }}>

          {/* ── Theme Toggle ── */}
          <View style={{ position: "absolute", top: 50, right: 24, zIndex: 999 }}>
            <ThemeToggleBtn />
          </View>

          {/* ── Logo Section ── */}
          <View style={{ alignItems: "center", marginBottom: 36, marginTop: 60 }}>
            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 28,
                backgroundColor: isDark ? "#1C2333" : "#EEF2FF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                shadowColor: BRAND,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.4 : 0.15,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Image
                source={
                  isDark
                    ? require("@/assets/images/logo.png")
                    : require("@/assets/images/logo_blue.png")
                }
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: isDark ? "#FFFFFF" : "#1A1D2E",
                letterSpacing: -0.5,
                marginBottom: 6,
              }}
            >
              Welcome back
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: labelText,
                fontWeight: "400",
              }}
            >
              Sign in to your LendGrid account
            </Text>
          </View>

          {/* ── Card ── */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 28,
              padding: 24,
              shadowColor: isDark ? "#000000" : "#6366F1",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.5 : 0.08,
              shadowRadius: 20,
              elevation: 8,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? "#2D3748" : "transparent",
            }}
          >
            {/* ── Tab Switcher ── */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: isDark ? "#0D1117" : "#ECEEF8",
                borderRadius: 50,
                padding: 3,
                marginBottom: 20,
                alignSelf: "center",
                width: "100%",
              }}
            >
              {/* User Login Tab */}
              <TouchableOpacity
                onPress={() => setActiveTab("user")}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  paddingVertical: 8,
                  borderRadius: 50,
                  backgroundColor:
                    activeTab === "user" ? BRAND : "transparent",
                  shadowColor: activeTab === "user" ? BRAND : "transparent",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.35,
                  shadowRadius: 6,
                  elevation: activeTab === "user" ? 3 : 0,
                }}
              >
                <Ionicons
                  name={activeTab === "user" ? "person" : "person-outline"}
                  size={13}
                  color={activeTab === "user" ? "#FFFFFF" : labelText}
                />
                <Text
                  style={{
                    color: activeTab === "user" ? "#FFFFFF" : labelText,
                    fontWeight: activeTab === "user" ? "700" : "500",
                    fontSize: 12,
                    letterSpacing: 0.2,
                  }}
                >
                  Partner Login
                </Text>
              </TouchableOpacity>

              {/* OMS Staff Tab */}
              <TouchableOpacity
                onPress={() => setActiveTab("oms")}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  paddingVertical: 8,
                  borderRadius: 50,
                  backgroundColor:
                    activeTab === "oms" ? BRAND : "transparent",
                  shadowColor: activeTab === "oms" ? BRAND : "transparent",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.35,
                  shadowRadius: 6,
                  elevation: activeTab === "oms" ? 3 : 0,
                }}
              >
                <Ionicons
                  name={activeTab === "oms" ? "briefcase" : "briefcase-outline"}
                  size={13}
                  color={activeTab === "oms" ? "#FFFFFF" : labelText}
                />
                <Text
                  style={{
                    color: activeTab === "oms" ? "#FFFFFF" : labelText,
                    fontWeight: activeTab === "oms" ? "700" : "500",
                    fontSize: 12,
                    letterSpacing: 0.2,
                  }}
                >
                  Staff Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Form ── */}
            {activeTab === "user" ? (
              <UserLoginForm
                router={router}
                showError={showError}
                isDark={isDark}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputText={inputText}
                placeholderText={placeholderText}
                labelText={labelText}
                dividerColor={dividerColor}
                accent={accent}
              />
            ) : (
              <OmsStaffLoginForm
                showError={showError}
                isDark={isDark}
                inputBg={inputBg}
                inputBorder={inputBorder}
                inputText={inputText}
                placeholderText={placeholderText}
                labelText={labelText}
                accent={accent}
              />
            )}
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
            backgroundColor: isDark ? "#2D1B1B" : "#FEF2F2",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? "#7F1D1D" : "#FECACA",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="alert-circle" size={16} color={isDark ? "#FC8181" : "#EF4444"} />
            <Text style={{ color: isDark ? "#FC8181" : "#DC2626", fontWeight: "600", fontSize: 13, flex: 1 }}>
              {snackbarMessage}
            </Text>
          </View>
        </Snackbar>
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Field Label
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({
  label,
  isDark,
  labelText,
}: {
  label: string;
  isDark: boolean;
  labelText: string;
}) {
  return (
    <Text
      style={{
        color: labelText,
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {label}
    </Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────
function UserLoginForm({
  router,
  showError,
  isDark,
  inputBg,
  inputBorder,
  inputText,
  placeholderText,
  labelText,
  dividerColor,
  accent,
}: {
  router: ReturnType<typeof useRouter>;
  showError: (msg: string) => void;
  isDark: boolean;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  labelText: string;
  dividerColor: string;
  accent: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: login, isPending } = useLogin();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    if (!captchaToken) {
      showError("Please verify that you are not a bot.");
      return;
    }

    try {
      const response = await login({
        email: data.email,
        password: data.password,
        captchaToken,
      });

      if (response?.success && response?.access_token) {
        const token = response.access_token;
        const previousToken = await AsyncStorage.getItem("token");

        if (previousToken) {
          setGraphqlAuthToken(previousToken);
          await unregisterPushTokenForCurrentUser();
          await clearLocalNotifications();
        }

        await AsyncStorage.clear();
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("authSource", "user");

        const payload = parseJwt(token);
        const role = payload?.role?.toLowerCase() || "";

        const isSales = role === "sales";
        const isAggregatorMember = role === "aggregator_member";
        const isAggregatorAdmin =
          role === "aggregator_admin" || role === "aggregator";

        let userType = "sales";
        if (isAggregatorAdmin) {
          userType = "aggregator";
        } else if (isSales || isAggregatorMember) {
          userType = "sales";
        }

        await AsyncStorage.setItem("userType", userType);
        await AsyncStorage.setItem(
          "authSource",
          isAggregatorMember ? "oms" : "user",
        );

        const companyIdValue =
          payload?.companyId ??
          payload?.company_id ??
          payload?.company?.id ??
          payload?.company?.companyId ??
          payload?.company?.company_id ??
          payload?.user?.companyId ??
          payload?.user?.company_id ??
          payload?.data?.companyId ??
          payload?.data?.company_id ??
          payload?.tenant?.companyId ??
          payload?.tenant?.company_id;
        if (companyIdValue !== undefined && companyIdValue !== null) {
          await AsyncStorage.setItem("companyId", String(companyIdValue));
        }

        const userIdValue =
          payload?.userId ??
          payload?.id ??
          payload?.sub ??
          payload?.salesUserId ??
          payload?.user_id;
        if (userIdValue !== undefined && userIdValue !== null) {
          await AsyncStorage.setItem("userId", String(userIdValue));
        }

        setGraphqlAuthToken(token);
        await apolloClient.clearStore();

        try {
          await syncPushTokenForCurrentUser();
        } catch (err) {
          console.error("Push token error:", err);
        }

        const nextRoute =
          userType === "sales" ? "/(tab)/applications" : ROUTES.Dashboard;
        router.replace(nextRoute);
      } else {
        showError(response?.message || "Login failed");
        setCaptchaToken(null);
        setCaptchaRefreshKey((k) => k + 1);
      }
    } catch (err: any) {
      showError(err?.message || "Invalid email or password");
      setCaptchaToken(null);
      setCaptchaRefreshKey((k) => k + 1);
    }
  };

  // Shared container style for all inputs (Android Material filled style)
  const fieldContainer = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: inputBg,
    borderRadius: 20,
    marginBottom: 4,
    minHeight: 56,
    overflow: "hidden" as const,
  };

  const fieldTextStyle = {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 0,
    fontSize: 15,
    color: inputText,
    height: 56,
  };

  const fieldIconBtn = {
    width: 48,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <>
      {/* Email */}
      <FieldLabel label="Email Address" isDark={isDark} labelText={labelText} />
      <View style={fieldContainer}>
        <TextInput
          placeholder="you@company.com"
          placeholderTextColor={placeholderText}
          onChangeText={(text) => setValue("email", text)}
          style={fieldTextStyle}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={fieldIconBtn}>
          <Ionicons name="mail-outline" size={18} color={placeholderText} />
        </View>
      </View>
      {errors.email && (
        <Text style={styles.errorText}>{errors.email.message}</Text>
      )}

      {/* Spacer */}
      <View style={{ height: 14 }} />

      {/* Password */}
      <FieldLabel label="Password" isDark={isDark} labelText={labelText} />
      <View style={fieldContainer}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={placeholderText}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setValue("password", text)}
          style={fieldTextStyle}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={fieldIconBtn}
          activeOpacity={0.6}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={showPassword ? accent : placeholderText}
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={async () => {
          const forgotPasswordUrl = process.env.EXPO_PUBLIC_FORGOT_PASSWORD_URL;
          if (!forgotPasswordUrl) {
            showError("Reset link is not configured.");
            return;
          }
          try {
            await WebBrowser.openBrowserAsync(forgotPasswordUrl, {
              toolbarColor: "#0F1729",
              enableBarCollapsing: true,
              showTitle: true,
            });
          } catch {
            showError("Could not open the browser");
          }
        }}
        style={{ alignSelf: "flex-end", marginTop: 10, marginBottom: 20 }}
      >
        <Text
          style={{
            color: accent,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Captcha */}
      <View style={{ marginBottom: 8, alignItems: "center" }}>
        <TurnstileCaptcha
          theme={isDark ? "dark" : "light"}
          refreshKey={captchaRefreshKey}
          onToken={(t) => setCaptchaToken(t)}
        />
        {!captchaToken && (
          <Text
            style={{
              color: labelText,
              fontSize: 12,
              marginTop: 6,
            }}
          >
            Please complete verification to continue
          </Text>
        )}
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[
          {
            backgroundColor: BRAND,
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 12,
            shadowColor: BRAND,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          (isPending || !captchaToken) && { opacity: 0.6 },
        ]}
        disabled={isPending || !captchaToken}
        onPress={handleSubmit(onSubmit)}
      >
        {isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Signing in...
            </Text>
          </View>
        ) : (
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 24, gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: dividerColor }} />
        <Text style={{ color: labelText, fontSize: 12, fontWeight: "500" }}>OR</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: dividerColor }} />
      </View>

      {/* Sign Up Link */}
      <TouchableOpacity
        onPress={() => router.push("/signup")}
        style={{
          borderWidth: 1.5,
          borderColor: isDark ? "#2D3748" : "#E2E6F0",
          borderRadius: 20,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? "#E8EAF0" : "#1A1D2E",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          Don&apos;t have an account?{" "}
          <Text style={{ color: accent, fontWeight: "700" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        onPress={() => router.push("/delete-account")}
        style={{ marginTop: 20, alignSelf: "center" }}
      >
        <Text
          style={{
            color: labelText,
            fontSize: 12,
            textDecorationLine: "underline",
          }}
        >
          Request Account Deletion
        </Text>
      </TouchableOpacity>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OMS STAFF LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────
function OmsStaffLoginForm({
  showError,
  isDark,
  inputBg,
  inputBorder,
  inputText,
  placeholderText,
  labelText,
  accent,
}: {
  showError: (msg: string) => void;
  isDark: boolean;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  labelText: string;
  accent: string;
}) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { loginOmsStaff, isPending } = useOmsLogin();

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<OmsSignInSchemaType>({
    resolver: zodResolver(omsSignInSchema),
    defaultValues: { workEmail: "", password: "" },
  });

  const onSubmit = async (data: OmsSignInSchemaType) => {
    await loginOmsStaff(
      { email: data.workEmail, password: data.password },
      showError,
    );
  };

  const fieldContainer = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: inputBg,
    borderRadius: 20,
    marginBottom: 4,
    minHeight: 56,
    overflow: "hidden" as const,
  };

  const fieldTextStyle = {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 0,
    fontSize: 15,
    color: inputText,
    height: 56,
  };

  const fieldIconBtn = {
    width: 48,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };

  return (
    <>
      {/* OMS Badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#1A2340" : "#EEF2FF",
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 6,
          alignSelf: "center",
          marginBottom: 20,
          gap: 6,
          borderWidth: 1,
          borderColor: isDark ? "#2D3748" : "#C7D2FE",
        }}
      >
        <Ionicons
          name="shield-checkmark"
          size={14}
          color={BRAND}
        />
        <Text
          style={{
            color: BRAND,
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.6,
          }}
        >
          OMS STAFF ACCESS
        </Text>
      </View>

      {/* Work Email */}
      <FieldLabel label="Work Email" isDark={isDark} labelText={labelText} />
      <View style={fieldContainer}>
        <TextInput
          placeholder="Enter your work email"
          placeholderTextColor={placeholderText}
          onChangeText={(text) => setValue("workEmail", text)}
          style={fieldTextStyle}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={fieldIconBtn}>
          <Ionicons name="mail-outline" size={18} color={placeholderText} />
        </View>
      </View>
      {errors.workEmail && (
        <Text style={styles.errorText}>{errors.workEmail.message}</Text>
      )}

      <View style={{ height: 14 }} />

      {/* Password */}
      <FieldLabel label="Password" isDark={isDark} labelText={labelText} />
      <View style={fieldContainer}>
        <TextInput
          placeholder="Enter your OMS password"
          placeholderTextColor={placeholderText}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setValue("password", text)}
          style={fieldTextStyle}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={fieldIconBtn}
          activeOpacity={0.6}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={showPassword ? accent : placeholderText}
          />
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() => router.push("/oms-forgot-password")}
        style={{ alignSelf: "flex-end", marginTop: 10, marginBottom: 20 }}
      >
        <Text style={{ color: accent, fontSize: 13, fontWeight: "600" }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={[
          {
            backgroundColor: BRAND,
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 4,
            shadowColor: BRAND,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          },
          isPending && { opacity: 0.6 },
        ]}
        disabled={isPending}
        onPress={handleSubmit(onSubmit)}
      >
        {isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
              Signing in...
            </Text>
          </View>
        ) : (
          <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 }}>
            Sign In as OMS Staff
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Note */}
      <View
        style={{
          backgroundColor: isDark ? "#1C2333" : "#F0F2F8",
          borderRadius: 12,
          padding: 14,
          marginTop: 20,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 10,
          borderWidth: 1,
          borderColor: isDark ? "#2D3748" : "#E2E6F0",
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={labelText}
          style={{ marginTop: 1 }}
        />
        <Text
          style={{
            color: labelText,
            fontSize: 12,
            flex: 1,
            lineHeight: 18,
          }}
        >
          Use your OMS credentials to login. Contact your administrator if you
          need access.
        </Text>
      </View>
    </>
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
