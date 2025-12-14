package com.dengin.verification.domain.model;

import com.dengin.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Manual Review Result Value Object
 * 
 * Encapsulates admin's manual review decision.
 * Used when AI confidence is 60-84% (requires human verification).
 * 
 * Immutable once created.
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ManualReviewResult implements ValueObject {
    
    /**
     * Admin user ID who performed the review
     */
    @Column(name = "reviewed_by_admin_id")
    private Long reviewedByAdminId;
    
    /**
     * Admin's decision: true = approved, false = rejected
     */
    @Column(name = "manual_review_approved")
    private Boolean approved;
    
    /**
     * Admin's review notes/reason
     */
    @Column(name = "manual_review_notes", columnDefinition = "TEXT")
    private String notes;
    
    /**
     * When the manual review was completed
     */
    @Column(name = "reviewed_at")
    private Instant reviewedAt;
    
    public static ManualReviewResult approve(Long adminId, String notes) {
        if (adminId == null) {
            throw new IllegalArgumentException("Admin ID cannot be null");
        }
        
        return new ManualReviewResult(
            adminId,
            true,
            notes,
            Instant.now()
        );
    }
    
    public static ManualReviewResult reject(Long adminId, String notes) {
        if (adminId == null) {
            throw new IllegalArgumentException("Admin ID cannot be null");
        }
        if (notes == null || notes.isBlank()) {
            throw new IllegalArgumentException("Rejection notes are required");
        }
        
        return new ManualReviewResult(
            adminId,
            false,
            notes,
            Instant.now()
        );
    }
    
    /**
     * Check if review decision was approval
     */
    public boolean isApproved() {
        return Boolean.TRUE.equals(approved);
    }
    
    /**
     * Check if review decision was rejection
     */
    public boolean isRejected() {
        return Boolean.FALSE.equals(approved);
    }
    
    @Override
    public String toString() {
        String decision = isApproved() ? "APPROVED" : "REJECTED";
        return String.format(
            "ManualReview[%s by Admin#%d at %s]",
            decision,
            reviewedByAdminId,
            reviewedAt
        );
    }
}
