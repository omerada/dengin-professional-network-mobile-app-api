// src/features/messaging/__tests__/messagingStore.test.ts
// Messaging store unit tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { useMessagingStore } from '../stores/messagingStore';
import { act } from '@testing-library/react-native';

describe('messagingStore', () => {
  beforeEach(() => {
    // Reset store state
    const { getState } = useMessagingStore;
    act(() => {
      getState().setActiveConversation(null);
      // Clear typing users for all conversations
      const typingUsers = getState().typingUsers;
      Object.keys(typingUsers).forEach(convId => {
        getState().clearTypingUsers(convId);
      });
      // Reset online users by setting each to false
      const onlineUsers = getState().onlineUsers;
      onlineUsers.forEach(userId => {
        getState().setUserOnline(userId, false);
      });
    });
  });

  describe('activeConversation', () => {
    it('should set active conversation', () => {
      const { setActiveConversation, activeConversationId } = useMessagingStore.getState();

      act(() => {
        setActiveConversation('conv123');
      });

      expect(useMessagingStore.getState().activeConversationId).toBe('conv123');
    });

    it('should clear active conversation', () => {
      const { setActiveConversation } = useMessagingStore.getState();

      act(() => {
        setActiveConversation('conv123');
        setActiveConversation(null);
      });

      expect(useMessagingStore.getState().activeConversationId).toBeNull();
    });
  });

  describe('typingUsers', () => {
    it('should add typing user', () => {
      const { addTypingUser, typingUsers } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const userName = 'Test User';

      act(() => {
        addTypingUser(conversationId, userName);
      });

      const state = useMessagingStore.getState();
      expect(state.typingUsers[conversationId]).toContain(userName);
    });

    it('should not add duplicate typing user', () => {
      const { addTypingUser } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const userName = 'Test User';

      act(() => {
        addTypingUser(conversationId, userName);
        addTypingUser(conversationId, userName);
      });

      const state = useMessagingStore.getState();
      expect(state.typingUsers[conversationId]).toHaveLength(1);
    });

    it('should remove typing user', () => {
      const { addTypingUser, removeTypingUser } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const userName = 'Test User';

      act(() => {
        addTypingUser(conversationId, userName);
        removeTypingUser(conversationId, userName);
      });

      const state = useMessagingStore.getState();
      expect(state.typingUsers[conversationId]).not.toContain(userName);
    });

    it('should clear typing users for conversation', () => {
      const { addTypingUser, clearTypingUsers } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        addTypingUser(conversationId, 'User 1');
        addTypingUser(conversationId, 'User 2');
        clearTypingUsers(conversationId);
      });

      const state = useMessagingStore.getState();
      // After clearing, the key should not exist
      expect(state.typingUsers[conversationId]).toBeUndefined();
    });
  });

  describe('onlineUsers', () => {
    it('should add online user', () => {
      const { setUserOnline, onlineUsers } = useMessagingStore.getState();
      const userId = 'user123';

      act(() => {
        setUserOnline(userId, true);
      });

      const state = useMessagingStore.getState();
      expect(state.onlineUsers.has(userId)).toBe(true);
    });

    it('should remove offline user', () => {
      const { setUserOnline } = useMessagingStore.getState();
      const userId = 'user123';

      act(() => {
        setUserOnline(userId, true);
        setUserOnline(userId, false);
      });

      const state = useMessagingStore.getState();
      expect(state.onlineUsers.has(userId)).toBe(false);
    });
  });

  describe('drafts', () => {
    it('should set draft for conversation', () => {
      const { setDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const content = 'Draft message';

      act(() => {
        setDraft(conversationId, content);
      });

      const state = useMessagingStore.getState();
      expect(state.drafts[conversationId]).toBe(content);
    });

    it('should get draft for conversation', () => {
      const { setDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const content = 'Draft message';

      act(() => {
        setDraft(conversationId, content);
      });

      expect(useMessagingStore.getState().drafts[conversationId]).toBe(content);
    });

    it('should update draft to empty string', () => {
      const { setDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        setDraft(conversationId, 'Some content');
        setDraft(conversationId, '');
      });

      const state = useMessagingStore.getState();
      expect(state.drafts[conversationId]).toBe('');
    });

    it('should clear draft for conversation', () => {
      const { setDraft, clearDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        setDraft(conversationId, 'Draft content');
        clearDraft(conversationId);
      });

      const state = useMessagingStore.getState();
      expect(state.drafts[conversationId]).toBeUndefined();
    });
  });

  describe('messageQueue', () => {
    it('should add message to queue', () => {
      const { addToQueue, clearQueue } = useMessagingStore.getState();
      const message = {
        tempId: 'temp1',
        conversationId: 'conv123',
        content: 'Queued message',
        retryCount: 0,
      };

      act(() => {
        clearQueue();
        addToQueue(message);
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).toContainEqual(message);
    });

    it('should remove message from queue', () => {
      const { addToQueue, removeFromQueue, clearQueue } = useMessagingStore.getState();
      const tempId = 'temp1';
      const message = {
        tempId: tempId,
        conversationId: 'conv123',
        content: 'Queued message',
        retryCount: 0,
      };

      act(() => {
        clearQueue();
        addToQueue(message);
        removeFromQueue(tempId);
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).not.toContainEqual(expect.objectContaining({ tempId: tempId }));
    });

    it('should clear message queue', () => {
      const { addToQueue, clearQueue } = useMessagingStore.getState();

      act(() => {
        addToQueue({
          tempId: 'temp1',
          conversationId: 'conv1',
          content: 'Message 1',
          retryCount: 0,
        });
        addToQueue({
          tempId: 'temp2',
          conversationId: 'conv2',
          content: 'Message 2',
          retryCount: 0,
        });
        clearQueue();
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    it('should check if user is online', () => {
      const { setUserOnline } = useMessagingStore.getState();
      const userId = 'user123';

      act(() => {
        setUserOnline(userId, true);
      });

      expect(useMessagingStore.getState().onlineUsers.has(userId)).toBe(true);
    });

    it('should get typing users for conversation', () => {
      const { addTypingUser } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        addTypingUser(conversationId, 'User 1');
        addTypingUser(conversationId, 'User 2');
      });

      const typingUsers = useMessagingStore.getState().typingUsers[conversationId];
      expect(typingUsers).toContain('User 1');
      expect(typingUsers).toContain('User 2');
    });
  });
});
