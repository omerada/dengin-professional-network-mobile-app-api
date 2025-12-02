package com.meslektas.common.storage;

import com.meslektas.common.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

/**
 * AWS S3 Storage Implementation
 * 
 * Used for production environment.
 * Stores files in AWS S3 bucket.
 * 
 * Active when profile: prod
 */
@Slf4j
@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public S3StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Upload file to S3
     */
    @Override
    public String upload(MultipartFile file, String folder) {
        try {
            String key = generateKey(folder, file.getOriginalFilename());

            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(
                    putRequest,
                    RequestBody.fromBytes(file.getBytes())
            );

            log.info("File uploaded to S3: {}/{}", bucketName, key);

            return getPublicUrl(key);

        } catch (IOException e) {
            log.error("Failed to upload file to S3", e);
            throw new BusinessException(
                    "Failed to upload file: " + e.getMessage(),
                    "FILE_UPLOAD_FAILED"
            );
        }
    }

    /**
     * Delete file from S3
     */
    @Override
    public void delete(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);

            log.info("File deleted from S3: {}/{}", bucketName, key);

        } catch (Exception e) {
            log.error("Failed to delete file from S3", e);
            throw new BusinessException(
                    "Failed to delete file: " + e.getMessage(),
                    "FILE_DELETE_FAILED"
            );
        }
    }

    /**
     * Get public URL for S3 object
     */
    @Override
    public String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }

    /**
     * Check if object exists in S3
     */
    @Override
    public boolean exists(String key) {
        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    /**
     * Generate unique S3 key
     */
    private String generateKey(String folder, String originalFilename) {
        String extension = FilenameUtils.getExtension(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return String.format("%s/%s.%s", folder, uuid, extension);
    }

    /**
     * Extract key from S3 URL
     */
    private String extractKeyFromUrl(String url) {
        // Extract key from S3 URL
        // Format: https://bucket.s3.region.amazonaws.com/key
        String[] parts = url.split(bucketName + ".s3." + region + ".amazonaws.com/");
        if (parts.length > 1) {
            return parts[1];
        }
        return url;
    }
}
