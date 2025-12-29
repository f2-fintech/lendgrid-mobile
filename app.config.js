export default {
  expo: {
    name: "LendGrid",
    slug: "lendgrid-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lendgridmobile",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    android: {
      package: "com.lendgrid.mobile",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#1D0A33",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },

    ios: {
      bundleIdentifier: "com.lendgrid.mobile",
      supportsTablet: true,
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
          image: "./assets/images/icon.png",
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
    ENV: process.env.EXPO_PUBLIC_ENV,
    eas: { projectId: "25848bf5-1e37-4a24-bd6a-43f5aebcad8a" },
  },

  },
};
