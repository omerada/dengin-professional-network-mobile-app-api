// src/features/onboarding/screens/OnboardingScreen.tsx
// Modern Onboarding Slider - İlk uygulama açılış deneyimi
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { memo, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Dimensions, FlatList, ViewToken, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolate,
  FadeInDown,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '@theme';
import { asyncStorage, STORAGE_KEYS } from '@core/storage';
import type { AuthStackNavigationProp } from '@shared/types';

const { width, height } = Dimensions.get('window');
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList) as typeof FlatList;

// Colors
const COLORS = {
  black: '#000',
  white: '#FFFFFF',
  whiteTransparent85: 'rgba(255, 255, 255, 0.85)',
  whiteTransparent70: 'rgba(255, 255, 255, 0.7)',
  whiteTransparent20: 'rgba(255, 255, 255, 0.2)',
  primaryBlue: '#4A90E2',
};

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: readonly [string, string];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Hoş Geldiniz',
    description:
      "Meslektaş'a hoş geldiniz! Profesyoneller için tasarlanmış güvenli sosyal ağ platformu.",
    emoji: '👋',
    gradient: ['#667eea', '#764ba2'] as const,
  },
  {
    id: '2',
    title: 'Doğrulanmış Topluluk',
    description:
      'AI destekli kimlik doğrulama sistemi ile sadece gerçek profesyonellerle bağlantı kurun.',
    emoji: '✓',
    gradient: ['#f093fb', '#f5576c'] as const,
  },
  {
    id: '3',
    title: 'Güvenli İletişim',
    description: 'Meslektaşlarınızla güvenli ve profesyonel bir ortamda iletişim kurun.',
    emoji: '💬',
    gradient: ['#4facfe', '#00f2fe'] as const,
  },
  {
    id: '4',
    title: 'Profesyonel Ağ',
    description:
      'Sektörünüzdeki profesyonellerle değerli bağlantılar oluşturun ve kariyerinizi geliştirin.',
    emoji: '🌟',
    gradient: ['#43e97b', '#38f9d7'] as const,
  },
];

/**
 * Onboarding Slide Component
 */
interface SlideProps {
  slide: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
}

const Slide = memo<SlideProps>(({ slide, index, scrollX }) => {
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], Extrapolate.CLAMP);

    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);

    const translateY = interpolate(scrollX.value, inputRange, [50, 0, 50], Extrapolate.CLAMP);

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  return (
    <View style={styles.slide}>
      <LinearGradient colors={[...slide.gradient]} style={StyleSheet.absoluteFillObject} />

      <Animated.View style={[styles.slideContent, animatedStyle, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );
});

Slide.displayName = 'OnboardingSlide';

/**
 * Pagination Dot Component
 */
interface DotProps {
  index: number;
  scrollX: SharedValue<number>;
}

const Dot = memo<DotProps>(({ index, scrollX }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolate.CLAMP);

    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);

    return {
      width: dotWidth,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
});

Dot.displayName = 'PaginationDot';

/**
 * Modern Onboarding Screen
 */
export const OnboardingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AuthStackNavigationProp>();

  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const handleComplete = useCallback(async () => {
    try {
      // Mark onboarding as completed
      await asyncStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);

      // Navigate to welcome screen
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleComplete();
    }
  }, [currentIndex, handleComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const renderItem = useCallback(
    ({ item, index }: { item: OnboardingSlide; index: number }) => (
      <Slide slide={item} index={index} scrollX={scrollX} />
    ),
    [scrollX],
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Slides */}
      <AnimatedFlatList<OnboardingSlide>
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item: OnboardingSlide) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        decelerationRate="fast"
      />

      {/* Controls */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={[styles.controls, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {!isLastSlide ? (
            <>
              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Atla</Text>
              </Pressable>

              <Pressable onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextText}>İleri →</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={handleComplete} style={styles.startButton}>
              <Text style={styles.startButtonText}>Başla</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.black,
    flex: 1,
  },
  slide: {
    alignItems: 'center',
    height,
    justifyContent: 'center',
    width,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    color: COLORS.whiteTransparent85,
    fontSize: 17,
    lineHeight: 26,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
  controls: {
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.xl,
    position: 'absolute',
    right: 0,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    height: 8,
  },
  buttons: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skipButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  skipText: {
    color: COLORS.whiteTransparent70,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: COLORS.whiteTransparent20,
    borderRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  nextText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
