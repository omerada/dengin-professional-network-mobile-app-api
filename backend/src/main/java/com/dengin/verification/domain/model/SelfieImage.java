package com.dengin.verification.domain.model;

import com.dengin.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Selfie Image Value Object
 * 
 * Represents user's selfie photo for face comparison.
 * Used by AWS Rekognition to match with document photo.
 * 
 * Business Rules:
 * - Max file size: 5MB
 * - Only image formats: JPG, PNG
 * - Must contain visible face
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SelfieImage implements ValueObject {
    
    @Column(name = "selfie_s3_key", length = 500)
    private String s3Key;
    
    @Column(name = "selfie_file_name", length = 255)
    private String fileName;
    
    @Column(name = "selfie_content_type", length = 100)
    private String contentType;
    
    @Column(name = "selfie_file_size")
    private Long fileSizeBytes;
    
    private SelfieImage(String s3Key, String fileName, String contentType, Long fileSizeBytes) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new IllegalArgumentException("S3 key cannot be null or empty");
        }
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name cannot be null or empty");
        }
        if (!isValidContentType(contentType)) {
            throw new IllegalArgumentException(
                "Invalid content type: " + contentType + ". Selfie must be image/jpeg or image/png"
            );
        }
        if (fileSizeBytes == null || fileSizeBytes <= 0) {
            throw new IllegalArgumentException("File size must be greater than 0");
        }
        if (fileSizeBytes > 5 * 1024 * 1024) { // 5MB
            throw new IllegalArgumentException(
                "Selfie size exceeds maximum allowed size of 5MB"
            );
        }
        
        this.s3Key = s3Key;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
    }
    
    public static SelfieImage of(String s3Key, String fileName, String contentType, Long fileSizeBytes) {
        return new SelfieImage(s3Key, fileName, contentType, fileSizeBytes);
    }
    
    private static boolean isValidContentType(String contentType) {
        if (contentType == null) {
            return false;
        }
        // Only allow images for selfie (no PDF)
        return contentType.equals("image/jpeg") || contentType.equals("image/png");
    }
    
    @Override
    public String toString() {
        return String.format("SelfieImage[%s, %s, %d bytes]", fileName, contentType, fileSizeBytes);
    }
}
