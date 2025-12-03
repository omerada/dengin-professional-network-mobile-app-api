// src/core/socket/messageQueue.ts
// Offline message queue for WebSocket
// Oku: mobile-development-guide/core/13-REAL-TIME.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SocketMessage } from './types';

const QUEUE_KEY = '@socket:message_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_COUNT = 3;

/**
 * Message Queue for offline support
 * Stores messages when offline and sends them when connection is restored
 */
class MessageQueue {
  private queue: SocketMessage[] = [];
  private isLoaded = false;

  /**
   * Load queue from storage
   */
  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('[MessageQueue] Failed to load:', error);
      this.queue = [];
      this.isLoaded = true;
    }
  }

  /**
   * Save queue to storage
   */
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[MessageQueue] Failed to save:', error);
    }
  }

  /**
   * Add message to queue
   */
  async add(message: SocketMessage): Promise<void> {
    await this.load();

    // Remove old messages if queue is full
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    this.queue.push(message);
    await this.save();
  }

  /**
   * Remove message from queue
   */
  async remove(messageId: string): Promise<void> {
    await this.load();
    this.queue = this.queue.filter((m) => m.id !== messageId);
    await this.save();
  }

  /**
   * Get all messages in queue (excluding failed ones)
   */
  getAll(): SocketMessage[] {
    return this.queue.filter((m) => !m.retry || m.retry < MAX_RETRY_COUNT);
  }

  /**
   * Get queue size
   */
  size(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.save();
  }

  /**
   * Increment retry count for a message
   */
  async incrementRetry(messageId: string): Promise<void> {
    await this.load();
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.retry = (message.retry || 0) + 1;
      await this.save();
    }
  }

  /**
   * Get failed messages (exceeded max retry)
   */
  getFailedMessages(): SocketMessage[] {
    return this.queue.filter((m) => m.retry && m.retry >= MAX_RETRY_COUNT);
  }

  /**
   * Reset retry count for a message
   */
  async resetRetry(messageId: string): Promise<void> {
    await this.load();
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.retry = 0;
      await this.save();
    }
  }
}

// Export singleton instance
export const messageQueue = new MessageQueue();
export default messageQueue;
