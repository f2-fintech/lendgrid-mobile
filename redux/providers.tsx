import darkTheme from "@/styles/theme/darkTheme";
import lightTheme from "@/styles/theme/lightTheme";
import React from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { RootState, store } from "./store";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useSelector((s: RootState) => s.theme.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <ThemeWrapper>{children}</ThemeWrapper>
      </SafeAreaProvider>
    </ReduxProvider>
  );
}
