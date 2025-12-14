import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { SCREEN_ANIMATIONS } from '@constants/animationPresets';
import { HAPTIC_TYPES } from '@constants/hapticPresets';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';
import { asyncStorage } from '@core/storage/asyncStorage';
import { STORAGE_KEYS } from '@core/storage/keys';
import type { AuthStackNavigationProp } from '@shared/types';

const { width } = Dimensions.get('window');

/**
 * Onboarding Slide Interface
 */
interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/**
 * Onboarding Slides Data - Professional & Minimal
 */
const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'shield',
    title: 'Güvenli Platform',
    description:
      'Yapay zeka destekli doğrulama sistemi ile güvenli ve güvenilir bir profesyonel ortam',
  },
  {
    id: '2',
    icon: 'check-circle',
    title: 'Doğrulanmış Kimlikler',
    description:
      'Tüm kullanıcılar kimlik doğrulama sürecinden geçer. Sahte profiller ve dolandırıcılara karşı korunun',
  },
  {
    id: '3',
    icon: 'users',
    title: 'Profesyonel Ağınızı Genişletin',
    description:
      'Sektörünüzden profesyonellerle bağlantı kurun, kariyer fırsatları keşfedin ve iş birliği yapın',
  },
];

/**
 * Slide Component - Minimalist & Professional
 */
interface SlideProps {
  slide: OnboardingSlide;
  index: number;
}

const SlideItem: React.FC<SlideProps> = ({ slide, index }) => {
  const colors = useColors();

  return (
    <Animated.View
      entering={SCREEN_ANIMATIONS.listItemEnter(index)}
      style={[styles.slide, { width }]}>
      {/* Icon Container */}
      <Animated.View
        entering={SCREEN_ANIMATIONS.heroEnter}
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.background.secondary,
            borderColor: colors.border.subtle,
          },
        ]}>
        <Icon name={slide.icon} size={48} color={colors.interactive.default} />
      </Animated.View>

      {/* Text Content */}
      <Animated.View entering={SCREEN_ANIMATIONS.contentEnter} style={styles.textContainer}>
        <Text style={[styles.slideTitle, { color: colors.text.primary }]}>{slide.title}</Text>
        <Text style={[styles.slideDescription, { color: colors.text.secondary }]}>
          {slide.description}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

/**
 * Pagination Dot - Minimal indicator
 */
interface DotProps {
  active: boolean;
}

const PaginationDot: React.FC<DotProps> = ({ active }) => {
  const colors = useColors();
  const dotWidth = active ? 24 : 8;

  return (
    <View
      style={[
        styles.paginationDot,
        {
          backgroundColor: active ? colors.interactive.default : colors.border.default,
          width: dotWidth,
        },
      ]}
    />
  );
};

/**
 * Main Onboarding Screen - Soft Corporate Design
 */
export const OnboardingScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<AuthStackNavigationProp>();
  const { trigger } = useHaptic();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  /**
   * Handle Scroll
   */
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      trigger(HAPTIC_TYPES.selection);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  /**
   * Handle Next
   */
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      trigger(HAPTIC_TYPES.buttonPress);
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['top', 'bottom']}>
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => <SlideItem slide={item} index={index} />}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer */}
      <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.footer}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot key={index} active={index === currentIndex} />
          ))}
        </View>

        {/* CTA Buttons */}
        {currentIndex === slides.length - 1 ? (
          <View style={styles.finalButtons}>
            <TouchableOpacity
              onPress={() => {
                trigger(HAPTIC_TYPES.buttonPress);
                asyncStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
                navigation.replace('Login');
              }}
              style={[styles.ctaButton, { backgroundColor: colors.interactive.default }]}
              activeOpacity={0.85}>
              <Text style={[styles.ctaButtonText, { color: colors.text.inverse }]}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                trigger(HAPTIC_TYPES.buttonPress);
                asyncStorage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
                navigation.replace('Register');
              }}
              style={[styles.ctaButtonOutline, { borderColor: colors.interactive.default }]}
              activeOpacity={0.85}>
              <Text style={[styles.ctaButtonOutlineText, { color: colors.interactive.default }]}>
                Kayıt Ol
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.ctaButton, { backgroundColor: colors.interactive.default }]}
            activeOpacity={0.85}>
            <Text style={[styles.ctaButtonText, { color: colors.text.inverse }]}>İleri</Text>
            <Icon name="arrow-right" size={20} color={colors.text.inverse} style={styles.ctaIcon} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ctaButton: {
    alignItems: 'center',
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaButtonOutline: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 14,
  },
  ctaButtonOutlineText: {
    fontSize: 17,
    fontWeight: '600',
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
  ctaIcon: {
    marginLeft: 4,
  },
  finalButtons: {
    gap: 0,
  },
  footer: {
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 80,
    borderWidth: 1,
    height: 140,
    justifyContent: 'center',
    marginBottom: 64,
    width: 140,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    borderRadius: 4,
    height: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  slideDescription: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
