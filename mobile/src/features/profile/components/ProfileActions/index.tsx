// src/features/profile/components/ProfileActions/index.tsx
// Meslektaş Design System - Modern ProfileActions Component
// Oku: mobile-development-guide/ui-ux-modernization/09-PROFILE-REDESIGN.md

import React, { memo, useCallback } from 'react';
import { Alert, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { Button } from '@shared/components';
import { useHaptic } from '@shared/hooks/useHaptic';
import { useColors } from '@contexts/ThemeContext';
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
    const { trigger } = useHaptic();
    const colors = useColors();

    // Mutations
    const followMutation = useFollow();
    const unfollowMutation = useUnfollow();
    const blockMutation = useBlock();
    const unblockMutation = useUnblock();

    const isLoading = followMutation.isPending || unfollowMutation.isPending;

    // Handle follow/unfollow
    const handleFollowPress = useCallback(() => {
      trigger(isFollowing ? 'light' : 'medium');

      if (isFollowing) {
        unfollowMutation.mutate(userId, {
          onSuccess: () => {
            trigger('success');
            onFollowChange?.(false);
          },
          onError: () => {
            trigger('error');
            Alert.alert('Hata', 'Takipten çıkılamadı. Lütfen tekrar deneyin.');
          },
        });
      } else {
        followMutation.mutate(userId, {
          onSuccess: () => {
            trigger('success');
            onFollowChange?.(true);
          },
          onError: () => {
            trigger('error');
            Alert.alert('Hata', 'Takip edilemedi. Lütfen tekrar deneyin.');
          },
        });
      }
    }, [userId, isFollowing, followMutation, unfollowMutation, onFollowChange, trigger]);

    // Handle message button
    const handleMessagePress = useCallback(() => {
      trigger('light');
      // @ts-expect-error - navigation types not fully typed
      navigation.navigate('Conversation', {
        userId,
        isNew: true,
      });
    }, [navigation, userId, trigger]);

    // Handle more options
    const handleMorePress = useCallback(() => {
      trigger('light');

      Alert.alert('Seçenekler', '', [
        {
          text: isBlocked ? 'Engeli Kaldır' : 'Engelle',
          style: isBlocked ? 'default' : 'destructive',
          onPress: () => {
            Alert.alert(
              isBlocked ? 'Engeli Kaldır' : 'Kullanıcıyı Engelle',
              isBlocked
                ? 'Bu kullanıcının engelini kaldırmak istediğinize emin misiniz?'
                : 'Bu kullanıcıyı engellemek istediğinize emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                {
                  text: isBlocked ? 'Engeli Kaldır' : 'Engelle',
                  style: isBlocked ? 'default' : 'destructive',
                  onPress: () => {
                    if (isBlocked) {
                      unblockMutation.mutate(userId, {
                        onSuccess: () => {
                          trigger('success');
                          onBlockChange?.(false);
                        },
                        onError: () => {
                          trigger('error');
                          Alert.alert('Hata', 'Engel kaldırılamadı.');
                        },
                      });
                    } else {
                      blockMutation.mutate(userId, {
                        onSuccess: () => {
                          trigger('warning');
                          onBlockChange?.(true);
                        },
                        onError: () => {
                          trigger('error');
                          Alert.alert('Hata', 'Engellenemedi.');
                        },
                      });
                    }
                  },
                },
              ],
            );
          },
        },
        {
          text: 'Şikayet Et',
          onPress: () => {
            // @ts-expect-error - navigation types not fully typed
            navigation.navigate('Report', {
              type: 'USER',
              targetId: userId,
            });
          },
        },
        { text: 'İptal', style: 'cancel' },
      ]);
    }, [isBlocked, navigation, userId, blockMutation, unblockMutation, onBlockChange, trigger]);

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
      </Animated.View>
    );
  },
);

ProfileActions.displayName = 'ProfileActions';

export default ProfileActions;
