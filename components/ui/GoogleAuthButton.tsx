import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface GoogleAuthButtonProps {
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  title?: string;
  isDark?: boolean;
}

export function GoogleAuthButton({ onSuccess, onError, title = "Sign in with Google", isDark = false }: GoogleAuthButtonProps) {
  const { signIn, loading } = useGoogleAuth();

  const handlePress = async () => {
    try {
      const response = await signIn();
      onSuccess(response);
    } catch (error) {
      onError(error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={[
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? "#FFF" : "#000"} />
      ) : (
        <View style={styles.contentContainer}>
          <Icon name="google" size={24} color={isDark ? "#FFF" : "#DB4437"} style={styles.icon} />
          <Text style={[styles.text, isDark ? styles.textDark : styles.textLight]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    height: 56,
  },
  buttonLight: {
    borderColor: "#E2E6F0",
    backgroundColor: "#FFFFFF",
  },
  buttonDark: {
    borderColor: "#2D3748",
    backgroundColor: "#1A202C",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  textLight: {
    color: "#1A1D2E",
  },
  textDark: {
    color: "#E8EAF0",
  },
});
