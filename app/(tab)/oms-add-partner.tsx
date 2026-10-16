import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Text, TextInput, useTheme, Snackbar } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { registerUserApi } from "@/apis/modules/auth.api";
import { restApi } from "@/apis/config/axiosConfig";

export default function OmsAddPartnerScreen() {
  const theme = useTheme();
  const isDark = theme.dark;
  const router = useRouter();
  const params = useLocalSearchParams<{ referralCode: string }>();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "", type: "error" });

  const bg = isDark ? "#0D1117" : "#F5F7FF";
  const cardBg = isDark ? "#161B27" : "#FFFFFF";
  const borderColor = isDark ? "#2D3748" : "#E8EDF5";
  const textColor = isDark ? "#E8EAF0" : "#1A1D2E";
  const labelColor = isDark ? "#8B95A9" : "#6B7280";

  const handleCreate = async () => {
    if (!fullName || !companyName || !email || !contact || !password) {
      setSnackbar({ visible: true, message: "Please fill all required fields", type: "error" });
      return;
    }

    if (password.length < 6) {
      setSnackbar({ visible: true, message: "Password must be at least 6 characters long", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: fullName,
        email: email.toLowerCase(),
        contact: contact,
        password: password,
        role: "AGGREGATOR_ADMIN",
        companyName: companyName,
        aggregatorType: "CHANNEL_PARTNER",
        isOmsEnabled: true,
        referralCode: params.referralCode,
      };

      const response = await registerUserApi(payload);

      if (response?.success) {
        // Create company profile via REST API
        const companyId = response.companyId;
        if (companyId) {
          try {
            await restApi.post("/companies", {
              name: companyName,
              email: email.toLowerCase(),
              contactNumber: contact,
              companyId,
            });
          } catch (companyError) {
            console.warn("Failed to create company profile:", companyError);
            // Non-blocking error, user is already created
          }
        }

        setSnackbar({ visible: true, message: "Channel Partner created successfully!", type: "success" });
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setSnackbar({ visible: true, message: response?.message || "Failed to create partner", type: "error" });
      }
    } catch (error: any) {
      const msg = error?.response?.errors?.[0]?.message || error?.message || "Something went wrong";
      setSnackbar({ visible: true, message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <LinearGradient
        colors={isDark ? ["#060818", "#0D1117"] : ["#EEF2FF", "#F5F7FF"]}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={() => router.back()} style={{ paddingRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </Pressable>
          <Text style={{ color: textColor, fontSize: 20, fontWeight: "800" }}>
            Add Channel Partner
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 20, borderWidth: 1, borderColor }}>
          
          <View style={{ marginBottom: 20, backgroundColor: isDark ? "#0D1117" : "#EEF2FF", padding: 12, borderRadius: 12, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="information-circle" size={20} color="#6366F1" style={{ marginRight: 8 }} />
            <Text style={{ color: isDark ? "#8B95A9" : "#6366F1", flex: 1, fontSize: 13, fontWeight: "600" }}>
              Partner will be tracked under your OMS Referral Code: {params.referralCode}
            </Text>
          </View>

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? "#0D1117" : "#FFF" }]}
            outlineColor={borderColor}
            activeOutlineColor="#6366F1"
            textColor={textColor}
          />

          <TextInput
            label="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            mode="outlined"
            style={[styles.input, { backgroundColor: isDark ? "#0D1117" : "#FFF" }]}
            outlineColor={borderColor}
            activeOutlineColor="#6366F1"
            textColor={textColor}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: isDark ? "#0D1117" : "#FFF" }]}
            outlineColor={borderColor}
            activeOutlineColor="#6366F1"
            textColor={textColor}
          />

          <TextInput
            label="Contact Number"
            value={contact}
            onChangeText={setContact}
            mode="outlined"
            keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: isDark ? "#0D1117" : "#FFF" }]}
            outlineColor={borderColor}
            activeOutlineColor="#6366F1"
            textColor={textColor}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} color={labelColor} />}
            style={[styles.input, { backgroundColor: isDark ? "#0D1117" : "#FFF" }]}
            outlineColor={borderColor}
            activeOutlineColor="#6366F1"
            textColor={textColor}
          />

          <Pressable
            onPress={handleCreate}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: "#6366F1",
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                marginTop: 20,
              },
              pressed && { opacity: 0.8 },
              loading && { opacity: 0.7 }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "800" }}>
                Create Partner Account
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{ backgroundColor: snackbar.type === "error" ? "#EF4444" : "#22C55E" }}
      >
        <Text style={{ color: "#FFF", fontWeight: "600" }}>{snackbar.message}</Text>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});
