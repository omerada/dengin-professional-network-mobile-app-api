package com.dengin.identity.application.mapper;

import com.dengin.identity.application.dto.response.ProfessionGroupResponse;
import com.dengin.identity.domain.model.ProfessionGroup;
import org.mapstruct.*;

/**
 * MapStruct Mapper for ProfessionGroup Entity
 * 
 * Converts between domain entities and DTOs.
 * Includes sector information in response.
 * 
 * @since Sprint 1 - Sector-based community structure
 */
@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ProfessionGroupMapper {

    /**
     * Convert ProfessionGroup entity to ProfessionGroupResponse DTO
     * Includes sector information
     * 
     * @param professionGroup domain entity
     * @return response DTO
     */
    @Mapping(target = "sectorId", source = "sector.id")
    @Mapping(target = "sectorCode", source = "sector.code")
    @Mapping(target = "sectorName", source = "sector.name")
    @Mapping(target = "memberCount", ignore = true)
    ProfessionGroupResponse toResponse(ProfessionGroup professionGroup);

    /**
     * Convert ProfessionGroup entity to response with member count
     * 
     * @param professionGroup domain entity
     * @param memberCount number of verified members
     * @return response DTO with member count
     */
    @Mapping(target = "sectorId", source = "professionGroup.sector.id")
    @Mapping(target = "sectorCode", source = "professionGroup.sector.code")
    @Mapping(target = "sectorName", source = "professionGroup.sector.name")
    @Mapping(target = "memberCount", source = "memberCount")
    ProfessionGroupResponse toResponse(ProfessionGroup professionGroup, Long memberCount);

}
