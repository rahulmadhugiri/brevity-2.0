# Brevity 2.0

Audio-first discovery: swipe through visual cards and listen to short clips with a clean, focused player.

**What’s implemented (core setup so far)**
1. Single primary experience: a full-screen home feed of audio cards.
2. Local audio playback with background support and lock-screen controls.
3. Swipe navigation between cards with animated transitions.
4. Progress bar with seek and real-time playback updates.
5. Light and dark theme support.

**How the app works today**
1. The home screen loads a small, static set of content cards from `services/ContentGenerator.ts`.
2. Each card includes a title, category, image, and an audio source (local MP3 files).
3. The audio player auto-starts on the first card, and auto-advances when a clip finishes.
4. Users can swipe left/right or use the previous/next buttons to change cards.
5. Lock-screen and remote media controls are enabled, so play/pause and track skipping work from AirPods or the OS media panel.

**Key user interactions**
1. Tap play/pause to control audio.
2. Tap previous/next to move between cards.
3. Swipe on the card area to navigate.
4. Tap the progress bar to seek.

**Project structure**
```
brevity2.0/
app/
  (tabs)/
    index.tsx              # Main home screen (audio cards)
    explore.tsx            # Placeholder secondary tab
services/
  ContentGenerator.ts      # Static content + audio source mapping
assets/
  audio/                   # Local MP3s used by the player
constants/
  colors.ts                # Light/dark color tokens
```

**Tech stack**
1. Expo + React Native
2. `expo-audio` for playback and status updates
3. `expo-media-control` for lock-screen and remote controls
4. `expo-linear-gradient` for background overlays
5. `expo-router` for navigation

**Run the app**
```bash
npm install
npx expo start
```
Then:
1. Press `i` for iOS simulator
2. Press `a` for Android emulator
3. Or scan the QR code with Expo Go

**Add or edit content**
1. Edit `services/ContentGenerator.ts`
2. Add a new object to `contentData`:
```ts
{
  title: 'Your Title',
  category: 'Your Category',
  script: 'Short description',
  mood: 'calm',
  image: 'https://your-image-url.com',
}
```
3. Add new MP3s to `assets/audio/` as needed.

**Current limitations (early-stage)**
1. Content is static and local.
2. Playback does not persist across app restarts.
3. Loading/error states are minimal.

**License**
Private project.
