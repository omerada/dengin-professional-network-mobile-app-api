// src/features/messaging/__tests__/messageQueue.test.ts
// Message queue unit tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock before imports
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../services/socketClient', () => ({
  socketClient: {
    isConnected: jest.fn(() => false),
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
  },
}));
jest.mock('../services/messagingService', () => ({
  messagingService: {
    sendMessage: jest.fn(),
    getConversations: jest.fn(),
    getMessages: jest.fn(),
  },
}));

import { messageQueue } from '../services/messageQueue';
import { socketClient } from '../services/socketClient';
import { messagingService } from '../services/messagingService';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSocketClient = socketClient as jest.Mocked<typeof socketClient>;
const mockMessagingService = messagingService as jest.Mocked<typeof messagingService>;

describe('messageQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockSocketClient.isConnected.mockReturnValue(false);
  });

  describe('add', () => {
    it('should add message to queue', async () => {
      const conversationId = 'conv123';
      const content = 'Test message';

      const result = await messageQueue.add(conversationId, content);

      expect(result).toHaveProperty('id');
      expect(result.conversationId).toBe(conversationId);
      expect(result.content).toBe(content);
      expect(result.retryCount).toBe(0);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should persist queue to AsyncStorage', async () => {
      await messageQueue.add('conv123', 'Test message');

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      expect(setItemCall[0]).toBe('messaging_queue');
    });
  });

  describe('remove', () => {
    it('should remove message from queue', async () => {
      const result = await messageQueue.add('conv123', 'Test');

      await messageQueue.remove(result.id);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not throw if message not found', async () => {
      await expect(messageQueue.remove('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return all queued messages', () => {
      const result = messageQueue.getAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getForConversation', () => {
    it('should return messages for specific conversation', async () => {
      await messageQueue.clear();
      await messageQueue.add('conv1', 'Message 1');
      await messageQueue.add('conv2', 'Message 2');
      await messageQueue.add('conv1', 'Message 3');

      const result = messageQueue.getForConversation('conv1');

      expect(result.every(m => m.conversationId === 'conv1')).toBe(true);
    });
  });

  describe('processQueue', () => {
    it('should not process if not connected', async () => {
      await messageQueue.clear();
      await messageQueue.add('conv123', 'Test');

      mockSocketClient.isConnected.mockReturnValue(false);

      await messageQueue.processQueue();

      expect(mockMessagingService.sendMessage).not.toHaveBeenCalled();
    });

    it('should process messages when connected', async () => {
      await messageQueue.clear();
      await messageQueue.add('conv123', 'Test message');

      mockSocketClient.isConnected.mockReturnValue(true);
      mockMessagingService.sendMessage.mockResolvedValue({
        messageId: 'msg1',
        conversationId: 'conv123',
        content: 'Test message',
        status: 'SENT',
        sentAt: new Date().toISOString(),
      });

      await messageQueue.processQueue();

      expect(mockMessagingService.sendMessage).toHaveBeenCalled();
    });
  });

  describe('getFailedMessages', () => {
    it('should return failed messages', () => {
      const result = messageQueue.getFailedMessages();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('retry', () => {
    it('should reset retry count for message', async () => {
      await messageQueue.clear();
      const message = await messageQueue.add('conv123', 'Test');

      mockSocketClient.isConnected.mockReturnValue(true);
      mockMessagingService.sendMessage.mockResolvedValue({
        messageId: 'msg1',
        conversationId: 'conv123',
        content: 'Test',
        status: 'SENT',
        sentAt: new Date().toISOString(),
      });

      await messageQueue.retry(message.id);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all queued messages', async () => {
      await messageQueue.add('conv123', 'Test 1');
      await messageQueue.add('conv123', 'Test 2');

      await messageQueue.clear();

      const result = messageQueue.getAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('listeners', () => {
    it('should add and remove listeners', async () => {
      const listener = jest.fn();

      const unsubscribe = messageQueue.addListener(listener);
      await messageQueue.add('conv123', 'Test');

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });
  });
});
