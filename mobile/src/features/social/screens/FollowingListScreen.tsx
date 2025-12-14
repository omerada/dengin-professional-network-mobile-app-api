// src/features/social/screens/FollowingListScreen.tsx
// Following list screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useColors } from '@contexts/ThemeContext';
import { EmptyState, Loading } from '@shared/components';
import { spacing } from '@theme';
import { UserListItem } from '../components';
import { useFollowing } from '../hooks';
import type { FollowUser } from '../types';
import type { StyleProp, ViewStyle } from 'react-native';

type ContentStyle = StyleProp<ViewStyle>;

/**
 * FollowingListScreen
 *
 * Displays paginated list of users that a user is following.
 * Supports pull-to-refresh and infinite scroll.
 */
export const FollowingListScreen: React.FC = () => {
  const colors = useColors();
  const route = useRoute();
  const { userId } = route.params as { userId: number };

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useFollowing(userId);

  const users = useMemo(() => {
    return data?.pages.flatMap(page => page.content) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FollowUser }) => <UserListItem user={item} showFollowButton />,
    [],
  );

  const keyExtractor = useCallback((item: FollowUser) => item.id.toString(), []);

  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={colors.interactive.default} />
      </View>
    );
  }, [isFetchingNextPage, colors]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="person-add-outline"
        title="Henüz takip edilen yok"
        description="Bu kullanıcı henüz kimseyi takip etmiyor"
        floatingIcon
        animated
      />
    );
  }, [isLoading]);

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
        data={users}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.interactive.default}
          />
        }
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={
          users.length === 0 ? ({ flexGrow: 1 } as unknown as ContentStyle) : undefined
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyContent: {
    flex: 1,
  },
});
