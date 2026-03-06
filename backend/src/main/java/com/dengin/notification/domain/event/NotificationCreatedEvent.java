package com.dengin.notification.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.notification.domain.model.NotificationId;
import com.dengin.notification.domain.model.NotificationType;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event raised when a notification is created.
 */
@Getter
public class NotificationCreatedEvent implements DomainEvent {

    private final NotificationId notificationId;
    private final Long recipientId;
    private final NotificationType type;
    private final String title;
    private final LocalDateTime occurredOn;

    public NotificationCreatedEvent(
            NotificationId notificationId,
            Long recipientId,
            NotificationType type,
            String title) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return recipientId;
    }
}
