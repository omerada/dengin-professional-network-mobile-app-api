package com.meslektas.verification.application.dto;

import com.meslektas.verification.domain.model.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Verification Attempt Response DTO
 * 
 * Represents a single verification attempt in user's history.
 * Used by GET /api/verifications/history endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationAttemptResponse {
    
    private Long id;
    private UUID verificationId;
    private Long professionId;
    private String professionName; // Joined from profession table
    private VerificationStatus status;
    private Integer attemptNumber;
    
    // Timestamps
    private Instant submittedAt;
    private Instant processedAt;
    
    // AI result summary
    private Double aiConfidence;
    private Double faceSimilarity;
    
    // Manual review summary (if applicable)
    private String reviewNotes;
    
    // Helper flags
    private boolean isApproved;
    private boolean isRejected;
    private boolean isPending;
    
    /**
     * Calculate days since submission
     */
    public long getDaysSinceSubmission() {
        return java.time.temporal.ChronoUnit.DAYS.between(submittedAt, Instant.now());
    }
}
