// src/features/moderation/components/BlockUserButton.tsx
// Kullanıcı engelleme butonu
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { spacing, fontSize, borderRadius } from '@theme';
import { showSuccess, showBlockError, showUnblockError } from '@shared/utils';
import { useHaptic } from '@shared/hooks';
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
    const colors = useColors();
    const toast = useToast();
    const { trigger } = useHaptic();
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
        showSuccess(toast, { trigger }, `${userName} engellendi`);
      },
      onError: () => {
        showBlockError(toast, { trigger });
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
        showSuccess(toast, { trigger }, 'Engel kaldırıldı');
      },
      onError: () => {
        showUnblockError(toast, { trigger });
      },
    });

    const isLoading = blockMutation.isPending || unblockMutation.isPending;

    const handlePress = useCallback(() => {
      if (isBlocked) {
        // Direct unblock - no confirmation needed for unblock action
        unblockMutation.mutate();
      } else {
        // Direct block - confirmation happens via toast
        blockMutation.mutate();
      }
    }, [isBlocked, blockMutation, unblockMutation]);

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
            backgroundColor: isBlocked ? colors.background.secondary : colors.status.error,
            borderWidth: 1,
            borderColor: isBlocked ? colors.border.default : colors.status.error,
          };
      }
    };

    const getTextColor = (): string => {
      if (isBlocked) {
        return colors.text.secondary;
      }
      return colors.status.error;
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
