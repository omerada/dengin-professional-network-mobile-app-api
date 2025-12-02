package com.meslektas.verification.domain.model;

/**
 * Verification Status Enum
 * 
 * State Machine:
 * PENDING → AI_PROCESSING → AUTO_APPROVED
 *        → AI_PROCESSING → PENDING_MANUAL_REVIEW → APPROVED/REJECTED
 *        → AI_PROCESSING → AUTO_REJECTED
 * 
 * Business Rules:
 * - Only PENDING can transition to AI_PROCESSING
 * - AI_PROCESSING can auto-decide or route to manual review
 * - Manual review is final decision
 */
public enum VerificationStatus {
    
    /**
     * Initial state - request submitted, waiting for AI processing
     */
    PENDING,
    
    /**
     * AI processing in progress (Rekognition face comparison + OCR)
     */
    AI_PROCESSING,
    
    /**
     * AI confidence >= 85% → Auto-approved without manual review
     */
    AUTO_APPROVED,
    
    /**
     * AI confidence < 60% → Auto-rejected
     */
    AUTO_REJECTED,
    
    /**
     * AI confidence 60-84% → Requires manual admin review
     */
    PENDING_MANUAL_REVIEW,
    
    /**
     * Admin approved after manual review
     */
    APPROVED,
    
    /**
     * Admin rejected after manual review
     */
    REJECTED,
    
    /**
     * Request expired (7 days without processing)
     */
    EXPIRED;
    
    /**
     * Check if verification is in a final state
     */
    public boolean isFinal() {
        return this == AUTO_APPROVED 
            || this == AUTO_REJECTED 
            || this == APPROVED 
            || this == REJECTED 
            || this == EXPIRED;
    }
    
    /**
     * Check if verification needs manual review
     */
    public boolean needsManualReview() {
        return this == PENDING_MANUAL_REVIEW;
    }
    
    /**
     * Check if verification is successful
     */
    public boolean isApproved() {
        return this == AUTO_APPROVED || this == APPROVED;
    }
    
    /**
     * Check if verification failed
     */
    public boolean isRejected() {
        return this == AUTO_REJECTED || this == REJECTED;
    }
}
