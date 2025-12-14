// src/features/moderation/screens/BlockedUsersScreen.tsx
// Blocked users list screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { Avatar, EmptyState, Loading, Button } from '@shared/components';
import { spacing, fontSize } from '@theme';
import { useBlockedUsers } from '../hooks';
import { useUnblock } from '@features/social';
import type { BlockedUser } from '../types';

/**
 * BlockedUsersScreen
 *
 * Displays list of blocked users with option to unblock.
 */
export const BlockedUsersScreen: React.FC = () => {
  const colors = useColors();
  const toast = useToast();
  const { data: blockedUsers, isLoading, refetch } = useBlockedUsers();
  const unblock = useUnblock();

  const handleUnblock = useCallback(
    async (user: BlockedUser) => {
      try {
        await unblock.mutateAsync(user.id);
        refetch();
        toast.success('Engel kaldırıldı');
      } catch (error) {
        toast.error('Engel kaldırılırken bir hata oluştu');
      }
    },
    [unblock, refetch, toast],
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUser }) => (
      <View style={[styles.item, { backgroundColor: colors.background.primary }]}>
        <Avatar uri={item.avatarUrl} name={item.fullName} size="lg" />
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text.primary }]}>{item.fullName}</Text>
          <Text style={[styles.date, { color: colors.text.secondary }]}>
            {new Date(item.blockedAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
        <Button
          title="Engeli Kaldır"
          variant="outline"
          size="sm"
          onPress={() => handleUnblock(item)}
          loading={unblock.isPending}
        />
      </View>
    ),
    [colors, handleUnblock, unblock.isPending],
  );

  const keyExtractor = useCallback((item: BlockedUser) => item.id.toString(), []);

  const ItemSeparatorComponent = useCallback(
    () => <View style={[styles.separator, { backgroundColor: colors.border.default }]} />,
    [colors],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Loading message="Yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={['bottom']}>
      <FlatList
        data={blockedUsers || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListEmptyComponent={
          <EmptyState
            icon="person-remove-outline"
            title="Engellenen kullanıcı yok"
            message="Engellediğiniz kullanıcılar burada görünecektir"
          />
        }
        contentContainerStyle={(!blockedUsers || blockedUsers.length === 0) && styles.emptyContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  date: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  emptyContent: {
    flex: 1,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
});
