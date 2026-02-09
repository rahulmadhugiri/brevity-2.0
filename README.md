# Brevity 2.0

Audio-first discovery: sign in with Google, complete onboarding, then swipe through visual cards and listen to short clips.

**What is implemented**
1. Firebase Authentication with Google OAuth.
2. Google Calendar read-only scope requested during sign-in.
3. Onboarding flow: commute time (10-90 mins) and interests picker with `Skip`.
4. Home audio feed with swipe navigation and a first-time coaching overlay.
5. Profile avatar in top-right from the authenticated Google user.
6. Local audio playback with lock-screen controls.

**Flow**
1. `auth/splash`: Terms switch + Google OAuth button.
2. `onboarding/commute`: choose commute in 10-minute increments.
3. `onboarding/interests`: choose topics or skip.
4. `(tabs)/index`: audio player home.

<<<<<<< HEAD
**Key user interactions**
1. Tap play/pause to control audio.
2. Tap previous/next to move between cards.
3. Swipe on the card area to navigate.
=======
**Environment setup**
1. Copy `.env.example` to `.env`.
2. Fill Firebase web config values:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
3. Fill OAuth client IDs:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
4. In Google Cloud Console, enable Google Calendar API and include `https://www.googleapis.com/auth/calendar.readonly` in OAuth consent scopes.
5. In Firebase Console, enable Google as a sign-in provider.
>>>>>>> 63a91f8 (feat: add Firebase Google auth onboarding flow, persistent session handling, pager based home feed, and first-use swipe onboarding UX)

**Project structure**
```
brevity2.0/
app/
  auth/
    splash.tsx             # Sign-in splash with terms + Google OAuth
  onboarding/
    commute.tsx            # Commute-time step
    interests.tsx          # Interests step with Skip
  (tabs)/
    index.tsx              # Main home screen (audio cards + first-use hint)
    explore.tsx            # Placeholder secondary tab
  index.tsx                # Route gate for auth/onboarding/home
contexts/
  AuthContext.tsx          # User session + onboarding state
services/
  firebase.ts              # Firebase app/auth bootstrap
  ContentGenerator.ts      # Static content + audio source mapping
assets/
  audio/
```

**Tech stack**
1. Expo + React Native
2. Firebase Auth
3. `expo-auth-session` for Google OAuth
4. `@react-native-async-storage/async-storage` for onboarding persistence
5. `expo-router` for navigation
6. `expo-audio` and `expo-media-control` for playback

**Run**
```bash
npm install
npx expo start
```

**License**
Private project.
