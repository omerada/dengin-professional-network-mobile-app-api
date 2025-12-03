package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Last Message DTO for conversation list view
 * 
 * Shows preview of the last message in conversation list.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LastMessageDto {

    /**
     * Message content preview (truncated if too long)
     */
    private String content;

    /**
     * Whether the message has an attachment
     */
    private boolean hasAttachment;

    /**
     * Whether the last message was sent by the current user
     */
    private boolean sentByMe;

    /**
     * Whether the message has been read
     */
    private boolean read;

    /**
     * When the message was sent
     */
    private Instant sentAt;
}
