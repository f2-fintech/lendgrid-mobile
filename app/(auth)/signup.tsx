import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Snackbar } from "react-native-paper";

import TurnstileCaptcha from "@/components/login_Signup/TurnstileCaptcha";
import { useSignUp } from "@/hooks/useAuth";
import { signUpSchema, SignUpSchemaType } from "@/lib/validators/signup.schema";

export default function SignUp() {
  const router = useRouter();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);

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
    <View style={styles.screen}>
      {/* Back button in foreground (overlay) */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backOverlay}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        extraHeight={120}
      >
        <View style={styles.inner}>
          {/*  Saved logo style */}
          <View style={styles.brandWrap}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>LendGrid</Text>
          </View>

          <Text style={styles.subtitle}>
            Create your account to get started
          </Text>

          {/*  Company Name */}
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            placeholder="Your Company Ltd."
            placeholderTextColor="#999"
            style={styles.input}
            value={formData.companyName}
            onChangeText={(v) => handleChange("companyName", v)}
          />
          {errors.companyName ? (
            <Text style={styles.error}>{errors.companyName}</Text>
          ) : null}

          {/*  Full Name + Phone */}
          <View style={styles.row}>
            <View style={styles.colLeft}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#999"
                style={styles.input}
                value={formData.fullName}
                onChangeText={(v) => handleChange("fullName", v)}
              />
              {errors.fullName ? (
                <Text style={styles.error}>{errors.fullName}</Text>
              ) : null}
            </View>

            <View style={styles.colRight}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                placeholder="9876543210"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                style={styles.input}
                value={formData.contact}
                onChangeText={(v) => handleChange("contact", v)}
              />
              {errors.contact ? (
                <Text style={styles.error}>{errors.contact}</Text>
              ) : null}
            </View>
          </View>

          {/*  Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="john@company.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={styles.error}>{errors.email}</Text>
          ) : null}

          {/*  Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
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
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          {/*  Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              style={styles.passwordInput}
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
                color="#999"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          ) : null}

          {/*  CAPTCHA */}
          <View style={styles.captchaWrap}>
            <TurnstileCaptcha
              theme="dark"
              refreshKey={captchaRefreshKey}
              onToken={(t) => setCaptchaToken(t)}
            />
            {!captchaToken ? (
              <Text style={styles.captchaHint}>
                Please complete verification to continue
              </Text>
            ) : null}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.signUpButton,
              (isPending || !captchaToken) && { opacity: 0.6 },
            ]}
            disabled={isPending || !captchaToken}
            onPress={handleSubmit}
          >
            {isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color="#FFD600" />
                <Text style={styles.loadingText}>Creating account...</Text>
              </View>
            ) : (
              <Text style={styles.signUpButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInLink}>Sign in</Text>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0c0c0c" },
  scrollContent: { flexGrow: 1, paddingBottom: 80 },

  // slight top padding so overlay button doesn't overlap logo tap area
  inner: { padding: 20, paddingTop: 18 },

  // Back button overlay (foreground)
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
