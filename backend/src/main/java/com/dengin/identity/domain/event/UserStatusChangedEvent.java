package com.dengin.identity.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.identity.domain.model.UserStatus;
import lombok.Value;

import java.time.LocalDateTime;

/**
 * Domain Event: User status changed
 * 
 * Triggered when user status changes (ACTIVE -> BANNED, etc.)
 * 
 * Listeners may:
 * - Terminate active sessions
 * - Cancel pending notifications
 * - Update analytics
 * - Send status change notification
 */
@Value
public class UserStatusChangedEvent implements DomainEvent {
    Long aggregateId;  // userId
    UserStatus oldStatus;
    UserStatus newStatus;
    String reason;
    LocalDateTime occurredOn;

    public UserStatusChangedEvent(Long userId, UserStatus oldStatus, UserStatus newStatus, String reason) {
        this.aggregateId = userId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.occurredOn = LocalDateTime.now();
    }
}
