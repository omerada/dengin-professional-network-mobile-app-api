package com.meslektas.messaging.application.command;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Command to mark messages as read in a conversation.
 * 
 * Business Rules:
 * - Only recipient can mark messages as read
 * - Can mark all unread messages or up to a specific message
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarkMessagesReadCommand {

    @NotNull(message = "Conversation ID is required")
    private UUID conversationId;

    /**
     * If provided, marks all messages up to and including this message as read.
     * If null, marks all unread messages as read.
     */
    private UUID lastReadMessageId;
}
