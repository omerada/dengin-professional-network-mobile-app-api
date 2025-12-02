package com.meslektas.identity.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Domain Event: User registered
 * 
 * Triggered when a new user registers.
 * 
 * Listeners may:
 * - Send welcome email
 * - Create default user settings
 * - Trigger analytics event
 */
@Value
public class UserRegisteredEvent implements DomainEvent {
    Long aggregateId;  // userId
    String email;
    LocalDateTime occurredOn;

    public UserRegisteredEvent(Long userId, String email) {
        this.aggregateId = userId;
        this.email = email;
        this.occurredOn = LocalDateTime.now();
    }
}
