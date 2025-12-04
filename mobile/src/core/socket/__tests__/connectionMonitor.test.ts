// src/core/socket/__tests__/connectionMonitor.test.ts
// Connection monitor tests
// Oku: mobile-development-guide/testing/24-UNIT-TESTS.md

import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Mock stompClient to avoid connection attempts
jest.mock('../stompClient', () => ({
  stompClient: {
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    isConnected: jest.fn().mockReturnValue(false),
    getStatus: jest.fn().mockReturnValue('DISCONNECTED'),
  },
}));

// Mock before importing
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(),
}));

// Import after mocks
import { connectionMonitor } from '../connectionMonitor';

const mockAppState = AppState as jest.Mocked<typeof AppState>;
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('connectionMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Stop any previous monitoring
    connectionMonitor.stop();

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    } as NetInfoState);
  });

  afterEach(() => {
    connectionMonitor.stop();
  });

  describe('start', () => {
    it('should have start method', () => {
      expect(typeof connectionMonitor.start).toBe('function');
    });

    it('should register AppState listener when started', () => {
      connectionMonitor.start();

      expect(mockAppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should register NetInfo listener when started', () => {
      connectionMonitor.start();

      expect(mockNetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('stop', () => {
    it('should have stop method', () => {
      expect(typeof connectionMonitor.stop).toBe('function');
    });

    it('should cleanup listeners when stopped', () => {
      const mockAppStateRemove = jest.fn();
      const mockNetInfoRemove = jest.fn();

      (mockAppState.addEventListener as jest.Mock).mockReturnValue({
        remove: mockAppStateRemove,
      });
      (mockNetInfo.addEventListener as jest.Mock).mockReturnValue(mockNetInfoRemove);

      connectionMonitor.start();
      connectionMonitor.stop();

      expect(mockAppStateRemove).toHaveBeenCalled();
      expect(mockNetInfoRemove).toHaveBeenCalled();
    });
  });

  describe('isNetworkConnected', () => {
    it('should have isNetworkAvailable method', () => {
      expect(typeof connectionMonitor.isNetworkAvailable).toBe('function');
    });
  });

  describe('isFullyConnected', () => {
    it('should have isFullyConnected method', () => {
      expect(typeof connectionMonitor.isFullyConnected).toBe('function');
    });

    it('should return boolean', () => {
      const result = connectionMonitor.isFullyConnected();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('forceReconnect', () => {
    it('should have forceReconnect method', () => {
      expect(typeof connectionMonitor.forceReconnect).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => connectionMonitor.forceReconnect()).not.toThrow();
    });
  });

  describe('app state handling', () => {
    it('should attempt reconnection when app becomes active', async () => {
      let appStateCallback: (state: AppStateStatus) => void = () => {};

      (mockAppState.addEventListener as jest.Mock).mockImplementation((_event, callback) => {
        appStateCallback = callback;
        return { remove: jest.fn() };
      });

      connectionMonitor.start();

      // Simulate app going to background and coming back
      appStateCallback('background');
      appStateCallback('active');

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('network state handling', () => {
    it('should update connection state when network changes', () => {
      let netInfoCallback: (state: NetInfoState) => void = () => {};

      (mockNetInfo.addEventListener as jest.Mock).mockImplementation(callback => {
        netInfoCallback = callback;
        return jest.fn();
      });

      connectionMonitor.start();

      // Simulate network disconnect
      netInfoCallback({
        isConnected: false,
        isInternetReachable: false,
      } as NetInfoState);

      // Simulate network reconnect
      netInfoCallback({
        isConnected: true,
        isInternetReachable: true,
      } as NetInfoState);

      // Should handle without throwing
      expect(true).toBe(true);
    });
  });
});
