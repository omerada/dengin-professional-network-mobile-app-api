// src/features/social/screens/FollowersListScreen.tsx
// Followers list screen with search
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { SCREEN_ANIMATIONS } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import {
  Loading,
  UnifiedEmptyState,
  AnimatedListItem,
  CustomRefreshControl,
  UnifiedScreenHeader,
} from '@shared/components';
import { ErrorBoundary } from '@core/components';
import { spacing } from '@theme';
import { UserListItem } from '../components';
import { useFollowers } from '../hooks';
import type { FollowUser } from '../types';
import type { StyleProp, ViewStyle } from 'react-native';

type ContentStyle = StyleProp<ViewStyle>;

/**
 * FollowersListScreen
 *
 * Displays paginated list of followers for a user.
 * Supports pull-to-refresh and infinite scroll.
 */
export const FollowersListScreen: React.FC = () => {
  const colors = useColors();
  const route = useRoute();
  const { userId } = route.params as { userId: number };
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch, isRefetching } =
    useFollowers(userId);

  const users = useMemo(() => {
    return data?.pages.flatMap(page => page.content) || [];
  }, [data]);

  // Filter users by search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(user => {
      const nameMatch = user.fullName.toLowerCase().includes(query);
      const professionMatch =
        user.profession && typeof user.profession === 'string'
          ? (user.profession as string).toLowerCase().includes(query)
          : user.profession && typeof user.profession === 'object'
            ? (user.profession as any).name?.toLowerCase().includes(query)
            : false;
      return nameMatch || professionMatch;
    });
  }, [users, searchQuery]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item, index }: { item: FollowUser; index: number }) => (
      <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(index)}>
        <AnimatedListItem>
          <UserListItem user={item} showFollowButton />
        </AnimatedListItem>
      </Animated.View>
    ),
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

    if (searchQuery.trim() && filteredUsers.length === 0) {
      return (
        <UnifiedEmptyState
          icon="search-outline"
          title="Sonuç Bulunamadı"
          description={`"${searchQuery}" için takipçi bulunamadı`}
        />
      );
    }

    return (
      <UnifiedEmptyState
        icon="people-outline"
        title="Henüz Takipçi Yok"
        description="Bu kullanıcının henüz takipçisi bulunmuyor"
      />
    );
  }, [isLoading, searchQuery, filteredUsers]);

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
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={{ flex: 1 }}>
        <UnifiedScreenHeader
          variant="search"
          title="Takipçiler"
          showBackButton
          searchProps={{
            placeholder: 'Takipçilerde ara...',
            value: searchQuery,
            onChangeText: setSearchQuery,
          }}
        />
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={<CustomRefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ItemSeparatorComponent={ItemSeparatorComponent}
          contentContainerStyle={
            users.length === 0 ? ({ flexGrow: 1 } as unknown as ContentStyle) : undefined
          }
        />
      </Animated.View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  separator: {
    height: 1,
    marginLeft: 76,
  },
});

// Wrap with Error Boundary for production safety
export default function FollowersListScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FollowersListScreen />
    </ErrorBoundary>
  );
}
