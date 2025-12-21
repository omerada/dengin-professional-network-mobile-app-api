package com.dengin.messaging.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.messaging.domain.model.ConversationId;
import com.dengin.messaging.domain.model.MessageId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event published when a message is deleted
 * 
 * Used for:
 * - Real-time UI update via WebSocket
 * - Audit logging
 */
@Getter
public class MessageDeletedEvent implements DomainEvent {

    private final ConversationId conversationId;
    private final MessageId messageId;
    private final Long deletedById;
    private final LocalDateTime occurredOn;

    public MessageDeletedEvent(
            ConversationId conversationId,
            MessageId messageId,
            Long deletedById) {
        this.conversationId = conversationId;
        this.messageId = messageId;
        this.deletedById = deletedById;
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
