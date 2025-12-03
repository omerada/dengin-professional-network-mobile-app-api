package com.meslektas.messaging.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.messaging.domain.model.ConversationId;
import com.meslektas.messaging.domain.model.MessageId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event published when a message is sent
 * 
 * Used for:
 * - Real-time WebSocket delivery
 * - Push notification triggering
 * - Message analytics
 */
@Getter
public class MessageSentEvent implements DomainEvent {
    
    private final ConversationId conversationId;
    private final MessageId messageId;
    private final Long senderId;
    private final Long recipientId;
    private final String messagePreview;
    private final LocalDateTime occurredOn;
    
    public MessageSentEvent(
            ConversationId conversationId,
            MessageId messageId,
            Long senderId,
            Long recipientId,
            String messagePreview) {
        this.conversationId = conversationId;
        this.messageId = messageId;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.messagePreview = messagePreview;
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
