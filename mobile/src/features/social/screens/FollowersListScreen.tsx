// src/features/social/screens/FollowersListScreen.tsx
// Followers list screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { EmptyState, Loading } from '@shared/components';
import { spacing } from '@theme';
import { UserListItem } from '../components';
import { useFollowers } from '../hooks';
import type { FollowUser } from '../types';

/**
 * FollowersListScreen
 *
 * Displays paginated list of followers for a user.
 * Supports pull-to-refresh and infinite scroll.
 */
export const FollowersListScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const { userId } = route.params as { userId: number };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFollowers(userId);

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) || [];
  }, [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: FollowUser }) => (
      <UserListItem user={item} showFollowButton />
    ),
    [],
  );

  const keyExtractor = useCallback((item: FollowUser) => item.id.toString(), []);

  const ListFooterComponent = useMemo(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingNextPage, theme]);

  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="people-outline"
        title="Henüz takipçi yok"
        message="Bu kullanıcının henüz takipçisi bulunmuyor"
      />
    );
  }, [isLoading]);

  const ItemSeparatorComponent = useCallback(
    () => (
      <View
        style={[styles.separator, { backgroundColor: theme.colors.border.light }]}
      />
    ),
    [theme],
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      >
        <Loading message="Yükleniyor..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      edges={['bottom']}
    >
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
            tintColor={theme.colors.primary[500]}
          />
        }
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={users.length === 0 && styles.emptyContent}
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
