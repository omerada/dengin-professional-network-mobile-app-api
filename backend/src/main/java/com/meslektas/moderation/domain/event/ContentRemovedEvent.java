package com.meslektas.moderation.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event raised when content is removed due to moderation.
 */
@Getter
public class ContentRemovedEvent implements DomainEvent {

    private final ReportType contentType;
    private final UUID contentId;
    private final Long contentOwnerId;
    private final ReportReason reason;
    private final Long moderatorId;
    private final LocalDateTime occurredOn;

    public ContentRemovedEvent(
            ReportType contentType,
            UUID contentId,
            Long contentOwnerId,
            ReportReason reason,
            Long moderatorId) {
        this.contentType = contentType;
        this.contentId = contentId;
        this.contentOwnerId = contentOwnerId;
        this.reason = reason;
        this.moderatorId = moderatorId;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public String getAggregateId() {
        return contentId.toString();
    }

    /**
     * Get reason display name for notification.
     */
    public String getReasonDisplayName() {
        return reason.getDisplayName();
    }
}
