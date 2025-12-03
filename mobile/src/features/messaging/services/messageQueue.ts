// src/features/messaging/services/messageQueue.ts
// Offline mesaj kuyruğu servisi
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import { messagingService } from './messagingService';
import { socketClient } from './socketClient';
import type { QueuedMessage, MessageType } from '../types';

const QUEUE_STORAGE_KEY = 'messaging_queue';
const MAX_RETRY_COUNT = 3;

/**
 * Message Queue Class
 * Offline modda mesajları saklar ve bağlantı kurulunca gönderir
 */
class MessageQueue {
  private queue: QueuedMessage[] = [];
  private isProcessing = false;
  private listeners: Set<(queue: QueuedMessage[]) => void> = new Set();

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
    conversationId: string,
    content: string,
    type: MessageType = 'text' as MessageType,
    attachmentIds?: string[],
    replyToId?: string
  ): Promise<QueuedMessage> {
    const message: QueuedMessage = {
      id: `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      content,
      type,
      attachmentIds,
      replyToId,
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
    this.queue = this.queue.filter((m) => m.id !== messageId);
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
          conversationId: message.conversationId,
          content: message.content,
          type: message.type,
          attachmentIds: message.attachmentIds,
          replyToId: message.replyToId,
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
   * Konuşma için bekleyen mesajları getir
   */
  getForConversation(conversationId: string): QueuedMessage[] {
    return this.queue.filter((m) => m.conversationId === conversationId);
  }

  /**
   * Tüm kuyruğu getir
   */
  getAll(): QueuedMessage[] {
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
  getFailedMessages(): QueuedMessage[] {
    return this.queue.filter((m) => m.retryCount === -1);
  }

  /**
   * Mesajı yeniden dene
   */
  async retry(messageId: string): Promise<void> {
    const message = this.queue.find((m) => m.id === messageId);
    if (message) {
      message.retryCount = 0;
      await this.save();
      this.processQueue();
    }
  }

  /**
   * Listener ekle
   */
  addListener(listener: (queue: QueuedMessage[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Listener'ları bilgilendir
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.queue]));
  }
}

export const messageQueue = new MessageQueue();
export default messageQueue;
