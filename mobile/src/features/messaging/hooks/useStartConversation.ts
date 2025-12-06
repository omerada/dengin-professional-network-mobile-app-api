// src/features/messaging/hooks/useStartConversation.ts
// Yeni konuşma başlatma hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useCallback, useState } from 'react';
import { messagingService } from '../services';
import { getErrorMessage } from '@core/utils/errorUtils';
import type { SendMessageRequest } from '../types';

/**
 * Yeni konuşma başlatmak için kullanılan hook
 * İlk mesaj gönderilerek yeni konuşma oluşturulur
 */
export function useStartConversation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Yeni konuşma başlat - ilk mesaj göndererek
   * @param recipientId - Alıcının UUID'si
   * @param initialMessage - İlk mesaj (opsiyonel)
   * @returns conversationId
   */
  const startConversation = useCallback(
    async (recipientId: string, initialMessage?: string): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        // İlk mesaj gönderilerek konuşma oluşturulur
        // Backend otomatik olarak konuşma oluşturur veya mevcut olanı bulur
        const message = initialMessage || 'Merhaba!';
        const request: SendMessageRequest = {
          recipientId: Number(recipientId), // Backend Long (number) bekliyor
          content: message,
        };

        const response = await messagingService.sendMessage(request);
        return response.conversationId;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        const error = new Error(errorMessage);
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    startConversation,
    isLoading,
    error,
  };
}

export default useStartConversation;
