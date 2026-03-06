package com.dengin.verification.domain.service;

import com.dengin.verification.domain.model.VerificationStatus;
import com.dengin.verification.domain.repository.VerificationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

/**
 * Verification Attempt Policy Domain Service
 * 
 * Enforces business rules:
 * - Max 3 verification attempts per profession
 * - 24-hour cooldown between failed attempts
 * - No duplicate pending/approved verifications
 * 
 * This is a domain service (not application service) because:
 * - Logic involves multiple aggregates (VerificationRequest + historical attempts)
 * - Business rules are domain-specific, not application workflow
 */
@Service
@RequiredArgsConstructor
public class VerificationAttemptPolicy {
    
    private static final int MAX_ATTEMPTS = 3;
    private static final int COOLDOWN_HOURS = 24;
    
    private final VerificationRequestRepository repository;
    
    /**
     * Check if user can submit new verification request
     * 
     * @param userId User ID
     * @param professionId Profession ID
     * @return Validation result
     */
    public ValidationResult canSubmitVerification(Long userId, Long professionId) {
        // Rule 1: Cannot have existing pending or approved verification
        List<VerificationStatus> blockingStatuses = Arrays.asList(
            VerificationStatus.PENDING,
            VerificationStatus.AI_PROCESSING,
            VerificationStatus.PENDING_MANUAL_REVIEW,
            VerificationStatus.AUTO_APPROVED,
            VerificationStatus.APPROVED
        );
        
        if (repository.existsByUserIdAndProfessionIdAndStatusIn(userId, professionId, blockingStatuses)) {
            return ValidationResult.failure(
                "You already have a pending or approved verification for this profession"
            );
        }
        
        // Rule 2: Max 3 total attempts
        int totalAttempts = repository.countTotalAttempts(userId, professionId);
        if (totalAttempts >= MAX_ATTEMPTS) {
            return ValidationResult.failure(
                "You have reached the maximum number of verification attempts (3) for this profession"
            );
        }
        
        // Rule 3: 24-hour cooldown after failed attempt
        Instant cooldownStart = Instant.now().minus(COOLDOWN_HOURS, ChronoUnit.HOURS);
        int recentFailedAttempts = repository.countRecentFailedAttempts(userId, professionId, cooldownStart);
        
        if (recentFailedAttempts > 0) {
            return ValidationResult.failure(
                "You must wait 24 hours after a failed verification attempt before trying again"
            );
        }
        
        return ValidationResult.success();
    }
    
    /**
     * Calculate next attempt number for user-profession pair
     * 
     * @param userId User ID
     * @param professionId Profession ID
     * @return Next attempt number (1, 2, or 3)
     */
    public int getNextAttemptNumber(Long userId, Long professionId) {
        int totalAttempts = repository.countTotalAttempts(userId, professionId);
        return totalAttempts + 1;
    }
    
    /**
     * Check if user has remaining attempts
     * 
     * @param userId User ID
     * @param professionId Profession ID
     * @return true if user can still attempt verification
     */
    public boolean hasRemainingAttempts(Long userId, Long professionId) {
        int totalAttempts = repository.countTotalAttempts(userId, professionId);
        return totalAttempts < MAX_ATTEMPTS;
    }
    
    /**
     * Get remaining attempts count
     * 
     * @param userId User ID
     * @param professionId Profession ID
     * @return Number of remaining attempts (0-3)
     */
    public int getRemainingAttempts(Long userId, Long professionId) {
        int totalAttempts = repository.countTotalAttempts(userId, professionId);
        return Math.max(0, MAX_ATTEMPTS - totalAttempts);
    }
    
    /**
     * Validation result
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        
        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }
        
        public static ValidationResult success() {
            return new ValidationResult(true, null);
        }
        
        public static ValidationResult failure(String errorMessage) {
            return new ValidationResult(false, errorMessage);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
