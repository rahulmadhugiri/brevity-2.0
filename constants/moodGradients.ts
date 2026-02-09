import { Mood } from '@/services/ContentGenerator';

export type GradientColors = [string, string, ...string[]];

const lightGradients: Record<Mood, GradientColors> = {
  calm: ['#EAF7FF', '#CFE9FF', '#CDE8FF'],
  energetic: ['#FFE9DA', '#FFD2C2', '#FFC9E3'],
  focused: ['#E7FFF3', '#CFF6E6', '#CBE7FF'],
  melancholic: ['#EEE9FF', '#D9D1FF', '#CFE0FF'],
  uplifting: ['#FFF5D6', '#FFE5B3', '#FFD6EC'],
};

const darkGradients: Record<Mood, GradientColors> = {
  calm: ['#0F1B2A', '#15324A', '#1C3E5C'],
  energetic: ['#2A140F', '#4B1E18', '#5A2B40'],
  focused: ['#0F1E18', '#183629', '#163C4C'],
  melancholic: ['#161327', '#221A3A', '#1D2A4A'],
  uplifting: ['#251A0F', '#3D2A14', '#4B2A3F'],
};

export const getMoodGradient = (mood: Mood, scheme: 'light' | 'dark'): GradientColors => {
  return scheme === 'dark' ? darkGradients[mood] : lightGradients[mood];
};
