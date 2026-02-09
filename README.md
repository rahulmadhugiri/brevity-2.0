# Brevity 2.0 - Audio Discovery App

A simple audio-first discovery experience built with React Native and Expo.

## Features

### 🎵 Core Experience
- **Card-Based Interface**: Swipe through audio content with visual cards
- **Local Audio Playback**: Play audio snippets with built-in controls
- **Clean Design**: Minimalist UI with rounded cards and smooth transitions
- **Progress Tracking**: Visual progress bar showing audio playback status

### 🎧 Audio Playback
- Play/pause controls
- Previous/next navigation
- Auto-advance to next card when audio completes
- Built with `expo-av` for reliable audio playback

## Project Structure

```
brevity2.0/
├── app/
│   └── (tabs)/
│       └── index.tsx          # Main home screen with audio cards
├── services/
│   └── ContentGenerator.ts   # Content data and local audio
├── assets/
│   └── audio/
│       ├── voice1.mp3
│       ├── voice2.mp3
│       └── voice3.mp3
└── constants/
    ├── moodGradients.ts      # Gradient color mappings
    └── theme.ts              # App-wide theme constants
```

## Get Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Key Dependencies

- `expo-av` - Audio playback
- `@expo/vector-icons` - UI icons
- `expo-router` - Navigation

## Usage

- **Tap the play button** to play/pause audio
- **Use << and >>** to navigate between cards
- **Progress bar** shows how far into the audio you are
- Audio automatically advances to the next card when finished

## Development Notes

### Adding New Content

Edit `services/ContentGenerator.ts` to add new audio content:

```typescript
const contentData = [
  {
    title: 'Your Title',
    category: 'Your Category',
    script: 'Description text',
    mood: 'calm',
    image: 'https://your-image-url.com',
  },
  // Add more items...
];
```

### Adding Audio Files

1. Add MP3 files to `assets/audio/`
2. The app will automatically cycle through available audio files

## License

Private project
