package com.meslektas.messaging.infrastructure.event;

import com.meslektas.identity.domain.model.User;
import com.meslektas.identity.domain.repository.UserRepository;
import com.meslektas.messaging.domain.event.MessageDeliveredEvent;
import com.meslektas.messaging.domain.event.MessageReadEvent;
import com.meslektas.messaging.domain.event.MessageSentEvent;
import com.meslektas.messaging.infrastructure.websocket.RedisMessagePublisher;
import com.meslektas.messaging.infrastructure.websocket.dto.WsMessageResponse;
import com.meslektas.messaging.infrastructure.websocket.dto.WsReadReceipt;
import com.meslektas.messaging.infrastructure.websocket.dto.WsDeliveryReceipt;
import com.meslektas.notification.application.service.NotificationService;
import com.meslektas.notification.domain.model.NotificationContent;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

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
    private final NotificationService notificationService;
    private final UserRepository userRepository;

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
                    .senderId(event.getSenderId())
                    .recipientId(event.getRecipientId())
                    .content(event.getMessagePreview())
                    .status("SENT")
                    .sentByMe(false) // Alıcı için her zaman false
                    .sentAt(event.getOccurredOn().atZone(java.time.ZoneId.systemDefault()).toInstant())
                    .build();

            // Publish to Redis for multi-instance delivery
            redisMessagePublisher.publishMessage(event.getRecipientId(), wsMessage);

            log.debug("Message notification sent to recipient {} via Redis", event.getRecipientId());

            // Create in-app notification
            createMessageNotification(event);

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
                        .readByUserId(longToUuid(event.getReadById()))
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
            // Notify sender about delivery status via WebSocket
            WsDeliveryReceipt deliveryReceipt = WsDeliveryReceipt.builder()
                    .messageId(event.getMessageId().getValue())
                    .conversationId(event.getConversationId().getValue())
                    .status("DELIVERED")
                    .deliveredAt(LocalDateTime.now())
                    .build();

            redisMessagePublisher.publishDeliveryReceipt(event.getSenderId(), deliveryReceipt);

            log.debug("Message {} delivered to recipient {}",
                    event.getMessageId(), event.getRecipientId());

        } catch (Exception e) {
            log.error("Error handling MessageDeliveredEvent for messageId: {}",
                    event.getMessageId(), e);
        }
    }

    /**
     * Create in-app notification for new message
     */
    private void createMessageNotification(MessageSentEvent event) {
        try {
            String senderName = getSenderName(event.getSenderId());
            String messagePreview = truncateMessage(event.getMessagePreview());
            String actionUrl = "/chat/" + event.getConversationId().getValue();

            notificationService.createNotification(
                    event.getRecipientId(),
                    NotificationType.NEW_MESSAGE,
                    "Yeni mesaj",
                    senderName + ": " + messagePreview,
                    actionUrl,
                    Map.of(
                            "conversationId", event.getConversationId().getValue().toString(),
                            "senderId", event.getSenderId().toString()
                    )
            );
        } catch (Exception e) {
            log.warn("Failed to create message notification: {}", e.getMessage());
        }
    }

    /**
     * Convert Long ID to UUID (deterministic conversion for compatibility)
     */
    private UUID longToUuid(Long id) {
        if (id == null) return null;
        return new UUID(0L, id);
    }

    /**
     * Truncate message preview
     */
    private String truncateMessage(String message) {
        if (message == null) return "";
        return message.length() > 50 ? message.substring(0, 47) + "..." : message;
    }

    /**
     * Get sender name from user repository
     */
    private String getSenderName(Long senderId) {
        return userRepository.findById(senderId)
                .map(User::getFullName)
                .orElse("Kullanıcı");
    }
}
