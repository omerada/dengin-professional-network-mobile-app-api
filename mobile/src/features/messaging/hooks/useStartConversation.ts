// src/features/messaging/hooks/useStartConversation.ts
// Yeni konuşma başlatma hook'u
// Oku: mobile-development-guide/sprints/26-SPRINT-7-8.md

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { messagingService } from '../services';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import type { Conversation, StartConversationDto } from '../types';

/**
 * Yeni konuşma başlatma hook'u
 */
export function useStartConversation() {
  const queryClient = useQueryClient();
  const navigation = useNavigation();

  return useMutation<Conversation, Error, StartConversationDto>({
    mutationFn: async (dto) => {
      // Önce mevcut konuşmayı kontrol et
      const existing = await messagingService.findConversationWithUser(dto.participantId);
      if (existing) {
        return existing;
      }

      // Yoksa yeni oluştur
      return messagingService.startConversation(dto);
    },
    onSuccess: (conversation) => {
      // Konuşma listesini güncelle
      queryClient.invalidateQueries({ queryKey: [CONVERSATIONS_QUERY_KEY] });

      // Chat ekranına git
      navigation.navigate('Chat' as never, {
        conversationId: conversation.id,
        participantName: conversation.participants[0]?.name,
      } as never);
    },
  });
}

export default useStartConversation;
