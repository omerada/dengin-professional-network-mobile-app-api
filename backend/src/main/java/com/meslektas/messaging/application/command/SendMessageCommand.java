package com.meslektas.messaging.application.command;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Command to send a message to another user.
 * 
 * Business Rules:
 * - Sender must be verified
 * - Recipient must not have blocked sender
 * - Content: 1-2000 characters
 * - Max 1 attachment per message
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageCommand {
    
    @NotNull(message = "Recipient ID is required")
    private UUID recipientId;
    
    @Size(min = 1, max = 2000, message = "Message content must be between 1 and 2000 characters")
    private String content;
    
    private AttachmentData attachment;
    
    /**
     * Attachment data for message
     */
    @Getter
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
    
    /**
     * Validate that at least content or attachment is provided
     */
    public boolean hasContent() {
        return content != null && !content.isBlank();
    }
    
    public boolean hasAttachment() {
        return attachment != null && attachment.getS3Key() != null;
    }
    
    public void validate() {
        if (!hasContent() && !hasAttachment()) {
            throw new IllegalArgumentException("Message must have content or attachment");
        }
    }
}
