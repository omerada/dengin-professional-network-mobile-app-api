package com.dengin.verification.application.dto;

import com.dengin.verification.domain.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Verification Response DTO
 * 
 * Returns verification request details to client.
 * Sensitive data (S3 keys, AI raw response) excluded from response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationResponse {
    
    private Long id;
    private UUID verificationId;
    private Long userId;
    private Long professionId;
    private VerificationStatus status;
    
    // Image references (S3 keys for download)
    private String documentS3Key;
    private String selfieS3Key;
    
    // Attempt tracking
    private Integer attemptNumber;
    
    // Timestamps
    private Instant submittedAt;
    private Instant processedAt;
    private Instant expiresAt;
    
    // AI results (only confidence scores, no raw data)
    private Double aiConfidence;
    private Double faceSimilarity;
    
    // Manual review (only notes, no admin details for privacy)
    private String manualReviewNotes;
}
