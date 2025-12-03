package com.meslektas.notification.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.notification.domain.model.DeliveryChannel;
import com.meslektas.notification.domain.model.NotificationId;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain event raised when a notification is delivered via a channel.
 */
@Getter
public class NotificationDeliveredEvent implements DomainEvent {

    private final NotificationId notificationId;
    private final Long recipientId;
    private final DeliveryChannel channel;
    private final LocalDateTime occurredOn;

    public NotificationDeliveredEvent(
            NotificationId notificationId,
            Long recipientId,
            DeliveryChannel channel) {
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.channel = channel;
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
