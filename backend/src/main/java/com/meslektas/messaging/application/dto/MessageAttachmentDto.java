package com.meslektas.messaging.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Message Attachment DTO for API responses
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageAttachmentDto {

    private String url;
    private String contentType;
    private Long fileSize;
    private String fileName;

    /**
     * File size in KB for display
     */
    public double getFileSizeKb() {
        return fileSize != null ? fileSize / 1024.0 : 0;
    }
}
