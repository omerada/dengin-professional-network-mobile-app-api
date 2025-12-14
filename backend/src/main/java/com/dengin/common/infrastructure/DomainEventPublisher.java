package com.dengin.common.infrastructure;

import com.dengin.common.domain.DomainEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Domain Event Publisher
 * 
 * Publishes domain events using Spring's ApplicationEventPublisher.
 * Events are handled by @EventListener annotated methods.
 * 
 * Usage:
 * - Called after transaction commit
 * - Publishes all events from aggregate roots
 * - Events handled asynchronously if @Async present
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DomainEventPublisher {
    
    private final ApplicationEventPublisher eventPublisher;
    
    /**
     * Publish all domain events from an aggregate
     * 
     * @param events List of domain events to publish
     */
    public void publishEvents(List<DomainEvent> events) {
        if (events == null || events.isEmpty()) {
            return;
        }
        
        log.debug("Publishing {} domain events", events.size());
        
        for (DomainEvent event : events) {
            log.debug("Publishing event: {}", event.getClass().getSimpleName());
            eventPublisher.publishEvent(event);
        }
    }
    
    /**
     * Publish single domain event
     * 
     * @param event Domain event to publish
     */
    public void publishEvent(DomainEvent event) {
        log.debug("Publishing event: {}", event.getClass().getSimpleName());
        eventPublisher.publishEvent(event);
    }
}
