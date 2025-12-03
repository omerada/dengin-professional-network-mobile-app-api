package com.meslektas.messaging.application.command;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Command to delete a message.
 * 
 * Business Rules:
 * - Only message sender can delete their message
 * - Message is soft-deleted (marked as deleted, not physically removed)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeleteMessageCommand {

    @NotNull(message = "Message ID is required")
    private UUID messageId;

    @NotNull(message = "Conversation ID is required")
    private UUID conversationId;
}
