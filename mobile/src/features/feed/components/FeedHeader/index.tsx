// src/features/feed/components/FeedHeader/index.tsx
// Meslektaş Design System - Modern FeedHeader Component
// Oku: mobile-development-guide/ui-ux-modernization/08-FEED-EXPERIENCE.md

import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks/useHaptic';

import { styles } from './FeedHeader.styles';
import type { FeedHeaderProps } from './FeedHeader.types';
import { ProfessionIcon } from './ProfessionIcon';

/**
 * Modern FeedHeader Component
 *
 * Features:
 * - Sector icon (left side, dynamic & colorful)
 * - "Ana Sayfa" title (center) with optional profession subtitle
 * - Notification icon with badge (right side)
 * - Haptic feedback on interactions
 *
 * Design: MOBILE-APP-HOME-SCREEN.md Lines 512-680
 *
 * @example
 * ```tsx
 * <FeedHeader
 *   sector={{ name: 'Sağlık', code: 'MEDICAL' }}
 *   unreadNotifications={3}
 *   onSectorPress={() => navigation.navigate('SectorDetail')}
 *   onNotificationPress={() => navigation.navigate('Notifications')}
 * />
 * ```
 */
export const FeedHeader: React.FC<FeedHeaderProps> = memo(
  ({
    sector,
    profession,
    unreadNotifications = 0,
    onSectorPress,
    onProfessionPress,
    onNotificationPress,
    testID,
  }) => {
    // Backward compatibility: use profession if sector not provided
    const displaySector = sector || profession;
    const handleSectorPress = onSectorPress || onProfessionPress;
    const colors = useColors();
    const { trigger } = useHaptic();

    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.container,
          {
            backgroundColor: colors.background.primary,
            borderBottomColor: colors.border.subtle,
          },
        ]}
        testID={testID}>
        {/* Left: Sector Icon */}
        <View style={styles.leftSection}>
          {displaySector ? (
            <ProfessionIcon
              category={displaySector.code as any}
              name={displaySector.name}
              onPress={handleSectorPress}
              testID={`${testID}-sector-icon`}
            />
          ) : (
            <Pressable
              onPress={handleSectorPress}
              style={styles.professionIconContainer}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icon name="people" size={28} color={colors.interactive.default} />
            </Pressable>
          )}
        </View>

        {/* Center: Title */}
        <View style={styles.centerSection}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Ana Sayfa</Text>
          {displaySector && (
            <Text style={[styles.professionSubtitle, { color: colors.text.secondary }]}>
              {displaySector.name}
            </Text>
          )}
        </View>

        {/* Right: Notification Icon with Badge */}
        <View style={styles.rightSection}>
          <Pressable
            onPress={() => {
              trigger('light');
              onNotificationPress?.();
            }}
            style={styles.iconButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={`Bildirimler ${unreadNotifications > 0 ? `, ${unreadNotifications} okunmamış` : ''}`}>
            <Icon name="notifications-outline" size={24} color={colors.text.primary} />
            {unreadNotifications > 0 && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={[styles.badge, { backgroundColor: colors.error.main }]}>
                <Text style={styles.badgeText}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </Animated.View>
            )}
          </Pressable>
        </View>
      </Animated.View>
    );
  },
);

FeedHeader.displayName = 'FeedHeader';

export type { FeedHeaderProps, SectorInfo, ProfessionInfo } from './FeedHeader.types';
export default FeedHeader;
