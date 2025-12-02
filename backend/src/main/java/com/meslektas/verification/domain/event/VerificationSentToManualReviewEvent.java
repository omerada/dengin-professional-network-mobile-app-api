package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification sent to manual review
 * 
 * Published when AI confidence is 60-84% or AI processing fails.
 * Triggers admin notification for manual review.
 */
@Getter
@RequiredArgsConstructor
public class VerificationSentToManualReviewEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Double aiConfidence;
    private final String reason;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
