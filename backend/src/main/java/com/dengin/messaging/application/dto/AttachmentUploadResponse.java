package com.dengin.messaging.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response containing presigned URL for message attachment upload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Presigned URL response for attachment upload")
public class AttachmentUploadResponse {

    @Schema(description = "Presigned S3 upload URL", example = "https://bucket.s3.region.amazonaws.com/...")
    private String uploadUrl;

    @Schema(description = "S3 key to reference in message", example = "message-attachments/conv-id/file-id.jpg")
    private String s3Key;

    @Schema(description = "URL expiration time in seconds", example = "900")
    private int expiresIn;

    @Schema(description = "Instructions for using the presigned URL")
    private UploadInstructions instructions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadInstructions {
        @Schema(description = "HTTP method to use", example = "PUT")
        private String method;

        @Schema(description = "Required Content-Type header", example = "image/jpeg")
        private String contentType;

        @Schema(description = "Maximum file size in bytes", example = "10485760")
        private long maxFileSize;
    }
}
