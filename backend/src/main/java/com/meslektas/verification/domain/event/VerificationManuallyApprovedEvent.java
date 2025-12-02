package com.meslektas.verification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain Event: Verification manually approved by admin
 * 
 * Published when admin approves verification after manual review.
 * User's profession should be marked as verified.
 */
@Getter
@RequiredArgsConstructor
public class VerificationManuallyApprovedEvent implements DomainEvent {
    
    private final Long verificationRequestId;
    private final UUID verificationId;
    private final Long userId;
    private final Long professionId;
    private final Long approvedByAdminId;
    private final String notes;
    private final LocalDateTime occurredOn = LocalDateTime.now();
    
    @Override
    public Long getAggregateId() {
        return verificationRequestId;
    }
}
