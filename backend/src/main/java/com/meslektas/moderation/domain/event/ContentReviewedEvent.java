package com.meslektas.moderation.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.moderation.domain.model.ContentReportId;
import com.meslektas.moderation.domain.model.ModerationDecision;
import com.meslektas.moderation.domain.model.ReportType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event raised when content is reviewed by a moderator.
 */
@Getter
public class ContentReviewedEvent implements DomainEvent {

    private final ContentReportId reportId;
    private final Long moderatorId;
    private final ReportType contentType;
    private final UUID contentId;
    private final ModerationDecision decision;
    private final LocalDateTime occurredOn;

    public ContentReviewedEvent(
            ContentReportId reportId,
            Long moderatorId,
            ReportType contentType,
            UUID contentId,
            ModerationDecision decision) {
        this.reportId = reportId;
        this.moderatorId = moderatorId;
        this.contentType = contentType;
        this.contentId = contentId;
        this.decision = decision;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return moderatorId;
    }

    /**
     * Check if content was removed as a result of this review.
     */
    public boolean isContentRemoved() {
        return decision.removesContent();
    }
}
