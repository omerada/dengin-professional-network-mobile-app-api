package com.dengin.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Conversation DTO for API responses (conversation list view)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {

    private UUID conversationId;
    private ParticipantDto participant;
    private LastMessageDto lastMessage;
    private int unreadCount;
    private Instant updatedAt;
    private Instant createdAt;
}
