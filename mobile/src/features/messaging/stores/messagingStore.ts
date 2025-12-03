// src/features/messaging/stores/messagingStore.ts
// Messaging Zustand store
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MessagingStoreState, QueuedMessage } from '../types';

type MessagingStorePersist = (
  config: StateCreator<MessagingStoreState>,
  options: PersistOptions<MessagingStoreState, Partial<MessagingStoreState>>
) => StateCreator<MessagingStoreState>;

/**
 * Messaging Store
 */
export const useMessagingStore = create<MessagingStoreState>()(
  (persist as MessagingStorePersist)(
    (set, get): MessagingStoreState => ({
      // Active conversation
      activeConversationId: null,
      setActiveConversation: (id: string | null) => set({ activeConversationId: id }),

      // Typing users per conversation
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

      // Online users
      onlineUsers: new Set<string>(),
      setUserOnline: (userId: string, isOnline: boolean) => {
        const { onlineUsers } = get();
        const newOnlineUsers = new Set(onlineUsers);
        if (isOnline) {
          newOnlineUsers.add(userId);
        } else {
          newOnlineUsers.delete(userId);
        }
        set({ onlineUsers: newOnlineUsers });
      },

      // Message queue
      messageQueue: [],
      addToQueue: (message: QueuedMessage) => {
        set({ messageQueue: [...get().messageQueue, message] });
      },
      removeFromQueue: (messageId: string) => {
        set({
          messageQueue: get().messageQueue.filter((m: QueuedMessage) => m.id !== messageId),
        });
      },
      clearQueue: () => set({ messageQueue: [] }),

      // Draft messages
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
    }),
    {
      name: 'messaging-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: MessagingStoreState) => ({
        drafts: state.drafts,
        // Queue is persisted separately in messageQueue service
      }),
    }
  )
);

/**
 * Selectors
 */
export const selectActiveConversation = (state: MessagingStoreState) =>
  state.activeConversationId;

export const selectTypingUsers = (conversationId: string) => (state: MessagingStoreState) =>
  state.typingUsers[conversationId] || [];

export const selectIsUserOnline = (userId: string) => (state: MessagingStoreState) =>
  state.onlineUsers.has(userId);

export const selectDraft = (conversationId: string) => (state: MessagingStoreState) =>
  state.drafts[conversationId] || '';

export const selectHasDraft = (conversationId: string) => (state: MessagingStoreState) =>
  (state.drafts[conversationId]?.length || 0) > 0;

export const selectQueuedMessages = (conversationId: string) => (state: MessagingStoreState) =>
  state.messageQueue.filter((m: QueuedMessage) => m.conversationId === conversationId);

export default useMessagingStore;
