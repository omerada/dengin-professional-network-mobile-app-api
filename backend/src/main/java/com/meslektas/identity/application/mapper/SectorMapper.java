package com.meslektas.identity.application.mapper;

import com.meslektas.identity.application.dto.response.SectorResponse;
import com.meslektas.identity.domain.model.Sector;
import org.mapstruct.*;

/**
 * MapStruct Mapper for Sector Entity
 * 
 * Converts between domain entities and DTOs.
 * MapStruct generates implementation at compile-time.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface SectorMapper {

    /**
     * Convert Sector entity to SectorResponse DTO
     * 
     * @param sector domain entity
     * @return response DTO
     */
    SectorResponse toResponse(Sector sector);

    /**
     * Convert Sector entity to SectorResponse with member count
     * 
     * @param sector domain entity
     * @param memberCount number of users in sector
     * @return response DTO with member count
     */
    @Mapping(target = "memberCount", source = "memberCount")
    SectorResponse toResponse(Sector sector, Long memberCount);

    /**
     * Convert Sector entity to SectorResponse builder
     * Useful for partial updates
     * 
     * @param sector domain entity
     * @return response builder
     */
    default SectorResponse.SectorResponseBuilder toResponseBuilder(Sector sector) {
        return SectorResponse.builder()
                .id(sector.getId())
                .code(sector.getCode())
                .name(sector.getName())
                .description(sector.getDescription())
                .iconUrl(sector.getIconUrl())
                .displayOrder(sector.getDisplayOrder())
                .isActive(sector.getIsActive());
    }
}
