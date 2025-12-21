package com.dengin.identity.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * Profession Group Response DTO
 * 
 * Data Transfer Object for ProfessionGroup entity.
 * Sent to clients (API responses).
 * 
 * Includes sector information and member count.
 * Immutable record for thread-safety.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Builder
@Schema(description = "Profession group information within a sector")
public record ProfessionGroupResponse(
        
        @Schema(description = "Profession group ID", example = "1")
        Long id,
        
        @Schema(description = "Parent sector ID", example = "1")
        Long sectorId,
        
        @Schema(description = "Parent sector code", example = "MEDICAL")
        String sectorCode,
        
        @Schema(description = "Parent sector name", example = "Sağlık")
        String sectorName,
        
        @Schema(description = "Profession group name", example = "Doktor")
        String name,
        
        @Schema(description = "Profession group description", example = "Tıp fakültesi mezunu, uzmanlık eğitimi almış doktorlar")
        String description,
        
        @Schema(description = "Whether verification is required to join", example = "true")
        Boolean requiresVerification,
        
        @Schema(description = "Profession icon URL", example = "https://cdn.dengin.com/icons/doctor.png")
        String iconUrl,
        
        @Schema(description = "Display order within sector (lower = shown first)", example = "1")
        Integer displayOrder,
        
        @Schema(description = "Whether profession group is active", example = "true")
        Boolean isActive,
        
        @Schema(description = "Number of verified members in this profession group", example = "156")
        Long memberCount
) {

    /**
     * Builder pattern for flexibility
     */
    public static class ProfessionGroupResponseBuilder {
        // Lombok generates builder
    }

    /**
     * Create response without member count
     */
    public static ProfessionGroupResponse of(
            Long id,
            Long sectorId,
            String sectorCode,
            String sectorName,
            String name,
            String description,
            Boolean requiresVerification,
            String iconUrl,
            Integer displayOrder,
            Boolean isActive) {
        return new ProfessionGroupResponse(
                id,
                sectorId,
                sectorCode,
                sectorName,
                name,
                description,
                requiresVerification,
                iconUrl,
                displayOrder,
                isActive,
                null // memberCount
        );
    }

    /**
     * Get full profession name with sector
     * 
     * @return formatted name (e.g., "Doktor (Sağlık)")
     */
    public String getFullName() {
        return name + " (" + sectorName + ")";
    }
}
