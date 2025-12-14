// src/features/verification/components/VerificationProgressIndicator.tsx
// Production-ready Verification Progress Tracker
// Oku: mobile-development-guide/ui-ux-modernization/07-SCREEN-REDESIGNS.md

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { spacing, fontSize } from '@theme';
import type { VerificationStep } from '../types';

// ============================================================================
// Types
// ============================================================================

interface VerificationProgressIndicatorProps {
  /** Current step */
  currentStep: VerificationStep;
  /** Test ID */
  testID?: string;
}

interface StepConfig {
  key: VerificationStep;
  label: string;
  shortLabel: string;
}

// ============================================================================
// Constants
// ============================================================================

const STEPS: StepConfig[] = [
  { key: 'intro', label: 'Giriş', shortLabel: '1' },
  { key: 'document_front', label: 'Belge Ön', shortLabel: '2' },
  { key: 'document_back', label: 'Belge Arka', shortLabel: '3' },
  { key: 'selfie', label: 'Selfie', shortLabel: '4' },
  { key: 'review', label: 'İnceleme', shortLabel: '5' },
];

// ============================================================================
// StepCircle Component
// ============================================================================

interface StepCircleProps {
  step: StepConfig;
  index: number;
  currentIndex: number;
  isLast: boolean;
}

const StepCircle: React.FC<StepCircleProps> = memo(({ step, index, currentIndex, isLast }) => {
  const colors = useColors();
  const isActive = index === currentIndex;
  const isCompleted = index < currentIndex;

  const circleStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      isCompleted || isActive ? 1 : 0,
      [0, 1],
      [colors.background.secondary, colors.interactive.default],
    );

    return {
      backgroundColor: bgColor,
      borderColor: isActive ? colors.interactive.default : colors.border.default,
    };
  });

  const lineStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      isCompleted ? 1 : 0,
      [0, 1],
      [colors.border.default, colors.interactive.default],
    );

    return {
      backgroundColor: bgColor,
    };
  });

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(200)}
        style={[styles.stepCircle, circleStyle]}>
        {isCompleted ? (
          <Icon name="checkmark" size={16} color={colors.text.inverse} />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              {
                color: isActive ? colors.text.inverse : colors.text.secondary,
              },
            ]}>
            {step.shortLabel}
          </Text>
        )}
      </Animated.View>

      {!isLast && <Animated.View style={[styles.stepLine, lineStyle]} />}
    </View>
  );
});

StepCircle.displayName = 'StepCircle';

// ============================================================================
// VerificationProgressIndicator Component
// ============================================================================

/**
 * Verification Progress Indicator
 *
 * Features:
 * - 5-step progress visualization
 * - Animated step transitions
 * - Check marks for completed steps
 * - Responsive layout
 * - Color-coded states
 *
 * @example
 * ```tsx
 * <VerificationProgressIndicator currentStep="selfie" />
 * ```
 */
export const VerificationProgressIndicator: React.FC<VerificationProgressIndicatorProps> = memo(
  ({ currentStep, testID }) => {
    const colors = useColors();

    const currentIndex = STEPS.findIndex(s => s.key === currentStep);

    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.stepsRow}>
          {STEPS.map((step, index) => (
            <StepCircle
              key={step.key}
              step={step}
              index={index}
              currentIndex={currentIndex}
              isLast={index === STEPS.length - 1}
            />
          ))}
        </View>

        {/* Current step label */}
        <Text style={[styles.currentStepLabel, { color: colors.text.secondary }]}>
          {STEPS[currentIndex]?.label || 'Giriş'}
        </Text>
      </View>
    );
  },
);

VerificationProgressIndicator.displayName = 'VerificationProgressIndicator';

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  stepCircle: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepNumber: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.xs,
  },
  currentStepLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
