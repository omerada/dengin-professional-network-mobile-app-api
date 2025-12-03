package com.meslektas.moderation.domain.event;

import com.meslektas.common.domain.DomainEvent;
import com.meslektas.moderation.domain.model.ContentReportId;
import com.meslektas.moderation.domain.model.ReportReason;
import com.meslektas.moderation.domain.model.ReportType;
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
    public String getAggregateId() {
        return reportId.getValue().toString();
    }
}
