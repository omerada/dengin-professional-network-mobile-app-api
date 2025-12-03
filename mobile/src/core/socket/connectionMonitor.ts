// src/core/socket/connectionMonitor.ts
// Connection monitor for WebSocket
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import NetInfo, { NetInfoSubscription, NetInfoState } from '@react-native-community/netinfo';
import { stompClient } from './stompClient';
import { SocketStatus } from './types';

/**
 * Connection Monitor
 * Monitors app state and network changes to manage WebSocket connection
 */
class ConnectionMonitor {
  private appStateSubscription: NativeEventSubscription | null = null;
  private netInfoSubscription: NetInfoSubscription | null = null;
  private isMonitoring = false;
  private lastAppState: AppStateStatus = 'active';
  private isNetworkConnected = true;

  /**
   * Start monitoring connection
   */
  start(): void {
    if (this.isMonitoring) {
      console.log('[ConnectionMonitor] Already monitoring');
      return;
    }

    this.isMonitoring = true;

    // Monitor app state changes
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this),
    );

    // Monitor network state changes
    this.netInfoSubscription = NetInfo.addEventListener(
      this.handleNetInfoChange.bind(this),
    );

    console.log('[ConnectionMonitor] Started');
  }

  /**
   * Stop monitoring connection
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.appStateSubscription?.remove();
    this.appStateSubscription = null;

    this.netInfoSubscription?.();
    this.netInfoSubscription = null;

    this.isMonitoring = false;
    console.log('[ConnectionMonitor] Stopped');
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    console.log('[ConnectionMonitor] App state changed:', this.lastAppState, '->', nextAppState);

    // App came to foreground
    if (
      (this.lastAppState === 'inactive' || this.lastAppState === 'background') &&
      nextAppState === 'active'
    ) {
      this.handleAppForeground();
    }

    // App went to background
    if (
      this.lastAppState === 'active' &&
      (nextAppState === 'inactive' || nextAppState === 'background')
    ) {
      this.handleAppBackground();
    }

    this.lastAppState = nextAppState;
  }

  /**
   * Handle app coming to foreground
   */
  private handleAppForeground(): void {
    console.log('[ConnectionMonitor] App came to foreground');

    // Reconnect if disconnected and network is available
    if (!stompClient.isConnected() && this.isNetworkConnected) {
      console.log('[ConnectionMonitor] Reconnecting socket...');
      stompClient.connect();
    }
  }

  /**
   * Handle app going to background
   */
  private handleAppBackground(): void {
    console.log('[ConnectionMonitor] App went to background');
    // Keep connection alive in background for now
    // Could implement disconnect logic here if needed to save battery
  }

  /**
   * Handle network state changes
   */
  private handleNetInfoChange(state: NetInfoState): void {
    const wasConnected = this.isNetworkConnected;
    this.isNetworkConnected = state.isConnected ?? false;

    console.log('[ConnectionMonitor] Network state changed:', {
      isConnected: this.isNetworkConnected,
      type: state.type,
      isInternetReachable: state.isInternetReachable,
    });

    // Network restored
    if (!wasConnected && this.isNetworkConnected) {
      this.handleNetworkRestored();
    }

    // Network lost
    if (wasConnected && !this.isNetworkConnected) {
      this.handleNetworkLost();
    }
  }

  /**
   * Handle network restored
   */
  private handleNetworkRestored(): void {
    console.log('[ConnectionMonitor] Network restored');

    // Reconnect socket if not connected
    if (!stompClient.isConnected()) {
      console.log('[ConnectionMonitor] Reconnecting socket after network restore...');
      stompClient.connect();
    }
  }

  /**
   * Handle network lost
   */
  private handleNetworkLost(): void {
    console.log('[ConnectionMonitor] Network lost');
    // Socket will handle disconnect automatically
    // Messages will be queued by messageQueue
  }

  /**
   * Get current network status
   */
  isNetworkAvailable(): boolean {
    return this.isNetworkConnected;
  }

  /**
   * Get current socket status
   */
  getSocketStatus(): SocketStatus {
    return stompClient.getStatus();
  }

  /**
   * Check if fully connected (network + socket)
   */
  isFullyConnected(): boolean {
    return this.isNetworkConnected && stompClient.isConnected();
  }

  /**
   * Force reconnect
   */
  async forceReconnect(): Promise<void> {
    console.log('[ConnectionMonitor] Force reconnecting...');
    stompClient.disconnect();
    await stompClient.connect();
  }
}

// Export singleton instance
export const connectionMonitor = new ConnectionMonitor();
export default connectionMonitor;
