import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0078FF',        // your main brand color
    secondary: '#E6F4FE',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#0A0A0A',
    onSurface: '#1E1E1E',
    border: '#E0E0E0',
  },
  roundness: 8,
};

export default lightTheme;
