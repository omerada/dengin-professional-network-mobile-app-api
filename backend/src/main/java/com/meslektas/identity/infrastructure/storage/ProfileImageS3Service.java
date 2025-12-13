package com.meslektas.identity.infrastructure.storage;

import com.meslektas.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * Profile Image S3 Service - Production-Ready
 * 
 * Implements presigned URL pattern for secure, direct S3 uploads.
 * - No file passing through backend (bandwidth optimization)
 * - CloudFront CDN for image serving
 * - IAM role-based security
 * 
 * Architecture:
 * 1. Mobile requests presigned URL
 * 2. Backend generates time-limited presigned URL (5 min)
 * 3. Mobile uploads directly to S3 via presigned URL
 * 4. Mobile confirms upload, backend validates and updates user profile
 * 5. Images served via CloudFront CDN with 1-year cache
 * 
 * References:
 * - Working example: com.meslektas.verification.infrastructure.storage
 * - Mobile pattern: mobile/src/features/verification/services/uploadService.ts
 */
@Slf4j
@Service
public class ProfileImageS3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.profile-images.folder:users}")
    private String profileImagesFolder;

    @Value("${aws.cloudfront.domain:}")
    private String cloudFrontDomain;

    @Value("${aws.s3.presigned-url.expiration:300}")
    private long presignedUrlExpirationSeconds; // Default: 5 minutes

    @Value("${aws.s3.presigned-url-host:}")
    private String presignedUrlHost; // Override for mobile access (e.g., http://192.168.1.101:4566)

    // Allowed content types (production security)
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    // Max file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public ProfileImageS3Service(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    /**
     * Generate presigned URL for avatar upload
     * 
     * @param userId User ID (for S3 key path)
     * @param contentType Image content type (image/jpeg, image/png, image/webp)
     * @return PresignedUrlResponse with URL, S3 key, expiration
     */
    public PresignedUrlResponse generatePresignedUploadUrl(Long userId, String contentType) {
        // Validate content type
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(
                    "Invalid content type. Allowed: image/jpeg, image/png, image/webp",
                    "INVALID_CONTENT_TYPE"
            );
        }

        // Generate unique S3 key: users/{userId}/avatar-{uuid}.{ext}
        String extension = getExtensionFromContentType(contentType);
        String s3Key = String.format("%s/%d/avatar-%s.%s",
                profileImagesFolder,
                userId,
                UUID.randomUUID().toString().substring(0, 8),
                extension
        );

        try {
            // Create presigned PUT request with constraints
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(contentType)
                    .contentLength(MAX_FILE_SIZE) // Enforce max size
                    .metadata(java.util.Map.of(
                            "user-id", userId.toString(),
                            "upload-type", "avatar"
                    ))
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .putObjectRequest(putRequest)
                    .signatureDuration(Duration.ofSeconds(presignedUrlExpirationSeconds))
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

            // Override URL host for mobile access (LocalStack on different network)
            String presignedUrl = presignedRequest.url().toString();
            if (presignedUrlHost != null && !presignedUrlHost.isBlank()) {
                presignedUrl = presignedUrl.replace("http://localhost:4566", presignedUrlHost);
                log.info("Overridden presigned URL host from localhost to {} for mobile access", presignedUrlHost);
            }

            log.info("Generated presigned URL for user {} - Key: {}", userId, s3Key);

            return PresignedUrlResponse.builder()
                    .url(presignedUrl)
                    .key(s3Key)
                    .expiresIn(presignedUrlExpirationSeconds)
                    .contentType(contentType)
                    .maxFileSize(MAX_FILE_SIZE)
                    .build();

        } catch (Exception e) {
            log.error("Failed to generate presigned URL for user {}", userId, e);
            throw new BusinessException(
                    "Failed to generate upload URL: " + e.getMessage(),
                    "PRESIGNED_URL_GENERATION_FAILED"
            );
        }
    }

    /**
     * Confirm upload and get CloudFront URL
     * 
     * Validates that the file was actually uploaded to S3 before
     * returning the CloudFront URL.
     * 
     * @param userId User ID
     * @param s3Key S3 object key returned from presigned URL
     * @return CloudFront CDN URL for the uploaded image
     */
    public String confirmUploadAndGetUrl(Long userId, String s3Key) {
        // Validate S3 key belongs to this user (security check)
        String expectedPrefix = String.format("%s/%d/", profileImagesFolder, userId);
        if (!s3Key.startsWith(expectedPrefix)) {
            log.warn("Security violation: User {} tried to confirm upload for key {}", userId, s3Key);
            throw new BusinessException(
                    "Invalid S3 key for this user",
                    "INVALID_S3_KEY"
            );
        }

        // Verify object exists in S3
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            HeadObjectResponse headResponse = s3Client.headObject(headRequest);

            // Additional validation: Check metadata (optional for LocalStack compatibility)
            String uploadedUserId = headResponse.metadata().get("user-id");
            if (uploadedUserId != null && !userId.toString().equals(uploadedUserId)) {
                log.warn("Metadata mismatch: Expected userId {}, got {}", userId, uploadedUserId);
                throw new BusinessException(
                        "Upload verification failed: metadata mismatch",
                        "UPLOAD_VERIFICATION_FAILED"
                );
            }

            if (uploadedUserId == null) {
                log.debug("No user-id metadata found in S3 object (LocalStack may not preserve metadata from presigned URLs)");
            }

            log.info("Upload confirmed for user {} - Key: {}", userId, s3Key);

            // Return CloudFront URL (or S3 URL if CloudFront not configured)
            return getCloudFrontUrl(s3Key);

        } catch (NoSuchKeyException e) {
            log.error("Upload verification failed: Object not found in S3 - Key: {}", s3Key);
            throw new BusinessException(
                    "Upload failed or file not found in storage",
                    "UPLOAD_NOT_FOUND"
            );
        } catch (S3Exception e) {
            log.error("S3 error during upload confirmation for key {}", s3Key, e);
            throw new BusinessException(
                    "Failed to verify upload: " + e.getMessage(),
                    "S3_VERIFICATION_FAILED"
            );
        }
    }

    /**
     * Delete old avatar from S3
     * 
     * @param avatarUrl Current avatar URL (can be S3 or CloudFront URL)
     */
    public void deleteAvatar(String avatarUrl) {
        if (avatarUrl == null || avatarUrl.isBlank()) {
            return; // Nothing to delete
        }

        try {
            String s3Key = extractKeyFromUrl(avatarUrl);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteRequest);

            log.info("Deleted avatar from S3: {}", s3Key);

        } catch (Exception e) {
            // Don't fail if deletion fails (old avatar cleanup is not critical)
            log.warn("Failed to delete old avatar: {}", avatarUrl, e);
        }
    }

    /**
     * Get CloudFront CDN URL for S3 key
     * 
     * If CloudFront is configured, returns CloudFront URL.
     * Otherwise, returns S3 direct URL (not recommended for production).
     */
    private String getCloudFrontUrl(String s3Key) {
        if (cloudFrontDomain != null && !cloudFrontDomain.isBlank()) {
            // CloudFront URL: https://d1234abcd.cloudfront.net/users/{userId}/avatar-{uuid}.jpg
            return String.format("https://%s/%s", cloudFrontDomain, s3Key);
        } else {
            // Fallback to S3 direct URL (for dev/test environments)
            log.warn("CloudFront domain not configured, using S3 direct URL (not recommended for production)");
            
            // Use presignedUrlHost if configured (for LocalStack/dev), otherwise use standard S3 URL
            if (presignedUrlHost != null && !presignedUrlHost.isBlank()) {
                // LocalStack path-style URL: http://192.168.1.101:4566/bucket/key
                return String.format("%s/%s/%s", presignedUrlHost, bucketName, s3Key);
            } else {
                // Standard S3 URL: https://bucket.s3.amazonaws.com/key
                return String.format("https://%s.s3.amazonaws.com/%s", bucketName, s3Key);
            }
        }
    }

    /**
     * Extract S3 key from URL (handles both S3 and CloudFront URLs)
     */
    private String extractKeyFromUrl(String url) {
        if (url.contains(cloudFrontDomain)) {
            // CloudFront URL: https://d1234.cloudfront.net/users/{userId}/avatar.jpg
            return url.substring(url.indexOf(cloudFrontDomain) + cloudFrontDomain.length() + 1);
        } else if (url.contains(".s3.")) {
            // S3 URL: https://bucket.s3.region.amazonaws.com/users/{userId}/avatar.jpg
            return url.substring(url.indexOf(bucketName) + bucketName.length() + 1);
        } else {
            throw new BusinessException("Invalid avatar URL format", "INVALID_URL");
        }
    }

    /**
     * Get file extension from content type
     */
    private String getExtensionFromContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }

    /**
     * DTO: Presigned URL Response
     */
    @lombok.Builder
    @lombok.Data
    public static class PresignedUrlResponse {
        private String url;           // Presigned URL for PUT request
        private String key;            // S3 object key
        private Long expiresIn;        // Expiration in seconds
        private String contentType;    // Expected content type
        private Long maxFileSize;      // Max allowed file size in bytes
    }
}
