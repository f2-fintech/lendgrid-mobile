import React from 'react';
import { Button, Card, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import ScreenContainer from '../components/ScreenContainer';
import { toggleTheme } from '../redux/features/themeSlice';
import type { AppDispatch, RootState } from '../redux/store';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector((s: RootState) => s.theme.mode);

  return (
    <ScreenContainer>
      <Card>
        <Card.Title
          title="LendGrid Mobile"
          subtitle="Unified Fintech Platform"
        />
        <Card.Content>
          <Text variant="titleLarge" style={{ marginBottom: 10 }}>
            Welcome to F2 Fintech — your financial freedom assistant.
          </Text>

          <Text style={{ marginBottom: 20 }}>
            This app is connected to our core F2 APIs and is theme adaptive.
            Use the button below to toggle between light and dark mode.
          </Text>

          <Button
            mode="contained"
            onPress={() => dispatch(toggleTheme())}
          >
            Switch to {themeMode === 'light' ? 'Dark' : 'Light'} Mode
          </Button>
        </Card.Content>
      </Card>
    </ScreenContainer>
  );
}
