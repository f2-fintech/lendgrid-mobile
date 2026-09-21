import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const APPLE_LOGIN_MUTATION = gql`
  mutation AppleLogin($identityToken: String!, $fullName: String) {
    appleLogin(identityToken: $identityToken, fullName: $fullName) {
      success
      message
      access_token
      action
      user_email
      user_name
    }
  }
`;

export function useAppleAuth() {
  const [appleLoginMutation, { loading: mutationLoading }] = useMutation(APPLE_LOGIN_MUTATION);
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error('No identity token returned from Apple.');
      }

      // Apple only returns fullName and email on the FIRST login
      let fullName = undefined;
      if (credential.fullName && credential.fullName.givenName) {
        fullName = `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim();
      }

      const { data } = await appleLoginMutation({
        variables: { 
          identityToken,
          fullName
        },
      });

      return data?.appleLogin;
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        // handle that the user canceled the sign-in flow
        console.log('User canceled Apple Sign In');
        return null;
      }
      console.error('Apple Sign-In Error:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { signIn, loading: loading || mutationLoading };
}
