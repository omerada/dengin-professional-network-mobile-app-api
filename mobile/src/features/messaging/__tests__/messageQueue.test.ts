// src/features/messaging/__tests__/messageQueue.test.ts
// Message queue unit tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { messageQueue } from '../services/messageQueue';
import { socketClient } from '../services/socketClient';
import type { QueuedMessage } from '../types';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../services/socketClient');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockSocketClient = socketClient as jest.Mocked<typeof socketClient>;

describe('messageQueue', () => {
  const createQueuedMessage = (overrides?: Partial<QueuedMessage>): QueuedMessage => ({
    id: 'msg-' + Math.random().toString(36).substr(2, 9),
    conversationId: 'conv123',
    content: 'Test message',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockSocketClient.isConnected.mockReturnValue(false);
  });

  describe('add', () => {
    it('should add message to queue', async () => {
      const message = createQueuedMessage();

      await messageQueue.add(message);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should persist queue to AsyncStorage', async () => {
      const message = createQueuedMessage();

      await messageQueue.add(message);

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      expect(setItemCall[0]).toBe('@meslektas/message_queue');
      
      const storedQueue = JSON.parse(setItemCall[1]);
      expect(storedQueue).toHaveLength(1);
      expect(storedQueue[0].id).toBe(message.id);
    });
  });

  describe('remove', () => {
    it('should remove message from queue', async () => {
      const message = createQueuedMessage();

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([message]));

      await messageQueue.remove(message.id);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedQueue = JSON.parse(setItemCall[1]);
      expect(storedQueue).toHaveLength(0);
    });

    it('should not throw if message not found', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

      await expect(messageQueue.remove('non-existent')).resolves.not.toThrow();
    });
  });

  describe('getAll', () => {
    it('should return all queued messages', async () => {
      const messages = [
        createQueuedMessage({ id: 'msg1' }),
        createQueuedMessage({ id: 'msg2' }),
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(messages));

      const result = await messageQueue.getAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg1');
      expect(result[1].id).toBe('msg2');
    });

    it('should return empty array if no messages', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await messageQueue.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getByConversation', () => {
    it('should return messages for specific conversation', async () => {
      const messages = [
        createQueuedMessage({ id: 'msg1', conversationId: 'conv1' }),
        createQueuedMessage({ id: 'msg2', conversationId: 'conv2' }),
        createQueuedMessage({ id: 'msg3', conversationId: 'conv1' }),
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(messages));

      const result = await messageQueue.getByConversation('conv1');

      expect(result).toHaveLength(2);
      expect(result.every(m => m.conversationId === 'conv1')).toBe(true);
    });
  });

  describe('processQueue', () => {
    it('should process all messages when connected', async () => {
      const messages = [
        createQueuedMessage({ id: 'msg1' }),
        createQueuedMessage({ id: 'msg2' }),
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));
      mockSocketClient.isConnected.mockReturnValue(true);
      mockSocketClient.emit.mockResolvedValue(undefined);

      await messageQueue.processQueue();

      expect(mockSocketClient.emit).toHaveBeenCalledTimes(2);
    });

    it('should not process if not connected', async () => {
      const messages = [createQueuedMessage()];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));
      mockSocketClient.isConnected.mockReturnValue(false);

      await messageQueue.processQueue();

      expect(mockSocketClient.emit).not.toHaveBeenCalled();
    });

    it('should increment retry count on failure', async () => {
      const message = createQueuedMessage({ retryCount: 0 });

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([message]));
      mockSocketClient.isConnected.mockReturnValue(true);
      mockSocketClient.emit.mockRejectedValueOnce(new Error('Send failed'));

      await messageQueue.processQueue();

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedQueue = JSON.parse(setItemCall[1]);
      expect(storedQueue[0].retryCount).toBe(1);
    });

    it('should remove message after max retries', async () => {
      const message = createQueuedMessage({ retryCount: 2 }); // Max is 3

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([message]));
      mockSocketClient.isConnected.mockReturnValue(true);
      mockSocketClient.emit.mockRejectedValueOnce(new Error('Send failed'));

      await messageQueue.processQueue();

      // Message should be moved to failed queue
      const setItemCalls = mockAsyncStorage.setItem.mock.calls;
      const failedQueueCall = setItemCalls.find(call => call[0].includes('failed'));
      expect(failedQueueCall).toBeDefined();
    });
  });

  describe('getFailedMessages', () => {
    it('should return failed messages', async () => {
      const failedMessages = [
        createQueuedMessage({ id: 'failed1', retryCount: 3 }),
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(failedMessages));

      const result = await messageQueue.getFailedMessages();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('failed1');
    });
  });

  describe('retryFailed', () => {
    it('should move failed message back to queue', async () => {
      const failedMessage = createQueuedMessage({ id: 'failed1', retryCount: 3 });

      // First call for failed queue
      mockAsyncStorage.getItem
        .mockResolvedValueOnce(JSON.stringify([failedMessage]))
        // Second call for main queue
        .mockResolvedValueOnce(JSON.stringify([]));

      await messageQueue.retryFailed(failedMessage.id);

      // Check that setItem was called to update both queues
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all queued messages', async () => {
      await messageQueue.clear();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@meslektas/message_queue');
    });
  });

  describe('clearFailed', () => {
    it('should clear all failed messages', async () => {
      await messageQueue.clearFailed();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@meslektas/message_queue_failed');
    });
  });
});
