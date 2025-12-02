package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification manually rejected by admin
 * 
 * Published when admin rejects verification after manual review.
 * User can retry (max 3 attempts with 24h cooldown).
 */
@Getter
@RequiredArgsConstructor
public class VerificationManuallyRejectedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Long rejectedByAdminId;
    private final String notes;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
