// src/features/messaging/components/MessageList.tsx
// Mesaj listesi komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '@contexts/ThemeContext';
import { useSemanticHaptic } from '@shared/hooks';
import { CustomRefreshControl, UnifiedLoadingState } from '@shared/components';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyChat } from './EmptyChat';
import type { Message, ClientMessage } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  conversationId: string;
  typingUsers: string[];
  userName?: string;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onMessageLongPress?: (message: Message | ClientMessage) => void;
  onReplyPress?: (message: Message | ClientMessage) => void;
  onScrollToBottom?: () => void;
}

const SCROLL_THRESHOLD = 200;

export const MessageList: React.FC<MessageListProps> = memo(
  ({
    messages,
    currentUserId,
    typingUsers,
    userName,
    isLoading = false,
    isFetchingMore = false,
    hasMore = false,
    onLoadMore,
    onRefresh,
    onMessageLongPress,
    onScrollToBottom,
  }) => {
    const colors = useColors();
    const { triggerSystem } = useSemanticHaptic();
    const flatListRef = useRef<FlatList<Message>>(null);
    const scrollOffsetRef = useRef(0);

    // UX IMPROVEMENT: Pull-to-refresh with haptic feedback
    const handleRefresh = useCallback(() => {
      triggerSystem('refresh');
      onRefresh?.();
    }, [onRefresh, triggerSystem]);

    /**
     * P3: Refined message grouping logic
     * - Avatar: Same sender within 2 minutes
     * - Timestamp separator: 1 hour gap
     */
    const renderMessage = useCallback(
      ({ item, index }: { item: Message; index: number }) => {
        // senderId is number, currentUserId is string, convert for comparison
        const isOwn = item.senderId === Number(currentUserId);

        const previousMessage = messages[index + 1]; // inverted list
        const nextMessage = messages[index - 1];

        // Show avatar if different sender OR more than 2 minutes gap
        let showAvatar = true;
        if (previousMessage && previousMessage.senderId === item.senderId) {
          const timeDiff =
            new Date(item.sentAt).getTime() - new Date(previousMessage.sentAt).getTime();
          showAvatar = timeDiff > 2 * 60 * 1000; // 2 minutes
        }

        // Show timestamp separator if more than 1 hour gap from next message
        let showTimestamp = false;
        if (nextMessage) {
          const timeDiff = new Date(nextMessage.sentAt).getTime() - new Date(item.sentAt).getTime();
          showTimestamp = timeDiff > 60 * 60 * 1000; // 1 hour
        } else {
          // Always show timestamp for last (oldest) message
          showTimestamp = true;
        }

        // P2: Only animate the first message (most recent, since list is inverted)
        const isNew = index === 0;

        return (
          <MessageBubble
            message={item}
            isOwn={isOwn}
            showAvatar={showAvatar}
            showTimestamp={showTimestamp}
            senderAvatar={isOwn ? null : item.senderName}
            onLongPress={onMessageLongPress}
            isNew={isNew}
          />
        );
      },
      [currentUserId, messages, onMessageLongPress],
    );

    const keyExtractor = useCallback((item: Message) => item.messageId, []);

    const handleEndReached = useCallback(() => {
      if (hasMore && !isFetchingMore) {
        onLoadMore?.();
      }
    }, [hasMore, isFetchingMore, onLoadMore]);

    const handleScroll = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollOffsetRef.current = offsetY;

        // Check if near bottom (for inverted list, this means near top of content)
        if (offsetY < SCROLL_THRESHOLD) {
          onScrollToBottom?.();
        }
      },
      [onScrollToBottom],
    );

    const ListHeaderComponent = useCallback(() => {
      if (typingUsers.length === 0) return null;

      return (
        <View style={styles.typingContainer}>
          <TypingIndicator visible={true} userName={userName} />
        </View>
      );
    }, [typingUsers, userName]);

    const ListFooterComponent = useCallback(() => {
      if (!isFetchingMore) return null;

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.interactive.default} />
        </View>
      );
    }, [isFetchingMore, colors.interactive.default]);

    const ListEmptyComponent = useCallback(() => {
      if (isLoading) {
        return (
          <View style={styles.centerContainer}>
            <UnifiedLoadingState strategy="spinner" variant="screen" />
          </View>
        );
      }

      return <EmptyChat userName={userName} />;
    }, [isLoading, userName]);

    const getItemLayout = useCallback(
      (_data: ArrayLike<Message> | null | undefined, index: number) => ({
        length: 60, // Approximate height
        offset: 60 * index,
        index,
      }),
      [],
    );

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        inverted
        style={[styles.list, { backgroundColor: colors.background.primary }]}
        contentContainerStyle={[
          styles.contentContainer,
          messages.length === 0 && styles.emptyContainer,
        ]}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh ? (
            <CustomRefreshControl refreshing={false} onRefresh={handleRefresh} />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        removeClippedSubviews
        maxToRenderPerBatch={15}
        windowSize={10}
        initialNumToRender={20}
        getItemLayout={getItemLayout}
      />
    );
  },
);

MessageList.displayName = 'MessageList';

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
  contentContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  list: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
  typingContainer: {
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
});

export default MessageList;
