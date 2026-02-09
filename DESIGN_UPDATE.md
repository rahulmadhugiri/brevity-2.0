# Design Language Update - Light/Dark Mode

## What Was Updated

### ✅ Added Light/Dark Mode Color Scheme

Created `constants/colors.ts` with your exact specifications:

**Light Mode:**
- Background: `#F9F9F9`
- Foreground: `#FFFFFF`
- Primary Text: `#171717`
- Secondary Text: `#666666`
- Button Border: `#E5E5E5`
- Component Background: `#F0F0F0`

**Dark Mode:**
- Background: `#0A0A0A`
- Foreground: `#181818`
- Primary Text: `#EDEDED`
- Secondary Text: `#A1A1A1`
- Button Border: `#242424`
- Component Background: `#181818`

### ✅ New Layout Design

1. **Top 48% of screen**: Blurred background image (blur radius 100) that fades into the background color using a gradient overlay

2. **Main Card Image**: 350px × 350px with 15px border radius, centered horizontally, positioned 15.7% from the top of the screen

3. **Dynamic theme support**: App automatically detects system light/dark mode and applies the appropriate color scheme

### ✅ Updated Components

- Profile picture in top right
- Title and category text (with theme colors)
- Progress bar (with theme colors)
- Navigation controls (with theme colors)
- All text and UI elements now respond to light/dark mode

### ✅ Added Dependencies

- `expo-blur` v15.0.6 - For the blurred background effect
- `expo-linear-gradient` v15.0.8 - For the gradient fade effect

## To See the New Design

**Restart the dev server to clear the cache:**

```bash
# Stop the current server (Ctrl+C)
# Then restart with cache cleared
npx expo start --clear
```

Or press `shift + r` in the Expo terminal to force reload.

## File Changes

- `app/(tabs)/index.tsx` - Complete redesign with new layout
- `constants/colors.ts` - New file with light/dark color schemes
- `package.json` - Added expo-blur and expo-linear-gradient

## Features

✅ Automatic light/dark mode detection  
✅ Blurred background with gradient fade  
✅ Centered card image with rounded corners  
✅ All colors match design specifications  
✅ Smooth color transitions between modes  
✅ Profile picture, controls, and progress bar all themed  

## How It Works

```typescript
// Detects system color scheme
const colorScheme = useColorScheme();
const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

// Applies theme colors throughout
<Text style={{ color: theme.primaryText }}>
```

The background image is blurred with `blurRadius={100}` and a LinearGradient creates the fade effect from transparent to the background color.

## Next Steps

Once you restart the server, you should see:
- Beautiful blurred background at the top
- Clean card image in the center
- All text and UI elements properly themed for light/dark mode
- Smooth transitions when switching between modes
