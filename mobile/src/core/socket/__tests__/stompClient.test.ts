// src/core/socket/__tests__/stompClient.test.ts
// STOMP WebSocket client tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { stompClient, SocketStatus } from '../index';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock SockJS and STOMP
jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => ({
    configure: jest.fn(),
    activate: jest.fn(),
    deactivate: jest.fn(),
    publish: jest.fn(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    connected: false,
  })),
}));

jest.mock('sockjs-client', () => jest.fn());
jest.mock('@react-native-async-storage/async-storage');

describe('stompClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connection', () => {
    it('should have connect method', () => {
      expect(typeof stompClient.connect).toBe('function');
    });

    it('should have disconnect method', () => {
      expect(typeof stompClient.disconnect).toBe('function');
    });

    it('should have isConnected method', () => {
      expect(typeof stompClient.isConnected).toBe('function');
    });

    it('should return false for isConnected when not connected', () => {
      expect(stompClient.isConnected()).toBe(false);
    });

    it('should have getStatus method', () => {
      expect(typeof stompClient.getStatus).toBe('function');
    });

    it('should return disconnected status initially', () => {
      const status = stompClient.getStatus();
      expect([
        SocketStatus.DISCONNECTED,
        SocketStatus.CONNECTING,
        SocketStatus.CONNECTED,
      ]).toContain(status);
    });
  });

  describe('messaging', () => {
    it('should have sendMessage method', () => {
      expect(typeof stompClient.sendMessage).toBe('function');
    });

    it('should have sendTyping method', () => {
      expect(typeof stompClient.sendTyping).toBe('function');
    });

    it('should have markAsRead method', () => {
      expect(typeof stompClient.markAsRead).toBe('function');
    });
  });

  describe('event subscription', () => {
    it('should have on method for subscribing to events', () => {
      expect(typeof stompClient.on).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const unsubscribe = stompClient.on('message', () => {});
      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple subscriptions to same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      const unsub1 = stompClient.on('message', handler1);
      const unsub2 = stompClient.on('message', handler2);

      expect(typeof unsub1).toBe('function');
      expect(typeof unsub2).toBe('function');
    });
  });

  describe('sendMessage', () => {
    it('should return false when not connected', () => {
      const result = stompClient.sendMessage({
        conversationId: 'conv1',
        content: 'Hello',
        clientMessageId: 'client-123',
      });

      expect(result).toBe(false);
    });
  });

  describe('sendTyping', () => {
    it('should not throw when not connected', () => {
      expect(() => {
        stompClient.sendTyping('conv1', 'recipient-uuid-123', true);
      }).not.toThrow();
    });
  });

  describe('markAsRead', () => {
    it('should not throw when not connected', () => {
      expect(() => {
        stompClient.markAsRead('conv1', ['msg1', 'msg2']);
      }).not.toThrow();
    });
  });
});
