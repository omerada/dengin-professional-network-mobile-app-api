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
      getState().clearTypingUsers();
      getState().clearOnlineUsers();
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
      expect(state.typingUsers[conversationId]).toEqual([]);
    });

    it('should clear all typing users', () => {
      const { addTypingUser, clearTypingUsers } = useMessagingStore.getState();

      act(() => {
        addTypingUser('conv1', 'User 1');
        addTypingUser('conv2', 'User 2');
        clearTypingUsers();
      });

      const state = useMessagingStore.getState();
      expect(state.typingUsers).toEqual({});
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

    it('should clear all online users', () => {
      const { setUserOnline, clearOnlineUsers } = useMessagingStore.getState();

      act(() => {
        setUserOnline('user1', true);
        setUserOnline('user2', true);
        clearOnlineUsers();
      });

      const state = useMessagingStore.getState();
      expect(state.onlineUsers.size).toBe(0);
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
      const { setDraft, getDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';
      const content = 'Draft message';

      act(() => {
        setDraft(conversationId, content);
      });

      expect(useMessagingStore.getState().getDraft(conversationId)).toBe(content);
    });

    it('should remove empty draft', () => {
      const { setDraft } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        setDraft(conversationId, 'Some content');
        setDraft(conversationId, '');
      });

      const state = useMessagingStore.getState();
      expect(state.drafts[conversationId]).toBeUndefined();
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
      const { addToQueue } = useMessagingStore.getState();
      const message = {
        id: 'temp1',
        conversationId: 'conv123',
        content: 'Queued message',
      };

      act(() => {
        addToQueue(message);
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).toContainEqual(message);
    });

    it('should remove message from queue', () => {
      const { addToQueue, removeFromQueue } = useMessagingStore.getState();
      const messageId = 'temp1';
      const message = {
        id: messageId,
        conversationId: 'conv123',
        content: 'Queued message',
      };

      act(() => {
        addToQueue(message);
        removeFromQueue(messageId);
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).not.toContainEqual(expect.objectContaining({ id: messageId }));
    });

    it('should clear message queue', () => {
      const { addToQueue, clearQueue } = useMessagingStore.getState();

      act(() => {
        addToQueue({ id: 'temp1', conversationId: 'conv1', content: 'Message 1' });
        addToQueue({ id: 'temp2', conversationId: 'conv2', content: 'Message 2' });
        clearQueue();
      });

      const state = useMessagingStore.getState();
      expect(state.messageQueue).toHaveLength(0);
    });
  });

  describe('selectors', () => {
    it('should check if user is online', () => {
      const { setUserOnline, isUserOnline } = useMessagingStore.getState();
      const userId = 'user123';

      act(() => {
        setUserOnline(userId, true);
      });

      expect(useMessagingStore.getState().isUserOnline(userId)).toBe(true);
    });

    it('should get typing users for conversation', () => {
      const { addTypingUser, getTypingUsersForConversation } = useMessagingStore.getState();
      const conversationId = 'conv123';

      act(() => {
        addTypingUser(conversationId, 'User 1');
        addTypingUser(conversationId, 'User 2');
      });

      const typingUsers = useMessagingStore.getState().getTypingUsersForConversation(conversationId);
      expect(typingUsers).toContain('User 1');
      expect(typingUsers).toContain('User 2');
    });
  });
});
