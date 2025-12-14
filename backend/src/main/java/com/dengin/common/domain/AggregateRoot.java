package com.dengin.common.domain;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Base class for all Aggregates in DDD.
 * Manages domain events and provides aggregate behavior.
 * 
 * Pattern: Aggregate Root (DDD)
 */
@Getter
public abstract class AggregateRoot extends BaseEntity {

    private final transient List<DomainEvent> domainEvents = new ArrayList<>();

    /**
     * Register a domain event.
     * Events will be published after transaction commit.
     */
    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    /**
     * Get all domain events (immutable copy).
     */
    public List<DomainEvent> getEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    /**
     * Clear all domain events.
     * Should be called after events are published.
     */
    public void clearEvents() {
        domainEvents.clear();
    }
}
