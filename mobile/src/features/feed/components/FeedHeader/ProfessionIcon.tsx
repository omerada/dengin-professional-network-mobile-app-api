// src/features/feed/components/FeedHeader/ProfessionIcon.tsx
// Meslektaş Design System - Profession Icon Component
// Oku: mobile-development-guide/sprints/30-SPRINT-HOME-SCREEN-COMPLETION.md Lines 692-780

import React, { memo } from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useHaptic } from '@shared/hooks/useHaptic';

import { styles } from './ProfessionIcon.styles';
import { getProfessionColor, getProfessionIcon, type ProfessionCategory } from './professionConfig';

export interface ProfessionIconProps {
  /** Profession category */
  category?: ProfessionCategory;
  /** Profession name (for accessibility) */
  name?: string;
  /** Callback when profession icon is pressed */
  onPress?: () => void;
  /** Test ID */
  testID?: string;
}

/**
 * ProfessionIcon Component
 *
 * Displays a colorful profession icon in FeedHeader.
 *
 * Features:
 * - 8 profession categories with unique icons & colors
 * - Tappable (navigate to profession detail)
 * - Haptic feedback on press
 * - Accessibility support
 *
 * @example
 * ```tsx
 * <ProfessionIcon
 *   category="MEDICAL"
 *   name="Doktor"
 *   onPress={() => navigation.navigate('ProfessionDetail')}
 * />
 * ```
 */
export const ProfessionIcon: React.FC<ProfessionIconProps> = memo(
  ({ category, name, onPress, testID = 'profession-icon' }) => {
    const { trigger } = useHaptic();

    const iconName = getProfessionIcon(category);
    const iconColor = getProfessionColor(category);

    // Handle press with haptic feedback
    const handlePress = () => {
      if (onPress) {
        trigger('light');
        onPress();
      }
    };

    // If no callback, render static icon
    if (!onPress) {
      return (
        <Icon
          name={iconName}
          size={24}
          color={iconColor}
          style={styles.icon}
          testID={testID}
          accessibilityLabel={name ? `${name} meslek simgesi` : 'Meslek simgesi'}
          accessibilityRole="image"
        />
      );
    }

    // Render pressable icon
    return (
      <Pressable
        style={styles.container}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={name ? `${name} detaylarını gör` : 'Meslek detaylarını gör'}
        testID={testID}>
        <Icon name={iconName} size={24} color={iconColor} style={styles.icon} />
      </Pressable>
    );
  },
);

ProfessionIcon.displayName = 'ProfessionIcon';

export default ProfessionIcon;
