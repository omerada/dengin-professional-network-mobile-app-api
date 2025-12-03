// src/features/notifications/components/NotificationList.tsx
// Notification list with infinite scroll and pull-to-refresh
// Oku: mobile-development-guide/sprints/27-SPRINT-9-10.md

import React, { memo, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { NotificationItem } from './NotificationItem';
import { EmptyNotifications } from './EmptyNotifications';
import { useNotifications, useNotificationActions } from '../hooks';
import { useTheme } from '@contexts/ThemeContext';
import type { NotificationData } from '../types';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<NotificationData>);

const ITEM_HEIGHT = 80;
const PAGE_SIZE = 20;

interface NotificationListProps {
  onNotificationPress?: (notification: NotificationData) => void;
}

export const NotificationList: React.FC<NotificationListProps> = memo(
  ({ onNotificationPress }) => {
    const { theme } = useTheme();
    const {
      data,
      isLoading,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      refetch,
      isRefetching,
    } = useNotifications();
    const { markAsRead, deleteNotification } = useNotificationActions();

    // Flatten pages into single array
    const notifications = data?.pages.flatMap((page) => page.items) ?? [];

    // Handle notification press
    const handleNotificationPress = useCallback(
      (notification: NotificationData) => {
        // Mark as read if unread
        if (!notification.isRead) {
          markAsRead(notification.id);
        }

        // Call external handler for navigation
        onNotificationPress?.(notification);
      },
      [markAsRead, onNotificationPress]
    );

    // Handle notification delete
    const handleDelete = useCallback(
      (id: string) => {
        deleteNotification(id);
      },
      [deleteNotification]
    );

    // Handle load more
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
      []
    );

    // Extract key
    const keyExtractor = useCallback((item: NotificationData) => item.id, []);

    // Render item
    const renderItem = useCallback(
      ({ item }: { item: NotificationData }) => (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          layout={Layout.springify()}
        >
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            onDelete={handleDelete}
          />
        </Animated.View>
      ),
      [handleNotificationPress, handleDelete]
    );

    // Render footer (loading indicator)
    const renderFooter = useCallback(() => {
      if (!isFetchingNextPage) return null;

      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
        </View>
      );
    }, [isFetchingNextPage, theme.colors.primary]);

    // Render empty component
    const renderEmpty = useCallback(() => {
      if (isLoading) return null;
      return <EmptyNotifications />;
    }, [isLoading]);

    // Loading state
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      );
    }

    return (
      <AnimatedFlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
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
  }
);

NotificationList.displayName = 'NotificationList';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationList;
