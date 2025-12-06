// src/features/messaging/stores/messagingStore.ts
// Messaging Zustand store - Backend WebSocket state management
// Backend: STOMP over SockJS connection state
// Oku: backend-development-guide/sprint-planning/26-SPRINT-7-8.md

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MessagingStoreState, QueuedMessage, StompConnectionState } from '../types';

type MessagingStorePersist = (
  config: StateCreator<MessagingStoreState>,
  options: PersistOptions<MessagingStoreState, Partial<MessagingStoreState>>,
) => StateCreator<MessagingStoreState>;

/**
 * Messaging Store
 * Backend STOMP/SockJS bağlantı durumunu ve client state'i yönetir
 */
export const useMessagingStore = create<MessagingStoreState>()(
  (persist as MessagingStorePersist)(
    (set, get): MessagingStoreState => ({
      // STOMP connection state
      connectionState: 'DISCONNECTED',
      setConnectionState: (state: StompConnectionState) => set({ connectionState: state }),

      // Active conversation
      activeConversationId: null,
      setActiveConversation: (id: string | null) => set({ activeConversationId: id }),

      // Typing users per conversation (userId listesi)
      typingUsers: {},
      addTypingUser: (conversationId: string, userId: string) => {
        const { typingUsers } = get();
        const currentUsers = typingUsers[conversationId] || [];
        if (!currentUsers.includes(userId)) {
          set({
            typingUsers: {
              ...typingUsers,
              [conversationId]: [...currentUsers, userId],
            },
          });
        }
      },
      removeTypingUser: (conversationId: string, userId: string) => {
        const { typingUsers } = get();
        const currentUsers = typingUsers[conversationId] || [];
        set({
          typingUsers: {
            ...typingUsers,
            [conversationId]: currentUsers.filter((id: string) => id !== userId),
          },
        });
      },
      clearTypingUsers: (conversationId: string) => {
        const { typingUsers } = get();
        const newTypingUsers = { ...typingUsers };
        delete newTypingUsers[conversationId];
        set({ typingUsers: newTypingUsers });
      },

      // Online users (userId set)
      onlineUsers: new Set<number>(),
      setUserOnline: (userId: number, isOnline: boolean) => {
        const { onlineUsers } = get();
        const newOnlineUsers = new Set(onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        set({ onlineUsers: newOnlineUsers });
      },

      // Offline message queue
      messageQueue: [],
      addToQueue: (message: QueuedMessage) => {
        set({ messageQueue: [...get().messageQueue, message] });
      },
      removeFromQueue: (tempId: string) => {
        set({
          messageQueue: get().messageQueue.filter((m: QueuedMessage) => m.tempId !== tempId),
        });
      },
      clearQueue: () => set({ messageQueue: [] }),
      incrementRetryCount: (tempId: string) => {
        set({
          messageQueue: get().messageQueue.map((m: QueuedMessage) =>
            m.tempId === tempId ? { ...m, retryCount: m.retryCount + 1 } : m,
          ),
        });
      },

      // Draft messages per conversation
      drafts: {},
      setDraft: (conversationId: string, content: string) => {
        set({
          drafts: {
            ...get().drafts,
            [conversationId]: content,
          },
        });
      },
      clearDraft: (conversationId: string) => {
        const { drafts } = get();
        const newDrafts = { ...drafts };
        delete newDrafts[conversationId];
        set({ drafts: newDrafts });
      },

      // Unread count cache
      totalUnreadCount: 0,
      setTotalUnreadCount: (count: number) => set({ totalUnreadCount: count }),
      decrementUnreadCount: (amount: number = 1) => {
        const { totalUnreadCount } = get();
        set({ totalUnreadCount: Math.max(0, totalUnreadCount - amount) });
      },
    }),
    {
      name: 'messaging-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: MessagingStoreState) => ({
        drafts: state.drafts,
        messageQueue: state.messageQueue,
        totalUnreadCount: state.totalUnreadCount,
      }),
    },
  ),
);

/**
 * Selectors
 */
export const selectConnectionState = (state: MessagingStoreState) => state.connectionState;

export const selectIsConnected = (state: MessagingStoreState) =>
  state.connectionState === 'CONNECTED';

export const selectActiveConversation = (state: MessagingStoreState) => state.activeConversationId;

export const selectTypingUsers = (conversationId: string) => (state: MessagingStoreState) =>
  state.typingUsers[conversationId] || [];

export const selectIsUserOnline = (userId: string) => (state: MessagingStoreState) =>
  state.onlineUsers.has(userId);

export const selectDraft = (conversationId: string) => (state: MessagingStoreState) =>
  state.drafts[conversationId] || '';

export const selectHasDraft = (conversationId: string) => (state: MessagingStoreState) =>
  (state.drafts[conversationId]?.length || 0) > 0;

export const selectQueuedMessages = (state: MessagingStoreState) => state.messageQueue;

export const selectQueuedMessagesForRecipient =
  (recipientId: string) => (state: MessagingStoreState) =>
    state.messageQueue.filter((m: QueuedMessage) => m.recipientId === recipientId);

export const selectTotalUnreadCount = (state: MessagingStoreState) => state.totalUnreadCount;

export default useMessagingStore;
