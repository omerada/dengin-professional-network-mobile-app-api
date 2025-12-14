package com.dengin.identity.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: User profile was updated
 * 
 * Triggered when:
 * - User updates name, surname, bio, date of birth
 * - User uploads new avatar
 * 
 * Listeners:
 * - Notification Context: Notify connections of profile change
 * - Search Context: Reindex user profile for search
 * - Analytics: Track profile completeness metrics
 */
@Getter
@AllArgsConstructor
public class ProfileUpdatedEvent implements DomainEvent {
    
    private final Long userId;
    private final String updatedFields; // Comma-separated field names
    private final LocalDateTime occurredOn;
    
    public ProfileUpdatedEvent(Long userId, String updatedFields) {
        this.userId = userId;
        this.updatedFields = updatedFields;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return userId;
    }
}
