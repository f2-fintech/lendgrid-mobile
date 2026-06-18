import { useMemo, useRef } from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

type Props = {
  onToken: (token: string | null) => void;
  refreshKey?: number; // change this value to force reload/reset
  style?: any;
  theme?: "light" | "dark";
};

export default function TurnstileCaptcha({
  onToken,
  refreshKey = 0,
  style,
  theme,
}: Props) {
  const webRef = useRef<WebView>(null);
  const scheme = useColorScheme();
  const reduxTheme = useSelector((state: RootState) => state.theme.mode);

  const activeTheme = theme || reduxTheme || scheme || "light";

  //  Load the real website route (allowed hostname)
  const uri = useMemo(() => {
    return `https://lendgrid.in/turnstile-mobile?rk=${refreshKey}&theme=${activeTheme}`;
  }, [refreshKey, activeTheme]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        originWhitelist={["https://*"]}
        source={{ uri }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);

            // Fix: Match the type "lendgrid_cookie" used in your Next.js file
            if (data?.type === "lendgrid_cookie") {
              onToken(data.token ?? null);
            }
          } catch (err) {
            console.error("Captcha parse error:", err);
            onToken(null);
          }
        }}
        onError={() => onToken(null)}
        onHttpError={() => onToken(null)}
        style={styles.webview}
        containerStyle={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  webview: { width: 340, height: 120, backgroundColor: "transparent" },
});
