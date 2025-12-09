package com.meslektas.identity.domain.event;

import com.meslektas.common.domain.DomainEvent;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Domain Event: User Selected Sector
 * 
 * Emitted when a user selects or changes their primary sector.
 * Other contexts can react to this event (e.g., analytics, recommendations).
 * 
 * Event-driven architecture pattern for loose coupling between contexts.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Getter
public class SectorSelectedEvent implements DomainEvent {

    private final Long userId;
    private final Long sectorId;
    private final String sectorCode;
    private final LocalDateTime selectedAt;

    public SectorSelectedEvent(Long userId, Long sectorId, String sectorCode) {
        super();
        this.userId = userId;
        this.sectorId = sectorId;
        this.sectorCode = sectorCode;
        this.selectedAt = LocalDateTime.now();
    }

    @Override
    public Long getAggregateId() {
        return this.userId;
    }

    @Override
    public LocalDateTime getOccurredOn() {
        return this.selectedAt;
    }

    @Override
    public String toString() {
        return "SectorSelectedEvent{" +
                "userId=" + userId +
                ", sectorId=" + sectorId +
                ", sectorCode='" + sectorCode + '\'' +
                ", selectedAt=" + selectedAt +
                '}';
    }
}
