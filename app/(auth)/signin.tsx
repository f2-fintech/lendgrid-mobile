import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.inner}>
        {/* Email Field */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />

        {/* Password Field */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In ➜</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.footerText}>
            Don’t have an account?{" "}
            <Text style={styles.signUpText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0c0c0c",
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 15,
    fontWeight: "500",
  },
  roleBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  roleText: {
    color: "#1b1b1b",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    color: "#000",
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1b1b",
    borderRadius: 10,
    marginBottom: 20,
  },
  eyeIcon: {
    paddingHorizontal: 10,
  },
  signInButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  signInText: {
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
  signUpText: {
    color: "#FFD600",
    fontWeight: "600",
  },
});
