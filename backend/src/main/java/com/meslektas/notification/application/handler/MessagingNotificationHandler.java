package com.meslektas.notification.application.handler;

import com.meslektas.messaging.domain.event.MessageSentEvent;
import com.meslektas.notification.application.service.NotificationService;
import com.meslektas.notification.domain.model.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * Event handler for messaging-related notifications.
 * 
 * Listens to domain events from Messaging Context and creates appropriate
 * notifications.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class MessagingNotificationHandler {

    private final NotificationService notificationService;

    /**
     * Handle new message event.
     * Creates an in-app notification for the recipient.
     */
    @EventListener
    @Async
    public void handleMessageSent(MessageSentEvent event) {
        log.debug("Handling MessageSentEvent: conversation={}, sender={}, recipient={}",
                event.getConversationId().getValue(), event.getSenderId(), event.getRecipientId());

        try {
            Map<String, String> metadata = new HashMap<>();
            metadata.put("conversationId", event.getConversationId().getValue().toString());
            metadata.put("messageId", event.getMessageId().getValue().toString());
            metadata.put("senderId", event.getSenderId().toString());

            // Truncate message preview if too long
            String preview = event.getMessagePreview();
            if (preview != null && preview.length() > 100) {
                preview = preview.substring(0, 100) + "...";
            }

            notificationService.createNotification(
                    event.getRecipientId(),
                    NotificationType.NEW_MESSAGE,
                    "Yeni mesajınız var",
                    preview,
                    "/messages/" + event.getConversationId().getValue(),
                    metadata);
        } catch (Exception e) {
            log.error("Failed to create notification for MessageSentEvent", e);
        }
    }
}
