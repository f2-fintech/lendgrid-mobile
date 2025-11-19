import { signUpStyles as styles } from "@/styles/auth/signup.styles";
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

import { signUpSchema } from "@/styles/auth/schemas/signup.schema";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const [errors, setErrors] = useState<any>({});

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
    setErrors({ ...errors, [key]: "" }); // remove error as they type
  };

  const handleSubmit = async () => {
    const result = signUpSchema.safeParse(formData);

    if (!result.success) {
      const errObj: any = {};
      result.error.errors.forEach((err) => {
        errObj[err.path[0]] = err.message;
      });
      setErrors(errObj);
      return;
    }
    const userToSave = {
      email: result.data.email,
      password: result.data.password,
      role: result.data.role,
      company: result.data.company,
      fullName: result.data.fullName,
    };

    console.log("Signup Success:", result.data);

    // Save user to local storage
    await AsyncStorage.setItem("user", JSON.stringify(userToSave));

    // Redirect to tab dashboard
    router.replace("/(tab)/dashboard");
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
          {errors.role && <Text style={styles.error}>{errors.role}</Text>}

          {/* Company Name */}
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            placeholder="Your Company Ltd."
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.company}
            onChangeText={(val) => handleChange("company", val)}
          />
          {errors.company && <Text style={styles.error}>{errors.company}</Text>}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
            placeholderTextColor="#666"
            style={styles.input}
            value={formData.fullName}
            onChangeText={(val) => handleChange("fullName", val)}
          />
          {errors.fullName && (
            <Text style={styles.error}>{errors.fullName}</Text>
          )}

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
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

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
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}

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
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword}</Text>
          )}

          {/* Create Account Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
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
