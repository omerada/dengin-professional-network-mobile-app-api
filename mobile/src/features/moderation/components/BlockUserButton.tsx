// src/features/moderation/components/BlockUserButton.tsx
// Kullanıcı engelleme butonu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ViewStyle,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@contexts/ThemeContext';
import { spacing, fontSize, borderRadius } from '@theme';
import { socialApi } from '@features/social/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * BlockUserButton props
 */
interface BlockUserButtonProps {
  /** User ID to block/unblock */
  userId: number;
  /** User's display name */
  userName: string;
  /** Is user currently blocked */
  isBlocked?: boolean;
  /** Button variant */
  variant?: 'icon' | 'text' | 'full';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom style */
  style?: ViewStyle;
  /** Callback after block/unblock */
  onToggle?: (isBlocked: boolean) => void;
  /** Test ID */
  testID?: string;
}

/**
 * BlockUserButton component
 *
 * Button to block/unblock a user with confirmation dialog.
 * Supports multiple variants: icon-only, text-only, or full button.
 */
export const BlockUserButton = React.memo<BlockUserButtonProps>(
  ({
    userId,
    userName,
    isBlocked: initialIsBlocked = false,
    variant = 'full',
    size = 'md',
    style,
    onToggle,
    testID,
  }) => {
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [isBlocked, setIsBlocked] = useState(initialIsBlocked);

    // Block mutation
    const blockMutation = useMutation({
      mutationFn: () => socialApi.block(userId),
      onSuccess: () => {
        setIsBlocked(true);
        onToggle?.(true);
        queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
        AccessibilityInfo.announceForAccessibility(`${userName} engellendi`);
      },
      onError: () => {
        Alert.alert('Hata', 'Kullanıcı engellenirken bir hata oluştu');
      },
    });

    // Unblock mutation
    const unblockMutation = useMutation({
      mutationFn: () => socialApi.unblock(userId),
      onSuccess: () => {
        setIsBlocked(false);
        onToggle?.(false);
        queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
        AccessibilityInfo.announceForAccessibility(`${userName} engeli kaldırıldı`);
      },
      onError: () => {
        Alert.alert('Hata', 'Engel kaldırılırken bir hata oluştu');
      },
    });

    const isLoading = blockMutation.isPending || unblockMutation.isPending;

    const handlePress = useCallback(() => {
      if (isBlocked) {
        // Confirm unblock
        Alert.alert(
          'Engeli Kaldır',
          `${userName} kullanıcısının engelini kaldırmak istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Engeli Kaldır',
              onPress: () => unblockMutation.mutate(),
            },
          ],
        );
      } else {
        // Confirm block
        Alert.alert(
          'Kullanıcıyı Engelle',
          `${userName} kullanıcısını engellemek istiyor musunuz?\n\nEngellenen kullanıcılar:\n• Size mesaj gönderemez\n• Gönderilerinizi göremez\n• Sizi takip edemez`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Engelle',
              style: 'destructive',
              onPress: () => blockMutation.mutate(),
            },
          ],
        );
      }
    }, [isBlocked, userName, blockMutation, unblockMutation]);

    // Size configurations
    const sizeConfig = {
      sm: { iconSize: 18, fontSize: fontSize.sm, padding: spacing.sm },
      md: { iconSize: 22, fontSize: fontSize.md, padding: spacing.md },
      lg: { iconSize: 26, fontSize: fontSize.lg, padding: spacing.lg },
    };

    const { iconSize, fontSize: textSize, padding } = sizeConfig[size];

    // Variant specific styles
    const getButtonStyle = (): ViewStyle => {
      const baseStyle: ViewStyle = {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      };

      switch (variant) {
        case 'icon':
          return {
            ...baseStyle,
            padding: padding / 2,
          };
        case 'text':
          return {
            ...baseStyle,
            padding: padding / 2,
          };
        case 'full':
        default:
          return {
            ...baseStyle,
            paddingVertical: padding,
            paddingHorizontal: padding * 1.5,
            borderRadius: borderRadius.md,
            backgroundColor: isBlocked ? theme.colors.background.secondary : theme.colors.error[50],
            borderWidth: 1,
            borderColor: isBlocked ? theme.colors.border.default : theme.colors.error[200],
          };
      }
    };

    const getTextColor = (): string => {
      if (isBlocked) {
        return theme.colors.text.secondary;
      }
      return theme.colors.error[600];
    };

    const buttonText = isBlocked ? 'Engeli Kaldır' : 'Engelle';
    const iconName = isBlocked ? 'person-add-outline' : 'ban-outline';

    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={handlePress}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel={
          isBlocked ? `${userName} engelini kaldır` : `${userName} kullanıcısını engelle`
        }
        accessibilityHint={
          isBlocked
            ? 'Kullanıcının engelini kaldırmak için dokunun'
            : 'Kullanıcıyı engellemek için dokunun'
        }
        accessibilityState={{ disabled: isLoading }}
        testID={testID}>
        {isLoading ? (
          <ActivityIndicator size="small" color={getTextColor()} />
        ) : (
          <>
            {(variant === 'icon' || variant === 'full') && (
              <Icon
                name={iconName}
                size={iconSize}
                color={getTextColor()}
                style={variant === 'full' ? styles.icon : undefined}
              />
            )}
            {(variant === 'text' || variant === 'full') && (
              <Text style={[styles.text, { fontSize: textSize, color: getTextColor() }]}>
                {buttonText}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

BlockUserButton.displayName = 'BlockUserButton';

const styles = StyleSheet.create({
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
});

export default BlockUserButton;
