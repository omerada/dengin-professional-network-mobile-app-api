package com.dengin.messaging.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.messaging.domain.model.ConversationId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event published when a new conversation is created
 */
@Getter
public class ConversationCreatedEvent implements DomainEvent {

    private final ConversationId conversationId;
    private final Long participant1Id;
    private final Long participant2Id;
    private final LocalDateTime occurredOn;

    public ConversationCreatedEvent(
            ConversationId conversationId,
            Long participant1Id,
            Long participant2Id) {
        this.conversationId = conversationId;
        this.participant1Id = participant1Id;
        this.participant2Id = participant2Id;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return null; // Will be set after persistence
    }
}
