package com.meslektas.messaging.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Send Message Request DTO
 * 
 * Validation:
 * - Content: 1-2000 characters (if no attachment)
 * - Either content or attachment required
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    
    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;
    
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String content;
    
    private AttachmentDto attachment;
    
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentDto {
        private String s3Key;
        private String url;
        private String contentType;
        private Long fileSize;
        private String fileName;
    }
}
