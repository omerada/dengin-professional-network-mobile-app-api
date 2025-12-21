package com.dengin.identity.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Domain Event: User profession verified
 * 
 * Triggered when user's profession is successfully verified via AI.
 * 
 * Listeners may:
 * - Grant profession-specific permissions
 * - Send congratulations notification
 * - Update user analytics
 * - Enable profession-based features
 */
@Value
public class UserProfessionVerifiedEvent implements DomainEvent {
    Long aggregateId;  // userId
    Long professionId;
    String professionName;
    LocalDateTime occurredOn;

    public UserProfessionVerifiedEvent(Long userId, Long professionId, String professionName) {
        this.aggregateId = userId;
        this.professionId = professionId;
        this.professionName = professionName;
        this.occurredOn = LocalDateTime.now();
    }
}
