package com.dengin.verification.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Verification Eligibility Response DTO
 * 
 * Returns whether user can submit verification for a profession.
 * Used by GET /api/verifications/check/{professionId} endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationEligibilityResponse {
    
    private boolean canSubmit;
    private int remainingAttempts;
    private int totalAttempts;
    private int maxAttempts; // Always 3
    
    private String message;
    private String reason;
    
    // Cooldown info (if applicable)
    private boolean cooldownActive;
    private Long cooldownEndsInSeconds;
    
    /**
     * Factory method for eligible user
     */
    public static VerificationEligibilityResponse eligible(int remainingAttempts, int totalAttempts) {
        return VerificationEligibilityResponse.builder()
            .canSubmit(true)
            .remainingAttempts(remainingAttempts)
            .totalAttempts(totalAttempts)
            .maxAttempts(3)
            .message("You can submit verification for this profession")
            .cooldownActive(false)
            .build();
    }
    
    /**
     * Factory method for ineligible user (max attempts reached)
     */
    public static VerificationEligibilityResponse maxAttemptsReached() {
        return VerificationEligibilityResponse.builder()
            .canSubmit(false)
            .remainingAttempts(0)
            .totalAttempts(3)
            .maxAttempts(3)
            .message("Maximum verification attempts reached")
            .reason("You have used all 3 verification attempts for this profession")
            .cooldownActive(false)
            .build();
    }
    
    /**
     * Factory method for cooldown active
     */
    public static VerificationEligibilityResponse cooldownActive(long cooldownEndsInSeconds) {
        return VerificationEligibilityResponse.builder()
            .canSubmit(false)
            .remainingAttempts(0)
            .totalAttempts(0)
            .maxAttempts(3)
            .message("Cooldown period active")
            .reason("You must wait 24 hours after a failed verification attempt")
            .cooldownActive(true)
            .cooldownEndsInSeconds(cooldownEndsInSeconds)
            .build();
    }
    
    /**
     * Factory method for already verified
     */
    public static VerificationEligibilityResponse alreadyVerified() {
        return VerificationEligibilityResponse.builder()
            .canSubmit(false)
            .remainingAttempts(0)
            .totalAttempts(0)
            .maxAttempts(3)
            .message("Already verified")
            .reason("You already have an approved verification for this profession")
            .cooldownActive(false)
            .build();
    }
}
