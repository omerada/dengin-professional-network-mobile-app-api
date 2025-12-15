// src/features/notifications/components/NotificationList.tsx
// Notification list with infinite scroll, pull-to-refresh, and time-based grouping
// Backend: GET /api/notifications (page-based pagination)
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { NotificationItem } from './NotificationItem';
import { EmptyNotifications } from './EmptyNotifications';
import { useNotifications, useMarkAsRead, useDeleteNotification } from '../hooks';
import { useColors } from '@contexts/ThemeContext';
import {
  AnimatedListItem,
  NotificationListSkeleton,
  UnifiedLoadingState,
  CustomRefreshControl,
} from '@shared/components';
import { SCREEN_ANIMATIONS } from '@constants';
import { spacing, fontSize } from '@theme';
import { groupNotificationsByTime } from '../utils/groupNotifications';
import type { NotificationResponse } from '../types';

type ListItem = NotificationResponse | { type: 'header'; title: string };

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<ListItem>);

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

    // Group notifications by time (Today, This Week, Earlier)
    const groupedData = useMemo(() => {
      if (notifications.length === 0) return [];

      const groups = groupNotificationsByTime(notifications);
      const flatData: ListItem[] = [];

      groups.forEach(group => {
        flatData.push({ type: 'header', title: group.title });
        flatData.push(...group.notifications);
      });

      return flatData;
    }, [notifications]);

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

    // Extract key
    const keyExtractor = useCallback((item: ListItem, index: number) => {
      if ('type' in item && item.type === 'header') {
        return `header-${item.title}`;
      }
      return (item as NotificationResponse).notificationId ?? `temp-${index}`;
    }, []);

    // Render item (header or notification)
    const renderItem = useCallback(
      ({ item, index }: { item: ListItem; index: number }) => {
        // Section header
        if ('type' in item && item.type === 'header') {
          return (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background.secondary }]}>
              <Text style={[styles.sectionHeaderText, { color: colors.text.secondary }]}>
                {item.title}
              </Text>
            </View>
          );
        }

        // Notification item
        const notification = item as NotificationResponse;
        return (
          <Animated.View entering={SCREEN_ANIMATIONS.listItemEnter(index)}>
            <AnimatedListItem
              onPress={() => handleNotificationPress(notification)}
              onLongPress={() => handleDelete(notification.notificationId)}>
              <NotificationItem notification={notification} />
            </AnimatedListItem>
          </Animated.View>
        );
      },
      [handleNotificationPress, handleDelete, colors],
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
        data={groupedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={groupedData.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={<CustomRefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
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
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeaderText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default NotificationList;
