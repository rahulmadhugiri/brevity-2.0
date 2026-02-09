export type Mood = 'calm' | 'energetic' | 'focused' | 'melancholic' | 'uplifting';

export interface AudioContent {
  id: string;
  title: string;
  category: string;
  script: string;
  mood: Mood;
  audioSource: any;
  image: string | any; // Can be URL string or require() result
}

const contentData = [
  {
    title: "New 'M2' Avian Flu Strain",
    category: 'Medicine',
    script: 'A concerning new strain of avian influenza has been detected in livestock',
    mood: 'focused' as Mood,
    image: require('@/assets/images/cow-avian-flu.png'),
  },
  {
    title: 'Ocean Conservation Efforts',
    category: 'Environment',
    script: 'Marine biologists discover new methods to protect coral reef ecosystems',
    mood: 'uplifting' as Mood,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800&fit=crop&q=80',
  },
  {
    title: 'AI Breakthrough in Healthcare',
    category: 'Technology',
    script: 'Machine learning models now detect diseases with unprecedented accuracy',
    mood: 'energetic' as Mood,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop&q=80',
  },
  {
    title: 'The Power of Meditation',
    category: 'Wellness',
    script: 'Studies reveal how mindfulness practices transform brain structure',
    mood: 'calm' as Mood,
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop&q=80',
  },
  {
    title: 'Renewable Energy Revolution',
    category: 'Science',
    script: 'Solar and wind power costs drop below fossil fuels globally',
    mood: 'energetic' as Mood,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=800&fit=crop&q=80',
  },
];

// Local audio files - these will be cycled through for all content
const audioSources = [
  require('@/assets/audio/voice1.mp3'),
  require('@/assets/audio/voice2.mp3'),
  require('@/assets/audio/voice3.mp3'),
  require('@/assets/audio/voice1.mp3'), // Cycle back for 4th item
  require('@/assets/audio/voice2.mp3'), // Cycle back for 5th item
];

let idCounter = 0;

export class ContentGenerator {
  /**
   * Get all content items
   */
  static getAllContent(): AudioContent[] {
    return contentData.map((data, index) => ({
      id: `content-${index}`,
      title: data.title,
      category: data.category,
      script: data.script,
      mood: data.mood,
      audioSource: audioSources[index],
      image: data.image,
    }));
  }

  /**
   * Get a specific content item by index
   */
  static getContent(index: number): AudioContent {
    const data = contentData[index % contentData.length];
    return {
      id: `content-${index}`,
      title: data.title,
      category: data.category,
      script: data.script,
      mood: data.mood,
      audioSource: audioSources[index % audioSources.length],
      image: data.image,
    };
  }
}
