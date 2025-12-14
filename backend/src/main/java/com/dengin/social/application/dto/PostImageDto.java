package com.dengin.social.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Post Image DTO
 * 
 * Represents image metadata for post creation.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostImageDto {
    
    @NotBlank(message = "S3 key is required")
    private String s3Key;
    
    @NotBlank(message = "URL is required")
    private String url;
    
    private Integer width;
    
    private Integer height;
    
    private Long fileSize;
}
