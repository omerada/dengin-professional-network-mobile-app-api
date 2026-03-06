package com.dengin.identity.domain.event;

import com.dengin.common.domain.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: User password was changed
 * 
 * Triggered when:
 * - User changes password from profile settings
 * - Password reset completed successfully
 * 
 * Listeners:
 * - Notification Context: Send email notification about password change
 * - Security Context: Invalidate all existing sessions (logout all devices)
 * - Audit Context: Log security-sensitive action
 */
@Getter
@AllArgsConstructor
public class PasswordChangedEvent implements DomainEvent {
    
    private final Long userId;
    private final String email;
    private final boolean isPasswordReset; // true if reset, false if manual change
    private final LocalDateTime occurredOn;
    
    public PasswordChangedEvent(Long userId, String email, boolean isPasswordReset) {
        this.userId = userId;
        this.email = email;
        this.isPasswordReset = isPasswordReset;
        this.occurredOn = LocalDateTime.now();
    }
    
    @Override
    public Long getAggregateId() {
        return userId;
    }
}
