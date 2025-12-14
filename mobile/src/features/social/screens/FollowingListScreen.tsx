// src/features/social/screens/FollowingListScreen.tsx
// Following list screen
// Oku: mobile-development-guide/sprints/29-SPRINT-13-14-PART5.md

import React, { useCallback, useMemo } from 'react';
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
} from '@shared/components';
import { ErrorBoundary } from '@core/components';
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
    return (
      <UnifiedEmptyState
        icon="person-add-outline"
        title="Henüz Takip Edilen Yok"
        description="Bu kullanıcı henüz kimseyi takip etmiyor"
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
      <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={{ flex: 1 }}>
        <FlatList
          data={users}
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
export default function FollowingListScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <FollowingListScreen />
    </ErrorBoundary>
  );
}
