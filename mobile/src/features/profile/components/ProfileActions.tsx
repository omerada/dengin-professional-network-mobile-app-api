// src/features/profile/components/ProfileActions.tsx
// Profile action buttons (Follow, Message, etc.)
// Oku: mobile-development-guide/features/08-PROFILE-MODULE.md

import React, { memo, useCallback, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@shared/components';
import { spacing } from '@theme';

interface ProfileActionsProps {
  /**
   * User ID of the profile being viewed
   */
  userId: number;
  /**
   * Whether current user is following this user
   */
  isFollowing?: boolean;
  /**
   * Whether this user is following the current user
   */
  isFollowedBy?: boolean;
  /**
   * Whether this user is blocked
   */
  isBlocked?: boolean;
  /**
   * Called when follow state changes
   */
  onFollowChange?: (isFollowing: boolean) => void;
  /**
   * Called when block state changes
   */
  onBlockChange?: (isBlocked: boolean) => void;
}

/**
 * ProfileActions Component
 *
 * Displays action buttons for interacting with other users' profiles:
 * - Follow/Unfollow button
 * - Message button
 * - More options menu (report, block)
 */
export const ProfileActions: React.FC<ProfileActionsProps> = memo(
  ({
    userId,
    isFollowing = false,
    isFollowedBy = false,
    isBlocked = false,
    onFollowChange,
    onBlockChange,
  }) => {
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);

    // Handle follow/unfollow
    const handleFollowPress = useCallback(async () => {
      setIsLoading(true);
      try {
        // TODO: Integrate with useFollow/useUnfollow hooks when available
        onFollowChange?.(!isFollowing);
      } catch (error) {
        Alert.alert('Hata', 'İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    }, [isFollowing, onFollowChange]);

    // Handle message button
    const handleMessagePress = useCallback(() => {
      // Navigate to messaging - create or open conversation
      navigation.navigate('Conversation' as never, {
        userId,
        isNew: true,
      } as never);
    }, [navigation, userId]);

    // Handle more options (report, block, etc.)
    const handleMorePress = useCallback(() => {
      Alert.alert(
        'Seçenekler',
        '',
        [
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
                    onPress: () => onBlockChange?.(!isBlocked),
                  },
                ],
              );
            },
          },
          {
            text: 'Şikayet Et',
            onPress: () => {
              navigation.navigate('Report' as never, {
                type: 'USER',
                targetId: userId,
              } as never);
            },
          },
          { text: 'İptal', style: 'cancel' },
        ],
      );
    }, [isBlocked, navigation, onBlockChange, userId]);

    // Get follow button text
    const getFollowButtonText = () => {
      if (isFollowing) return 'Takipten Çık';
      if (isFollowedBy) return 'Seni Takip Ediyor • Takip Et';
      return 'Takip Et';
    };

    return (
      <View style={styles.container}>
        {/* Follow Button */}
        <View style={styles.primaryButtonContainer}>
          <Button
            title={getFollowButtonText()}
            onPress={handleFollowPress}
            variant={isFollowing ? 'outline' : 'primary'}
            size="md"
            fullWidth
            loading={isLoading}
          />
        </View>

        {/* Message Button */}
        <View style={styles.secondaryButtonContainer}>
          <Button
            title="Mesaj"
            onPress={handleMessagePress}
            variant="outline"
            size="md"
            fullWidth
            leftIcon="chatbubble-outline"
          />
        </View>

        {/* More Options Button */}
        <Button
          title=""
          onPress={handleMorePress}
          variant="outline"
          size="md"
          leftIcon="ellipsis-horizontal"
          style={styles.moreButton}
        />
      </View>
    );
  },
);

ProfileActions.displayName = 'ProfileActions';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonContainer: {
    flex: 2,
  },
  secondaryButtonContainer: {
    flex: 1.5,
  },
  moreButton: {
    width: 44,
    paddingHorizontal: 0,
  },
});
