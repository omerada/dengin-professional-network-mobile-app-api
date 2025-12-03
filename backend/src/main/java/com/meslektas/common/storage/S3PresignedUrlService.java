package com.meslektas.common.storage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;

/**
 * S3 Presigned URL Service
 * 
 * Generates presigned URLs for direct client uploads and downloads.
 * Used for message attachments to allow client-side S3 uploads without
 * passing through the server.
 * 
 * Flow:
 * 1. Client requests upload URL from server
 * 2. Server generates presigned PUT URL with expiry
 * 3. Client uploads directly to S3 using presigned URL
 * 4. Client sends message with S3 key to server
 * 5. Server validates key and saves message
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class S3PresignedUrlService {
    
    private final S3Presigner s3Presigner;
    
    @Value("${aws.s3.bucket}")
    private String bucketName;
    
    @Value("${aws.s3.presigned-url-expiration:15}")
    private int presignedUrlExpirationMinutes;
    
    /**
     * Generate presigned URL for uploading a message attachment.
     * 
     * @param conversationId The conversation ID for organizing files
     * @param fileName Original filename (for extension extraction)
     * @param contentType MIME type of the file
     * @return PresignedUploadUrl containing URL and S3 key
     */
    public PresignedUploadUrl generateUploadUrl(
            UUID conversationId,
            String fileName,
            String contentType
    ) {
        // Generate unique S3 key
        String extension = getExtension(fileName);
        String s3Key = String.format(
            "message-attachments/%s/%s%s",
            conversationId,
            UUID.randomUUID(),
            extension
        );
        
        // Build presigned PUT request
        PutObjectRequest putRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(s3Key)
            .contentType(contentType)
            .build();
        
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
            .putObjectRequest(putRequest)
            .build();
        
        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);
        
        log.info("Generated presigned upload URL for conversation {}, key: {}", 
            conversationId, s3Key);
        
        return PresignedUploadUrl.builder()
            .uploadUrl(presignedRequest.url().toString())
            .s3Key(s3Key)
            .expiresIn(presignedUrlExpirationMinutes * 60) // seconds
            .build();
    }
    
    /**
     * Generate presigned URL for downloading an attachment.
     * 
     * @param s3Key The S3 key of the file
     * @return Presigned download URL
     */
    public String generateDownloadUrl(String s3Key) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(s3Key)
            .build();
        
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(presignedUrlExpirationMinutes))
            .getObjectRequest(getRequest)
            .build();
        
        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        
        log.debug("Generated presigned download URL for key: {}", s3Key);
        
        return presignedRequest.url().toString();
    }
    
    /**
     * Validate that an S3 key is within allowed message attachment path.
     * 
     * @param s3Key The S3 key to validate
     * @param conversationId The conversation ID the attachment should belong to
     * @return true if valid
     */
    public boolean isValidAttachmentKey(String s3Key, UUID conversationId) {
        if (s3Key == null || s3Key.isBlank()) {
            return false;
        }
        
        // Check prefix matches expected path
        String expectedPrefix = "message-attachments/" + conversationId + "/";
        return s3Key.startsWith(expectedPrefix);
    }
    
    /**
     * Get file extension from filename.
     */
    private String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        int lastDot = fileName.lastIndexOf(".");
        return fileName.substring(lastDot).toLowerCase();
    }
    
    /**
     * Presigned upload URL response
     */
    @lombok.Value
    @lombok.Builder
    public static class PresignedUploadUrl {
        String uploadUrl;
        String s3Key;
        int expiresIn; // seconds
    }
}
