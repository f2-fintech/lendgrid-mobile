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

import { ROUTES } from "@/constants/routes";
import {
  signInSchema,
  SignInSchemaType,
} from "@/lib/validators/signin.schema";
import { signInStyles } from "@/styles/auth/signin.styles";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchemaType) => {
    const savedUser = await AsyncStorage.getItem("user");

    if (!savedUser) {
      alert("No account found! Please signup first.");
      return;
    }

    const user = JSON.parse(savedUser);

    if (user.email === data.email && user.password === data.password) {
      router.replace(ROUTES.Dashboard);
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
        <Text style={signInStyles.label}>Email Address</Text>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#888"
          onChangeText={(text) => setValue("email", text)}
          style={signInStyles.input}
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

        <TouchableOpacity
          style={signInStyles.signInButton}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={signInStyles.signInText}>Sign In ➜</Text>
        </TouchableOpacity>

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
