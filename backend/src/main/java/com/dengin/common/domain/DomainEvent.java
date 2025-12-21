package com.dengin.common.domain;

import java.time.LocalDateTime;

/**
 * Base interface for all domain events.
 * 
 * Pattern: Domain Event (DDD)
 */
public interface DomainEvent {
    
    /**
     * Get the time when the event occurred.
     */
    LocalDateTime getOccurredOn();
    
    /**
     * Get the aggregate ID that triggered the event.
     */
    Long getAggregateId();
}
