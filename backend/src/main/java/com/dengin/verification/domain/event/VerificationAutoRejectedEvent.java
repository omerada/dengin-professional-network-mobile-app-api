package com.dengin.verification.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification auto-rejected by AI
 * 
 * Published when AI confidence < 60%.
 * User can retry (max 3 attempts with 24h cooldown).
 * 
 * KVKK: Documents must be deleted immediately after this event.
 */
@Getter
public class VerificationAutoRejectedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Double aiConfidence;
    private final Double faceSimilarity;
    private final String rejectionReason;
    private final String documentS3Key;
    private final String selfieS3Key;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    public VerificationAutoRejectedEvent(
        Long verificationRequestId,
        UUID verificationId,
        Long userId,
        Long professionId,
        Double aiConfidence,
        Double faceSimilarity,
        String rejectionReason
    ) {
        this(verificationRequestId, verificationId, userId, professionId,
             aiConfidence, faceSimilarity, rejectionReason, null, null);
    }
    
    public VerificationAutoRejectedEvent(
        Long verificationRequestId,
        UUID verificationId,
        Long userId,
        Long professionId,
        Double aiConfidence,
        Double faceSimilarity,
        String rejectionReason,
        String documentS3Key,
        String selfieS3Key
    ) {
        this.verificationRequestId = verificationRequestId;
        this.verificationId = verificationId;
        this.userId = userId;
        this.professionId = professionId;
        this.aiConfidence = aiConfidence;
        this.faceSimilarity = faceSimilarity;
        this.rejectionReason = rejectionReason;
        this.documentS3Key = documentS3Key;
        this.selfieS3Key = selfieS3Key;
    }
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
