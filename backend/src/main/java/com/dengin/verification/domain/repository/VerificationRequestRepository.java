package com.dengin.verification.domain.repository;

import com.dengin.verification.domain.model.VerificationId;
import com.dengin.verification.domain.model.VerificationRequest;
import com.dengin.verification.domain.model.VerificationStatus;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Verification Request Repository Interface
 * 
 * Domain repository for verification request aggregate.
 * Infrastructure layer will provide JPA implementation.
 */
public interface VerificationRequestRepository {
    
    /**
     * Save verification request (create or update)
     */
    VerificationRequest save(VerificationRequest verificationRequest);
    
    /**
     * Find by verification ID
     */
    Optional<VerificationRequest> findByVerificationId(VerificationId verificationId);
    
    /**
     * Find by database ID
     */
    Optional<VerificationRequest> findById(Long id);
    
    /**
     * Find by user ID and profession ID
     * Used to check if user already has pending verification for this profession
     */
    Optional<VerificationRequest> findByUserIdAndProfessionId(Long userId, Long professionId);
    
    /**
     * Find all verification requests by user ID
     * Ordered by submission date (newest first)
     */
    List<VerificationRequest> findByUserIdOrderBySubmittedAtDesc(Long userId);
    
    /**
     * Find pending manual review requests
     * Used by admin dashboard
     */
    List<VerificationRequest> findByStatus(VerificationStatus status);
    
    /**
     * Find expired requests (not in final state and past expiration date)
     * Used by scheduled job to mark as expired
     */
    List<VerificationRequest> findExpiredRequests(Instant currentTime);
    
    /**
     * Count user's failed attempts for a profession in last 24 hours
     * Used to enforce 24h cooldown between attempts
     */
    int countRecentFailedAttempts(Long userId, Long professionId, Instant since);
    
    /**
     * Count user's total verification attempts for a profession
     * Used to enforce max 3 attempts rule
     */
    int countTotalAttempts(Long userId, Long professionId);
    
    /**
     * Find last failed attempt timestamp for cooldown calculation
     */
    Instant findLastFailedAttemptTime(Long userId, Long professionId);
    
    /**
     * Check if user has pending or approved verification for profession
     */
    boolean existsByUserIdAndProfessionIdAndStatusIn(
        Long userId, 
        Long professionId, 
        List<VerificationStatus> statuses
    );
    
    /**
     * Statistics queries - count by status
     */
    long count();
    long countByStatus(VerificationStatus status);
    long countByStatusIn(List<VerificationStatus> statuses);
    long countBySubmittedAtAfter(Instant timestamp);
    
    /**
     * Calculate average processing time in minutes
     * Used for admin dashboard statistics
     */
    Double calculateAverageProcessingTimeMinutes();
    
    /**
     * Delete verification request (for testing/cleanup)
     */
    void delete(VerificationRequest verificationRequest);
}
