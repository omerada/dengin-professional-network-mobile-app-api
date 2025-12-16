// src/features/messaging/screens/ChatScreen.tsx
// Modern Chat Screen - Instagram/WhatsApp kalitesinde
// Backend: ConversationController, MessageWebSocketController

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SAFE_AREA_EDGES, SCREEN_ANIMATIONS } from '@constants';
import { useColors } from '@contexts/ThemeContext';
import { useToast } from '@contexts/ToastContext';
import { useSemanticHaptic, useLoadingTimeout, useHaptic } from '@shared/hooks';
import { showMessageDeleteError, showSuccess } from '@shared/utils';
import { useAuthStore } from '@features/auth/stores';
import { UnifiedScreenHeader, KeyboardAwareScreen, ActionSheet } from '@shared/components';
import {
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
  const { trigger } = useHaptic();
  const { triggerMedia, triggerSystem, triggerContent } = useSemanticHaptic();
  const toast = useToast();

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
      toast.error('Konuşma ID bulunamadı');
      navigation.goBack();
    }
  }, [conversationId, navigation, toast]);

  // State
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [messageToReport, setMessageToReport] = useState<Message | null>(null);

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

  // Loading timeout protection
  useLoadingTimeout(isLoading && messages.length === 0, {
    timeout: 30000,
    onTimeout: () => {
      toast.error('Mesajlar yüklenirken zaman aşımı oluştu. Lütfen tekrar deneyin.');
    },
    onRetry: async () => {
      await refetch();
    },
  });

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
    toast.info('Bu özellik yakında eklenecek');
  }, [toast]);

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim();
    if (!trimmedText || !recipientId) return;

    triggerSystem('success'); // Send message

    sendMessage({
      content: trimmedText,
      recipientId,
    });

    setMessageText('');
    clearDraft(conversationId);
  }, [conversationId, messageText, recipientId, sendMessage, clearDraft, triggerSystem]);

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

  // P2: Media attachment handlers
  const handleImagePick = useCallback(() => {
    triggerMedia('select');
    toast.info('Bu özellik yakında eklenecek');
  }, [triggerMedia, toast]);

  const handleCameraOpen = useCallback(() => {
    triggerMedia('capture');
    toast.info('Bu özellik yakında eklenecek');
  }, [triggerMedia, toast]);

  const handleVoiceRecord = useCallback(() => {
    triggerMedia('capture');
    toast.info('Bu özellik yakında eklenecek');
  }, [triggerMedia, toast]);

  const handleMessageLongPress = useCallback(
    (message: Message | ClientMessage) => {
      triggerContent('edit');
      setSelectedMessage(message as Message);
      messageOptionsRef.current?.open();
    },
    [triggerContent],
  );

  const handleDeleteMessage = useCallback((message: Message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  }, []);

  const executeDeleteMessage = useCallback(async () => {
    if (!messageToDelete) return;

    try {
      await messagingService.deleteMessage(conversationId, messageToDelete.messageId);
      showSuccess(toast, { trigger }, 'Mesaj silindi');
      refetch();
    } catch (error) {
      showMessageDeleteError(toast, { trigger });
    } finally {
      setShowDeleteConfirm(false);
      setMessageToDelete(null);
    }
  }, [messageToDelete, conversationId, refetch, triggerSystem, toast]);

  const handleReportMessage = useCallback((message: Message) => {
    setMessageToReport(message);
    setShowReportConfirm(true);
  }, []);

  const executeReportMessage = useCallback(() => {
    if (!messageToReport) return;

    // TODO: Implement actual report API call
    triggerSystem('success');
    toast.success('Mesaj bildirildi');
    setShowReportConfirm(false);
    setMessageToReport(null);
  }, [messageToReport, triggerSystem, toast]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get typing users for this conversation
  const { typingUsers } = useMessagingStore();
  const conversationTypingUsers = typingUsers[conversationId] || [];

  // Show loading skeleton while initial load
  if (isLoading && messages.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background.primary }]}
        edges={SAFE_AREA_EDGES.standard}>
        <UnifiedScreenHeader
          variant="chat"
          onBackPress={handleBackPress}
          chatProps={{
            avatar: participant?.profileImageUrl || undefined,
            name: participant?.fullName || 'Yükleniyor...',
            subtitle: undefined,
            isOnline: false,
            onProfilePress: handleProfilePress,
            onOptionsPress: handleOptionsPress,
          }}
        />
        <ChatSkeleton count={8} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      edges={SAFE_AREA_EDGES.standard}>
      <KeyboardAwareScreen mode="padding">
        <Animated.View entering={SCREEN_ANIMATIONS.screenEnter} style={styles.content}>
          {/* Unified Header */}
          <UnifiedScreenHeader
            variant="chat"
            onBackPress={handleBackPress}
            chatProps={{
              avatar: participant?.profileImageUrl || undefined,
              name: participant?.fullName || 'Kullanıcı',
              subtitle: participant?.online ? 'çevrimiçi' : undefined,
              isOnline: participant?.online || false,
              isTyping: conversationTypingUsers.length > 0,
              onProfilePress: handleProfilePress,
              onOptionsPress: handleOptionsPress,
            }}
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

          {/* Input - P2: With media attachment support */}
          <MessageInput
            value={messageText}
            onChangeText={handleTextChange}
            onSend={handleSend}
            disabled={isSending}
            onImagePick={handleImagePick}
            onCameraOpen={handleCameraOpen}
            onVoiceRecord={handleVoiceRecord}
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
      </KeyboardAwareScreen>

      {/* Delete Message Confirmation */}
      <ActionSheet
        visible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setMessageToDelete(null);
        }}
        title="Mesajı Sil"
        message="Bu mesajı silmek istediğinize emin misiniz?"
        options={[
          {
            id: 'delete',
            label: 'Sil',
            icon: 'trash-outline',
            destructive: true,
            onPress: executeDeleteMessage,
          },
        ]}
        cancelLabel="İptal"
        testID="delete-message-sheet"
      />

      {/* Report Message Confirmation */}
      <ActionSheet
        visible={showReportConfirm}
        onClose={() => {
          setShowReportConfirm(false);
          setMessageToReport(null);
        }}
        title="Mesajı Bildir"
        message="Bu mesajı bildirmek istediğinize emin misiniz?"
        options={[
          {
            id: 'report',
            label: 'Bildir',
            icon: 'flag-outline',
            destructive: true,
            onPress: executeReportMessage,
          },
        ]}
        cancelLabel="İptal"
        testID="report-message-sheet"
      />
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
