package com.meslektas.social.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Add Comment Request DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentRequest {
    
    @NotBlank(message = "Comment content is required")
    @Size(min = 1, max = 500, message = "Comment must be between 1 and 500 characters")
    private String content;
}
