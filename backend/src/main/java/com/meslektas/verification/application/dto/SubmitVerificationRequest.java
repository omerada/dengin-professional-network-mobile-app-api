package com.meslektas.verification.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Submit Verification Request DTO
 * 
 * User submits verification with:
 * - Profession to verify
 * - Document image (already uploaded to S3)
 * - Selfie image (already uploaded to S3)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitVerificationRequest {
    
    @NotNull(message = "Profession ID is required")
    @Positive(message = "Profession ID must be positive")
    private Long professionId;
    
    // Document image metadata (already uploaded to S3)
    @NotBlank(message = "Document S3 key is required")
    private String documentS3Key;
    
    @NotBlank(message = "Document file name is required")
    private String documentFileName;
    
    @NotBlank(message = "Document content type is required")
    private String documentContentType;
    
    @NotNull(message = "Document file size is required")
    @Positive(message = "Document file size must be positive")
    private Long documentFileSize;
    
    // Selfie image metadata (already uploaded to S3)
    @NotBlank(message = "Selfie S3 key is required")
    private String selfieS3Key;
    
    @NotBlank(message = "Selfie file name is required")
    private String selfieFileName;
    
    @NotBlank(message = "Selfie content type is required")
    private String selfieContentType;
    
    @NotNull(message = "Selfie file size is required")
    @Positive(message = "Selfie file size must be positive")
    private Long selfieFileSize;
}
