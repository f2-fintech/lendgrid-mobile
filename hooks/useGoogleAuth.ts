import { useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GOOGLE_LOGIN_MUTATION = gql`
  mutation GoogleLogin($idToken: String!) {
    googleLogin(idToken: $idToken) {
      success
      message
      access_token
      action
      user_email
      user_name
    }
  }
`;

export function useGoogleAuth() {
  const [googleLoginMutation, { loading }] = useMutation(GOOGLE_LOGIN_MUTATION);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      console.log('Google Sign-In Response:', JSON.stringify(userInfo, null, 2));

      // Handle user cancellation gracefully
      if (userInfo.type === 'cancelled') {
        console.log('User cancelled Google Sign-In');
        return null; // Return null so the UI can ignore the cancellation instead of crashing
      }

      const idToken = userInfo?.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found. Please ensure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is correct.');
      }

      const { data } = await googleLoginMutation({
        variables: { idToken },
      });

      return data?.googleLogin;
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out Error:', error);
    }
  };

  return { signIn, signOut, loading };
}
