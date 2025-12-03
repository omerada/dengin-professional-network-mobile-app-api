package com.meslektas.social.domain.model;

import com.meslektas.common.domain.DomainEvent;

import java.time.LocalDateTime;

/**
 * Event raised when a user unblocks another user
 */
public class UserUnblockedEvent implements DomainEvent {

    private final Long unblockerId;
    private final Long unblockedId;
    private final LocalDateTime occurredOn;

    public UserUnblockedEvent(Long unblockerId, Long unblockedId) {
        this.unblockerId = unblockerId;
        this.unblockedId = unblockedId;
        this.occurredOn = LocalDateTime.now();
    }

    public Long getUnblockerId() {
        return unblockerId;
    }

    public Long getUnblockedId() {
        return unblockedId;
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return unblockerId;
    }
}
