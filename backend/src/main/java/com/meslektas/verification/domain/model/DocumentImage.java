package com.meslektas.verification.domain.model;

import com.meslektas.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Document Image Value Object
 * 
 * Represents uploaded verification document (diploma, ID card, license)
 * Stores S3 key and metadata.
 * 
 * Business Rules:
 * - Max file size: 10MB
 * - Allowed formats: JPG, PNG, PDF
 * - Must contain valid S3 key
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentImage implements ValueObject {
    
    @Column(name = "document_s3_key", length = 500)
    private String s3Key;
    
    @Column(name = "document_file_name", length = 255)
    private String fileName;
    
    @Column(name = "document_content_type", length = 100)
    private String contentType;
    
    @Column(name = "document_file_size")
    private Long fileSizeBytes;
    
    private DocumentImage(String s3Key, String fileName, String contentType, Long fileSizeBytes) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new IllegalArgumentException("S3 key cannot be null or empty");
        }
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name cannot be null or empty");
        }
        if (!isValidContentType(contentType)) {
            throw new IllegalArgumentException(
                "Invalid content type: " + contentType + ". Allowed: image/jpeg, image/png, application/pdf"
            );
        }
        if (fileSizeBytes == null || fileSizeBytes <= 0) {
            throw new IllegalArgumentException("File size must be greater than 0");
        }
        if (fileSizeBytes > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException(
                "File size exceeds maximum allowed size of 10MB"
            );
        }
        
        this.s3Key = s3Key;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSizeBytes = fileSizeBytes;
    }
    
    public static DocumentImage of(String s3Key, String fileName, String contentType, Long fileSizeBytes) {
        return new DocumentImage(s3Key, fileName, contentType, fileSizeBytes);
    }
    
    private static boolean isValidContentType(String contentType) {
        if (contentType == null) {
            return false;
        }
        return contentType.equals("image/jpeg") 
            || contentType.equals("image/png") 
            || contentType.equals("application/pdf");
    }
    
    /**
     * Check if document is an image (not PDF)
     */
    public boolean isImage() {
        return contentType.startsWith("image/");
    }
    
    /**
     * Check if document is PDF
     */
    public boolean isPdf() {
        return contentType.equals("application/pdf");
    }
    
    @Override
    public String toString() {
        return String.format("DocumentImage[%s, %s, %d bytes]", fileName, contentType, fileSizeBytes);
    }
}
