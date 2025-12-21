package com.dengin.social.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Post Image (Value Object)
 * 
 * Represents an image attached to a post.
 * Stored in S3, only metadata in database.
 */
@Embeddable
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode
@Getter
public class PostImage {
    
    @Column(name = "s3_key", nullable = false)
    private String s3Key;
    
    @Column(name = "url", nullable = false)
    private String url;
    
    @Column(name = "width")
    private Integer width;
    
    @Column(name = "height")
    private Integer height;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    private PostImage(String s3Key, String url, Integer width, Integer height, Long fileSize) {
        if (s3Key == null || s3Key.isBlank()) {
            throw new IllegalArgumentException("S3 key cannot be empty");
        }
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Image URL cannot be empty");
        }
        
        this.s3Key = s3Key;
        this.url = url;
        this.width = width;
        this.height = height;
        this.fileSize = fileSize;
    }
    
    /**
     * Create PostImage with full metadata
     */
    public static PostImage of(
        String s3Key, 
        String url, 
        Integer width, 
        Integer height, 
        Long fileSize
    ) {
        return new PostImage(s3Key, url, width, height, fileSize);
    }
    
    /**
     * Create PostImage with minimal metadata
     */
    public static PostImage of(String s3Key, String url) {
        return new PostImage(s3Key, url, null, null, null);
    }
    
    /**
     * Check if image is large (> 2MB)
     */
    public boolean isLarge() {
        return fileSize != null && fileSize > 2_000_000;
    }
    
    @Override
    public String toString() {
        return String.format("PostImage(s3Key=%s, size=%d)", s3Key, fileSize);
    }
}
