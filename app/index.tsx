import CustomSplashScreen from "@/components/CustomSplashScreen";

export default function Index() {
  return (
    <CustomSplashScreen
      // nextRoute="/(tab)/dashboard"
      nextRoute="/(auth)/signin"
      repeatCount={1}
      iconDurationMs={800}
      holdMs={300}
    />
  );
}
