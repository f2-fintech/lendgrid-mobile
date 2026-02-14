export default {
  expo: {
    name: "LendGrid",
    slug: "lendgrid-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/adaptive-icon_1.png",
    scheme: "lendgridmobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    android: {
      package: "com.lendgrid.mobile",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon_1.png",
        backgroundColor: "#1D0A33",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    ios: {
      bundleIdentifier: "com.lendgrid.mobile",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/adaptive-icon_1.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1D0A33",
          dark: { backgroundColor: "#1D0A33" },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      ADMIN_API_URL: process.env.EXPO_PUBLIC_ADMIN_API_URL,
      CORE_REST_URL: process.env.EXPO_PUBLIC_CORE_REST_URL,

      PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
      TERMS_URL: process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL,

      CAPTCHA_SITE_KEY: process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,

      GRAPHQL_HTTP_URL:
        process.env.EXPO_PUBLIC_GRAPHQL_HTTP_URL ??
        process.env.EXPO_PUBLIC_API_URL ??
        "https://api.f2fintech.in/graphql",

      GRAPHQL_WS_URL:
        process.env.EXPO_PUBLIC_GRAPHQL_WS_URL ??
        (process.env.EXPO_PUBLIC_API_URL
          ? process.env.EXPO_PUBLIC_API_URL.replace("http", "ws")
          : "wss://api.f2fintech.in/graphql"),

      ENV: process.env.EXPO_PUBLIC_ENV,

      eas: {
        projectId: "d12c2bb2-a90f-46ee-9c03-2a07ec6b6430",
      },

      router: {},
    },
  },
};
