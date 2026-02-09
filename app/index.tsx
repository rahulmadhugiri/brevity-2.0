import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';

export default function IndexGate() {
  const { user, isAuthReady, isOnboardingReady, onboarding } = useAuth();

  if (!isAuthReady || !isOnboardingReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
        <Text style={styles.loadingText}>Loading your session...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/auth/splash" />;
  }

  if (onboarding.commuteMinutes === null) {
    return <Redirect href="/onboarding/commute" />;
  }

  if (!onboarding.interestsSkipped && onboarding.interests.length === 0) {
    return <Redirect href="/onboarding/interests" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F6F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#4B5563',
  },
});
