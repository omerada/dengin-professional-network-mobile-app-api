package com.dengin.messaging.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request for generating a presigned URL for message attachment upload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to generate presigned upload URL for message attachment")
public class AttachmentUploadRequest {

    @NotNull(message = "Conversation ID is required")
    @Schema(description = "Conversation ID (optional for new conversations)", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID conversationId;

    @NotBlank(message = "File name is required")
    @Schema(description = "Original file name", example = "photo.jpg")
    private String fileName;

    @NotBlank(message = "Content type is required")
    @Pattern(regexp = "^image/(jpeg|jpg|png|gif|webp)$", message = "Only image files are allowed (JPEG, PNG, GIF, WebP)")
    @Schema(description = "MIME type of the file", example = "image/jpeg")
    private String contentType;

    @NotNull(message = "File size is required")
    @Schema(description = "File size in bytes", example = "1024000")
    private Long fileSize;
}
