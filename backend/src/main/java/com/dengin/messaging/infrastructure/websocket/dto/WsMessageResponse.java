package com.dengin.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * WebSocket response containing a message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "WebSocket message response")
public class WsMessageResponse {

    @Schema(description = "Message ID")
    private UUID messageId;

    @Schema(description = "Conversation ID")
    private UUID conversationId;

    @Schema(description = "Sender user ID")
    private Long senderId;

    @Schema(description = "Recipient user ID")
    private Long recipientId;

    @Schema(description = "Message content")
    private String content;

    @Schema(description = "Optional attachment")
    private AttachmentData attachment;

    @Schema(description = "Message status (SENT, DELIVERED, READ)")
    private String status;
    
    @Schema(description = "Whether the message was sent by the current user")
    private boolean sentByMe;

    @Schema(description = "When the message was sent")
    private Instant sentAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentData {
        private String s3Key;
        private String url;
        private String contentType;
        private Long fileSize;
        private String fileName;
    }
}
