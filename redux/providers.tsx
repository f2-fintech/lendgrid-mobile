import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { Provider as ReduxProvider, useSelector } from "react-redux";

import { RootState, store } from "./store";

import darkTheme from "@/styles/theme/darkTheme";
import lightTheme from "@/styles/theme/lightTheme";

type Props = { children: React.ReactNode };

const queryClient = new QueryClient();

const ThemedPaperProvider: React.FC<Props> = ({ children }) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = mode === "dark" ? darkTheme : lightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};

export default function AppProviders({ children }: Props) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemedPaperProvider>{children}</ThemedPaperProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
