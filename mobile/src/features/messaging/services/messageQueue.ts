// src/features/messaging/services/messageQueue.ts
// Offline mesaj kuyruğu servisi
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { messagingService } from './messagingService';
import { socketClient } from './socketClient';
import type { SendMessageAttachment } from '../types';

const QUEUE_STORAGE_KEY = 'messaging_queue';
const MAX_RETRY_COUNT = 3;

/**
 * Local queued message type for offline storage
 * This differs from the store's QueuedMessage to support full message data
 */
interface LocalQueuedMessage {
  /** Unique queue item ID */
  id: string;
  /** Recipient user UUID */
  recipientId: string;
  /** Message content */
  content: string;
  /** Optional attachment */
  attachment?: SendMessageAttachment;
  /** Creation timestamp */
  createdAt: string;
  /** Number of retry attempts */
  retryCount: number;
}

/**
 * Message Queue Class
 * Offline modda mesajları saklar ve bağlantı kurulunca gönderir
 */
class MessageQueue {
  private queue: LocalQueuedMessage[] = [];
  private isProcessing = false;
  private listeners: Set<(queue: LocalQueuedMessage[]) => void> = new Set();

  /**
   * Kuyruğu yükle
   */
  async load(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch {
      // Storage error - start with empty queue
      this.queue = [];
    }
  }

  /**
   * Kuyruğu kaydet
   */
  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Storage error - continue without persisting
    }
  }

  /**
   * Mesajı kuyruğa ekle
   */
  async add(
    recipientId: string,
    content: string,
    attachment?: SendMessageAttachment,
  ): Promise<LocalQueuedMessage> {
    const message: LocalQueuedMessage = {
      id: `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipientId,
      content,
      attachment,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.queue.push(message);
    await this.save();
    this.notifyListeners();

    // Eğer bağlıysa hemen göndermeyi dene
    if (socketClient.isConnected()) {
      this.processQueue();
    }

    return message;
  }

  /**
   * Mesajı kuyruktan kaldır
   */
  async remove(messageId: string): Promise<void> {
    this.queue = this.queue.filter((m: LocalQueuedMessage) => m.id !== messageId);
    await this.save();
    this.notifyListeners();
  }

  /**
   * Kuyruğu temizle
   */
  async clear(): Promise<void> {
    this.queue = [];
    await this.save();
    this.notifyListeners();
  }

  /**
   * Kuyruğu işle - bekleyen mesajları gönder
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    if (!socketClient.isConnected()) {
      return;
    }

    this.isProcessing = true;

    const toProcess = [...this.queue];

    for (const message of toProcess) {
      try {
        await messagingService.sendMessage({
          recipientId: Number(message.recipientId),
          content: message.content,
          attachment: message.attachment,
        });

        // Başarıyla gönderildi, kuyruktan kaldır
        await this.remove(message.id);
      } catch (error) {
        // Hata durumunda retry count artır
        message.retryCount++;

        if (message.retryCount >= MAX_RETRY_COUNT) {
          // Max retry'a ulaştı, başarısız olarak işaretle
          // UI'da gösterilebilir
          message.retryCount = -1; // Failed marker
          await this.save();
        }
      }
    }

    this.isProcessing = false;
    this.notifyListeners();
  }

  /**
   * Alıcı için bekleyen mesajları getir
   */
  getForRecipient(recipientId: string): LocalQueuedMessage[] {
    return this.queue.filter((m: LocalQueuedMessage) => m.recipientId === recipientId);
  }

  /**
   * Tüm kuyruğu getir
   */
  getAll(): LocalQueuedMessage[] {
    return [...this.queue];
  }

  /**
   * Kuyruk boyutunu getir
   */
  getSize(): number {
    return this.queue.length;
  }

  /**
   * Başarısız mesajları getir
   */
  getFailedMessages(): LocalQueuedMessage[] {
    return this.queue.filter((m: LocalQueuedMessage) => m.retryCount === -1);
  }

  /**
   * Mesajı yeniden dene
   */
  async retry(messageId: string): Promise<void> {
    const message = this.queue.find((m: LocalQueuedMessage) => m.id === messageId);
    if (message) {
      message.retryCount = 0;
      await this.save();
      this.processQueue();
    }
  }

  /**
   * Listener ekle
   */
  addListener(listener: (queue: LocalQueuedMessage[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Listener'ları bilgilendir
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.queue]));
  }
}

export const messageQueue = new MessageQueue();
export default messageQueue;
