package com.dengin.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * WebSocket response for message delivery status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Delivery receipt notification")
public class WsDeliveryReceipt {

    @Schema(description = "Message ID")
    private UUID messageId;

    @Schema(description = "Conversation ID")
    private UUID conversationId;

    @Schema(description = "Delivery status (DELIVERED, FAILED)")
    private String status;

    @Schema(description = "When the message was delivered")
    private LocalDateTime deliveredAt;

    @Schema(description = "Error message if delivery failed")
    private String errorMessage;
}
