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

export const coreApi = axios.create({
  baseURL: extra?.CORE_REST_URL, //  http://192.168.1.46:8080/api/v1
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Attach token + companyId to BOTH instances
[gqlApi, restApi, coreApi].forEach((instance) => {
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    const companyId = await AsyncStorage.getItem("companyId");
    const isAllCompanyScope = (config.params as any)?._cid === "all";

    config.headers = config.headers || {};
    if (token) config.headers.Authorization = `Bearer ${token}`;

    //  backend is reading req.headers.companyid.
    //  Keep request-level overrides, e.g. OMS sales list uses companyid=all.
    if (
      companyId &&
      !isAllCompanyScope &&
      !(config.headers as any)["companyid"] &&
      !(config.headers as any)["Companyid"]
    ) {
      (config.headers as any)["companyid"] = companyId;
    }

    if (isAllCompanyScope) {
      delete (config.headers as any)["companyid"];
      delete (config.headers as any)["Companyid"];
    }

    // FULL URL LOGGER (baseURL + path + query)
    // const fullUrl =
    //   (config.baseURL || "") +
    //   (config.url || "") +
    //   (config.params
    //     ? "?" + new URLSearchParams(config.params as any).toString()
    //     : "");

    // console.log("➡️ [API REQUEST]", fullUrl, {
    //   companyIdHeader: companyId,
    //   hasToken: !!token,
    // });

    return config;
  });
});
