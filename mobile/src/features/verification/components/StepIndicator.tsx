// src/features/verification/components/StepIndicator.tsx
// Adım göstergesi bileşeni
// Oku: mobile-development-guide/sprints/24-SPRINT-3-4.md

import React, { memo, useMemo } from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@contexts';
import { spacing, typography } from '@theme';
import type { VerificationStep } from '../types';

/**
 * Adım göstergesi props
 */
interface StepIndicatorProps {
  /** Mevcut adım */
  currentStep: VerificationStep;
  /** Özel stil */
  style?: ViewStyle;
}

/**
 * Adım yapılandırması
 */
interface StepConfig {
  key: VerificationStep;
  label: string;
  shortLabel: string;
}

/**
 * Doğrulama adımları
 */
const STEPS: StepConfig[] = [
  { key: 'intro', label: 'Başlangıç', shortLabel: '1' },
  { key: 'document_front', label: 'Ön Yüz', shortLabel: '2' },
  { key: 'document_back', label: 'Arka Yüz', shortLabel: '3' },
  { key: 'selfie', label: 'Selfie', shortLabel: '4' },
  { key: 'review', label: 'Önizleme', shortLabel: '5' },
];

/**
 * Tek adım bileşeni
 */
interface StepDotProps {
  step: StepConfig;
  index: number;
  currentIndex: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

const StepDot: React.FC<StepDotProps> = memo(({ step, isCompleted, isCurrent }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isCurrent ? 1.2 : 1, {
          damping: 15,
          stiffness: 300,
        }),
      },
    ],
  }));

  const getBackgroundColor = () => {
    if (isCompleted) return colors.success;
    if (isCurrent) return colors.primary;
    return colors.border;
  };

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        style={[
          styles.stepDot,
          {
            backgroundColor: getBackgroundColor(),
          },
          animatedStyle,
        ]}>
        <Text
          style={[
            styles.stepNumber,
            {
              color: isCompleted || isCurrent ? colors.textInverse : colors.textSecondary,
            },
          ]}>
          {isCompleted ? '✓' : step.shortLabel}
        </Text>
      </Animated.View>
      <Text
        style={[
          styles.stepLabel,
          {
            color: isCurrent ? colors.text : colors.textSecondary,
            fontWeight: isCurrent ? '600' : '400',
          },
        ]}
        numberOfLines={1}>
        {step.label}
      </Text>
    </View>
  );
});

StepDot.displayName = 'StepDot';

/**
 * Adım çizgisi bileşeni
 */
interface StepLineProps {
  isCompleted: boolean;
}

const StepLine: React.FC<StepLineProps> = memo(({ isCompleted }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withSpring(isCompleted ? colors.success : colors.border, {
      damping: 20,
      stiffness: 200,
    }),
  }));

  return <Animated.View style={[styles.stepLine, animatedStyle]} />;
});

StepLine.displayName = 'StepLine';

/**
 * Adım göstergesi
 * Doğrulama sürecindeki ilerlemeyi görsel olarak gösterir
 */
export const StepIndicator: React.FC<StepIndicatorProps> = memo(({ currentStep, style }) => {
  const currentIndex = useMemo(() => STEPS.findIndex(s => s.key === currentStep), [currentStep]);

  // Yükleme ve durum adımlarını gösterme
  if (currentStep === 'uploading' || currentStep === 'status') {
    return null;
  }

  return (
    <View style={[styles.container, style]} accessibilityRole="progressbar">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.key}>
          <StepDot
            step={step}
            index={index}
            currentIndex={currentIndex}
            isCompleted={index < currentIndex}
            isCurrent={index === currentIndex}
          />
          {index < STEPS.length - 1 && <StepLine isCompleted={index < currentIndex} />}
        </React.Fragment>
      ))}
    </View>
  );
});

StepIndicator.displayName = 'StepIndicator';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepContainer: {
    alignItems: 'center',
    width: 60,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 3,
    marginTop: 14,
    marginHorizontal: 4,
    borderRadius: 1.5,
  },
});

export default StepIndicator;
