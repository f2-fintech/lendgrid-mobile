import { useColorScheme } from 'react-native';
import darkTheme from './darkTheme';
import lightTheme from './lightTheme';

export const useAppTheme = () => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
