package com.dengin.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * WebSocket request/response for read receipts
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Read receipt notification")
public class WsReadReceipt {

    @NotNull(message = "Conversation ID is required")
    @Schema(description = "Conversation ID")
    private UUID conversationId;

    @Schema(description = "User ID who read the messages (Long for internal use)")
    private Long readerId;

    @Schema(description = "User UUID who read the messages (for client)")
    private UUID readByUserId;

    @Schema(description = "Last read message ID")
    private UUID lastReadMessageId;

    @Schema(description = "Number of messages marked as read")
    private int messagesRead;

    @Schema(description = "When the messages were read")
    private LocalDateTime readAt;
}
