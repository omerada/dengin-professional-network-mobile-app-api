package com.meslektas.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * WebSocket request for typing indicator
 * Note: recipientId uses Long (database ID) instead of UUID for compatibility
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Typing indicator notification")
public class WsTypingNotification {

    @NotNull(message = "Conversation ID is required")
    @Schema(description = "Conversation ID")
    private UUID conversationId;

    @NotNull(message = "Recipient ID is required")
    @Schema(description = "Recipient user ID (Long database ID)")
    private Long recipientId;

    @Schema(description = "Whether user is currently typing")
    private boolean isTyping;
}
