package com.dengin.messaging.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.messaging.domain.model.ConversationId;
import com.dengin.messaging.domain.model.MessageId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event published when a message is delivered to recipient
 * 
 * Used for:
 * - Real-time delivery receipt via WebSocket
 * - Message status tracking
 */
@Getter
public class MessageDeliveredEvent implements DomainEvent {

    private final ConversationId conversationId;
    private final MessageId messageId;
    private final Long senderId;
    private final Long recipientId;
    private final LocalDateTime occurredOn;

    public MessageDeliveredEvent(
            ConversationId conversationId,
            MessageId messageId,
            Long senderId,
            Long recipientId) {
        this.conversationId = conversationId;
        this.messageId = messageId;
        this.senderId = senderId;
        this.recipientId = recipientId;
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
