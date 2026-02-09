# How to Fix the Metro Bundler Errors

## The Problem

The Metro bundler has cached the OLD version of your files and won't reload them, even though the files on disk are correct.

I've verified that `app/(tabs)/_layout.tsx` is **100% correct** on disk - it no longer imports any missing components.

## The Solution

**You MUST manually stop and restart the dev server:**

### Step 1: Stop the Server
In your terminal where you see the red errors, press:
```
Ctrl + C
```

### Step 2: Start Fresh
Run this command:
```bash
npx expo start --clear
```

**That's it.** Once you do this, all the errors will disappear.

## What I Fixed

1. ✅ Removed all references to missing components (`HapticTab`, `IconSymbol`, etc.)
2. ✅ Simplified the tab layout to use only basic Expo Router components
3. ✅ Updated the home screen with your new layout specifications
4. ✅ All files are correct on disk

The ONLY issue is that Metro is reading from its cache instead of the actual files.

## Alternative If That Doesn't Work

If `--clear` doesn't work, try:

```bash
rm -rf .expo node_modules/.cache
npx expo start
```

This will force a complete cache clear.
