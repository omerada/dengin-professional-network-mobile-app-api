// src/features/messaging/screens/ChatScreen.tsx
// Sohbet ekranı
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '@contexts/ThemeContext';
import { useAuthStore } from '@features/auth/stores';
import {
  ChatHeader,
  MessageList,
  MessageInput,
  MessageOptionsSheet,
  type MessageOptionsSheetRef,
} from '../components';
import {
  useMessages,
  useSendMessage,
  useTyping,
  useMarkAsRead,
} from '../hooks';
import { useMessagingStore } from '../stores';
import { messagingService } from '../services';
import type { Message, Conversation } from '../types';
import type { MessagingStackParamList } from '@navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();

  const { conversationId } = route.params;

  // State
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Refs
  const messageOptionsRef = useRef<MessageOptionsSheetRef>(null);

  // Stores
  const { user } = useAuthStore();
  const { setActiveConversation, getDraft, setDraft } = useMessagingStore();

  // Hooks
  const {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useMessages(conversationId);

  const { sendMessage, isPending: isSending, retryMessage } = useSendMessage(conversationId);
  const { startTyping, stopTyping, typingUsers: conversationTypingUserNames } = useTyping(conversationId);
  const { markAsRead } = useMarkAsRead();

  // Computed
  const currentUserId = user?.id || '';
  const conversationTypingUsers = useMemo(() => {
    // Use typing users from hook instead of store
    return conversationTypingUserNames.filter(name => name !== user?.displayName);
  }, [conversationTypingUserNames, user?.displayName]);

  // Load conversation details
  useEffect(() => {
    const loadConversation = async () => {
      try {
        // For now, create a mock conversation from the first message's data
        // In a real app, you'd fetch this from the API
        if (messages.length > 0) {
          const firstMessage = messages[0];
          const mockConversation: Conversation = {
            id: conversationId,
            name: firstMessage.sender?.displayName || 'Konuşma',
            avatarUrl: firstMessage.sender?.avatarUrl,
            participants: [],
            createdAt: firstMessage.createdAt,
            updatedAt: firstMessage.createdAt,
            isPinned: false,
            isMuted: false,
            unreadCount: 0,
          };
          setConversation(mockConversation);
        }
      } catch (error) {
        // Handle error
      }
    };

    loadConversation();
  }, [conversationId, messages]);

  // Set active conversation on mount
  useEffect(() => {
    setActiveConversation(conversationId);

    // Load draft
    const draft = getDraft(conversationId);
    if (draft) {
      setMessageText(draft);
    }

    return () => {
      // Save draft on unmount
      if (messageText.trim()) {
        setDraft(conversationId, messageText);
      }
      setActiveConversation(null);
    };
  }, [conversationId, setActiveConversation, getDraft, setDraft]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead(conversationId);
    }
  }, [conversationId, messages.length, markAsRead]);

  // Handlers
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    // Navigate to user profile
    if (conversation?.participants[0]) {
      // TODO: Navigate to profile
    }
  }, [conversation]);

  const handleOptionsPress = useCallback(() => {
    // TODO: Show conversation options
    Alert.alert('Konuşma Seçenekleri', 'Bu özellik yakında eklenecek');
  }, []);

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim();
    if (!trimmedText) return;

    sendMessage({
      content: trimmedText,
      replyToId: replyingTo?.id,
    });

    setMessageText('');
    setReplyingTo(null);
    setDraft(conversationId, '');
  }, [conversationId, messageText, replyingTo, sendMessage, setDraft]);

  const handleTypingStart = useCallback(() => {
    startTyping();
  }, [startTyping]);

  const handleTypingStop = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  const handleMessageLongPress = useCallback((message: Message) => {
    setSelectedMessage(message);
    messageOptionsRef.current?.open();
  }, []);

  const handleReplyPress = useCallback((message: Message) => {
    setReplyingTo(message);
    // Focus input would go here with ref
  }, []);

  const handleCopyMessage = useCallback(() => {
    // Toast or feedback would go here
  }, []);

  const handleDeleteMessage = useCallback(async (message: Message) => {
    Alert.alert(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await messagingService.deleteMessage(conversationId, message.id);
              refetch();
            } catch (error) {
              Alert.alert('Hata', 'Mesaj silinemedi');
            }
          },
        },
      ]
    );
  }, [conversationId, refetch]);

  const handleReportMessage = useCallback((message: Message) => {
    Alert.alert(
      'Mesajı Bildir',
      'Bu mesajı bildirmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bildir',
          onPress: () => {
            // TODO: Implement report
            Alert.alert('Bilgi', 'Mesaj bildirildi');
          },
        },
      ]
    );
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Default conversation object if not loaded
  const displayConversation: Conversation = conversation || {
    id: conversationId,
    name: 'Konuşma',
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    isMuted: false,
    unreadCount: 0,
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.primary },
      ]}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <ChatHeader
          conversation={displayConversation}
          onBackPress={handleBackPress}
          onProfilePress={handleProfilePress}
          onOptionsPress={handleOptionsPress}
        />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <MessageList
          messages={messages}
          currentUserId={currentUserId}
          conversationId={conversationId}
          typingUsers={conversationTypingUsers}
          userName={conversation?.name}
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          hasMore={hasNextPage}
          onLoadMore={handleLoadMore}
          onRefresh={refetch}
          onMessageLongPress={handleMessageLongPress}
          onReplyPress={handleReplyPress}
        />

        {/* Reply indicator */}
        {replyingTo && (
          <View
            style={[
              styles.replyBar,
              { backgroundColor: theme.colors.background.secondary },
            ]}
          >
            <View style={styles.replyContent}>
              <View
                style={[
                  styles.replyIndicator,
                  { backgroundColor: theme.colors.primary[500] },
                ]}
              />
              <View style={styles.replyTextContainer}>
                <View style={styles.replyText}>
                  <View>
                    {/* Reply text would go here */}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <MessageInput
            value={messageText}
            onChangeText={setMessageText}
            onSend={handleSend}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            disabled={isSending}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Message options sheet */}
      <MessageOptionsSheet
        ref={messageOptionsRef}
        message={selectedMessage}
        isOwn={selectedMessage?.senderId === currentUserId}
        onReply={handleReplyPress}
        onCopy={handleCopyMessage}
        onDelete={handleDeleteMessage}
        onReport={handleReportMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  replyBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyIndicator: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: 8,
  },
  replyTextContainer: {
    flex: 1,
  },
  replyText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ChatScreen;
