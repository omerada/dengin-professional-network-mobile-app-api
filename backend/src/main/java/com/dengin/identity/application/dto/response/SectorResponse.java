package com.dengin.identity.application.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * Sector Response DTO
 * 
 * Data Transfer Object for Sector entity.
 * Sent to clients (API responses).
 * 
 * Includes member count for UI display.
 * Immutable record for thread-safety.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Builder
@Schema(description = "Sector information with member count")
public record SectorResponse(
        
        @Schema(description = "Sector ID", example = "1")
        Long id,
        
        @Schema(description = "Sector code (uppercase)", example = "MEDICAL")
        String code,
        
        @Schema(description = "Sector display name", example = "Sağlık")
        String name,
        
        @Schema(description = "Sector description", example = "Sağlık sektörü profesyonelleri")
        String description,
        
        @Schema(description = "Sector icon URL", example = "https://cdn.meslektas.com/icons/medical.png")
        String iconUrl,
        
        @Schema(description = "Display order (lower = shown first)", example = "1")
        Integer displayOrder,
        
        @Schema(description = "Whether sector is active", example = "true")
        Boolean isActive,
        
        @Schema(description = "Number of users in this sector", example = "1234")
        Long memberCount
) {

    /**
     * Builder pattern for flexibility
     * Example:
     * <pre>
     * SectorResponse response = SectorResponse.builder()
     *     .id(1L)
     *     .code("MEDICAL")
     *     .name("Sağlık")
     *     .memberCount(1234L)
     *     .build();
     * </pre>
     */
    public static class SectorResponseBuilder {
        // Lombok generates builder
    }

    /**
     * Create response without member count
     * Member count defaults to null
     */
    public static SectorResponse of(
            Long id,
            String code,
            String name,
            String description,
            String iconUrl,
            Integer displayOrder,
            Boolean isActive) {
        return new SectorResponse(
                id,
                code,
                name,
                description,
                iconUrl,
                displayOrder,
                isActive,
                null // memberCount
        );
    }
}
