package com.dengin.messaging.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.messaging.domain.model.ConversationId;
import com.dengin.messaging.domain.model.MessageId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event published when a message is read
 * 
 * Used for:
 * - Real-time read receipt via WebSocket
 * - Message analytics
 */
@Getter
public class MessageReadEvent implements DomainEvent {

    private final ConversationId conversationId;
    private final MessageId messageId;
    private final Long senderId;
    private final Long readById;
    private final LocalDateTime occurredOn;

    public MessageReadEvent(
            ConversationId conversationId,
            MessageId messageId,
            Long senderId,
            Long readById) {
        this.conversationId = conversationId;
        this.messageId = messageId;
        this.senderId = senderId;
        this.readById = readById;
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
