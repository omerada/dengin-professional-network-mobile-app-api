package com.meslektas.verification.infrastructure.persistence;

import com.meslektas.verification.domain.model.VerificationId;
import com.meslektas.verification.domain.model.VerificationRequest;
import com.meslektas.verification.domain.model.VerificationStatus;
import com.meslektas.verification.domain.repository.VerificationRequestRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * JPA Repository Implementation for Verification Request
 * 
 * Extends Spring Data JPA for automatic CRUD operations.
 * Custom queries for complex business logic.
 */
@Repository
public interface JpaVerificationRequestRepository extends 
    JpaRepository<VerificationRequest, Long>, 
    VerificationRequestRepository {
    
    /**
     * Find by verification ID (UUID business identifier)
     */
    @Query("SELECT v FROM VerificationRequest v WHERE v.verificationId.value = :#{#verificationId.value}")
    Optional<VerificationRequest> findByVerificationId(@Param("verificationId") VerificationId verificationId);
    
    /**
     * Find by user ID and profession ID
     * Used to check existing verification for user-profession pair
     */
    @Query("SELECT v FROM VerificationRequest v " +
           "WHERE v.userId = :userId " +
           "AND v.professionId = :professionId " +
           "ORDER BY v.submittedAt DESC")
    Optional<VerificationRequest> findByUserIdAndProfessionId(
        @Param("userId") Long userId, 
        @Param("professionId") Long professionId
    );
    
    /**
     * Find all verification requests by user ID
     * Ordered by submission date (newest first)
     */
    @Query("SELECT v FROM VerificationRequest v " +
           "WHERE v.userId = :userId " +
           "ORDER BY v.submittedAt DESC")
    List<VerificationRequest> findByUserIdOrderBySubmittedAtDesc(@Param("userId") Long userId);
    
    /**
     * Find all requests by status
     * Used by admin dashboard
     */
    @Query("SELECT v FROM VerificationRequest v " +
           "WHERE v.status = :status " +
           "ORDER BY v.submittedAt DESC")
    List<VerificationRequest> findByStatus(@Param("status") VerificationStatus status);
    
    /**
     * Find expired requests (not in final state and past expiration date)
     * Used by scheduled job to mark as expired
     */
    @Query("SELECT v FROM VerificationRequest v " +
           "WHERE v.expiresAt < :currentTime " +
           "AND v.status NOT IN ('AUTO_APPROVED', 'AUTO_REJECTED', 'APPROVED', 'REJECTED', 'EXPIRED')")
    List<VerificationRequest> findExpiredRequests(@Param("currentTime") Instant currentTime);
    
    /**
     * Count user's failed attempts for a profession in last 24 hours
     * Used to enforce 24h cooldown between attempts
     */
    @Query("SELECT COUNT(v) FROM VerificationRequest v " +
           "WHERE v.userId = :userId " +
           "AND v.professionId = :professionId " +
           "AND v.submittedAt >= :since " +
           "AND v.status IN ('AUTO_REJECTED', 'REJECTED')")
    int countRecentFailedAttempts(
        @Param("userId") Long userId, 
        @Param("professionId") Long professionId, 
        @Param("since") Instant since
    );
    
    /**
     * Count user's total verification attempts for a profession
     * Used to enforce max 3 attempts rule
     */
    @Query("SELECT COUNT(v) FROM VerificationRequest v " +
           "WHERE v.userId = :userId " +
           "AND v.professionId = :professionId")
    int countTotalAttempts(
        @Param("userId") Long userId, 
        @Param("professionId") Long professionId
    );
    
    /**
     * Check if user has pending or approved verification for profession
     * Used to prevent duplicate verification requests
     */
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END " +
           "FROM VerificationRequest v " +
           "WHERE v.userId = :userId " +
           "AND v.professionId = :professionId " +
           "AND v.status IN :statuses")
    boolean existsByUserIdAndProfessionIdAndStatusIn(
        @Param("userId") Long userId, 
        @Param("professionId") Long professionId, 
        @Param("statuses") List<VerificationStatus> statuses
    );
    
    /**
     * Count all verification requests
     */
    long count();
    
    /**
     * Count by specific status
     */
    @Query("SELECT COUNT(v) FROM VerificationRequest v WHERE v.status = :status")
    long countByStatus(@Param("status") VerificationStatus status);
    
    /**
     * Count by multiple statuses
     */
    @Query("SELECT COUNT(v) FROM VerificationRequest v WHERE v.status IN :statuses")
    long countByStatusIn(@Param("statuses") List<VerificationStatus> statuses);
    
    /**
     * Count submissions after specific timestamp
     */
    @Query("SELECT COUNT(v) FROM VerificationRequest v WHERE v.submittedAt >= :timestamp")
    long countBySubmittedAtAfter(@Param("timestamp") Instant timestamp);
    
    /**
     * Calculate average processing time in minutes for processed requests
     * Only for processed requests (submittedAt and processedAt both not null)
     */
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (processed_at - submitted_at)) / 60.0) " +
           "FROM verification_requests " +
           "WHERE processed_at IS NOT NULL " +
           "AND status IN ('AUTO_APPROVED', 'AUTO_REJECTED', 'APPROVED', 'REJECTED')",
           nativeQuery = true)
    Double calculateAverageProcessingTimeMinutes();
}
