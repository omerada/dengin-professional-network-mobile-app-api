package com.dengin.verification.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification request expired
 * 
 * Published when verification request expires (7 days without processing).
 * User can submit new request.
 */
@Getter
@RequiredArgsConstructor
public class VerificationExpiredEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
