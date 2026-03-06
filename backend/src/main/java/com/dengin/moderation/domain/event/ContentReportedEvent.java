package com.dengin.moderation.domain.event;

import com.dengin.common.domain.DomainEvent;
import com.dengin.moderation.domain.model.ContentReportId;
import com.dengin.moderation.domain.model.ReportReason;
import com.dengin.moderation.domain.model.ReportType;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Domain event raised when content is reported.
 */
@Getter
public class ContentReportedEvent implements DomainEvent {

    private final ContentReportId reportId;
    private final Long reporterId;
    private final ReportType contentType;
    private final UUID contentId;
    private final ReportReason reason;
    private final LocalDateTime occurredOn;

    public ContentReportedEvent(
            ContentReportId reportId,
            Long reporterId,
            ReportType contentType,
            UUID contentId,
            ReportReason reason) {
        this.reportId = reportId;
        this.reporterId = reporterId;
        this.contentType = contentType;
        this.contentId = contentId;
        this.reason = reason;
        this.occurredOn = LocalDateTime.now();
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return occurredOn;
    }

    @Override
    public Long getAggregateId() {
        return reporterId;
    }
}
