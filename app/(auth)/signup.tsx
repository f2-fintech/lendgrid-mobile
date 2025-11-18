import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    role: "",
    company: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0c0c0c" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          {/* Back Button */}
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Logo + Title */}
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

          {/* User Type */}
          <Text style={styles.label}>User Type</Text>
          <TextInput
            placeholder="Select your role"
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.role}
            onChangeText={(val) => handleChange("role", val)}
          />

          {/* Company Name */}
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            placeholder="Your Company Ltd."
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.company}
            onChangeText={(val) => handleChange("company", val)}
          />

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.fullName}
            onChangeText={(val) => handleChange("fullName", val)}
          />

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            placeholder="john@company.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            style={styles.input}
            value={formData.email}
            onChangeText={(val) => handleChange("email", val)}
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Create a strong password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              style={[styles.input, styles.passwordInput]}
              value={formData.password}
              onChangeText={(val) => handleChange("password", val)}
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

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Re-enter your password"
              placeholderTextColor="#666"
              secureTextEntry={!showConfirmPassword}
              style={[styles.input, styles.passwordInput]}
              value={formData.confirmPassword}
              onChangeText={(val) => handleChange("confirmPassword", val)}
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

          {/* Create Account Button */}
          <TouchableOpacity style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Footer */}
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

const styles = StyleSheet.create({
  inner: {
    padding: 20,
    paddingTop: 40,
  },
  backText: {
    color: "#FFD600",
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 8,
  },
  logoText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 25,
    fontSize: 14,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  eyeIcon: {
    paddingLeft: 8,
  },
  signUpButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#FFD600",
    fontWeight: "700",
    fontSize: 16,
  },
  footerText: {
    textAlign: "center",
    color: "#ccc",
    marginTop: 25,
    fontSize: 14,
  },
  signInLink: {
    color: "#FFD600",
    fontWeight: "600",
  },
});
