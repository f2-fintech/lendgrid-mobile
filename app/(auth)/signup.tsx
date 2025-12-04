import { signUpApi } from "@/apis/auth.api";
import { signUpStyles as styles } from "@/styles/components/auth/signup.style";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { signUpSchema, SignUpSchemaType } from "@/lib/validators/signup.schema";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleChange = <K extends keyof SignUpSchemaType>(
    key: K,
    value: SignUpSchemaType[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async () => {
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const errObj: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errObj[issue.path[0] as string] = issue.message;
      });
      setErrors(errObj);
      return;
    }

    try {
      const { confirmPassword, agreeToTerms, role, userType, ...apiData } =
        result.data;

      const webAppPayload = {
        username: apiData.fullName,
        email: apiData.email.toLowerCase(),
        password: apiData.password,
        role: "AGGREGATOR_ADMIN",
        companyName: apiData.companyName,
        contact: apiData.contact,
      };

      console.log("Final Payload:", webAppPayload);

      const response = await signUpApi(webAppPayload);

      if (response.success) {
        alert("Account created successfully!");
        router.replace("/signin");
      } else {
        alert(response.message || "Signup failed");
      }
    } catch (error: any) {
      alert(error?.message || "Signup failed");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0c0c0c" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>LendGrid</Text>
          </View>

          <Text style={styles.title}>Join LendGrid</Text>
          <Text style={styles.subtitle}>
            Create your account to get started
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.fullName}
            onChangeText={(v) => handleChange("fullName", v)}
          />
          {errors.fullName && (
            <Text style={styles.error}>{errors.fullName}</Text>
          )}

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="john@company.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          <Text style={styles.label}>Company Name</Text>
          <TextInput
            placeholder="Your Company Ltd."
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.companyName}
            onChangeText={(v) => handleChange("companyName", v)}
          />
          {errors.companyName && (
            <Text style={styles.error}>{errors.companyName}</Text>
          )}
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="9876543210"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            style={styles.input}
            value={formData.contact}
            onChangeText={(v) => handleChange("contact", v)}
          />
          {errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create a strong password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
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
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Re-enter your password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, styles.passwordInput]}
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
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
