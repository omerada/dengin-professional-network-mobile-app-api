// src/features/feed/components/EmptyFeed/NewUserEmptyState/NewUserEmptyState.tsx
// New user onboarding empty state with gamification
// Oku: MOBILE-APP-HOME-SCREEN.md Lines 1564-1604
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 300-350

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { styles } from './NewUserEmptyState.styles';
import type { NewUserEmptyStateProps, ChecklistItemId } from './NewUserEmptyState.types';
import {
  ONBOARDING_CHECKLIST,
  getChecklistStatus,
  getCompletionPercentage,
  getTotalXP,
} from './NewUserEmptyState.types';

/**
 * NewUserEmptyState Component
 *
 * Displays onboarding checklist and gamification for new users.
 *
 * Features:
 * - Conditional rendering (user.isNew === true, account age < 7 days)
 * - 4-item onboarding checklist with completion status
 * - Progress bar showing completion percentage
 * - XP gamification (10-30 XP per item)
 * - Haptic feedback on checklist item press
 * - Stagger animations (FadeIn + FadeInDown)
 *
 * Design Spec: MOBILE-APP-HOME-SCREEN.md Lines 1564-1604
 *
 * @example
 * ```tsx
 * const handleCompleteProfile = () => {
 *   navigation.navigate('ProfileEdit');
 * };
 *
 * const handleChecklistItem = (itemId: ChecklistItemId) => {
 *   // Navigate based on item action
 *   switch (itemId) {
 *     case 'avatar':
 *     case 'bio':
 *       navigation.navigate('ProfileEdit');
 *       break;
 *     case 'follow':
 *       navigation.navigate('Discover');
 *       break;
 *     case 'post':
 *       navigation.navigate('CreatePost');
 *       break;
 *   }
 * };
 *
 * {isNewUser && posts.length === 0 && (
 *   <NewUserEmptyState
 *     user={userData}
 *     onCompleteProfile={handleCompleteProfile}
 *     onChecklistItemPress={handleChecklistItem}
 *   />
 * )}
 * ```
 */
export const NewUserEmptyState: React.FC<NewUserEmptyStateProps> = memo(
  ({ user, onCompleteProfile, onChecklistItemPress, testID = 'new-user-empty-state' }) => {
    const colors = useColors();
    const { trigger } = useHaptic();

    const checklistStatus = getChecklistStatus(user);
    const completionPercentage = getCompletionPercentage(user);
    const totalXP = getTotalXP(user);

    // Handle checklist item press
    const handleItemPress = useCallback(
      (itemId: ChecklistItemId) => {
        trigger('light');
        onChecklistItemPress?.(itemId);
      },
      [onChecklistItemPress, trigger],
    );

    // Handle CTA button press
    const handleCTAPress = useCallback(() => {
      trigger('medium');
      onCompleteProfile();
    }, [onCompleteProfile, trigger]);

    return (
      <Animated.View entering={FadeIn.duration(400)} style={styles.container} testID={testID}>
        {/* Rocket Icon */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.iconContainer}>
          <Icon name="rocket-outline" size={80} color={colors.interactive.default} />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.title, { color: colors.text.primary }]}>
          Hoş Geldin, {user.name}! 👋
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.subtitle, { color: colors.text.secondary }]}>
          Dengin topluluğuna katılmak için birkaç adım kaldı
        </Animated.Text>

        {/* Checklist */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.checklistContainer}>
          {ONBOARDING_CHECKLIST.map(item => {
            const isCompleted = checklistStatus[item.id];

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.checklistItem,
                  {
                    backgroundColor: isCompleted
                      ? colors.status.successBg
                      : colors.background.secondary,
                  },
                ]}
                onPress={() => handleItemPress(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`${item.label}, ${isCompleted ? 'tamamlandı' : 'tamamlanmadı'}, ${item.xp} XP`}
                accessibilityHint={`${item.label} için dokun`}>
                <View style={styles.checklistItemLeft}>
                  {/* Checkmark */}
                  <View
                    style={[
                      styles.checkmarkContainer,
                      isCompleted
                        ? styles.checkmarkCompleted
                        : [styles.checkmarkIncomplete, { borderColor: colors.border.default }],
                    ]}>
                    {isCompleted && <Icon name="checkmark" size={16} color="#FFFFFF" />}
                  </View>

                  {/* Item Icon */}
                  <Icon
                    name={item.icon}
                    size={20}
                    color={isCompleted ? colors.status.success : colors.text.secondary}
                    style={styles.itemIcon}
                  />

                  {/* Label */}
                  <Text
                    style={[
                      styles.itemLabel,
                      {
                        color: isCompleted ? colors.text.primary : colors.text.secondary,
                      },
                    ]}>
                    {item.label}
                  </Text>
                </View>

                {/* XP Badge */}
                <View
                  style={[
                    styles.xpBadge,
                    {
                      backgroundColor: isCompleted
                        ? colors.status.success
                        : colors.background.tertiary,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.xpBadgeText,
                      {
                        color: isCompleted ? '#FFFFFF' : colors.text.tertiary,
                      },
                    ]}>
                    +{item.xp} XP
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>İlerleme</Text>
            <Text style={[styles.progressValue, { color: colors.interactive.default }]}>
              {completionPercentage}% • {totalXP} XP
            </Text>
          </View>

          <View style={[styles.progressBarTrack, { backgroundColor: colors.background.tertiary }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor: colors.interactive.default,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={{ width: '100%' }}>
          <Pressable
            style={[styles.ctaButton, { backgroundColor: colors.interactive.default }]}
            onPress={handleCTAPress}
            accessibilityRole="button"
            accessibilityLabel="Profilimi tamamla"
            accessibilityHint="Profil düzenleme ekranına git">
            <Text style={[styles.ctaButtonText, { color: colors.text.inverse }]}>
              Profilimi Tamamla
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    );
  },
);

NewUserEmptyState.displayName = 'NewUserEmptyState';

export default NewUserEmptyState;
