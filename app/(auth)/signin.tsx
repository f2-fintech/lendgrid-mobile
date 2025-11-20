import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import {
  signInSchema,
  SignInSchemaType,
} from "../../styles/auth/schemas/signin.schema";
import { signInStyles } from "../../styles/auth/signin.styles";

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInSchemaType) => {
    console.log("Form Submitted:", data);

    // 1️⃣ Get saved user from storage
    const savedUser = await AsyncStorage.getItem("user");

    if (!savedUser) {
      alert("No account found! Please signup first.");
      return;
    }

    const user = JSON.parse(savedUser);

    // 2️⃣ Check if email & password match
    if (user.email === data.email && user.password === data.password) {
      // 3️⃣ Redirect to dashboard
      router.replace("/(tab)/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <ScrollView
      style={signInStyles.container}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={signInStyles.inner}>
        {/* Email */}
        <Text style={signInStyles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#888"
          onChangeText={(text) => setValue("email", text)}
          style={signInStyles.input}
          {...register("email")}
        />
        {errors.email && (
          <Text style={{ color: "red", marginBottom: 10 }}>
            {errors.email.message}
          </Text>
        )}

        {/* Password */}
        <Text style={signInStyles.label}>Password</Text>
        <View style={signInStyles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            onChangeText={(text) => setValue("password", text)}
            style={[signInStyles.input, { flex: 1, marginBottom: 0 }]}
            {...register("password")}
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

        {/* Button */}
        <TouchableOpacity
          style={signInStyles.signInButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={signInStyles.signInText}>Sign In ➜</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={signInStyles.footerText}>
            Don’t have an account?{" "}
            <Text style={signInStyles.signUpText}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
