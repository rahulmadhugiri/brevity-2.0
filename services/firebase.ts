import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredValues = Object.values(firebaseConfig);
export const isFirebaseConfigured = requiredValues.every((value) => Boolean(value));

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

if (isFirebaseConfigured) {
  firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);

  try {
    // Firebase RN persistence helper isn't exposed in the default web typings,
    // so we resolve it dynamically from the Auth package at runtime.
    const authModule = require('@firebase/auth') as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
    };
    const getReactNativePersistence = authModule.getReactNativePersistence;

    if (typeof getReactNativePersistence === 'function') {
      firebaseAuth = initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage) as any,
      });
    } else {
      firebaseAuth = getAuth(firebaseApp);
    }
  } catch {
    firebaseAuth = getAuth(firebaseApp);
  }
}

export { firebaseApp, firebaseAuth };
