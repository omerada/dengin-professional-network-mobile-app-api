package com.meslektas.verification.domain.model;

import com.meslektas.common.domain.ValueObject;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Confidence Score Value Object
 * 
 * Represents AI verification confidence (0-100%)
 * 
 * Business Rules:
 * - >= 85%: Auto-approve
 * - 60-84%: Manual review required
 * - < 60%: Auto-reject
 */
@Embeddable
@Getter
@EqualsAndHashCode
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ConfidenceScore implements ValueObject {
    
    @Column(name = "confidence_score")
    private Double value; // 0.0 to 100.0
    
    private ConfidenceScore(Double value) {
        if (value == null) {
            throw new IllegalArgumentException("Confidence score cannot be null");
        }
        if (value < 0.0 || value > 100.0) {
            throw new IllegalArgumentException(
                "Confidence score must be between 0 and 100, got: " + value
            );
        }
        this.value = value;
    }
    
    public static ConfidenceScore of(Double value) {
        return new ConfidenceScore(value);
    }
    
    /**
     * Check if score is high enough for auto-approval
     */
    public boolean isAutoApprovalThreshold() {
        return value >= 85.0;
    }
    
    /**
     * Check if score requires manual review
     */
    public boolean needsManualReview() {
        return value >= 60.0 && value < 85.0;
    }
    
    /**
     * Check if score is too low (auto-reject)
     */
    public boolean isAutoRejectThreshold() {
        return value < 60.0;
    }
    
    /**
     * Get verification decision based on score
     */
    public VerificationDecision getDecision() {
        if (isAutoApprovalThreshold()) {
            return VerificationDecision.AUTO_APPROVE;
        } else if (needsManualReview()) {
            return VerificationDecision.MANUAL_REVIEW;
        } else {
            return VerificationDecision.AUTO_REJECT;
        }
    }
    
    @Override
    public String toString() {
        return String.format("%.2f%%", value);
    }
    
    /**
     * Verification decision enum
     */
    public enum VerificationDecision {
        AUTO_APPROVE,
        AUTO_REJECT,
        MANUAL_REVIEW
    }
}
