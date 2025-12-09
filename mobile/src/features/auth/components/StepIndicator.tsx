// src/features/auth/components/StepIndicator.tsx
// Multi-step form progress indicator with vector icons - Modern Full-Width Design

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useColors } from '@contexts/ThemeContext';
import { spacing } from '@theme';

interface StepIndicatorProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current active step (1-based) */
  currentStep: number;
  /** Step labels (optional) */
  labels?: string[];
  /** Step icons (optional - defaults to user, briefcase, lock) */
  icons?: string[];
}

/**
 * Modern StepIndicator Component
 *
 * Full-width responsive design with perfect alignment
 *
 * Features:
 * - Full-width responsive layout
 * - Larger icons (24px) for better visibility
 * - Perfect alignment for all elements
 * - Smooth visual feedback
 * - Corporate modern design
 *
 * @example
 * <StepIndicator
 *   totalSteps={3}
 *   currentStep={2}
 *   labels={['Bilgiler', 'Meslek', 'Hesap']}
 *   icons={['user', 'briefcase', 'lock']}
 * />
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  labels,
  icons = ['user', 'briefcase', 'lock'],
}) => {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {/* Steps with Full Width */}
      <View style={styles.stepsWrapper}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          const iconName = icons[index] || 'check-circle';

          return (
            <View key={stepNumber} style={styles.stepItem}>
              {/* Step Circle with Icon */}
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor:
                      isActive || isCompleted
                        ? colors.interactive.default
                        : colors.background.tertiary,
                    borderColor: isActive ? colors.interactive.default : colors.border.default,
                    shadowColor: isActive ? colors.interactive.default : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isActive ? 0.3 : 0,
                    shadowRadius: 8,
                    elevation: isActive ? 4 : 0,
                  },
                ]}>
                <Icon
                  name={isCompleted ? 'check' : iconName}
                  size={24}
                  color={isActive || isCompleted ? colors.text.inverse : colors.text.tertiary}
                />
              </View>

              {/* Connector Line */}
              {stepNumber < totalSteps && (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted
                        ? colors.interactive.default
                        : colors.border.default,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      {/* Labels */}
      {labels && labels.length === totalSteps && (
        <View style={styles.labelsContainer}>
          {labels.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;

            return (
              <Text
                key={stepNumber}
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.text.primary : colors.text.tertiary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
                numberOfLines={1}>
                {label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  stepsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: spacing.md,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  stepCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  connector: {
    position: 'absolute',
    top: 28,
    left: '50%',
    right: '-50%',
    height: 3,
    zIndex: -1,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.xs,
    flex: 1,
  },
});
