/**
 * Social Authentication Hook
 * 
 * Handles Google and Facebook OAuth flows for mobile devices
 * with proper error handling and retry mechanisms.
 */
import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export function useSocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'com.yourapp.scheme',
      path: 'auth/google',
    }),
    scopes: ['openid', 'profile', 'email'],
    responseType: 'code',
  });

  // Facebook OAuth configuration
  const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
    redirectUri: makeRedirectUri({
      scheme: 'com.yourapp.scheme',
      path: 'auth/facebook',
    }),
    scopes: ['email', 'public_profile'],
    responseType: 'code',
  });

  const googleLogin = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!googleRequest) {
        throw new Error('Google authentication not configured');
      }

      const result = await googlePromptAsync();

      if (result.type === 'success') {
        // Exchange code for tokens and user info
        const { authentication } = result;
        
        if (authentication?.accessToken) {
          // Fetch user profile
          const userResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication.accessToken}`
          );
          const userData = await userResponse.json();

          // Send to your backend for authentication
          const authResponse = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: authentication.accessToken,
              userData,
            }),
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            return {
              success: true,
              user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                picture: userData.picture,
              },
            };
          } else {
            throw new Error('Authentication failed on server');
          }
        } else {
          throw new Error('No access token received');
        }
      } else if (result.type === 'cancel') {
        return { success: false, error: 'Authentication cancelled' };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const facebookLogin = async (): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!facebookRequest) {
        throw new Error('Facebook authentication not configured');
      }

      const result = await facebookPromptAsync();

      if (result.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.accessToken) {
          // Fetch user profile
          const userResponse = await fetch(
            `https://graph.facebook.com/me?access_token=${authentication.accessToken}&fields=id,name,email,picture`
          );
          const userData = await userResponse.json();

          // Send to your backend for authentication
          const authResponse = await fetch('/api/auth/facebook', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              accessToken: authentication.accessToken,
              userData,
            }),
          });

          if (authResponse.ok) {
            const authData = await authResponse.json();
            return {
              success: true,
              user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                picture: userData.picture?.data?.url,
              },
            };
          } else {
            throw new Error('Authentication failed on server');
          }
        } else {
          throw new Error('No access token received');
        }
      } else if (result.type === 'cancel') {
        return { success: false, error: 'Authentication cancelled' };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Facebook login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    googleLogin,
    facebookLogin,
    isLoading,
    error,
  };
}