package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification auto-rejected by AI
 * 
 * Published when AI confidence < 60%.
 * User can retry (max 3 attempts with 24h cooldown).
 */
@Getter
@RequiredArgsConstructor
public class VerificationAutoRejectedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Double aiConfidence;
    private final Double faceSimilarity;
    private final String rejectionReason;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
