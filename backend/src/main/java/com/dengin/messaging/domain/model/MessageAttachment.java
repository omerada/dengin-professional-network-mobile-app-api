package com.dengin.messaging.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Message Attachment Value Object
 * 
 * Immutable value object representing an image attachment in a message.
 * 
 * Business Rules:
 * - Only images are supported (jpg, png, gif, webp)
 * - Max file size: 10MB
 * - S3 key is required for storage
 * - URL is required for display
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@EqualsAndHashCode
public class MessageAttachment {

    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Column(name = "attachment_s3_key")
    private String s3Key;

    @Column(name = "attachment_url")
    private String url;

    @Column(name = "attachment_content_type")
    private String contentType;

    @Column(name = "attachment_file_size")
    private Long fileSize;

    @Column(name = "attachment_file_name")
    private String fileName;

    private MessageAttachment(String s3Key, String url, String contentType, Long fileSize, String fileName) {
        this.s3Key = s3Key;
        this.url = url;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.fileName = fileName;
    }

    /**
     * Create a new message attachment with validation
     * 
     * @param s3Key       S3 storage key
     * @param url         Public URL for the attachment
     * @param contentType MIME type of the file
     * @param fileSize    Size in bytes
     * @param fileName    Original file name
     * @return MessageAttachment value object
     * @throws IllegalArgumentException if validation fails
     */
    public static MessageAttachment of(
            String s3Key,
            String url,
            String contentType,
            Long fileSize,
            String fileName) {
        validateS3Key(s3Key);
        validateUrl(url);
        validateContentType(contentType);
        validateFileSize(fileSize);
        validateFileName(fileName);

        return new MessageAttachment(s3Key, url, contentType, fileSize, fileName);
    }

    /**
     * Create a simple attachment with just S3 key and URL
     */
    public static MessageAttachment of(String s3Key, String url) {
        validateS3Key(s3Key);
        validateUrl(url);

        return new MessageAttachment(s3Key, url, null, null, null);
    }

    private static void validateS3Key(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new IllegalArgumentException("Attachment S3 key cannot be null or blank");
        }
    }

    private static void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Attachment URL cannot be null or blank");
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new IllegalArgumentException("Attachment URL must be a valid HTTP(S) URL");
        }
    }

    private static void validateContentType(String contentType) {
        if (contentType != null && !contentType.isBlank()) {
            if (!isValidImageType(contentType)) {
                throw new IllegalArgumentException(
                        "Only image attachments are supported (jpg, png, gif, webp)");
            }
        }
    }

    private static void validateFileSize(Long fileSize) {
        if (fileSize != null) {
            if (fileSize <= 0) {
                throw new IllegalArgumentException("File size must be positive");
            }
            if (fileSize > MAX_FILE_SIZE) {
                throw new IllegalArgumentException(
                        String.format("File size cannot exceed %d bytes (10MB)", MAX_FILE_SIZE));
            }
        }
    }

    private static void validateFileName(String fileName) {
        if (fileName != null && fileName.isBlank()) {
            throw new IllegalArgumentException("File name cannot be blank");
        }
    }

    private static boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp");
    }

    /**
     * Check if this is an image attachment
     */
    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }

    /**
     * Get file size in kilobytes
     */
    public Long getFileSizeKb() {
        return fileSize != null ? fileSize / 1024 : null;
    }

    /**
     * Get file size in megabytes
     */
    public Double getFileSizeMb() {
        return fileSize != null ? fileSize / (1024.0 * 1024.0) : null;
    }

    @Override
    public String toString() {
        return String.format("MessageAttachment{fileName='%s', contentType='%s', size=%dKB}",
                fileName, contentType, getFileSizeKb());
    }
}
