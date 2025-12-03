package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;

import java.time.LocalDateTime;

/**
 * Event raised when a user blocks another user
 */
public class UserBlockedEvent implements DomainEvent {
    
    private final Long blockerId;
    private final Long blockedId;
    private final LocalDateTime occurredOn;
    
    public UserBlockedEvent(Long blockerId, Long blockedId) {
        this.blockerId = blockerId;
        this.blockedId = blockedId;
        this.occurredOn = LocalDateTime.now();
    }
    
    public Long getBlockerId() {
        return blockerId;
    }
    
    public Long getBlockedId() {
        return blockedId;
    }
    
    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }
    
    @Override
    public Long getAggregateId() {
        return blockerId;
    }
}
