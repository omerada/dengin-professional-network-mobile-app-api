// src/features/messaging/screens/ChatScreen.tsx
// Modern Chat Screen - Instagram/WhatsApp kalitesinde
// Backend: ConversationController, MessageWebSocketController

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Alert, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SAFE_AREA_EDGES, SCREEN_ANIMATIONS } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import { useHaptic } from '@shared/hooks';
import { useAuthStore } from '@features/auth/stores';
import {
  ChatHeader,
  MessageList,
  MessageInput,
  MessageOptionsSheet,
  ChatSkeleton,
  type MessageOptionsSheetRef,
} from '../components';
import { useMessages, useSendMessage, useTyping } from '../hooks';
import { useMessagingStore } from '../stores';
import { messagingService } from '../services';
import type { Message, Participant, Conversation, ClientMessage } from '../types';
import type { MessagingStackParamList } from '@core/navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const colors = useColors();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();
  const { trigger: triggerHaptic } = useHaptic();

  // Route params - Backend Conversation yapısıyla uyumlu
  const routeParams = route.params as {
    conversationId: string;
    participant?: Participant;
    conversation?: Conversation;
  };

  const {
    conversationId,
    participant: initialParticipant,
    conversation: initialConversation,
  } = routeParams;

  // Conversation state - header için güncel bilgi
  const [conversation] = useState<Conversation | null>(
    initialConversation ||
      (initialParticipant
        ? {
            conversationId,
            participant: initialParticipant,
            lastMessage: null,
            unreadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : null),
  );

  const participant = conversation?.participant || initialParticipant;

  // Validate required params
  useEffect(() => {
    if (!conversationId) {
      console.error('[ChatScreen] Missing conversationId, navigating back');
      Alert.alert('Hata', 'Konuşma ID bulunamadı', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    }
  }, [conversationId, navigation]);

  // State
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Refs
  const messageOptionsRef = useRef<MessageOptionsSheetRef>(null);

  // Stores
  const { user } = useAuthStore();
  const { setActiveConversation, drafts, setDraft, clearDraft } = useMessagingStore();

  // Computed
  const currentUserId = user?.id?.toString() || '';

  // Hooks
  const {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
    markAsRead,
  } = useMessages(conversationId, currentUserId);

  const {
    sendMessage,
    isPending: isSending,
    retryMessage: _retryMessage,
  } = useSendMessage(conversationId);

  const {
    startTyping,
    stopTyping,
    setRecipientId,
    isTyping: _otherUserTyping,
  } = useTyping(conversationId);

  const recipientId = participant?.userId || 0;

  // Set recipient for typing
  useEffect(() => {
    if (recipientId) {
      setRecipientId(recipientId);
    }
  }, [recipientId, setRecipientId]);

  // Set active conversation on mount
  useEffect(() => {
    setActiveConversation(conversationId);

    // Load draft
    const draft = drafts[conversationId];
    if (draft) {
      setMessageText(draft);
    }

    return () => {
      // Save draft on unmount
      if (messageText.trim()) {
        setDraft(conversationId, messageText);
      } else {
        clearDraft(conversationId);
      }
      setActiveConversation(null);
    };
  }, [conversationId]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, markAsRead]);

  // Handlers
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    if (participant) {
      // Profile is in ProfileStack, use type assertion for cross-stack navigation
      (navigation as any).navigate('ProfileTab', {
        screen: 'Profile',
        params: { userId: participant.userId },
      });
    }
  }, [navigation, participant]);

  const handleOptionsPress = useCallback(() => {
    Alert.alert('Konuşma Seçenekleri', 'Bu özellik yakında eklenecek');
  }, []);

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim();
    if (!trimmedText || !recipientId) return;

    triggerHaptic('light');

    sendMessage({
      content: trimmedText,
      recipientId,
    });

    setMessageText('');
    clearDraft(conversationId);
  }, [conversationId, messageText, recipientId, sendMessage, clearDraft, triggerHaptic]);

  const handleTextChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (text.length > 0) {
        startTyping();
      } else {
        stopTyping();
      }
    },
    [startTyping, stopTyping],
  );

  const handleMessageLongPress = useCallback(
    (message: Message | ClientMessage) => {
      triggerHaptic('medium');
      setSelectedMessage(message as Message);
      messageOptionsRef.current?.open();
    },
    [triggerHaptic],
  );

  const handleDeleteMessage = useCallback(
    async (message: Message) => {
      Alert.alert('Mesajı Sil', 'Bu mesajı silmek istediğinize emin misiniz?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await messagingService.deleteMessage(conversationId, message.messageId);
              refetch();
            } catch (error) {
              Alert.alert('Hata', 'Mesaj silinemedi');
            }
          },
        },
      ]);
    },
    [conversationId, refetch],
  );

  const handleReportMessage = useCallback((_message: Message) => {
    Alert.alert('Mesajı Bildir', 'Bu mesajı bildirmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Bildir',
        onPress: () => {
          Alert.alert('Bilgi', 'Mesaj bildirildi');
        },
      },
    ]);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Display data
  const displayParticipant: Participant = participant || {
    userId: 0,
    fullName: 'Konuşma',
    profession: '',
    profileImageUrl: null,
    verified: false,
    online: false,
    lastSeenAt: null,
  };

  // Create a conversation object for ChatHeader
  const displayConversation: Conversation = {
    conversationId,
    participant: displayParticipant,
    lastMessage: null,
    unreadCount: 0,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Get typing users for this conversation
  const { typingUsers } = useMessagingStore();
  const conversationTypingUsers = typingUsers[conversationId] || [];

  // Show loading skeleton while initial load
  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <ChatHeader
          conversation={displayConversation}
          onBackPress={handleBackPress}
          onProfilePress={handleProfilePress}
          onOptionsPress={handleOptionsPress}
        />
        <ChatSkeleton count={8} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={SAFE_AREA_EDGES.standard}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={styles.content}>
          {/* Header */}
          <ChatHeader
            conversation={displayConversation}
            onBackPress={handleBackPress}
            onProfilePress={handleProfilePress}
            onOptionsPress={handleOptionsPress}
          />

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            conversationId={conversationId}
            typingUsers={conversationTypingUsers}
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={handleLoadMore}
            onRefresh={refetch}
            onMessageLongPress={handleMessageLongPress}
          />

          {/* Input */}
          <MessageInput
            value={messageText}
            onChangeText={handleTextChange}
            onSend={handleSend}
            disabled={isSending}
          />

          {/* Message options sheet */}
          <MessageOptionsSheet
            ref={messageOptionsRef}
            message={selectedMessage}
            isOwn={selectedMessage?.senderId === Number(currentUserId)}
            onDelete={handleDeleteMessage}
            onReport={handleReportMessage}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

// Wrap with Error Boundary for production safety
import { ErrorBoundary } from '@core/components';

export default function ChatScreenWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ChatScreen />
    </ErrorBoundary>
  );
}
