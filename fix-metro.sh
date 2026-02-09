#!/bin/bash

echo "🔧 Fixing Metro Bundler Issues..."

# Kill any existing Expo processes
echo "1. Stopping existing Expo servers..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "react-native start" 2>/dev/null || true

# Clear Metro cache
echo "2. Clearing Metro bundler cache..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

# Clear watchman cache if installed
if command -v watchman &> /dev/null; then
    echo "3. Clearing watchman cache..."
    watchman watch-del-all 2>/dev/null || true
fi

echo "✅ Cache cleared!"
echo ""
echo "Now run: npx expo start"
echo ""
