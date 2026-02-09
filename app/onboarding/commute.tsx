import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';

export default function CommuteOnboardingScreen() {
  const router = useRouter();
  const { onboarding, setCommuteMinutes } = useAuth();
  const [selected, setSelected] = useState<number | null>(onboarding.commuteMinutes);
  const [isSaving, setIsSaving] = useState(false);

  const options = useMemo(() => Array.from({ length: 9 }, (_, index) => (index + 1) * 10), []);

  const handleContinue = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      await setCommuteMinutes(selected);
      router.replace('/onboarding/interests');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>How long is your morning commute?</Text>
      <Text style={styles.subtitle}>Choose the closest estimate in 10-minute steps.</Text>

      <View style={styles.grid}>
        {options.map((minutes) => {
          const isActive = selected === minutes;
          return (
            <Pressable
              key={minutes}
              style={({ pressed }) => [
                styles.optionChip,
                isActive && styles.optionChipActive,
                pressed && styles.optionChipPressed,
              ]}
              onPress={() => setSelected(minutes)}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>{minutes} mins</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.continueButton,
          (!selected || isSaving) && styles.continueButtonDisabled,
          pressed && styles.continueButtonPressed,
        ]}
        disabled={!selected || isSaving}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>{isSaving ? 'Saving...' : 'Continue'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  title: {
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginTop: 10,
  },
  grid: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionChip: {
    minWidth: '30%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  optionChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  optionChipPressed: {
    opacity: 0.85,
  },
  optionText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#F8FAFC',
  },
  continueButton: {
    marginTop: 'auto',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonPressed: {
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
});
