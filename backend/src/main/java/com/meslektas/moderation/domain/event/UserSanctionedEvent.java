package com.meslektas.moderation.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.SanctionType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event raised when a user is sanctioned.
 */
@Getter
public class UserSanctionedEvent implements DomainEvent {

    private final Long userId;
    private final SanctionType sanctionType;
    private final ReportReason reason;
    private final UUID reportId;
    private final Long moderatorId;
    private final LocalDateTime occurredOn;

    public UserSanctionedEvent(
            Long userId,
            SanctionType sanctionType,
            ReportReason reason,
            UUID reportId,
            Long moderatorId) {
        this.userId = userId;
        this.sanctionType = sanctionType;
        this.reason = reason;
        this.reportId = reportId;
        this.moderatorId = moderatorId;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return userId;
    }

    /**
     * Check if this is a permanent sanction.
     */
    public boolean isPermanent() {
        return sanctionType.isPermanent();
    }

    /**
     * Check if this is a suspension.
     */
    public boolean isSuspension() {
        return sanctionType.isSuspension();
    }

    /**
     * Get sanction display name for notification.
     */
    public String getSanctionDisplayName() {
        return sanctionType.getDisplayName();
    }
}
