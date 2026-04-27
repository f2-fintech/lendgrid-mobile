import "dotenv/config";

export default {
  expo: {
    owner: "adarsh7523",
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
      // CRITICAL: Point to your Firebase config file for system notifications
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "lendgrid.in",
              pathPrefix: "/reset-password",
            },
          ],
        },
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon_1.png",
        backgroundColor: "#1D0A33",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    ios: {
      bundleIdentifier: "com.lendgrid.mobile",
      associatedDomains: ["applinks:lendgrid.in"],
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
      [
        "expo-notifications",
        {
          icon: "./assets/images/adaptive-icon_1.png",
          color: "#1D0A33",
          // UPDATED: Changed from 'downloads' to 'default'
          // to match setNotificationChannelAsync in RootLayout
          defaultChannel: "default",
          sounds: [],
        },
      ],
      ["expo-web-browser"],
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },

    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      ADMIN_API_URL: process.env.EXPO_PUBLIC_ADMIN_API_URL,
      CORE_REST_URL: process.env.EXPO_PUBLIC_CORE_REST_URL,
      UPLOAD_API_URL: process.env.EXPO_PUBLIC_UPLOAD_API_URL,

      PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
      TERMS_URL: process.env.EXPO_PUBLIC_TERMS_OF_SERVICE_URL,
      CAPTCHA_SITE_KEY: process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
      forgotPasswordUrl: process.env.EXPO_PUBLIC_FORGOT_PASSWORD_URL,

      GRAPHQL_HTTP_URL:
        process.env.EXPO_PUBLIC_GRAPHQL_HTTP_URL ??
        process.env.EXPO_PUBLIC_API_URL ??
        "https://api.f2fintech.in/graphql",

      GRAPHQL_WS_URL:
        process.env.EXPO_PUBLIC_GRAPHQL_WS_URL ??
        (process.env.EXPO_PUBLIC_API_URL
          ? process.env.EXPO_PUBLIC_API_URL.replace(/^http/, "ws")
          : "wss://api.f2fintech.in/graphql"),

      ENV: process.env.EXPO_PUBLIC_ENV,

      eas: {
        projectId: "16608c42-65bc-47d0-9cca-f5158e848475",
      },
    },
  },
};
