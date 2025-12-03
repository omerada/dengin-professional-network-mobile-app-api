package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification auto-approved by AI
 * 
 * Published when AI confidence >= 85%.
 * User's profession should be marked as verified.
 * 
 * KVKK: Documents must be deleted immediately after this event.
 */
@Getter
public class VerificationAutoApprovedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Double aiConfidence;
    private final Double faceSimilarity;
    private final String documentS3Key;
    private final String selfieS3Key;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    public VerificationAutoApprovedEvent(
        Long verificationRequestId,
        UUID verificationId,
        Long userId,
        Long professionId,
        Double aiConfidence,
        Double faceSimilarity
    ) {
        this(verificationRequestId, verificationId, userId, professionId, 
             aiConfidence, faceSimilarity, null, null);
    }
    
    public VerificationAutoApprovedEvent(
        Long verificationRequestId,
        UUID verificationId,
        Long userId,
        Long professionId,
        Double aiConfidence,
        Double faceSimilarity,
        String documentS3Key,
        String selfieS3Key
    ) {
        this.verificationRequestId = verificationRequestId;
        this.verificationId = verificationId;
        this.userId = userId;
        this.professionId = professionId;
        this.aiConfidence = aiConfidence;
        this.faceSimilarity = faceSimilarity;
        this.documentS3Key = documentS3Key;
        this.selfieS3Key = selfieS3Key;
    }
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
