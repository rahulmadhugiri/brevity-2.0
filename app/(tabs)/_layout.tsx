import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user, isAuthReady, onboarding, isOnboardingReady } = useAuth();

  if (!isAuthReady || !isOnboardingReady) {
    return null;
  }

  if (!user) {
    return <Redirect href="/auth/splash" />;
  }

  if (onboarding.commuteMinutes === null || (!onboarding.interestsSkipped && onboarding.interests.length === 0)) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
        }}
      />
    </Tabs>
  );
}
