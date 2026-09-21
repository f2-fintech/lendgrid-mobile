import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAppleAuth } from '../../hooks/useAppleAuth';

interface AppleAuthButtonProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  isDark?: boolean;
}

export function AppleAuthButton({ onSuccess, onError, isDark = false }: AppleAuthButtonProps) {
  const { signIn, loading } = useAppleAuth();

  const handlePress = async () => {
    try {
      const response = await signIn();
      if (response) {
        onSuccess(response);
      }
    } catch (error) {
      onError(error);
    }
  };

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={
          isDark 
            ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
            : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
        }
        cornerRadius={20}
        style={styles.button}
        onPress={handlePress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%',
  },
  button: {
    width: '100%',
    height: 56,
  },
});
