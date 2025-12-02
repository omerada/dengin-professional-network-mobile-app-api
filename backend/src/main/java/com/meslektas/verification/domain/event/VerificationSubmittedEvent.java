package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification request submitted
 * 
 * Published when user submits a new verification request.
 * Triggers AI processing workflow.
 */
@Getter
@RequiredArgsConstructor
public class VerificationSubmittedEvent implements DomainEvent {
    
    private final Long verificationRequestId; // Database ID
    private final UUID verificationId; // Business ID
    private final Long userId;
    private final Long professionId;
    private final String documentS3Key;
    private final String selfieS3Key;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
