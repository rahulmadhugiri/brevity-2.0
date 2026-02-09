import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, User, onAuthStateChanged, signInWithCredential, signOut } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { firebaseAuth, isFirebaseConfigured } from '@/services/firebase';

const ONBOARDING_STORAGE_KEY = '@brevity/onboarding-v1';
const CALENDAR_TOKEN_STORAGE_KEY = '@brevity/calendar-token-v1';

export type OnboardingData = {
  commuteMinutes: number | null;
  interests: string[];
  interestsSkipped: boolean;
  hasSeenFeedHint: boolean;
};

type GoogleSignInTokens = {
  idToken: string;
  accessToken?: string;
};

type AuthContextValue = {
  user: User | null;
  isAuthReady: boolean;
  isSigningIn: boolean;
  isFirebaseReady: boolean;
  onboarding: OnboardingData;
  isOnboardingReady: boolean;
  calendarAccessToken: string | null;
  signInWithGoogle: (tokens: GoogleSignInTokens) => Promise<void>;
  signOutUser: () => Promise<void>;
  setCommuteMinutes: (minutes: number) => Promise<void>;
  setInterests: (interests: string[]) => Promise<void>;
  skipInterests: () => Promise<void>;
  markFeedHintSeen: () => Promise<void>;
};

const defaultOnboarding: OnboardingData = {
  commuteMinutes: null,
  interests: [],
  interestsSkipped: false,
  hasSeenFeedHint: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

const parseOnboardingData = (value: string | null): OnboardingData => {
  if (!value) return defaultOnboarding;

  try {
    const parsed = JSON.parse(value) as Partial<OnboardingData>;
    return {
      commuteMinutes:
        typeof parsed.commuteMinutes === 'number' ? parsed.commuteMinutes : defaultOnboarding.commuteMinutes,
      interests: Array.isArray(parsed.interests) ? parsed.interests : defaultOnboarding.interests,
      interestsSkipped:
        typeof parsed.interestsSkipped === 'boolean'
          ? parsed.interestsSkipped
          : defaultOnboarding.interestsSkipped,
      hasSeenFeedHint:
        typeof parsed.hasSeenFeedHint === 'boolean'
          ? parsed.hasSeenFeedHint
          : defaultOnboarding.hasSeenFeedHint,
    };
  } catch {
    return defaultOnboarding;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingData>(defaultOnboarding);
  const [isOnboardingReady, setIsOnboardingReady] = useState(false);
  const [calendarAccessToken, setCalendarAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loadLocalState = async () => {
      try {
        const [storedOnboarding, storedCalendarToken] = await Promise.all([
          AsyncStorage.getItem(ONBOARDING_STORAGE_KEY),
          AsyncStorage.getItem(CALENDAR_TOKEN_STORAGE_KEY),
        ]);

        setOnboarding(parseOnboardingData(storedOnboarding));
        setCalendarAccessToken(storedCalendarToken);
      } finally {
        setIsOnboardingReady(true);
      }
    };

    loadLocalState();
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  const persistOnboarding = useCallback(async (next: OnboardingData) => {
    setOnboarding(next);
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const signInWithGoogle = useCallback(
    async ({ idToken, accessToken }: GoogleSignInTokens) => {
      if (!firebaseAuth) {
        throw new Error('Firebase Auth is not configured.');
      }

      if (!idToken) {
        throw new Error('Google sign-in did not return an ID token.');
      }

      setIsSigningIn(true);
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(firebaseAuth, credential);

        if (accessToken) {
          setCalendarAccessToken(accessToken);
          await AsyncStorage.setItem(CALENDAR_TOKEN_STORAGE_KEY, accessToken);
        }
      } finally {
        setIsSigningIn(false);
      }
    },
    []
  );

  const signOutUser = useCallback(async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  }, []);

  const setCommuteMinutes = useCallback(
    async (minutes: number) => {
      const next = { ...onboarding, commuteMinutes: minutes };
      await persistOnboarding(next);
    },
    [onboarding, persistOnboarding]
  );

  const setInterests = useCallback(
    async (interests: string[]) => {
      const next = { ...onboarding, interests, interestsSkipped: false };
      await persistOnboarding(next);
    },
    [onboarding, persistOnboarding]
  );

  const skipInterests = useCallback(async () => {
    const next = { ...onboarding, interests: [], interestsSkipped: true };
    await persistOnboarding(next);
  }, [onboarding, persistOnboarding]);

  const markFeedHintSeen = useCallback(async () => {
    if (onboarding.hasSeenFeedHint) return;
    const next = { ...onboarding, hasSeenFeedHint: true };
    await persistOnboarding(next);
  }, [onboarding, persistOnboarding]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthReady,
      isSigningIn,
      isFirebaseReady: isFirebaseConfigured,
      onboarding,
      isOnboardingReady,
      calendarAccessToken,
      signInWithGoogle,
      signOutUser,
      setCommuteMinutes,
      setInterests,
      skipInterests,
      markFeedHintSeen,
    }),
    [
      user,
      isAuthReady,
      isSigningIn,
      onboarding,
      isOnboardingReady,
      calendarAccessToken,
      signInWithGoogle,
      signOutUser,
      setCommuteMinutes,
      setInterests,
      skipInterests,
      markFeedHintSeen,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
