package com.dengin.messaging.application.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for message search result.
 */
@Value
@Builder
public class MessageSearchResult {

    UUID messageId;
    UUID conversationId;
    UUID senderId;
    String senderName;
    String content;
    String contentHighlight; // Content with search terms highlighted
    LocalDateTime sentAt;
    double relevanceScore;

    // Participant info for navigation
    ParticipantInfo otherParticipant;

    @Value
    @Builder
    public static class ParticipantInfo {
        UUID userId;
        String firstName;
        String lastName;
        String profileImageUrl;
    }
}
