package com.meslektas.messaging.infrastructure.event;

import com.meslektas.messaging.domain.event.MessageDeliveredEvent;
import com.meslektas.messaging.domain.event.MessageReadEvent;
import com.meslektas.messaging.domain.event.MessageSentEvent;
import com.meslektas.messaging.infrastructure.websocket.RedisMessagePublisher;
import com.meslektas.messaging.infrastructure.websocket.dto.WsMessageResponse;
import com.meslektas.messaging.infrastructure.websocket.dto.WsReadReceipt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Event Handler for Message Domain Events
 * 
 * Handles domain events published by the Messaging bounded context.
 * Responsible for:
 * - Sending WebSocket notifications to recipients
 * - Publishing to Redis for multi-instance delivery
 * - Creating in-app notifications (future)
 * - Sending push notifications (future)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MessageEventHandler {
    
    private final RedisMessagePublisher redisMessagePublisher;
    
    /**
     * Handle MessageSentEvent
     * 
     * When a new message is sent, notify the recipient via WebSocket.
     */
    @EventListener
    @Async
    public void handleMessageSent(MessageSentEvent event) {
        log.info("Handling MessageSentEvent - messageId: {}, senderId: {}, recipientId: {}",
            event.getMessageId(), event.getSenderId(), event.getRecipientId());
        
        try {
            // Create WebSocket message response
            WsMessageResponse wsMessage = WsMessageResponse.builder()
                .messageId(event.getMessageId().getValue())
                .conversationId(event.getConversationId().getValue())
                .senderId(null) // TODO: Convert Long to UUID when User entity is updated
                .recipientId(null) // TODO: Convert Long to UUID when User entity is updated
                .content(event.getMessagePreview())
                .status("SENT")
                .sentAt(event.getOccurredOn().atZone(java.time.ZoneId.systemDefault()).toInstant())
                .build();
            
            // Publish to Redis for multi-instance delivery
            redisMessagePublisher.publishMessage(event.getRecipientId(), wsMessage);
            
            log.debug("Message notification sent to recipient {} via Redis", event.getRecipientId());
            
            // TODO: Create in-app notification
            // notificationService.createMessageNotification(event);
            
            // TODO: Send push notification if recipient is offline
            // pushNotificationService.sendMessageNotification(event);
            
        } catch (Exception e) {
            log.error("Error handling MessageSentEvent for messageId: {}", 
                event.getMessageId(), e);
        }
    }
    
    /**
     * Handle MessageReadEvent
     * 
     * When a message is marked as read, notify the sender via WebSocket.
     */
    @EventListener
    @Async
    public void handleMessageRead(MessageReadEvent event) {
        log.info("Handling MessageReadEvent - conversationId: {}, readerId: {}, messageId: {}",
            event.getConversationId(), event.getReadById(), event.getMessageId());
        
        try {
            // Notify the message sender about read receipt
            Long senderId = event.getSenderId();
            
            if (senderId != null) {
                WsReadReceipt readReceipt = WsReadReceipt.builder()
                    .conversationId(event.getConversationId().getValue())
                    .readByUserId(null) // TODO: Convert Long to UUID when User entity is updated
                    .lastReadMessageId(event.getMessageId().getValue())
                    .messagesRead(1)
                    .readAt(LocalDateTime.now())
                    .build();
                
                // Publish to Redis for multi-instance delivery
                redisMessagePublisher.publishReadReceipt(senderId, readReceipt);
                
                log.debug("Read receipt sent to sender {} via Redis", senderId);
            }
            
        } catch (Exception e) {
            log.error("Error handling MessageReadEvent for conversationId: {}", 
                event.getConversationId(), e);
        }
    }
    
    /**
     * Handle MessageDeliveredEvent
     * 
     * When a message is delivered, notify the sender.
     */
    @EventListener
    @Async
    public void handleMessageDelivered(MessageDeliveredEvent event) {
        log.info("Handling MessageDeliveredEvent - messageId: {}, recipientId: {}",
            event.getMessageId(), event.getRecipientId());
        
        try {
            // TODO: Notify sender about delivery status
            // This could update message status in sender's UI
            
            log.debug("Message {} delivered to recipient {}", 
                event.getMessageId(), event.getRecipientId());
                
        } catch (Exception e) {
            log.error("Error handling MessageDeliveredEvent for messageId: {}", 
                event.getMessageId(), e);
        }
    }
    
    /**
     * Get sender name from user service
     * TODO: Implement actual user lookup
     */
    private String getSenderName(Long senderId) {
        // Placeholder - should fetch from UserRepository
        return "User " + senderId;
    }
}
