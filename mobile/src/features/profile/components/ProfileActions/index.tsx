// src/features/profile/components/ProfileActions/index.tsx
// Dengin Design System - Modern ProfileActions Component
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { memo, useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Button, ActionSheet } from '@shared/components';
import { useSemanticHaptic } from '@shared/hooks';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useFollow, useUnfollow, useBlock, useUnblock } from '@features/social/hooks/useFollow';

import { styles } from './ProfileActions.styles';
import { getFollowButtonText, type ProfileActionsProps } from './ProfileActions.types';

/**
 * Modern ProfileActions Component
 *
 * Features:
 * - Animated button entrance
 * - Haptic feedback on actions
 * - Follow/Unfollow with loading state
 * - Message navigation
 * - More options menu (report, block)
 *
 * @example
 * ```tsx
 * <ProfileActions
 *   userId={123}
 *   isFollowing={false}
 *   isFollowedBy={true}
 *   onFollowChange={(following) => console.log(following)}
 * />
 * ```
 */
export const ProfileActions: React.FC<ProfileActionsProps> = memo(
  ({
    userId,
    isFollowing = false,
    isFollowedBy = false,
    isBlocked = false,
    onFollowChange,
    onBlockChange,
    testID,
  }) => {
    const navigation = useNavigation();
    const { triggerSocial, triggerSystem, triggerNavigation } = useSemanticHaptic();
    const toast = useToast();
    const colors = useColors();

    // State for ActionSheets
    const [showOptionsSheet, setShowOptionsSheet] = useState(false);
    const [showBlockConfirmSheet, setShowBlockConfirmSheet] = useState(false);

    // Mutations
    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();
    const blockMutation = useBlock();
    const unblockMutation = useUnblock();

    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    // Handle follow/unfollow
    const handleFollowPress = useCallback(() => {
      triggerSocial(isFollowing ? 'unfollow' : 'follow');

      if (isFollowing) {
        unfollowMutation.mutate(userId, {
          onSuccess: () => {
            triggerSystem('success');
            toast.success('Takipten çıkıldı');
            onFollowChange?.(false);
          },
          onError: () => {
            triggerSystem('error');
            toast.error('Takipten çıkılamadı');
          },
        });
      } else {
        followMutation.mutate(userId, {
          onSuccess: () => {
            triggerSystem('success');
            toast.success('Takip edildi');
            onFollowChange?.(true);
          },
          onError: () => {
            triggerSystem('error');
            toast.error('Takip edilemedi');
          },
        });
      }
    }, [
      userId,
      isFollowing,
      followMutation,
      unfollowMutation,
      onFollowChange,
      triggerSystem,
      triggerSocial,
    ]);

    // Handle message button
    const handleMessagePress = useCallback(() => {
      triggerNavigation('navigate'); // Navigating to conversation
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('Conversation', {
        userId,
        isNew: true,
      });
    }, [navigation, userId, triggerNavigation]);

    // Handle block/unblock confirmation
    const handleBlockAction = useCallback(() => {
      if (isBlocked) {
        unblockMutation.mutate(userId, {
          onSuccess: () => {
            triggerSystem('success');
            toast.success('Engel kaldırıldı');
            onBlockChange?.(false);
            setShowBlockConfirmSheet(false);
          },
          onError: () => {
            triggerSystem('error');
            toast.error('Engel kaldırılamadı');
            setShowBlockConfirmSheet(false);
          },
        });
      } else {
        blockMutation.mutate(userId, {
          onSuccess: () => {
            triggerSystem('alert');
            toast.success('Kullanıcı engellendi');
            onBlockChange?.(true);
            setShowBlockConfirmSheet(false);
          },
          onError: () => {
            triggerSystem('error');
            toast.error('Engellenemedi');
            setShowBlockConfirmSheet(false);
          },
        });
      }
    }, [isBlocked, userId, blockMutation, unblockMutation, onBlockChange, triggerSystem, toast]);

    // Handle report navigation
    const handleReport = useCallback(() => {
      setShowOptionsSheet(false);
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('Report', {
        type: 'USER',
        targetId: userId,
      });
    }, [navigation, userId]);

    // Handle more options
    const handleMorePress = useCallback(() => {
      triggerSystem('confirm'); // Opening options menu
      setShowOptionsSheet(true);
    }, [triggerSystem]);

    return (
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.container}
        testID={testID}>
        {/* Follow Button */}
        <View style={styles.primaryButton}>
          <Button
            title={getFollowButtonText(isFollowing, isFollowedBy)}
            onPress={handleFollowPress}
            variant={isFollowing ? 'outline' : 'primary'}
            size="md"
            fullWidth
            loading={isLoading}
          />
        </View>

        {/* Message Button */}
        <View style={styles.messageButton}>
          <Button
            title="Mesaj"
            onPress={handleMessagePress}
            variant="outline"
            size="md"
            fullWidth
            leftIcon={<Icon name="chatbubble-outline" size={20} color={colors.text.secondary} />}
          />
        </View>

        {/* More Options Button */}
        <Button
          title=""
          onPress={handleMorePress}
          variant="outline"
          size="md"
          leftIcon={<Icon name="ellipsis-horizontal" size={20} color={colors.text.secondary} />}
          style={styles.moreButton}
        />

        {/* Options ActionSheet */}
        <ActionSheet
          visible={showOptionsSheet}
          onClose={() => setShowOptionsSheet(false)}
          title="Seçenekler"
          options={[
            {
              id: 'block',
              label: isBlocked ? 'Engeli Kaldır' : 'Engelle',
              icon: isBlocked ? 'checkmark-circle-outline' : 'ban-outline',
              destructive: !isBlocked,
              onPress: () => {
                setShowOptionsSheet(false);
                setShowBlockConfirmSheet(true);
              },
            },
            {
              id: 'report',
              label: 'Şikayet Et',
              icon: 'flag-outline',
              onPress: handleReport,
            },
          ]}
          cancelLabel="İptal"
          testID="profile-options-sheet"
        />

        {/* Block Confirmation ActionSheet */}
        <ActionSheet
          visible={showBlockConfirmSheet}
          onClose={() => setShowBlockConfirmSheet(false)}
          title={isBlocked ? 'Engeli Kaldır' : 'Kullanıcıyı Engelle'}
          message={
            isBlocked
              ? 'Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?'
              : 'Bu kullanıcıyı engellemek istediğinize emin misiniz?'
          }
          options={[
            {
              id: 'confirm',
              label: isBlocked ? 'Engeli Kaldır' : 'Engelle',
              icon: isBlocked ? 'checkmark-circle-outline' : 'ban-outline',
              destructive: !isBlocked,
              onPress: handleBlockAction,
            },
          ]}
          cancelLabel="İptal"
          testID="block-confirm-sheet"
        />
      </Animated.View>
    );
  },
);

ProfileActions.displayName = 'ProfileActions';

export default ProfileActions;
