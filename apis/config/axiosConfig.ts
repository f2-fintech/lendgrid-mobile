// axiosConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as any;

// GraphQL (Nest + Mongo)
export const gqlApi = axios.create({
  baseURL: extra?.API_URL, // EXPO_PUBLIC_API_URL = http://192.168.1.10:4000/graphql
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// REST (Admin + MySQL)
export const restApi = axios.create({
  baseURL: extra?.ADMIN_API_URL, // EXPO_PUBLIC_ADMIN_API_URL = http://192.168.1.10:3001/api/v1
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token + companyId to BOTH instances
[gqlApi, restApi].forEach((instance) => {
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    const companyId = await AsyncStorage.getItem("companyId"); // <- store this after login

    config.headers = config.headers || {};

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (companyId) {
      // Nest @Headers('Companyid') will read this
      (config.headers as any)["companyid"] = companyId;
    }

    return config;
  });
});
  