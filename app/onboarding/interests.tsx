import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';

export default function InterestsOnboardingScreen() {
  const router = useRouter();
  const { onboarding, setInterests, skipInterests } = useAuth();
  const [selected, setSelected] = useState<string[]>(onboarding.interests);
  const [isSaving, setIsSaving] = useState(false);

  const interestOptions = useMemo(
    () => [
      'World News',
      'Technology',
      'Business',
      'Science',
      'Health',
      'Politics',
      'Sports',
      'Climate',
      'Culture',
      'Finance',
      'Startups',
      'Markets',
    ],
    []
  );

  const toggleInterest = (interest: string) => {
    setSelected((previous) => {
      if (previous.includes(interest)) {
        return previous.filter((item) => item !== interest);
      }
      return [...previous, interest];
    });
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      await skipInterests();
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setIsSaving(true);
    try {
      await setInterests(selected);
      router.replace('/(tabs)');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        <Pressable onPress={handleSkip} disabled={isSaving} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Choose your interests</Text>
      <Text style={styles.subtitle}>Pick topics to tune your feed.</Text>

      <View style={styles.chipList}>
        {interestOptions.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <Pressable
              key={interest}
              onPress={() => toggleInterest(interest)}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipSelected,
                pressed && styles.chipPressed,
              ]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{interest}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={isSaving || selected.length === 0}
        style={({ pressed }) => [
          styles.continueButton,
          (selected.length === 0 || isSaving) && styles.continueButtonDisabled,
          pressed && styles.continueButtonPressed,
        ]}
      >
        <Text style={styles.continueText}>{isSaving ? 'Saving...' : 'Continue'}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
    height: 1,
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    marginTop: 18,
    color: '#0F172A',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#475569',
    fontSize: 15,
  },
  chipList: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextSelected: {
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
  continueText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
});
