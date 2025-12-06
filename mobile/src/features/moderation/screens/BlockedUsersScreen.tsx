// src/features/moderation/screens/BlockedUsersScreen.tsx
// Blocked users list screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@contexts/ThemeContext';
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
  const { data: blockedUsers, isLoading, refetch } = useBlockedUsers();
  const unblock = useUnblock();

  const handleUnblock = useCallback(
    async (user: BlockedUser) => {
      Alert.alert(
        'Engeli Kaldır',
        `${user.fullName} engelini kaldırmak istediğinize emin misiniz?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Engeli Kaldır',
            onPress: async () => {
              try {
                await unblock.mutateAsync(user.id);
                refetch();
              } catch (error) {
                Alert.alert('Hata', 'Engel kaldırılırken bir hata oluştu');
              }
            },
          },
        ],
      );
    },
    [unblock, refetch],
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  emptyContent: {
    flex: 1,
  },
});
