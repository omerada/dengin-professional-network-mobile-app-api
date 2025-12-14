// src/features/notifications/components/NotificationList.tsx
// Notification list with infinite scroll and pull-to-refresh
// Backend: GET /api/notifications (page-based pagination)
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl, ActivityIndicator, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { NotificationItem } from './NotificationItem';
import { EmptyNotifications } from './EmptyNotifications';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '../hooks';
import { useColors } from '@contexts/ThemeContext';
import {
  AnimatedListItem,
  NotificationListSkeleton,
  UnifiedLoadingState,
} from '@shared/components';
import type { NotificationResponse } from '../types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<NotificationResponse>);

const ITEM_HEIGHT = 80;
const PAGE_SIZE = 20;

interface NotificationListProps {
  onNotificationPress?: (notification: NotificationResponse) => void;
  unreadOnly?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = memo(
  ({ onNotificationPress, unreadOnly = false }) => {
    const colors = useColors();

    // Backend page-based pagination hook
    const {
      notifications,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch,
      isRefreshing,
    } = useNotifications({ pageSize: PAGE_SIZE, unreadOnly });

    const { markAsRead } = useMarkAsRead();
    const { deleteNotification } = useDeleteNotification();

    // Handle notification press
    const handleNotificationPress = useCallback(
      (notification: NotificationResponse) => {
        // Validate notification has ID
        if (!notification.notificationId) {
          console.warn('[Notifications] Notification missing ID, skipping');
          return;
        }

        // Mark as read if unread
        if (!notification.read) {
          markAsRead(notification.notificationId);
        }

        // Call external handler for navigation
        onNotificationPress?.(notification);
      },
      [markAsRead, onNotificationPress],
    );

    // Handle notification delete (swipe action)
    const handleDelete = useCallback(
      (notificationId: string | undefined) => {
        if (!notificationId) {
          console.warn('[Notifications] Cannot delete notification without ID');
          return;
        }
        deleteNotification(notificationId);
      },
      [deleteNotification],
    );

    // Handle load more (next page)
    const handleEndReached = useCallback(() => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Get item layout for performance
    const getItemLayout = useCallback(
      (_: unknown, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      [],
    );

    // Extract key - backend notificationId with fallback
    const keyExtractor = useCallback(
      (item: NotificationResponse) => item.notificationId ?? `temp-${Date.now()}-${Math.random()}`,
      [],
    );

    // Render item with AnimatedListItem wrapper for press animation
    const renderItem = useCallback(
      ({ item }: { item: NotificationResponse }) => (
        <AnimatedListItem
          onPress={() => handleNotificationPress(item)}
          onLongPress={() => handleDelete(item.notificationId)}>
          <NotificationItem notification={item} />
        </AnimatedListItem>
      ),
      [handleNotificationPress, handleDelete],
    );

    // Render footer (loading indicator for next page)
    const renderFooter = useCallback(() => {
      if (!isFetchingNextPage) return null;

      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.interactive.default} />
        </View>
      );
    }, [isFetchingNextPage, colors.interactive.default]);

    // Render empty component
    const renderEmpty = useCallback(() => {
      if (isLoading) return null;
      return <EmptyNotifications />;
    }, [isLoading]);

    // Loading state - show unified skeleton
    if (isLoading) {
      return (
        <UnifiedLoadingState strategy="skeleton" customSkeleton={<NotificationListSkeleton />} />
      );
    }

    return (
      <AnimatedFlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            colors={[colors.interactive.default]}
            tintColor={colors.interactive.default}
            progressBackgroundColor={colors.background.primary}
            titleColor={colors.text.secondary}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    );
  },
);

NotificationList.displayName = 'NotificationList';

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default NotificationList;
