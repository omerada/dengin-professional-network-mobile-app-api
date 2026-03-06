package com.dengin.social.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Create Post Request DTO
 * 
 * Validation:
 * - Content: 10-5000 characters
 * - Images: Max 5 URLs
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {
    
    @NotNull(message = "Profession ID is required")
    private Long professionId;
    
    @NotBlank(message = "Content is required")
    @Size(min = 10, max = 5000, message = "Content must be between 10 and 5000 characters")
    private String content;
    
    @Size(max = 5, message = "Maximum 5 images allowed")
    private List<PostImageDto> images;
}
