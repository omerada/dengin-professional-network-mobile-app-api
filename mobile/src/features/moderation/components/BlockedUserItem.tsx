// src/features/moderation/components/BlockedUserItem.tsx
// Engelli kullanıcı liste öğesi
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AccessibilityInfo } from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { Avatar, Button } from '@shared/components';
import { spacing, fontSize, borderRadius } from '@theme';
import { socialApi } from '@features/social/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { BlockedUser } from '../types';

/**
 * BlockedUserItem props
 */
interface BlockedUserItemProps {
  /** Blocked user data */
  user: BlockedUser;
  /** Callback after unblock */
  onUnblock?: (userId: number) => void;
  /** Test ID */
  testID?: string;
}

/**
 * BlockedUserItem component
 *
 * Displays a blocked user with avatar, name, and unblock button.
 */
export const BlockedUserItem = React.memo<BlockedUserItemProps>(({ user, onUnblock, testID }) => {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [isUnblocked, setIsUnblocked] = useState(false);

  const unblockMutation = useMutation({
    mutationFn: () => socialApi.unblock(user.id),
    onSuccess: () => {
      setIsUnblocked(true);
      onUnblock?.(user.id);
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      AccessibilityInfo.announceForAccessibility(`${user.fullName} engeli kaldırıldı`);
    },
    onError: () => {
      Alert.alert('Hata', 'Engel kaldırılırken bir hata oluştu');
    },
  });

  const handleUnblock = useCallback(() => {
    Alert.alert(
      'Engeli Kaldır',
      `${user.fullName} kullanıcısının engelini kaldırmak istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Engeli Kaldır',
          onPress: () => unblockMutation.mutate(),
        },
      ],
    );
  }, [user.fullName, unblockMutation]);

  // Format blocked date
  const blockedTimeAgo = formatDistanceToNow(new Date(user.blockedAt), {
    addSuffix: true,
    locale: tr,
  });

  // If unblocked, show success state briefly before removal
  if (isUnblocked) {
    return (
      <View
        style={[styles.container, styles.unblocked, { backgroundColor: colors.status.success }]}
        accessibilityLabel={`${user.fullName} engeli kaldırıldı`}>
        <Text style={[styles.unblockedText, { color: colors.status.success }]}>
          {user.fullName} engeli kaldırıldı
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      accessibilityRole="listitem"
      accessibilityLabel={`${user.fullName}, ${blockedTimeAgo} engellendi`}
      testID={testID}>
      <TouchableOpacity
        style={styles.userInfo}
        accessibilityRole="button"
        accessibilityLabel={`${user.fullName} profilini görüntüle`}>
        <Avatar
          source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
          name={user.fullName}
          size="md"
        />
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text.primary }]} numberOfLines={1}>
            {user.fullName}
          </Text>
          <Text style={[styles.blockedDate, { color: colors.text.secondary }]}>
            {blockedTimeAgo} engellendi
          </Text>
        </View>
      </TouchableOpacity>

      <Button
        title="Engeli Kaldır"
        variant="outline"
        size="sm"
        onPress={handleUnblock}
        loading={unblockMutation.isPending}
        disabled={unblockMutation.isPending}
        testID={`unblock-button-${user.id}`}
      />
    </View>
  );
});

BlockedUserItem.displayName = 'BlockedUserItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  textContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  blockedDate: {
    fontSize: fontSize.sm,
    marginTop: spacing.xxs,
  },
  unblocked: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  unblockedText: {
    fontSize: fontSize.md,
    fontWeight: '500',
  },
});

export default BlockedUserItem;
