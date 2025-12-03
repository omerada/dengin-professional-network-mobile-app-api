// src/core/socket/__tests__/messageQueue.test.ts
// Offline message queue tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import AsyncStorage from '@react-native-async-storage/async-storage';

// Must mock before importing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

import { messageQueue } from '../messageQueue';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('messageQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('add', () => {
    it('should add message to queue', async () => {
      const message = {
        id: 'client-123',
        destination: '/app/chat.send',
        body: {
          conversationId: 'conv1',
          content: 'Hello',
        },
        timestamp: Date.now(),
      };

      await messageQueue.add(message);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('message_queue'),
        expect.any(String)
      );
    });

    it('should include timestamp when adding', async () => {
      const message = {
        id: 'client-456',
        destination: '/app/chat.send',
        body: {
          conversationId: 'conv1',
          content: 'Test',
        },
        timestamp: Date.now(),
      };

      await messageQueue.add(message);

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);

      expect(storedData).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'client-456',
            destination: '/app/chat.send',
            timestamp: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe('remove', () => {
    it('should remove message from queue by id', async () => {
      const existingQueue = [
        {
          id: 'client-123',
          destination: '/app/chat.send',
          body: { conversationId: 'conv1', content: 'Hello' },
          timestamp: Date.now(),
        },
        {
          id: 'client-456',
          destination: '/app/chat.send',
          body: { conversationId: 'conv1', content: 'World' },
          timestamp: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingQueue));

      await messageQueue.remove('client-123');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('message_queue'),
        expect.any(String)
      );

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);

      expect(storedData).toHaveLength(1);
      expect(storedData[0].id).toBe('client-456');
    });
  });

  describe('getAll', () => {
    it('should return all queued messages', () => {
      // getAll is synchronous and uses in-memory cache
      const result = messageQueue.getAll();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('incrementRetry', () => {
    it('should increment retry count for a message', async () => {
      const existingQueue = [
        {
          id: 'client-123',
          destination: '/app/chat.send',
          body: { conversationId: 'conv1', content: 'Hello' },
          timestamp: Date.now(),
          retry: 0,
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingQueue));

      await messageQueue.incrementRetry('client-123');

      const setItemCall = mockAsyncStorage.setItem.mock.calls[0];
      const storedData = JSON.parse(setItemCall[1]);

      expect(storedData[0].retry).toBe(1);
    });

    it('should handle non-existent message gracefully', async () => {
      const existingQueue = [
        {
          id: 'client-123',
          destination: '/app/chat.send',
          body: { conversationId: 'conv1', content: 'Hello' },
          timestamp: Date.now(),
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingQueue));

      await expect(messageQueue.incrementRetry('non-existent')).resolves.not.toThrow();
    });
  });

  describe('persistence', () => {
    it('should use correct storage key', async () => {
      const message = {
        id: 'client-789',
        destination: '/app/chat.send',
        body: { conversationId: 'conv1', content: 'Test' },
        timestamp: Date.now(),
      };

      await messageQueue.add(message);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@socket:message_queue',
        expect.any(String)
      );
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      const message = {
        id: 'client-error',
        destination: '/app/chat.send',
        body: { conversationId: 'conv1', content: 'Test' },
        timestamp: Date.now(),
      };

      // Should not throw
      await expect(messageQueue.add(message)).resolves.not.toThrow();
    });
  });
});
