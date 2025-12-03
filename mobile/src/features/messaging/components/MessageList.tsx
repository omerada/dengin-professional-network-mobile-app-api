// src/features/messaging/components/MessageList.tsx
// Mesaj listesi komponenti
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { memo, useCallback, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from '@contexts/ThemeContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmptyChat } from './EmptyChat';
import type { Message } from '../types';

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
  onMessageLongPress?: (message: Message) => void;
  onReplyPress?: (message: Message) => void;
  onScrollToBottom?: () => void;
}

const SCROLL_THRESHOLD = 200;

export const MessageList: React.FC<MessageListProps> = memo(({
  messages,
  currentUserId,
  conversationId,
  typingUsers,
  userName,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  onRefresh,
  onMessageLongPress,
  onReplyPress,
  onScrollToBottom,
}) => {
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList<Message>>(null);
  const scrollOffsetRef = useRef(0);

  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.senderId === currentUserId;
    
    // Önceki mesajla aynı gönderici mi kontrol et
    const previousMessage = messages[index + 1]; // inverted list
    const showAvatar = !previousMessage || previousMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        onLongPress={onMessageLongPress}
        onReplyPress={onReplyPress}
      />
    );
  }, [currentUserId, messages, onMessageLongPress, onReplyPress]);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetchingMore) {
      onLoadMore?.();
    }
  }, [hasMore, isFetchingMore, onLoadMore]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffsetRef.current = offsetY;

    // Check if near bottom (for inverted list, this means near top of content)
    if (offsetY < SCROLL_THRESHOLD) {
      onScrollToBottom?.();
    }
  }, [onScrollToBottom]);

  const ListHeaderComponent = useCallback(() => {
    if (typingUsers.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <TypingIndicator users={typingUsers} />
      </View>
    );
  }, [typingUsers]);

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingMore) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }, [isFetchingMore, theme.colors.primary]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      );
    }

    return <EmptyChat userName={userName} />;
  }, [isLoading, userName, theme.colors.primary]);

  const getItemLayout = useCallback((_data: Message[] | null | undefined, index: number) => ({
    length: 60, // Approximate height
    offset: 60 * index,
    index,
  }), []);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted
      style={[styles.list, { backgroundColor: theme.colors.background.primary }]}
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
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[500]]}
            tintColor={theme.colors.primary[500]}
          />
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
});

MessageList.displayName = 'MessageList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  typingContainer: {
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Inverted list için dönüştürme
    transform: [{ scaleY: -1 }],
  },
});

export default MessageList;
