import { ThemeToggleBtn } from "@/components/common/AppHeader";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Buffer } from "buffer";
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
import { signInStyles } from "@/styles/auth/signin.styles";
import { COLORS } from "@/styles/theme/tokens";
import * as WebBrowser from "expo-web-browser";

// ─── Brand color (matches logo blue exactly) ──────────────────────────────────
const BRAND = COLORS.primary;
const BRAND_DARK = COLORS.primary;
const BRAND_BG = "#EEF0FD";
const BRAND_BORDER = "#B0B8F0";

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

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
        translucent={false}
      />

      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={120}
      >
        <View style={signInStyles.inner}>
          {/* ── Theme Toggle ── */}
          <View
            style={{
              position: "absolute",
              top: 50,
              right: 20,
              zIndex: 999,
            }}
          >
            <ThemeToggleBtn />
          </View>

          {/* ── Logo ── */}
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Image
              source={
                isDark
                  ? require("@/assets/images/logo.png")
                  : require("@/assets/images/logo_blue.png")
              }
              style={{ width: 130, height: 130, marginBottom: 0 }}
              resizeMode="contain"
            />
            <Text
              style={{
                color: isDark ? BRAND_DARK : BRAND,
                fontWeight: "800",
                fontSize: 36,
                marginTop: -25,
              }}
            >
              LendGrid
            </Text>
          </View>

          {/* ── Tab Switcher ── */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: isDark ? theme.colors.background : BRAND_BG,
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: isDark ? "#2A3A5C" : BRAND_BORDER,
            }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab("user")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 11,
                borderRadius: 9,
                backgroundColor:
                  activeTab === "user"
                    ? isDark
                      ? "#2A3A5C"
                      : BRAND
                    : "transparent",
              }}
            >
              <Ionicons
                name="person-outline"
                size={15}
                color={
                  activeTab === "user" ? "#FFFFFF" : isDark ? "#888" : BRAND
                }
              />
              <Text
                style={{
                  color:
                    activeTab === "user" ? "#FFFFFF" : isDark ? "#888" : BRAND,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                User Login
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("oms")}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 11,
                borderRadius: 9,
                backgroundColor:
                  activeTab === "oms"
                    ? isDark
                      ? BRAND_DARK
                      : BRAND
                    : "transparent",
              }}
            >
              <Ionicons
                name="people-outline"
                size={15}
                color={
                  activeTab === "oms" ? "#FFFFFF" : isDark ? "#888" : BRAND
                }
              />
              <Text
                style={{
                  color:
                    activeTab === "oms" ? "#FFFFFF" : isDark ? "#888" : BRAND,
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                OMS Staff
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Render active form ── */}
          {activeTab === "user" ? (
            <UserLoginForm
              router={router}
              showError={showError}
              isDark={isDark}
            />
          ) : (
            <OmsStaffLoginForm showError={showError} isDark={isDark} />
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* ── Snackbar ── */}
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
          style={{
            backgroundColor: "#FFD600",
            width: "90%",
            borderRadius: 8,
          }}
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: Beautiful field label with icon
// ─────────────────────────────────────────────────────────────────────────────
function FieldLabel({
  label,
  icon,
  isDark,
}: {
  label: string;
  icon: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 7,
        marginTop: 4,
      }}
    >
      <Ionicons
        name={icon as any}
        size={13}
        color={isDark ? BRAND_DARK : BRAND}
      />
      <Text
        style={{
          color: isDark ? BRAND_DARK : BRAND,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER LOGIN FORM
// ─────────────────────────────────────────────────────────────────────────────
function UserLoginForm({
  router,
  showError,
  isDark,
}: {
  router: ReturnType<typeof useRouter>;
  showError: (msg: string) => void;
  isDark: boolean;
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

  return (
    <>
      <FieldLabel label="Email Address" icon="mail-outline" isDark={isDark} />
      <TextInput
        placeholder="Enter your email"
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

      <FieldLabel label="Password" icon="lock-closed-outline" isDark={isDark} />
      <View style={signInStyles.passwordContainer}>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setValue("password", text)}
          style={[
            signInStyles.input,
            { flex: 1, marginBottom: 0 },
            {
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
        style={{ alignSelf: "flex-end", marginTop: 6, marginBottom: 15 }}
      >
        <Text
          style={{
            color: isDark ? "#FFD600" : BRAND,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 14, marginBottom: 8, alignItems: "center" }}>
        <TurnstileCaptcha
          refreshKey={captchaRefreshKey}
          onToken={(t) => setCaptchaToken(t)}
        />
        {!captchaToken && (
          <Text
            style={{
              color: isDark ? "#666" : "#8A9EC0",
              fontSize: 12,
              marginTop: 6,
            }}
          >
            Please complete verification to continue
          </Text>
        )}
      </View>

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
          (isPending || !captchaToken) && { opacity: 0.6 },
        ]}
        disabled={isPending || !captchaToken}
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
              Signing in...
            </Text>
          </View>
        ) : (
          <Text
            style={[signInStyles.signInText, !isDark && { color: "#FFFFFF" }]}
          >
            Sign In ➜
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text
          style={[signInStyles.footerText, !isDark && { color: "#5A6A8A" }]}
        >
          Don&apos;t have an account?{" "}
          <Text
            style={[
              signInStyles.signUpText,
              !isDark && { color: BRAND, fontWeight: "700" },
            ]}
          >
            Sign up
          </Text>
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
}: {
  showError: (msg: string) => void;
  isDark: boolean;
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

  return (
    <>
      {/* ── OMS Badge ── */}
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
          name="shield-checkmark"
          size={14}
          color={isDark ? BRAND_DARK : BRAND}
        />
        <Text
          style={{
            color: isDark ? BRAND_DARK : BRAND,
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.4,
          }}
        >
          OMS STAFF ACCESS
        </Text>
      </View>

      {/* ── Work Email ── */}
      <FieldLabel label="Work Email" icon="mail-outline" isDark={isDark} />
      <TextInput
        placeholder="Enter your work email"
        placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
        onChangeText={(text) => setValue("workEmail", text)}
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
      {errors.workEmail && (
        <Text style={{ color: "#D94F43", marginBottom: 10, fontSize: 12 }}>
          {errors.workEmail.message}
        </Text>
      )}

      {/* ── Password ── */}
      <FieldLabel label="Password" icon="lock-closed-outline" isDark={isDark} />
      <View style={signInStyles.passwordContainer}>
        <TextInput
          placeholder="Enter your OMS password"
          placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
          secureTextEntry={!showPassword}
          onChangeText={(text) => setValue("password", text)}
          style={[
            signInStyles.input,
            { flex: 1, marginBottom: 0 },
            {
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

      {/* ── Sign In Button ── */}
      <TouchableOpacity
        onPress={() => router.push("/oms-forgot-password")}
        style={{ alignSelf: "flex-end", marginTop: 6, marginBottom: 15 }}
      >
        <Text
          style={{
            color: isDark ? "#FFD600" : BRAND,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          Forgot Password?
        </Text>
      </TouchableOpacity>

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
              Signing in...
            </Text>
          </View>
        ) : (
          <Text
            style={[signInStyles.signInText, !isDark && { color: "#FFFFFF" }]}
          >
            Sign In as OMS Staff ➜
          </Text>
        )}
      </TouchableOpacity>

      {/* ── Info Note ── */}
      <View
        style={{
          backgroundColor: isDark ? "#1A2340" : BRAND_BG,
          borderColor: isDark ? "#2A3A5C" : BRAND_BORDER,
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginTop: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={isDark ? "#888" : BRAND}
        />
        <Text
          style={{
            color: isDark ? "#888" : "#3A4A6A",
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
