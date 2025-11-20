import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider, useSelector } from 'react-redux';

import { RootState, store } from './store';


import darkTheme from '@/styles/theme/darkTheme';
import lightTheme from '@/styles/theme/lightTheme';

type Props = { children: React.ReactNode };

const ThemedPaperProvider: React.FC<Props> = ({ children }) => {
  const mode = useSelector((state: RootState) => state.theme.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
};

export default function AppProviders({ children }: Props) {
  return (
    <ReduxProvider store={store}>
      <ThemedPaperProvider>{children}</ThemedPaperProvider>
    </ReduxProvider>
  );
}
