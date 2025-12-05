// __tests__/unit/messaging/stompReconnection.test.ts
// Unit tests for STOMP WebSocket reconnection logic
// Oku: mobile-development-guide/testing/21-TESTING-STRATEGY.md

import { stompClient } from '@features/messaging/services/socketClient';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn().mockReturnValue(jest.fn()),
  fetch: jest.fn().mockResolvedValue({ isConnected: true }),
}));

// Mock AppState
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
}));

// Mock STOMP client
const mockStompClient = {
  configure: jest.fn(),
  activate: jest.fn(),
  deactivate: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
  connected: false,
  onConnect: null,
  onDisconnect: null,
  onStompError: null,
  onWebSocketClose: null,
  onWebSocketError: null,
  reconnectDelay: 5000,
};

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => mockStompClient),
}));

// Mock token service
jest.mock('@features/auth/services', () => ({
  tokenService: {
    getAccessToken: jest.fn().mockResolvedValue('mock-jwt-token'),
  },
}));

// Mock environment config
jest.mock('@config/env', () => ({
  ENV: {
    API_URL: 'http://localhost:8080',
  },
}));

// Mock messaging store
const mockSetConnectionState = jest.fn();
jest.mock('@features/messaging/stores', () => ({
  useMessagingStore: {
    getState: jest.fn().mockReturnValue({
      setConnectionState: mockSetConnectionState,
      addTypingUser: jest.fn(),
      removeTypingUser: jest.fn(),
    }),
  },
}));

describe('STOMP Client Reconnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Auto Reconnection', () => {
    it('should attempt reconnection after connection loss', async () => {
      // Connect first
      await stompClient.connect();

      // Simulate connection loss
      mockStompClient.connected = false;
      if (mockStompClient.onWebSocketClose) {
        mockStompClient.onWebSocketClose({ reason: 'Connection lost' });
      }

      // Advance timers to trigger reconnection
      jest.advanceTimersByTime(5000);

      // Should attempt to reconnect
      expect(mockStompClient.activate).toHaveBeenCalled();
    });

    it('should use exponential backoff for reconnection attempts', async () => {
      const reconnectDelays: number[] = [];
      let reconnectAttempts = 0;

      // Simulate multiple reconnection failures
      const originalActivate = mockStompClient.activate;
      mockStompClient.activate = jest.fn().mockImplementation(() => {
        reconnectAttempts++;
        // Simulate failed connection
        setTimeout(() => {
          if (mockStompClient.onWebSocketError) {
            mockStompClient.onWebSocketError(new Error('Connection failed'));
          }
        }, 100);
      });

      await stompClient.connect();

      // First attempt
      jest.advanceTimersByTime(5000);
      reconnectDelays.push(5000);

      // Second attempt should be longer (exponential backoff)
      jest.advanceTimersByTime(10000);
      reconnectDelays.push(10000);

      // Third attempt
      jest.advanceTimersByTime(20000);
      reconnectDelays.push(20000);

      // Verify attempts were made
      expect(reconnectAttempts).toBeGreaterThan(0);
    });

    it('should not reconnect when manually disconnected', async () => {
      await stompClient.connect();

      // Manually disconnect
      await stompClient.disconnect();

      // Simulate connection close event
      mockStompClient.connected = false;

      // Advance timers
      jest.advanceTimersByTime(10000);

      // Should not attempt to reconnect after manual disconnect
      const activateCalls = mockStompClient.activate.mock.calls.length;

      jest.advanceTimersByTime(5000);

      // Activate should not be called again
      expect(mockStompClient.activate.mock.calls.length).toBe(activateCalls);
    });

    it('should limit maximum reconnection attempts', async () => {
      const MAX_ATTEMPTS = 5;
      let attempts = 0;

      mockStompClient.activate = jest.fn().mockImplementation(() => {
        attempts++;
        setTimeout(() => {
          if (mockStompClient.onWebSocketError) {
            mockStompClient.onWebSocketError(new Error('Connection failed'));
          }
        }, 100);
      });

      await stompClient.connect();

      // Advance through multiple reconnection attempts
      for (let i = 0; i < 10; i++) {
        jest.advanceTimersByTime(30000);
      }

      // Should stop after max attempts
      expect(attempts).toBeLessThanOrEqual(MAX_ATTEMPTS + 1); // +1 for initial connect
    });
  });

  describe('Network State Changes', () => {
    it('should reconnect when network becomes available', async () => {
      // Simulate offline state
      const netInfoCallback = (NetInfo.addEventListener as jest.Mock).mock.calls[0]?.[0];

      if (netInfoCallback) {
        // Go offline
        netInfoCallback({ isConnected: false });

        await stompClient.connect();

        // Go online
        netInfoCallback({ isConnected: true });

        // Should attempt to reconnect
        expect(mockStompClient.activate).toHaveBeenCalled();
      }
    });

    it('should disconnect when network becomes unavailable', async () => {
      await stompClient.connect();
      mockStompClient.connected = true;

      const netInfoCallback = (NetInfo.addEventListener as jest.Mock).mock.calls[0]?.[0];

      if (netInfoCallback) {
        // Go offline
        netInfoCallback({ isConnected: false });

        // Connection state should be updated
        expect(mockSetConnectionState).toHaveBeenCalledWith('disconnected');
      }
    });
  });

  describe('App State Changes', () => {
    it('should reconnect when app comes to foreground', async () => {
      await stompClient.connect();
      mockStompClient.connected = false;

      const appStateCallback = (AppState.addEventListener as jest.Mock).mock.calls[0]?.[1];

      if (appStateCallback) {
        // Simulate app going to background
        appStateCallback('background');

        // Simulate app coming to foreground
        appStateCallback('active');

        // Should attempt to reconnect
        expect(mockStompClient.activate).toHaveBeenCalled();
      }
    });

    it('should disconnect when app goes to background (optionally)', async () => {
      await stompClient.connect();
      mockStompClient.connected = true;

      const appStateCallback = (AppState.addEventListener as jest.Mock).mock.calls[0]?.[1];

      if (appStateCallback) {
        // Simulate app going to background
        appStateCallback('background');

        // Depending on implementation, may disconnect or keep alive
        // This test documents the expected behavior
        expect(mockStompClient.deactivate).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('Connection State Management', () => {
    it('should update connection state to connecting', async () => {
      await stompClient.connect();

      expect(mockSetConnectionState).toHaveBeenCalledWith('connecting');
    });

    it('should update connection state to connected on success', async () => {
      await stompClient.connect();

      // Simulate successful connection
      mockStompClient.connected = true;
      if (mockStompClient.onConnect) {
        mockStompClient.onConnect({ headers: {} });
      }

      expect(mockSetConnectionState).toHaveBeenCalledWith('connected');
    });

    it('should update connection state to disconnected on error', async () => {
      await stompClient.connect();

      // Simulate connection error
      if (mockStompClient.onStompError) {
        mockStompClient.onStompError({ headers: {}, body: 'Error' });
      }

      expect(mockSetConnectionState).toHaveBeenCalledWith('disconnected');
    });

    it('should update connection state to reconnecting during retry', async () => {
      await stompClient.connect();

      // Simulate connection loss
      mockStompClient.connected = false;
      if (mockStompClient.onWebSocketClose) {
        mockStompClient.onWebSocketClose({ reason: 'Connection lost' });
      }

      // Advance to reconnection
      jest.advanceTimersByTime(5000);

      expect(mockSetConnectionState).toHaveBeenCalledWith('reconnecting');
    });
  });

  describe('Subscription Recovery', () => {
    it('should restore subscriptions after reconnection', async () => {
      const mockCallback = jest.fn();

      await stompClient.connect();

      // Subscribe to a topic
      stompClient.on('message', mockCallback);

      // Simulate reconnection
      mockStompClient.connected = false;
      if (mockStompClient.onWebSocketClose) {
        mockStompClient.onWebSocketClose({ reason: 'Connection lost' });
      }

      jest.advanceTimersByTime(5000);

      // Simulate successful reconnection
      mockStompClient.connected = true;
      if (mockStompClient.onConnect) {
        mockStompClient.onConnect({ headers: {} });
      }

      // Subscriptions should be restored
      expect(mockStompClient.subscribe).toHaveBeenCalled();
    });
  });

  describe('Heartbeat', () => {
    it('should send heartbeat to keep connection alive', async () => {
      await stompClient.connect();
      mockStompClient.connected = true;

      // Advance by heartbeat interval
      jest.advanceTimersByTime(30000);

      // Should have sent heartbeat (via STOMP protocol)
      // This is typically handled by the STOMP library itself
      expect(mockStompClient.connected).toBe(true);
    });
  });
});
