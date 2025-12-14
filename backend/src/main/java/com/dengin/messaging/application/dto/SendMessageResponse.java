package com.dengin.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response after sending a message
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageResponse {

    private UUID messageId;
    private UUID conversationId;
    private String content;
    private MessageAttachmentDto attachment;
    private String status;
    private Instant sentAt;
}
