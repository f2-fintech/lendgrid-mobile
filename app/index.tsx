import CustomSplashScreen from "@/components/CustomSplashScreen";

export default function Index() {
  return (
  <CustomSplashScreen
    nextRoute="/(tab)/dashboard"   
    repeatCount={1}
    iconDurationMs={800}
    holdMs={300}
  />
  );
}
