// Brevity 2.0 Home Screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, useColorScheme, Animated, PanResponder } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { MediaControl, PlaybackState, Command, MediaControlEvent } from 'expo-media-control';
import { LinearGradient } from 'expo-linear-gradient';
import { ContentGenerator, AudioContent } from '@/services/ContentGenerator';
import { Colors } from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Layout constants
const CARD_SIZE = 350;
const CARD_LEFT = (SCREEN_WIDTH - CARD_SIZE) / 2;
const IMAGE_TOP = SCREEN_HEIGHT * 0.157;
const IMAGE_BOTTOM = IMAGE_TOP + CARD_SIZE;

// Spacing from design specs
const TITLE_OFFSET = 38;
const TITLE_HEIGHT = 23 + 8; // font size + margin
const SUBTITLE_HEIGHT = 18;
const PROGRESS_OFFSET = 65;
const PROGRESS_HEIGHT = 3;
const CONTROLS_OFFSET = 79;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Animation values - use interpolation for ultra-smooth transitions
  const slideAnim = useRef(new Animated.Value(0)).current;

  const cards = ContentGenerator.getAllContent();
  const currentCard = cards[currentIndex];

  // Use expo-audio hook for audio playback - start with first card's source
  const player = useAudioPlayer(cards[0].audioSource, {
    updateInterval: 100, // Smooth progress bar updates
  });
  const status = useAudioPlayerStatus(player);

  // Track if initial load has happened
  const hasLoadedRef = useRef(false);
  const lastIndexRef = useRef(0);
  const currentTimeRef = useRef(0);

  // Refs for panResponder to access latest values
  const currentIndexRef = useRef(currentIndex);
  const cardsLengthRef = useRef(cards.length);

  // Keep refs in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    cardsLengthRef.current = cards.length;
  }, [cards.length]);

  useEffect(() => {
    currentTimeRef.current = status.currentTime;
  }, [status.currentTime]);

  // Calculate adjacent indices for preloading
  const prevIndex = Math.max(0, currentIndex - 1);
  const nextIndex = Math.min(cards.length - 1, currentIndex + 1);

  const prevCard = cards[prevIndex];
  const nextCardData = cards[nextIndex];

  // Set up audio mode for background playback
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  // Replace audio source when index changes
  useEffect(() => {
    if (currentIndex !== lastIndexRef.current) {
      lastIndexRef.current = currentIndex;
      setProgress(0);
      player.replace(currentCard.audioSource);
    }
  }, [currentIndex, currentCard.audioSource, player]);

  // Set up lock screen controls when player is ready
  useEffect(() => {
    if (player && status.isLoaded) {
      player.setActiveForLockScreen(true, {
        title: currentCard.title,
        artist: currentCard.category,
        artworkUrl: typeof currentCard.image === 'string' ? currentCard.image : undefined,
      });
    }
  }, [player, status.isLoaded, currentCard.title, currentCard.category, currentCard.image]);

  // Enable media controls for remote commands (AirPods next/previous)
  useEffect(() => {
    let removeListener: (() => void) | null = null;

    const setupMediaControls = async () => {
      try {
        await MediaControl.enableMediaControls({
          capabilities: [
            Command.PLAY,
            Command.PAUSE,
            Command.NEXT_TRACK,
            Command.PREVIOUS_TRACK,
            Command.SEEK,
            Command.SKIP_FORWARD,
            Command.SKIP_BACKWARD,
          ],
        });

        removeListener = MediaControl.addListener((event: MediaControlEvent) => {
          switch (event.command) {
            case Command.PLAY:
              player.play();
              break;
            case Command.PAUSE:
              player.pause();
              break;
            case Command.NEXT_TRACK:
              goToNext();
              break;
            case Command.PREVIOUS_TRACK:
              goToPrevious();
              break;
            case Command.SEEK:
              if (typeof event.data?.position === 'number') {
                player.seekTo(event.data.position);
              }
              break;
            case Command.SKIP_FORWARD:
              if (typeof event.data?.interval === 'number') {
                player.seekTo(currentTimeRef.current + event.data.interval);
              }
              break;
            case Command.SKIP_BACKWARD:
              if (typeof event.data?.interval === 'number') {
                player.seekTo(Math.max(0, currentTimeRef.current - event.data.interval));
              }
              break;
            default:
              break;
          }
        });
      } catch (error) {
        console.error('Failed to enable media controls:', error);
      }
    };

    setupMediaControls();

    return () => {
      if (removeListener) removeListener();
      MediaControl.disableMediaControls();
    };
  }, [goToNext, goToPrevious, player]);

  // Keep media control metadata in sync
  useEffect(() => {
    if (!status.isLoaded) return;
    MediaControl.updateMetadata({
      title: currentCard.title,
      artist: currentCard.category,
      artwork: typeof currentCard.image === 'string' ? { uri: currentCard.image } : undefined,
      duration: status.duration || undefined,
    }).catch((error) => {
      console.error('Failed to update media metadata:', error);
    });
  }, [
    status.isLoaded,
    status.duration,
    currentCard.title,
    currentCard.category,
    currentCard.image,
  ]);

  // Update media control playback state
  useEffect(() => {
    if (!status.isLoaded) return;
    const state = status.playing ? PlaybackState.PLAYING : PlaybackState.PAUSED;
    MediaControl.updatePlaybackState(state, currentTimeRef.current).catch((error) => {
      console.error('Failed to update playback state:', error);
    });
  }, [status.isLoaded, status.playing]);

  // Auto-play when loaded
  useEffect(() => {
    if (status.isLoaded && !status.playing && status.currentTime === 0) {
      player.play();
    }
  }, [status.isLoaded, player]);

  // Update progress from status
  useEffect(() => {
    if (status.duration > 0) {
      setProgress(status.currentTime / status.duration);
    }
  }, [status.currentTime, status.duration]);

  // Auto-advance to next card when finished
  useEffect(() => {
    if (status.didJustFinish) {
      const idx = currentIndexRef.current;
      const totalCards = cardsLengthRef.current;
      if (idx < totalCards - 1) {
        const newIndex = idx + 1;
        Animated.timing(slideAnim, {
          toValue: newIndex,
          duration: 350,
          useNativeDriver: true,
        }).start(() => {
          setCurrentIndex(newIndex);
        });
      }
    }
  }, [status.didJustFinish, slideAnim]);

  // Navigation functions
  const goToNext = useCallback(() => {
    const idx = currentIndexRef.current;
    const totalCards = cardsLengthRef.current;
    if (idx < totalCards - 1) {
      const newIndex = idx + 1;
      Animated.timing(slideAnim, {
        toValue: newIndex,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(newIndex);
      });
    }
  }, [slideAnim]);

  const goToPrevious = useCallback(() => {
    const idx = currentIndexRef.current;
    if (idx > 0) {
      const newIndex = idx - 1;
      Animated.timing(slideAnim, {
        toValue: newIndex,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(newIndex);
      });
    }
  }, [slideAnim]);

  const handlePrevious = goToPrevious;
  const handleNext = goToNext;

  // Swipe gesture handler for card navigation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const swipeThreshold = 50;
        const velocityThreshold = 0.3;
        const idx = currentIndexRef.current;
        const totalCards = cardsLengthRef.current;

        // Swipe left (next) or swipe right (previous)
        if (dx < -swipeThreshold || vx < -velocityThreshold) {
          // Swiped left - go to next
          if (idx < totalCards - 1) {
            const newIndex = idx + 1;
            Animated.timing(slideAnim, {
              toValue: newIndex,
              duration: 350,
              useNativeDriver: true,
            }).start(() => {
              setCurrentIndex(newIndex);
            });
          }
        } else if (dx > swipeThreshold || vx > velocityThreshold) {
          // Swiped right - go to previous
          if (idx > 0) {
            const newIndex = idx - 1;
            Animated.timing(slideAnim, {
              toValue: newIndex,
              duration: 350,
              useNativeDriver: true,
            }).start(() => {
              setCurrentIndex(newIndex);
            });
          }
        }
      },
    })
  ).current;

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleProgressBarPress = async (event: any) => {
    if (!status.duration) return;

    const { locationX } = event.nativeEvent;
    const progressBarWidth = CARD_SIZE; // Same width as card
    const newProgress = locationX / progressBarWidth;
    const newPosition = newProgress * status.duration;

    try {
      await player.seekTo(newPosition);
      setProgress(newProgress);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Render all valid backgrounds (avoid duplicates) */}
      {Array.from(new Set([prevIndex, currentIndex, nextIndex])).map((idx) => {
        const card = cards[idx];
        const opacity = slideAnim.interpolate({
          inputRange: [idx - 1, idx, idx + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View 
            key={`bg-${idx}`}
            style={[styles.backgroundImageContainer, { opacity }]}
          >
            <Image
              source={typeof card.image === 'string' ? { uri: card.image } : card.image}
              style={styles.backgroundImage}
              blurRadius={100}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                colorScheme === 'dark' ? 'rgba(10, 10, 10, 0)' : 'rgba(249, 249, 249, 0)',
                colorScheme === 'dark' ? 'rgba(10, 10, 10, 0.5)' : 'rgba(249, 249, 249, 0.5)',
                colorScheme === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(249, 249, 249, 0.85)',
                colorScheme === 'dark' ? '#0A0A0A' : '#F9F9F9',
              ]}
              style={styles.gradientOverlay}
            />
          </Animated.View>
        );
      })}

      {/* Profile Picture - Top Right */}
      <TouchableOpacity style={styles.profileButton}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      {/* Render all unique cards (avoid duplicates) */}
      {Array.from(new Set([prevIndex, currentIndex, nextIndex])).map((idx) => {
        const card = cards[idx];
        const translateX = slideAnim.interpolate({
          inputRange: [idx - 1, idx, idx + 1],
          outputRange: [SCREEN_WIDTH, 0, -SCREEN_WIDTH],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={`card-${idx}`}
            style={[
              styles.cardImageContainer,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            <Image
              source={typeof card.image === 'string' ? { uri: card.image } : card.image}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </Animated.View>
        );
      })}

      {/* Swipe gesture overlay on card area */}
      <View
        style={styles.swipeOverlay}
        {...panResponder.panHandlers}
      />

      {/* Title - 38px below image, left aligned */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.primaryText }]}>{currentCard.title}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{currentCard.category}</Text>
      </View>

      {/* Progress Bar - 65px below subtitle */}
      <TouchableOpacity 
        style={styles.progressBarContainer}
        onPress={handleProgressBarPress}
        activeOpacity={0.8}
      >
        <View style={[styles.progressBarBackground, { backgroundColor: theme.componentBackground }]}>
          <View
            style={[
              styles.progressBarFill,
              { 
                width: `${progress * 100}%`,
                backgroundColor: theme.primaryText,
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Controls - 79px below progress bar */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <MaterialIcons
            name="skip-previous"
            size={56}
            color={currentIndex === 0 ? theme.secondaryText : theme.primaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePlayPause}
        >
          <MaterialIcons
            name={status.playing ? 'pause-circle-filled' : 'play-circle-filled'}
            size={56}
            color={theme.primaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            currentIndex === cards.length - 1 && styles.controlButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === cards.length - 1}
        >
          <MaterialIcons
            name="skip-next"
            size={56}
            color={currentIndex === cards.length - 1 ? theme.secondaryText : theme.primaryText}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.60, // Extended from 48% to 60%
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%', // Extended gradient coverage
  },
  profileButton: {
    position: 'absolute',
    top: 60,
    right: 30,
    width: 42,
    height: 42,
    borderRadius: 21,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  cardImageContainer: {
    position: 'absolute',
    top: IMAGE_TOP,
    left: CARD_LEFT,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  swipeOverlay: {
    position: 'absolute',
    top: IMAGE_TOP,
    left: CARD_LEFT,
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 15,
    zIndex: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    top: IMAGE_BOTTOM + TITLE_OFFSET,
    left: CARD_LEFT,
    right: CARD_LEFT,
  },
  title: {
    fontSize: 23,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBarContainer: {
    position: 'absolute',
    top: IMAGE_BOTTOM + TITLE_OFFSET + TITLE_HEIGHT + SUBTITLE_HEIGHT + PROGRESS_OFFSET,
    left: CARD_LEFT,
    right: CARD_LEFT,
  },
  progressBarBackground: {
    width: '100%',
    height: PROGRESS_HEIGHT,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  controlsContainer: {
    position: 'absolute',
    top: IMAGE_BOTTOM + TITLE_OFFSET + TITLE_HEIGHT + SUBTITLE_HEIGHT + PROGRESS_OFFSET + PROGRESS_HEIGHT + CONTROLS_OFFSET,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 75,
  },
  controlButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  preloadImage: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
