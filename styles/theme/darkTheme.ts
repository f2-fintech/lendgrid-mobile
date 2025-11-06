import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4DA3FF',
    secondary: '#2C2C2C',
    background: '#121212',
    surface: '#1A1A1A',
    text: '#FFFFFF',
    onSurface: '#E6E6E6',
    border: '#2E2E2E',
  },
  roundness: 8,
};

export default darkTheme;
