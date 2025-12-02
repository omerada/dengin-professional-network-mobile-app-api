package com.meslektas.verification.domain.model;

import com.meslektas.common.domain.AggregateRoot;
import com.meslektas.verification.domain.event.*;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Verification Request Aggregate Root
 * 
 * Encapsulates professional verification process:
 * 1. User submits document + selfie
 * 2. AI processes (AWS Rekognition face comparison + OCR)
 * 3. Auto-decision or manual review based on confidence
 * 
 * Business Rules:
 * - Max 3 attempts per user
 * - 24h cooldown between failed attempts
 * - AI confidence >= 85%: Auto-approve
 * - AI confidence 60-84%: Manual review
 * - AI confidence < 60%: Auto-reject
 * - Requests expire after 7 days if not processed
 */
@Entity
@Table(name = "verification_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VerificationRequest extends AggregateRoot {
    
    @Embedded
    private VerificationId verificationId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "profession_id", nullable = false)
    private Long professionId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private VerificationStatus status;
    
    @Embedded
    private DocumentImage documentImage;
    
    @Embedded
    private SelfieImage selfieImage;
    
    @Embedded
    private AIVerificationResult aiResult;
    
    @Embedded
    private ManualReviewResult manualReviewResult;
    
    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;
    
    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;
    
    @Column(name = "processed_at")
    private Instant processedAt;
    
    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
    
    // Factory method
    private VerificationRequest(
        Long userId,
        Long professionId,
        DocumentImage documentImage,
        SelfieImage selfieImage,
        Integer attemptNumber
    ) {
        this.verificationId = VerificationId.generate();
        this.userId = userId;
        this.professionId = professionId;
        this.documentImage = documentImage;
        this.selfieImage = selfieImage;
        this.attemptNumber = attemptNumber;
        this.status = VerificationStatus.PENDING;
        this.submittedAt = Instant.now();
        this.expiresAt = this.submittedAt.plus(7, ChronoUnit.DAYS);
    }
    
    /**
     * Publish submitted event after entity is persisted
     * Called by application service after save()
     */
    public void publishSubmittedEvent() {
        if (getId() == null) {
            throw new IllegalStateException("Cannot publish event before entity is persisted");
        }
        
        registerEvent(new VerificationSubmittedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            this.documentImage.getS3Key(),
            this.selfieImage.getS3Key()
        ));
    }
    
    /**
     * Create new verification request
     * 
     * @param userId User ID
     * @param professionId Profession to verify
     * @param documentImage Document image (diploma, ID, license)
     * @param selfieImage User's selfie photo
     * @param attemptNumber Current attempt number (1, 2, or 3)
     * @return New verification request
     */
    public static VerificationRequest create(
        Long userId,
        Long professionId,
        DocumentImage documentImage,
        SelfieImage selfieImage,
        Integer attemptNumber
    ) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        if (professionId == null) {
            throw new IllegalArgumentException("Profession ID cannot be null");
        }
        if (documentImage == null) {
            throw new IllegalArgumentException("Document image cannot be null");
        }
        if (selfieImage == null) {
            throw new IllegalArgumentException("Selfie image cannot be null");
        }
        if (attemptNumber == null || attemptNumber < 1 || attemptNumber > 3) {
            throw new IllegalArgumentException("Attempt number must be between 1 and 3");
        }
        
        return new VerificationRequest(
            userId,
            professionId,
            documentImage,
            selfieImage,
            attemptNumber
        );
    }
    
    /**
     * Mark request as AI processing started
     */
    public void startAIProcessing() {
        if (status != VerificationStatus.PENDING) {
            throw new IllegalStateException(
                "Cannot start AI processing from status: " + status
            );
        }
        
        this.status = VerificationStatus.AI_PROCESSING;
        
        registerEvent(new AIProcessingStartedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.documentImage.getS3Key(),
            this.selfieImage.getS3Key()
        ));
    }
    
    /**
     * Process AI verification result and make decision
     * 
     * @param aiResult AI verification result from AWS Rekognition
     */
    public void processAIResult(AIVerificationResult aiResult) {
        if (status != VerificationStatus.AI_PROCESSING) {
            throw new IllegalStateException(
                "Cannot process AI result from status: " + status
            );
        }
        
        this.aiResult = aiResult;
        
        if (!aiResult.isSuccessful()) {
            // AI processing failed - requires manual review
            sendToManualReview("AI processing failed: " + aiResult.getErrorMessage());
            return;
        }
        
        ConfidenceScore confidence = aiResult.getConfidenceScore();
        
        switch (confidence.getDecision()) {
            case AUTO_APPROVE:
                autoApprove(confidence);
                break;
            case AUTO_REJECT:
                autoReject(confidence);
                break;
            case MANUAL_REVIEW:
                sendToManualReview("AI confidence " + confidence + " requires manual review");
                break;
        }
    }
    
    /**
     * Auto-approve based on high AI confidence (>= 85%)
     */
    private void autoApprove(ConfidenceScore confidence) {
        this.status = VerificationStatus.AUTO_APPROVED;
        this.processedAt = Instant.now();
        
        registerEvent(new VerificationAutoApprovedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            confidence.getValue(),
            this.aiResult.getFaceSimilarity()
        ));
    }
    
    /**
     * Auto-reject based on low AI confidence (< 60%)
     */
    private void autoReject(ConfidenceScore confidence) {
        this.status = VerificationStatus.AUTO_REJECTED;
        this.processedAt = Instant.now();
        
        registerEvent(new VerificationAutoRejectedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            confidence.getValue(),
            this.aiResult.getFaceSimilarity(),
            "AI confidence too low for auto-approval"
        ));
    }
    
    /**
     * Send to manual review (AI confidence 60-84% or AI processing failed)
     */
    private void sendToManualReview(String reason) {
        this.status = VerificationStatus.PENDING_MANUAL_REVIEW;
        
        registerEvent(new VerificationSentToManualReviewEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            this.aiResult != null ? this.aiResult.getOverallConfidence() : 0.0,
            reason
        ));
    }
    
    /**
     * Admin approves after manual review
     * 
     * @param adminId Admin user ID
     * @param notes Review notes
     */
    public void approveManually(Long adminId, String notes) {
        if (status != VerificationStatus.PENDING_MANUAL_REVIEW) {
            throw new IllegalStateException(
                "Cannot manually approve from status: " + status
            );
        }
        
        this.manualReviewResult = ManualReviewResult.approve(adminId, notes);
        this.status = VerificationStatus.APPROVED;
        this.processedAt = Instant.now();
        
        registerEvent(new VerificationManuallyApprovedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            adminId,
            notes
        ));
    }
    
    /**
     * Admin rejects after manual review
     * 
     * @param adminId Admin user ID
     * @param notes Rejection reason (required)
     */
    public void rejectManually(Long adminId, String notes) {
        if (status != VerificationStatus.PENDING_MANUAL_REVIEW) {
            throw new IllegalStateException(
                "Cannot manually reject from status: " + status
            );
        }
        
        this.manualReviewResult = ManualReviewResult.reject(adminId, notes);
        this.status = VerificationStatus.REJECTED;
        this.processedAt = Instant.now();
        
        registerEvent(new VerificationManuallyRejectedEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId,
            adminId,
            notes
        ));
    }
    
    /**
     * Mark request as expired (7 days without processing)
     */
    public void markAsExpired() {
        if (status.isFinal()) {
            throw new IllegalStateException(
                "Cannot expire request in final status: " + status
            );
        }
        
        if (Instant.now().isBefore(expiresAt)) {
            throw new IllegalStateException(
                "Cannot expire request before expiration date: " + expiresAt
            );
        }
        
        this.status = VerificationStatus.EXPIRED;
        this.processedAt = Instant.now();
        
        registerEvent(new VerificationExpiredEvent(
            getId(),
            this.verificationId.getValue(),
            this.userId,
            this.professionId
        ));
    }
    
    /**
     * Check if request has expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt) && !status.isFinal();
    }
    
    /**
     * Check if verification was successful (approved)
     */
    public boolean isApproved() {
        return status.isApproved();
    }
    
    /**
     * Check if verification was rejected
     */
    public boolean isRejected() {
        return status.isRejected();
    }
    
    /**
     * Check if request is awaiting manual review
     */
    public boolean needsManualReview() {
        return status.needsManualReview();
    }
    
    /**
     * Get processing time in seconds (if processed)
     */
    public Long getProcessingTimeSeconds() {
        if (processedAt == null) {
            return null;
        }
        return ChronoUnit.SECONDS.between(submittedAt, processedAt);
    }
}
