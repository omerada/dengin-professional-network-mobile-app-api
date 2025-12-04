// src/features/messaging/screens/ChatScreen.tsx
// Sohbet ekranı - Backend API ile uyumlu
// Backend: ConversationController, MessageWebSocketController
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

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
} from '../hooks';
import { useMessagingStore } from '../stores';
import { messagingService } from '../services';
import type { Message, Conversation, Participant } from '../types';
import type { MessagingStackParamList } from '@navigation/types';

type NavigationProp = NativeStackNavigationProp<MessagingStackParamList, 'Chat'>;
type ChatRouteProp = RouteProp<MessagingStackParamList, 'Chat'>;

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ChatRouteProp>();

  // Route params - Backend Conversation yapısıyla uyumlu
  const { conversationId, participant } = route.params as {
    conversationId: string;
    participant?: Participant;
  };

  // State
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Refs
  const messageOptionsRef = useRef<MessageOptionsSheetRef>(null);

  // Stores
  const { user } = useAuthStore();
  const { setActiveConversation, drafts, setDraft, clearDraft } = useMessagingStore();

  // Hooks
  const {
    messages,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
    markAsRead,
  } = useMessages(conversationId);

  const { sendMessage, isPending: isSending, retryMessage } = useSendMessage(conversationId);
  const { startTyping, stopTyping, setRecipientId, isTyping: otherUserTyping } = useTyping(conversationId);

  // Computed
  const currentUserId = user?.id?.toString() || '';
  const recipientId = participant?.userId || '';

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
      navigation.navigate('Profile' as never, { userId: participant.userId } as never);
    }
  }, [navigation, participant]);

  const handleOptionsPress = useCallback(() => {
    Alert.alert('Konuşma Seçenekleri', 'Bu özellik yakında eklenecek');
  }, []);

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim();
    if (!trimmedText || !recipientId) return;

    sendMessage({
      content: trimmedText,
      recipientId,
    });

    setMessageText('');
    clearDraft(conversationId);
  }, [conversationId, messageText, recipientId, sendMessage, clearDraft]);

  const handleTextChange = useCallback((text: string) => {
    setMessageText(text);
    if (text.length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  }, [startTyping, stopTyping]);

  const handleMessageLongPress = useCallback((message: Message) => {
    setSelectedMessage(message);
    messageOptionsRef.current?.open();
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
              await messagingService.deleteMessage(conversationId, message.messageId);
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

  // Display data
  const displayParticipant: Participant = participant || {
    userId: '',
    fullName: 'Konuşma',
    profession: '',
    profileImageUrl: null,
    verified: false,
    online: false,
    lastSeenAt: null,
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
          participant={displayParticipant}
          isTyping={otherUserTyping}
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
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          hasMore={!!hasNextPage}
          onLoadMore={handleLoadMore}
          onRefresh={refetch}
          onMessageLongPress={handleMessageLongPress}
        />

        {/* Input */}
        <View style={{ paddingBottom: insets.bottom }}>
          <MessageInput
            value={messageText}
            onChangeText={handleTextChange}
            onSend={handleSend}
            disabled={isSending || !recipientId}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Message options sheet */}
      <MessageOptionsSheet
        ref={messageOptionsRef}
        message={selectedMessage}
        isOwn={selectedMessage?.senderId === currentUserId}
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
