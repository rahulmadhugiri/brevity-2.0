import { MaterialIcons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { Command, MediaControl, MediaControlEvent, PlaybackState } from 'expo-media-control';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  GestureResponderEvent,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { AudioContent, ContentGenerator } from '@/services/ContentGenerator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_SIZE = 350;
const CARD_LEFT = (SCREEN_WIDTH - CARD_SIZE) / 2;
const IMAGE_TOP = SCREEN_HEIGHT * 0.157;
const IMAGE_BOTTOM = IMAGE_TOP + CARD_SIZE;

const TITLE_OFFSET = 38;
const TITLE_HEIGHT = 23 + 8;
const SUBTITLE_HEIGHT = 18;
const PROGRESS_OFFSET = 65;
const PROGRESS_HEIGHT = 3;
const CONTROLS_OFFSET = 79;
const FORCE_SHOW_SWIPE_HINT_FOR_TESTING = false;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { user, onboarding, markFeedHintSeen, signOutUser } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHintDismissed, setIsHintDismissed] = useState(onboarding.hasSeenFeedHint);

  const cards = ContentGenerator.getAllContent();
  const currentCard = cards[currentIndex];

  const player = useAudioPlayer(cards[0].audioSource, {
    updateInterval: 100,
  });
  const status = useAudioPlayerStatus(player);

  const pagerRef = useRef<FlatList<AudioContent>>(null);
  const swipeHintAnim = useRef(new Animated.Value(0)).current;
  const hintOverlayOpacity = useRef(new Animated.Value(onboarding.hasSeenFeedHint ? 0 : 1)).current;
  const lastIndexRef = useRef(0);
  const currentTimeRef = useRef(0);
  const currentIndexRef = useRef(currentIndex);
  const cardsLengthRef = useRef(cards.length);
  const isUserDraggingRef = useRef(false);
  const pageChangeSourceRef = useRef<'user' | 'programmatic' | null>(null);
  const isHintFadingRef = useRef(false);

  const profileImageUri =
    user?.photoURL ??
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
  const profileName = user?.displayName || 'Your Profile';
  const profileEmail = user?.email || 'Signed in with Google';
  const shouldShowSwipeHint =
    !isHintDismissed && (FORCE_SHOW_SWIPE_HINT_FOR_TESTING || !onboarding.hasSeenFeedHint);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    cardsLengthRef.current = cards.length;
  }, [cards.length]);

  useEffect(() => {
    currentTimeRef.current = status.currentTime;
  }, [status.currentTime]);

  useEffect(() => {
    if (onboarding.hasSeenFeedHint) {
      setIsHintDismissed(true);
      hintOverlayOpacity.setValue(0);
    }
  }, [onboarding.hasSeenFeedHint, hintOverlayOpacity]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  const goToIndex = useCallback(
    (index: number, animated = true) => {
      const clamped = Math.max(0, Math.min(cardsLengthRef.current - 1, index));
      pageChangeSourceRef.current = 'programmatic';
      setCurrentIndex(clamped);
      pagerRef.current?.scrollToOffset({ offset: clamped * SCREEN_WIDTH, animated });
      if (!animated) pageChangeSourceRef.current = null;
    },
    []
  );

  const goToNext = useCallback(() => {
    const idx = currentIndexRef.current;
    if (idx < cardsLengthRef.current - 1) {
      goToIndex(idx + 1);
    }
  }, [goToIndex]);

  const goToPrevious = useCallback(() => {
    const idx = currentIndexRef.current;
    if (idx > 0) {
      goToIndex(idx - 1);
    }
  }, [goToIndex]);

  useEffect(() => {
    if (currentIndex !== lastIndexRef.current) {
      lastIndexRef.current = currentIndex;
      setProgress(0);
      player.replace(currentCard.audioSource);
    }
  }, [currentIndex, currentCard.audioSource, player]);

  useEffect(() => {
    if (player && status.isLoaded) {
      player.setActiveForLockScreen(true, {
        title: currentCard.title,
        artist: currentCard.category,
        artworkUrl: typeof currentCard.image === 'string' ? currentCard.image : undefined,
      });
    }
  }, [player, status.isLoaded, currentCard.title, currentCard.category, currentCard.image]);

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
  }, [status.isLoaded, status.duration, currentCard.title, currentCard.category, currentCard.image]);

  useEffect(() => {
    if (!status.isLoaded) return;
    const state = status.playing ? PlaybackState.PLAYING : PlaybackState.PAUSED;
    MediaControl.updatePlaybackState(state, currentTimeRef.current).catch((error) => {
      console.error('Failed to update playback state:', error);
    });
  }, [status.isLoaded, status.playing]);

  useEffect(() => {
    if (status.isLoaded && !status.playing && status.currentTime === 0) {
      player.play();
    }
  }, [status.isLoaded, status.playing, status.currentTime, player]);

  useEffect(() => {
    if (status.duration > 0) {
      setProgress(status.currentTime / status.duration);
    }
  }, [status.currentTime, status.duration]);

  useEffect(() => {
    if (status.didJustFinish) {
      goToNext();
    }
  }, [status.didJustFinish, goToNext]);

  useEffect(() => {
    if (!shouldShowSwipeHint) return;

    swipeHintAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(swipeHintAnim, {
        toValue: 1,
        duration: 1900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    loop.start();
    return () => {
      loop.stop();
      swipeHintAnim.setValue(0);
    };
  }, [shouldShowSwipeHint, swipeHintAnim]);

  const dismissSwipeHint = useCallback(() => {
    if (isHintDismissed || isHintFadingRef.current) return;

    isHintFadingRef.current = true;
    Animated.timing(hintOverlayOpacity, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      setIsHintDismissed(true);
      isHintFadingRef.current = false;
      markFeedHintSeen().catch((error) => {
        console.error('Failed to persist feed hint state:', error);
      });
    });
  }, [hintOverlayOpacity, isHintDismissed, markFeedHintSeen]);

  const handlePageChanged = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (nextIndex !== currentIndexRef.current && nextIndex >= 0 && nextIndex < cards.length) {
      setCurrentIndex(nextIndex);
    }

    const isUserDriven = pageChangeSourceRef.current === 'user' || isUserDraggingRef.current;
    if (isUserDriven && nextIndex > 0) {
      dismissSwipeHint();
    }
    isUserDraggingRef.current = false;
    pageChangeSourceRef.current = null;
  };

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleProfilePress = () => {
    const doSignOut = () => {
      signOutUser().catch((error) => {
        Alert.alert('Sign out failed', error instanceof Error ? error.message : 'Please try again.');
      });
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: profileName,
          message: profileEmail,
          options: ['Cancel', 'Sign Out'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            doSignOut();
          }
        }
      );
      return;
    }

    Alert.alert(profileName, profileEmail, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: doSignOut },
    ]);
  };

  const handleProgressBarPress = async (event: GestureResponderEvent) => {
    if (!status.duration) return;

    const { locationX } = event.nativeEvent;
    const newProgress = locationX / CARD_SIZE;
    const newPosition = newProgress * status.duration;

    try {
      await player.seekTo(newPosition);
      setProgress(newProgress);
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const hintTranslateX = swipeHintAnim.interpolate({
    inputRange: [0, 0.3, 0.78, 1],
    outputRange: [0, 0, -96, -96],
  });
  const hintDotScale = swipeHintAnim.interpolate({
    inputRange: [0, 0.16, 0.78, 1],
    outputRange: [1, 0.5, 0.5, 0.5],
  });
  const hintDotOpacity = swipeHintAnim.interpolate({
    inputRange: [0, 0.2, 0.72, 0.9, 1],
    outputRange: [1, 0.95, 0.95, 0.25, 0],
  });

  const renderPage = ({ item }: { item: AudioContent }) => {
    return (
      <View style={styles.page}>
        <View style={styles.backgroundImageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
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
        </View>

        <View style={styles.cardImageContainer}>
          <Image
            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        ref={pagerRef}
        data={cards}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderPage}
        onScrollBeginDrag={() => {
          isUserDraggingRef.current = true;
          pageChangeSourceRef.current = 'user';
        }}
        onMomentumScrollEnd={handlePageChanged}
        onScrollToIndexFailed={(info) => {
          pagerRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
        <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
      </TouchableOpacity>

      <View style={styles.textContainer} pointerEvents="none">
        <Text style={[styles.title, { color: theme.primaryText }]}>{currentCard.title}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{currentCard.category}</Text>
      </View>

      <TouchableOpacity style={styles.progressBarContainer} onPress={handleProgressBarPress} activeOpacity={0.8}>
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

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]}
          onPress={goToPrevious}
          disabled={currentIndex === 0}
        >
          <MaterialIcons
            name="skip-previous"
            size={56}
            color={currentIndex === 0 ? theme.secondaryText : theme.primaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
          <MaterialIcons
            name={status.playing ? 'pause-circle-filled' : 'play-circle-filled'}
            size={56}
            color={theme.primaryText}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, currentIndex === cards.length - 1 && styles.controlButtonDisabled]}
          onPress={goToNext}
          disabled={currentIndex === cards.length - 1}
        >
          <MaterialIcons
            name="skip-next"
            size={56}
            color={currentIndex === cards.length - 1 ? theme.secondaryText : theme.primaryText}
          />
        </TouchableOpacity>
      </View>

      {shouldShowSwipeHint ? (
        <Animated.View style={[styles.hintOverlay, { opacity: hintOverlayOpacity }]} pointerEvents="none">
          <View style={styles.hintCenter}>
            <View style={styles.hintGestureArea}>
              <Animated.View
                style={[
                  styles.hintDot,
                  {
                    opacity: hintDotOpacity,
                    transform: [{ translateX: hintTranslateX }, { scale: hintDotScale }],
                  },
                ]}
              />
            </View>
            <Text style={styles.hintText}>The more you listen, the better your feed gets</Text>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
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
    height: '70%',
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
    top:
      IMAGE_BOTTOM +
      TITLE_OFFSET +
      TITLE_HEIGHT +
      SUBTITLE_HEIGHT +
      PROGRESS_OFFSET +
      PROGRESS_HEIGHT +
      CONTROLS_OFFSET,
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
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  hintCenter: {
    alignItems: 'center',
    transform: [{ translateY: -75 }],
  },
  hintGestureArea: {
    width: 260,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintDot: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  hintText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '500',
    lineHeight: 38,
  },
});
