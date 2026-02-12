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
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";

import { setGraphqlAuthToken } from "@/apis/config/graphql_Notification_Client";
import { ROUTES } from "@/assets/constants/routes";
import { useLogin } from "@/hooks/useAuth";
import { signInSchema, SignInSchemaType } from "@/lib/validators/signin.schema";
import { signInStyles } from "@/styles/auth/signin.styles";

import TurnstileCaptcha from "@/components/login_Signup/TurnstileCaptcha"; // ✅ add this

// Decode JWT payload (companyId token me hi hai)
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

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { mutateAsync: login, isPending } = useLogin();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Turnstile token
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const showError = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    //  Block if not verified
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

        await AsyncStorage.setItem("token", token);

        const payload = parseJwt(token);
        const companyId = payload?.companyId;

        if (companyId !== undefined && companyId !== null) {
          await AsyncStorage.setItem("companyId", String(companyId));
        }

        setGraphqlAuthToken(token);

        router.replace(ROUTES.Dashboard);
      } else {
        showError(response?.message || "Login failed");

        //  reset captcha on failure
        setCaptchaToken(null);
        setCaptchaRefreshKey((k) => k + 1);
      }
    } catch (err: any) {
      showError(err?.message || "Invalid email or password");

      //  reset captcha on error
      setCaptchaToken(null);
      setCaptchaRefreshKey((k) => k + 1);
    }
  };

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0c0c0c" }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={signInStyles.inner}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 130, height: 130, marginBottom: 0 }}
              resizeMode="contain"
            />

            <Text
              style={{
                color: "#4c7dff",
                fontWeight: "800",
                fontSize: 36,
                marginTop: -25,
              }}
            >
              LendGrid
            </Text>
          </View>

          <Text style={signInStyles.label}>Email Address</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#888"
            onChangeText={(text) => setValue("email", text)}
            style={signInStyles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {errors.email && (
            <Text style={{ color: "red", marginBottom: 10 }}>
              {errors.email.message}
            </Text>
          )}

          <Text style={signInStyles.label}>Password</Text>
          <View style={signInStyles.passwordContainer}>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#888"
              secureTextEntry={!showPassword}
              onChangeText={(text) => setValue("password", text)}
              style={[signInStyles.input, { flex: 1, marginBottom: 0 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={signInStyles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={{ color: "red", marginBottom: 10 }}>
              {errors.password.message}
            </Text>
          )}

          {/*  Turnstile */}
          <View
            style={{ marginTop: 14, marginBottom: 8, alignItems: "center" }}
          >
            <TurnstileCaptcha
              theme="dark"
              refreshKey={captchaRefreshKey}
              onToken={(t) => setCaptchaToken(t)}
            />
            {!captchaToken ? (
              <Text style={{ color: "#888", fontSize: 12, marginTop: 6 }}>
                Please complete verification to continue
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              signInStyles.signInButton,
              (isPending || !captchaToken) && { opacity: 0.6 },
            ]}
            disabled={isPending || !captchaToken}
            onPress={handleSubmit(onSubmit)}
          >
            {isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator size="small" color="#FFD600" />
                <Text
                  style={{
                    color: "#FFD600",
                    marginLeft: 8,
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Signing in...
                </Text>
              </View>
            ) : (
              <Text style={signInStyles.signInText}>Sign In ➜</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={signInStyles.footerText}>
              Don’t have an account?{" "}
              <Text style={signInStyles.signUpText}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
