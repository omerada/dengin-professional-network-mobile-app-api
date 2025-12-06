package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Message DTO for API responses
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {

    private UUID messageId;
    private UUID conversationId;
    private Long senderId; // Changed from UUID to Long - User entity ID
    private String senderName;
    private String senderProfileImageUrl;
    private String content;
    private MessageAttachmentDto attachment;
    private String status;
    private boolean read;
    private boolean sentByMe;
    private Instant sentAt;
    private Instant readAt;
}
