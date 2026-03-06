package com.dengin.notification.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.notification.domain.model.NotificationId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event raised when a notification is read by the user.
 */
@Getter
public class NotificationReadEvent implements DomainEvent {

    private final NotificationId notificationId;
    private final Long recipientId;
    private final LocalDateTime occurredOn;

    public NotificationReadEvent(NotificationId notificationId, Long recipientId) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
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
