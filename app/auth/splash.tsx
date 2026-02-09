import { FontAwesome } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';

export default function SplashAuthScreen() {
  const router = useRouter();
  const { user, signInWithGoogle, isSigningIn, isFirebaseReady } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    iosClientId,
    webClientId,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
    ],
    selectAccount: true,
    responseType: 'code',
    extraParams: {
      prompt: 'consent',
      access_type: 'offline',
    },
  });

  const isGoogleConfigured = useMemo(() => {
    return Boolean(androidClientId || iosClientId || webClientId);
  }, [androidClientId, iosClientId, webClientId]);

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (!response) return;

      if (response.type === 'error') {
        setErrorMessage(response.error?.message ?? 'Google authentication failed.');
        return;
      }

      if (response.type !== 'success') return;

      const idToken =
        response.authentication?.idToken ??
        (typeof response.params?.id_token === 'string' ? response.params.id_token : undefined);
      const accessToken =
        response.authentication?.accessToken ??
        (typeof response.params?.access_token === 'string' ? response.params.access_token : undefined);

      if (!idToken) {
        setErrorMessage(
          'Google sign-in did not return an ID token. Ensure the correct OAuth client IDs are configured.'
        );
        return;
      }

      try {
        await signInWithGoogle({ idToken, accessToken });
        router.replace('/');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to sign in with Google.';
        setErrorMessage(message);
      }
    };

    handleGoogleResponse();
  }, [response, router, signInWithGoogle]);

  const handleGooglePress = async () => {
    if (!termsAccepted) {
      Alert.alert('Accept Terms', 'Please accept Terms and Conditions to continue.');
      return;
    }

    if (!isFirebaseReady) {
      Alert.alert('Firebase Config Missing', 'Set EXPO_PUBLIC_FIREBASE_* variables before signing in.');
      return;
    }

    if (!isGoogleConfigured) {
      Alert.alert('Google OAuth Missing', 'Set EXPO_PUBLIC_GOOGLE_*_CLIENT_ID variables to continue.');
      return;
    }

    setErrorMessage(null);
    await promptAsync();
  };

  if (user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headline}>Brevity</Text>
        <Text style={styles.subheadline}>Personalized audio news for your mornings.</Text>
      </View>

      <View style={styles.bottomArea}>
        <View style={styles.termsTile}>
          <Text style={styles.termsTitle}>Terms and Conditions</Text>
          <Switch value={termsAccepted} onValueChange={setTermsAccepted} />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            (!request || isSigningIn) && styles.googleButtonDisabled,
            pressed && styles.googleButtonPressed,
          ]}
          onPress={handleGooglePress}
          disabled={!request || isSigningIn}
        >
          {isSigningIn ? (
            <ActivityIndicator color="#111827" />
          ) : (
            <>
              <FontAwesome name="google" size={18} color="#111827" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <Text style={styles.caption}>Includes read-only access to your Google Calendar.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  content: {
    marginTop: 72,
  },
  headline: {
    color: '#F9FAFB',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subheadline: {
    color: '#D1D5DB',
    fontSize: 17,
    marginTop: 10,
    lineHeight: 24,
  },
  bottomArea: {
    gap: 14,
  },
  termsTile: {
    minHeight: 58,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termsTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  googleButtonDisabled: {
    opacity: 0.55,
  },
  googleButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  googleButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  caption: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});
