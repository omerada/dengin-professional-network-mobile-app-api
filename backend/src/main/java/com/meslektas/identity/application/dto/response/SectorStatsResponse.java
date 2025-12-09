package com.meslektas.identity.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * Sector Statistics Response DTO
 * 
 * Provides overview statistics about the sector system.
 * Used for admin dashboards and analytics.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Builder
@Schema(description = "Sector system statistics")
public record SectorStatsResponse(
        
        @Schema(description = "Total number of sectors (including inactive)", example = "8")
        Long totalSectors,
        
        @Schema(description = "Number of active sectors", example = "8")
        Long activeSectors
) {
    
    /**
     * Calculate percentage of active sectors
     * 
     * @return percentage (0-100)
     */
    public double getActivePercentage() {
        if (totalSectors == null || totalSectors == 0) {
            return 0.0;
        }
        return (activeSectors != null ? activeSectors : 0) * 100.0 / totalSectors;
    }

    /**
     * Check if all sectors are active
     * 
     * @return true if all sectors active
     */
    public boolean isAllActive() {
        return totalSectors != null && totalSectors.equals(activeSectors);
    }
}
