package com.meslektas.messaging.infrastructure.websocket.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * WebSocket request for sending a message via STOMP
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "WebSocket message send request")
public class WsSendMessageRequest {
    
    @NotNull(message = "Recipient ID is required")
    @Schema(description = "UUID of the message recipient")
    private UUID recipientId;
    
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    @Schema(description = "Message text content")
    private String content;
    
    @Schema(description = "Optional attachment data")
    private AttachmentData attachment;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Attachment data")
    public static class AttachmentData {
        private String s3Key;
        private String url;
        private String contentType;
        private Long fileSize;
        private String fileName;
    }
}
